import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import logger from '../../utils/logger';
import { logKick } from '../../structures/logmanager';
import { Servers } from '../../models/server';
import { getDefaultEmbed } from '../../utils/message';

export default class NickCommand extends Command {
    public constructor() {
        super('nick', {
            aliases: ['nick'],
            description: {
                content: 'Change or reset the nickname of a user in a server.',
                usage: 'nick <user> [nick - leave out to reset]',
                examples: [
                    'nick @temporis#6402',
                    'nick @temporis#6402 Nerd',
                    'nick 111901076520767488 Bot',
                ],
            },
            category: 'moderation',
            channel: 'guild',
            clientPermissions: [Permissions.FLAGS.MANAGE_NICKNAMES],
            userPermissions: [Permissions.FLAGS.MANAGE_NICKNAMES],
            // TODO: Create a silent flag to not send them a message. (maybe dont log??)
            args: [
                {
                    id: 'member',
                    type: 'member',
                },
                {
                    id: 'nick',
                    type: 'string',
                    match: 'rest',
                    default: (_: Message) => '',
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        { member, nick }: { member: GuildMember; nick: string }
    ) {
        if (!member) {
            return msg.util?.send(
                'Please specify a user to change nickname for.'
            );
        }

        // Checks so that you can not nick someone higher than you.
        if (
            member.roles.highest.position > msg.member.roles.highest.position &&
            msg.author.id !== msg.guild.ownerID
        ) {
            return msg.util.send(
                'That member has a higher role than you. You are unable to change their nickname.'
            );
        }

        let serversRepo = this.client.db.getRepository(Servers);

        try {
            if (!nick) {
                await member.setNickname(member.user.username);
            } else {
                await member.setNickname(nick);
            }

            // TODO: Log nickname changes?

            logger.debug(
                `Changed nickname of ${member.user.tag} (${member.id}) to ${nick}`
            );
        } catch (err) {
            logger.error('Error changing nickname of user. Error: ', err);
            return msg.util?.send('Error occured when trying to nick user.');
        }

        return msg.util?.send(`${member.user}'s nickname has been updated.`);
    }
}

