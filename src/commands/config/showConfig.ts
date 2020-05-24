import { stripIndent } from 'common-tags';
import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Repository } from 'typeorm';
import { Servers } from '../../models/server';
import { getDefaultEmbed } from '../../utils/message';
import ms from 'ms';

export default class ShowConfigCommand extends Command {
    public constructor() {
        super('config-show', {
            category: 'config',
            clientPermissions: [Permissions.FLAGS.MANAGE_GUILD],
            userPermissions: [Permissions.FLAGS.MANAGE_GUILD],
        });
    }

    public async exec(msg: Message) {
        const serversRepo: Repository<Servers> = this.client.db.getRepository(
            Servers
        );

        let server = await serversRepo.findOne({
            where: { server: msg.guild.id },
        });

        const embed = getDefaultEmbed()
            .setTitle(`Server Config | ${msg.guild.name}`)
            .addField('**❯ Prefix** (prefix)', `*${server.prefix}*`, true)
            .addField(
                '**❯ Missing Permission Messages** (permissionmessages)',
                server.missingPermissionMessages ? '*Enabled*' : '*Disabled*',
                true
            )
            .addField(
                '**❯ Mute Configuration**',
                stripIndent`
                **• Role** \`muterole\`
                ${
                    server.mutedRole
                        ? `<@&${server.mutedRole}> *(${server.mutedRole})*`
                        : '*Not set*'
                }
                **• Duration** \`muteduration\`
                *${ms(server.muteDuration)}*
                `,
                false
            )
            .addField(
                '**❯ Auto Role**',
                stripIndent`
                **• Status ** \`autoroletoggle\`
                *${server.autoroleEnabled ? 'Enabled' : 'Disabled'}*
                **• Role** \`autorole\`
                ${
                    server.autoroleRole
                        ? `<@&${server.autoroleRole}> *(${server.autoroleRole})*`
                        : '*Not set*'
                }
                `,
                true
            )
            .addField(
                '**❯ Command Logging**',
                stripIndent`
                • **Status** \`commandlogtoggle\`
                *${server.commandLogEnabled ? 'Enabled' : 'Disabled'}*
                • **Channel** \`commandlog\`
                ${server.commandLog ? `<#${server.commandLog}>` : '*Not set*'}`,
                true
            )
            .addField(
                '**❯ Mod Action Logging**',
                stripIndent`
                **• Status** \`modlogtoggle\`
                *${server.modLogEnabled ? 'Enabled' : 'Disabled'}*
                **• Channel** \`modlog\`
                ${server.modLog ? `<#${server.modLog}>` : '*Not set*'}`,
                true
            )
            .addField(
                '**❯ Join/Leave Messages**',
                stripIndent`
                **• Join** \`joinmsg\`
                *${server.joinMsgEnabled ? 'Enabled' : 'Disabled'}*
                **• Delete** \`leavemsg\`
                *${server.leaveMsgEnabled ? 'Enabled' : 'Disabled'}*
                **• Channel** \`joinleavelog\`
                ${
                    server.joinLeaveLog
                        ? `<#${server.joinLeaveLog}>`
                        : '*Not set*'
                }`,
                true
            )
            .addField(
                '**❯ Message Logging**',
                stripIndent`
                **• Deletes** \`logdeletes\`
                *${server.messageLogDeletesEnabled ? 'Enabled' : 'Disabled'}*
                **• Edits** \`logedits\`
                *${server.messageLogEditsEnabled ? 'Enabled' : 'Disabled'}*
                **• Images** \`logimages\`
                *${server.messageLogImagesEnabled ? 'Enabled' : 'Disabled'}*
                **• Channel** \`msglog\`
                ${server.messageLog ? `<#${server.messageLog}>` : '*Not set*'}
                `,
                true
            )
            .setThumbnail(msg.guild.iconURL() ?? '');

        return msg.util?.send(embed);
    }
}
