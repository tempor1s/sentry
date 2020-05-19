import { Command } from 'discord-akairo';
import { Message, Permissions, GuildMember } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { Mutes } from '../../models/mutes';
import { Servers } from '../../models/server';
import { duration as dur } from 'moment';
import 'moment-duration-format';
import ms from 'ms';
import { unmute } from '../../structures/mutemanager';

export default class UnmuteCommand extends Command {
    public constructor() {
        super('unmute', {
            aliases: ['unmute', 'unsilence'],
            description: {
                content: 'Unmute a user in the discord server.',
                usage: 'unmute <user>',
                examples: [
                    'unmute @temporis#6402',
                    'unmute temporis',
                    'unmute 111901076520767488',
                    'unmute temp',
                ],
            },
            category: 'moderation',
            channel: 'guild',
            clientPermissions: [
                Permissions.FLAGS.MUTE_MEMBERS,
                Permissions.FLAGS.MANAGE_ROLES,
                Permissions.FLAGS.MANAGE_MESSAGES,
            ],
            args: [
                {
                    id: 'member',
                    type: 'member',
                    match: 'content',
                },
            ],
        });
    }

    public async exec(msg: Message, { member }: { member: GuildMember }) {
        // If they did not specify a member.
        if (!member) {
            return msg.util?.send('Please specify a user to mute.');
        }

        let mutesRepos = this.client.db.getRepository(Mutes);
        let serverRepo = this.client.db.getRepository(Servers);

        let server = await serverRepo.findOne({
            where: { server: msg.guild.id },
        });

        // TODO: Could just swap this over to checking user roles later if we need to optimize DB
        let mute = await mutesRepos.findOne({
            where: { server: msg.guild.id, user: member.id },
        });

        if (!mute) {
            return msg.util?.send('That user is not muted.');
        }

        unmute(mutesRepos, member, server.mutedRole);

        return msg.util?.send(`Unmuted ${member.user}.`);
    }
}
