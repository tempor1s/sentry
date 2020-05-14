require('dotenv').config()

export let token: string = process.env.BOT_TOKEN
export let default_prefix: string = process.env.DEFAULT_PREFIX
export let owners: string[] = process.env.OWNERS.split(',')
