import { Listener } from 'discord-akairo';
import { TextChannel } from 'discord.js';
import { unmute } from '../../structures/muteManager';
import { logUnmute } from '../../structures/logManager';
import logger from '../../utils/logger';

import { Mutes } from '../../models/mutes';
import { Servers } from '../../models/server';
import { AutoPurges } from '../../models/autopurge';

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

        // Unmute loop
        // TODO: Move this into mute strcture as a refactor to clean this up
        setInterval(async () => {
            const mutes = await mutesRepo.find();
            mutes
                .filter((m) => m.end <= Date.now())
                .map(async (m) => {
                    let guild = this.client.guilds.cache.get(m.server);
                    let member = guild.members.cache.get(m.user);
                    // TODO: This is slow. Optimize with relations or something? :)
                    let serverDb = await serversRepo.findOne({
                        where: { server: m.server },
                    });

                    // try to mute the user
                    try {
                        // Unmute the user
                        unmute(mutesRepo, member, serverDb.mutedRole);
                        // Log the unmute
                        logUnmute(
                            serversRepo,
                            member,
                            member.guild.members.cache.get(this.client.user.id)
                        );

                        logger.debug(
                            `Unmuting user ${member.user.tag} (${member.id}).`
                        );
                    } catch (err) {
                        logger.error(
                            'Error unmuting user in unmute loop. Reason: ',
                            err
                        );
                    }
                });
        }, 30000);

        // purge auto purged channels
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
    }
}
