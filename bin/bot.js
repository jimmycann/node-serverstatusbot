'use strict'

const ServerStatusBot = require('../lib/ServerStatusBot')

const token = process.env.BOT_API_KEY
const name = process.env.BOT_NAME

const serverstatusbot = new ServerStatusBot({
    token: token,
    name: name,
})

serverstatusbot.run()
