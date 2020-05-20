import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { Repository } from 'typeorm';
import { Servers } from '../../models/server';
import { getDefaultEmbed } from '../../utils/message';
import ms from 'ms';
import 'moment-duration-format';

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

        let muteRole = msg.guild.roles.cache.get(server.mutedRole);

        const embed = getDefaultEmbed()
            .setTitle(`Server Config | ${msg.guild.name}`)
            .addField('❯ Prefix `prefix`', server.prefix, false)
            .addField(
                '❯ Mute Role `muterole`',
                `${muteRole.name} (${muteRole.id})`,
                false
            )
            .addField(
                '❯ Mute Duration `muteduration`',
                ms(server.muteDuration),
                false
            )
            .setThumbnail(msg.guild.iconURL() ?? '');

        return msg.util?.send(embed);
    }
}
