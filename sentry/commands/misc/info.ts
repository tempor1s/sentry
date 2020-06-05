import { Command } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import { getDefaultEmbed } from '../../utils/message';
import { duration } from 'moment';
import 'moment-duration-format';

export default class InfoCommand extends Command {
  public constructor() {
    super('info', {
      aliases: ['info'],
      description: {
        content: 'Get information about the bot.',
        usage: 'info',
      },
      category: 'info',
      clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
    });
  }

  public async exec(msg: Message) {
    let owner = this.client.users.cache.get(this.client.ownerID[0]);
    const embed = getDefaultEmbed()
      .setTitle('Sentry')
      .addField('❯ Bot Owner', `${owner!.tag} (${owner!.id})`, false)
      .addField(
        '❯ Uptime',
        duration(this.client.uptime ?? 0).format('d[d ]h[h ]m[m ]s[s]'),
        true
      )
      .addField(
        '❯ Memory Used',
        `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        true
      )
      .addField('❯ Guilds', this.client.guilds.cache.size, true)
      .addField('❯ Channels', this.client.channels.cache.size, true)
      .addField('❯ Users', this.client.users.cache.size, true)
      .addField('❯ Language', 'Typescript', true)
      .addField('❯ Library', 'Discord.js', true)
      .addField('❯ Framework', 'Akairo', true)
      .addField('Code', '[Source](https://github.com/tempor1s/sentry)')
      .setThumbnail(this.client.user?.displayAvatarURL() ?? '');

    msg.util?.send(embed);
  }
}
