import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import { unmute, unmuteLoop } from '../../structures/muteManager';
import { logUnmute, logUnban } from '../../structures/logManager';
import logger from '../../utils/logger';

import { Mutes } from '../../models/mutes';
import { Servers } from '../../models/server';
import { AutoPurges } from '../../models/autopurge';
import { TempBans } from '../../models/tempbans';

export default class ReadyListener extends Listener {
    public constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready',
            category: 'client',
        });
    }

    public async exec() {
        logger.info(`${this.client.user.tag} is now online.`);

        const mutesRepo = this.client.db.getRepository(Mutes);
        const serversRepo = this.client.db.getRepository(Servers);
        const autoPurgeRepo = this.client.db.getRepository(AutoPurges);
        const tempBanRepo = this.client.db.getRepository(TempBans);

        // Update servers/members every 5 minutes.
        this.client.user.setActivity(
            `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
            { type: 'WATCHING' }
        );

        // update activity every 5mins with new server/member count
        setInterval(() => {
            this.client.user.setActivity(
                `${this.client.guilds.cache.size} servers | ${this.client.users.cache.size} members`,
                { type: 'WATCHING' }
            );
        }, 3e5);

        // Unmute loop (runs every 30 seconds)
        setInterval(async () => {
            unmuteLoop(serversRepo, mutesRepo);
        }, 30000);

        // purge auto purged channels (runs every 30 seconds)
        // TODO: Refactor this out into a seperate manager with other other purge related commands :)
        setInterval(async () => {
            const autoPurges = await autoPurgeRepo.find();
            autoPurges
                .filter((p) => p.timeUntilNextPurge <= Date.now())
                .map(async (p) => {
                    // get the channel that we are going to purge
                    let channel = this.client.channels.cache.get(
                        p.channel
                    ) as TextChannel;

                    // get all the messages in the channel
                    let messages = await channel.messages.fetch();
                    // filter out all messages that are pinned
                    let filteredMsgs = messages.filter((msg) => !msg.pinned);
                    // delete messages that are not pinned
                    await channel.bulkDelete(filteredMsgs);

                    channel.send('Channel purged! :)');

                    logger.debug(
                        `Purging ${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id}) due to auto purge.`
                    );

                    // update our time till next purge to be date.now() + the set interval
                    await autoPurgeRepo.update(
                        { server: p.server, channel: p.channel },
                        {
                            timeUntilNextPurge:
                                Number(p.purgeInterval) + Date.now(),
                        }
                    );
                });
        }, 30000);

        // unban users that are past the interval
        // TODO: Refactor this out into a ban manager?
        setInterval(async () => {
            const tempBans = await tempBanRepo.find();
            tempBans
                .filter((ban) => ban.end <= Date.now())
                .map(async (ban) => {
                    // get the server to remove ban from
                    let server = this.client.guilds.cache.get(ban.server);
                    // the bot member in the server
                    let botMember = server.members.cache.get(
                        this.client.user.id
                    );
                    // remove ban
                    let user = await server.members.unban(ban.user);
                    // log unban
                    logUnban(
                        serversRepo,
                        user,
                        botMember,
                        'Temporary ban expired.'
                    );

                    tempBanRepo.delete({
                        server: ban.server,
                        user: ban.user,
                    });
                });
        }, 3e5);
    }
}
