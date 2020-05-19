import { Message, GuildMember, Guild } from 'discord.js';
import { Repository } from 'typeorm';
import { Mutes } from '../models/mutes';
import { Servers } from '../models/server';

export async function unmute(user: GuildMember, server: Guild) {
    // TODO: Unmute a given user in a given guild.
}

export async function createMuteRole(server: Guild) {
    // TODO: Create a mute role when the user joins
}
