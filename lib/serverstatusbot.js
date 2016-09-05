'use strict'

const util = require('util')
const Bot = require('slackbots')
const https = require('https')
const http = require('http')
const async = require('async')
const _ = require('lodash')


// Environment variables
const channel = process.env.CHANNEL || 'server-status'
const hostsArray = process.env.HOSTS.split(',') || 'https://google.com'
const interval = parseInt(process.env.INTERVAL) || 1000

if (typeof channel !== 'string') throw new Error('process.env.CHANNEL needs to be a string')
if (typeof hostsArray !== 'object') throw new Error('process.env.HOSTS needs to be a comma-delimted list without spaces')
if (typeof interval !== 'number') throw new Error('process.env.INTERVAL needs to be a number')

let hosts = []
_(hostsArray).forEach((host) => {
  hosts.push({
    name: host,
    status: null
  })
})

/**
 * @description :: Constructor function. It accepts a settings object which should contain the following keys:
 *      token : the API token of the bot (mandatory)
 *      name : the name of the bot (will default to "serverstatusbot")
 * @param {object} settings
 * @constructor
 * @author :: Jimmy Cann <mail@jimmycann.com>
 */
const ServerStatusBot = function Constructor(settings) {
  this.settings = settings
  this.settings.name = this.settings.name || 'serverstatusbot'
}

// inherits methods and properties from the Bot constructor
util.inherits(ServerStatusBot, Bot)

/**
 * @description :: Run the bot
 * @public
 */
ServerStatusBot.prototype.run = function () {
  ServerStatusBot.super_.call(this, this.settings)
  this.on('start', this._onStart)
  this.on('message', this._onMessage)
}

/**
 * @description :: On Start callback, called when the bot connects to the Slack server and access the channel
 * @private
 */
ServerStatusBot.prototype._onStart = function () {
  this._loadBotUser()
  this._setCheckInterval()
}

/**
 * @description :: Send a welcome message
 * @private
 */
ServerStatusBot.prototype._welcomeMessage = function () {
  this.postMessageToChannel(channel, 'ServerStatusBot is now active', {as_user: true})
}

/**
 * @description :: Set the interval for tests
 * @private
 */
ServerStatusBot.prototype._setCheckInterval = function () {
  setInterval(() => {
    this._checkHosts(false)
  }, interval)
}

/**
 * @description :: Check the host and send a message to the channel if the status has changed
 * @params {bool} force :: Force the message to be sent to Slack, ignoring change in status code
 * @private
 */
ServerStatusBot.prototype._checkHosts = function (force) {
  let i = 0
  async.each(hosts, (host, callback) => {
    if (host.name.indexOf('https://') === 0) {
      this._httpsCheck(host.name, force, i)
    } else this._httpCheck(host.name, force, i)
    i++
    callback()
  })
}

/**
 * @description :: Run a HTTP GET request on host
 * @private
 */
ServerStatusBot.prototype._httpCheck = function (host, force, i) {
  http.get(host, (res) => {
    if (hosts[i].status !== res.statusCode || force) this._postStatusToChannel(res.statusCode, host, res.headers)
    hosts[i].status = res.statusCode
  })
}

/**
 * @description :: Run a HTTPS GET request on host
 * @private
 */
ServerStatusBot.prototype._httpsCheck = function (host, force, i) {
  https.get(host, (res) => {
    if (hosts[i].status !== res.statusCode || force) this._postStatusToChannel(res.statusCode, host, res.headers)
    hosts[i].status = res.statusCode
  })
}

/**
 * @description :: Send a return message when one is received in the channel
 * @private
 */
ServerStatusBot.prototype._onMessage = function (message) {
  if (
    this._isChatMessage(message) &&
    this._isChannelConversation(message) &&
    !this._isFromServerStatusBot(message) &&
    !this._isFromSlackBot(message) &&
    this._isMentioningServerStatus(message)
  ) {
    console.log(this._isFromServerStatusBot(message))
    this._checkHosts(true)
  }
}

/**
 * @description :: Send the status of the host to Slack
 * @private
 */
ServerStatusBot.prototype._postStatusToChannel = function (statusCode, host, headers) {
  let msg = host + ' is responding with status code ' + statusCode
  async.forEach(_.keys(headers), (header, callback) => {
    msg += '\n' + header + ': ' + headers[header]
    callback()
  }, () => {
    this.postMessageToChannel(channel, msg, {as_user: true})
  })
}

/**
 * @description :: Loads the user object representing the bot
 * @private
 */
ServerStatusBot.prototype._loadBotUser = function () {
  let self = this
  this.user = this.users.filter((user) => {
    return user.name === self.name
  })[0]
}

/**
 * @description :: Util function to check if a given real time message object represents a chat message
 * @param {object} message
 * @returns {boolean}
 * @private
 */
ServerStatusBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text)
}

/**
 * Util function to check if a given real time message object is directed to a channel
 * @param {object} message
 * @returns {boolean}
 * @private
 */
ServerStatusBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C'
}

/**
 * Util function to check if a given real time message is mentioning 'server status' or the serverstatusbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
ServerStatusBot.prototype._isMentioningServerStatus = function (message) {
    return message.text.toLowerCase().indexOf('server status') > -1 ||
        message.text.toLowerCase().indexOf(this.name) > -1;
};

/**
 * Util function to check if a given real time message has ben sent by the serverstatusbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
ServerStatusBot.prototype._isFromServerStatusBot = function (message) {
  return message.user === this.user.id
}

/**
 * Util function to check if a given real time message has ben sent by the serverstatusbot
 * @param {object} message
 * @returns {boolean}
 * @private
 */
ServerStatusBot.prototype._isFromSlackBot = function (message) {
  return message.username === 'slackbot'
}

/**
 * @description :: Util function to get the name of a channel given its id
 * @param {string} channelId
 * @returns {Object}
 * @private
 */
ServerStatusBot.prototype._getChannelById = function (channelId) {
  return this.channels.filter((item) => {
    return item.id === channelId
  })[0]
}

module.exports = ServerStatusBot
