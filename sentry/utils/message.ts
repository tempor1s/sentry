import { MessageEmbed, User, TextChannel } from 'discord.js';
import logger from './logger';

export const getDefaultEmbed = (
  color: string = 'DARKER_GREY'
): MessageEmbed => {
  return new MessageEmbed()
    .setColor(color)
    .setTimestamp()
    .setFooter('sentrybot.io');
};

// Will attempt to DM the user the given message or embed. Needed so that the command does not crash when the user has DM's disabled.
// Also allows for a channel to send the message to if their dm's are disabled.
export const dmUser = async (
  message: string | MessageEmbed,
  user: User,
  channel?: TextChannel
) => {
  try {
    await user.send(message);
  } catch (e) {
    logger.debug(
      `Could not send message via DM's to ${user.username} (${user.id}). Reason: `,
      e
    );

    if (channel) {
      await channel.send(`<@${user.id}>, ${message}`);
    }
  }
};
