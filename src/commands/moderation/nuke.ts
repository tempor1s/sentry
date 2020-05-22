import { Command } from 'discord-akairo';
import { Message, Permissions, TextChannel } from 'discord.js';
import logger from '../../utils/logger';
import { stripIndents } from 'common-tags';
import { logNuke } from '../../structures/logmanager';
import { Servers } from '../../models/server';

export default class NukeCommand extends Command {
    public constructor() {
        super('nuke', {
            aliases: ['nuke'],
            description: {
                content:
                    'Nuke an entire channel. This removes the channel and creates it again. THIS IS NOT REVERSABLE.',
                usage: 'nuke <channel>',
                examples: ['nuke #logs', 'nuke logs'],
            },
            category: 'moderation',
            channel: 'guild',
            clientPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            userPermissions: [
                Permissions.FLAGS.MANAGE_MESSAGES,
                Permissions.FLAGS.MANAGE_CHANNELS,
            ],
            args: [
                {
                    id: 'channel',
                    type: 'channel',
                    prompt: {
                        start: (_: Message) =>
                            stripIndents`Which channel do you want to nuke?
                            \`cancel\` to cancel.`,
                        retry: (
                            _: Message
                        ) => stripIndents`Please specify an actual channel.
                            \`cancel\` to cancel`,
                    },
                },
                {
                    id: 'confirmPrompt',
                    type: 'string',
                    prompt: {
                        start: (_: Message) =>
                            stripIndents`Are you **sure** you want to nuke this channel? This is **irreversable**. Continue: \`confirm\`
                            \`cancel\` to cancel`,
                        cancel: (_: Message) => 'Command terminated.',
                    },
                },
            ],
        });
    }

    public async exec(
        msg: Message,
        {
            channel,
            confirmPrompt,
        }: { channel: TextChannel; confirmPrompt: string }
    ) {
        if (confirmPrompt.toLowerCase() !== 'confirm') {
            return msg.util?.send('Command terminated.');
        }
        let oldChannel = await channel.delete('Nuked');

        // clone the channel and set it to the same position as the old one
        let newChannel = await channel.clone();
        newChannel.setPosition(oldChannel.rawPosition);

        let serverRepo = this.client.db.getRepository(Servers);

        logNuke(serverRepo, newChannel, msg.member);
        logger.debug(
            `Nuked channel ${newChannel.name} (${newChannel.id}) in ${newChannel.guild.name} (${newChannel.guild.id})`
        );

        newChannel.send('Channel nuked! :)');

        return msg.util?.send(`Channel <#${newChannel.id}> has been nuked.`);
    }
}
