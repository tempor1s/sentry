export const ConfigFields = [
    ['config-prefix', 'prefix'],
    ['config-permissionmessages', 'permissionmessages'],
    ['config-muterole', 'muterole'],
    ['config-muteduration', 'muteduration'],
    ['config-commandlogtoggle', 'commandlogtoggle'],
    ['config-commandlog', 'commandlog'],
    ['config-modlogtoggle', 'modlogtoggle'],
    ['config-modlog', 'modlog'],
    ['config-logdeletes', 'logdeletes'],
    ['config-logedits', 'logedits'],
    ['config-logimages', 'logimages'],
    ['config-msglog', 'msglog'],
    ['config-autoroletoggle', 'autoroletoggle'],
    ['config-autorole', 'autorole'],
    ['config-joinmsg', 'joinmsg'],
    ['config-leavemsg', 'leavemsg'],
    ['config-joinleavelog', 'joinleavelog'],
];

interface ConfigDescriptionInterface {
    [key: string]: string;
}

export const ConfigDescription: ConfigDescriptionInterface = {
    prefix: 'View or update the prefix of the bot.',
    permissionmessages:
        'Enable/Disable messages for when a user does not have permissions to run a command.',
    muterole: 'Update the mute role in the server.',
    muteduration: 'Update the duration of the mute in the server.',
    commandlogtoggle: 'Enable/Disable command logging in the server.',
    commandlog: 'Update the command log channel in the server.',
    modlogtoggle: 'Enable/Disable mod action logging on the server.',
    modlog: 'Update the modlog channel in the server.',
    logdeletes: 'Enable/Disable the logging of deleted messages in the server.',
    logedits: 'Enable/Disable the logging of edited messages in the server.',
    logimages: 'Enable/Disable the logging of uploaded images in the server.',
    msglog: 'Update the msglog channel in the server.',
    autoroletoggle: 'Enable/Disable auto role in the server.',
    autorole: 'Update the autorole in the server.',
    joinmsg: 'Enable/Disable logging for when a user joins the server.',
    leavemsg: 'Enable/Disable logging for when a user leaves the server.',
    joinleavelog: 'Update the channel for join/leave logging in the server.',
};
