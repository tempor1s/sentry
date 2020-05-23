import { Message, GuildMember, Role } from 'discord.js';

// a check to make sure that the user does not have higher or equal permissions to yourself
// returns true if higher or equal permissions
export async function checkHigherOrEqualPermissions(
    modMsg: Message,
    other: GuildMember
): Promise<boolean> {
    if (
        other.roles.highest.position >= modMsg.member.roles.highest.position &&
        modMsg.author.id !== modMsg.guild.ownerID
    ) {
        return true;
    }

    return false;
}

export async function checkHigherRole(
    msg: Message,
    role: Role
): Promise<boolean> {
    if (
        msg.member.roles.highest.position <= role.position &&
        msg.author.id !== msg.guild.ownerID
    ) {
        return true;
    }

    return false;
}
