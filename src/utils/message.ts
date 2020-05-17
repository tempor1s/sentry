import { MessageEmbed } from 'discord.js';

export function getDefaultEmbed(color: string = 'DARKER_GREY'): MessageEmbed {
    return new MessageEmbed()
        .setColor(color)
        .setTimestamp()
        .setFooter('Powered by Sentry');
}
