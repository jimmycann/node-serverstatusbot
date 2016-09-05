# Node ServerStatusBot

ServerStatusBot is a Slack bot that alters you when a web server goes down.

Inspired by lmammino's [NorrisBot](https://github.com/lmammino/norrisbot)

### Why?

Want to get a notification in Slack when a server/API HTTP response changes, but don't want to use a fancy tool like New Relic?  

## Installation

```bash
$ npm install -g serverstatusbot
```

## Support

This bot is using ES2015 syntax, so might not work as desired on NodeJS builds pre-V6. As you can see from this [support guide](node.green) ES2015 is about 50% for V5 and below, but should work nonetheless.

## Running ServerStatusBot

To run the ServerStatusBot you must have an [API token](#getting-the-api-token-for-your-slack-channel) to authenticate the bot on your slack channel. Once you get it (instructions on the next paragraph) you just have to run:

```bash
$ BOT_API_KEY=your_slack_API_key CHANNEL=server-status HOSTS=https://jimmycann.com,http://google.com serverstatusbot
```

## Getting the API token for your Slack channel

To allow the ServerStatusBot to connect your Slack channel you must provide him an API key. To retrieve it you need to add a new Bot in your Slack organization by visiting the following url: https://*yourorganization*.slack.com/services/new/bot, where *yourorganization* must be substituted with the name of your organization (e.g. https://*loige*.slack.com/services/new/bot). Ensure you are logged to your Slack organization in your browser and you have the admin rights to add a new bot.

You will find your API key under the field API Token, copy it in a safe place and get ready to use it.

## Configuration

ServerStatusBot is configurable through environment variables. There are several variable available:

| PROCESS_ENV variable | Description | Notes |
|----------------------|-------------|-------|
| `BOT_API_KEY`        | Your Slack API key (Mandatory) | |
| `BOT_NAME`           | The name of your bot. Will default to 'serverstatusbot' (Optional) | |
| `CHANNEL`            | The Slack channel to use. Will default to 'server-status' (Optional) | |
| `HOSTS`              | A comma-delimted list of hosts to check (no spaces, include protocol). Will default to 'https://google.com' (Optional) | Make sure you add 'http://' https://' to the start (eg. http://google.com,https://yahoo.com) |
| `INTERVAL`           | Time in milliseconds between each check. Will default to 1000 (Optional) | Best not to go under 1000ms due to Slack API's [rate limits](https://api.slack.com/docs/rate-limits) |


## Command example

If you downloaded the source code of the bot you can run it with:

```bash
$ BOT_API_KEY=your_slack_API_key CHANNEL=server-status HOSTS=https://jimmycann.com,http://google.com node bin/bot.js
```

## Bugs and improvements

Feel free to [open an issue](https://github.com/yjimk/node-serverstatusbot/issues) or [submit a PR](https://github.com/yjimk/node-serverstatusbot/pulls). Your feedback makes me a better programmer!


## Origins

I wanted a quick project I could do for fun in a day, and also solve a problem. Instead of manually checking my [personal website](https://jimmycann.com) to make sure nothing has gone horribly, horribly wrong, I can now just let Slack tell me there's a problem.

Code inspiration comes from lmammino's [NorrisBot](https://github.com/lmammino/norrisbot). A [very detailed article](https://scotch.io/tutorials/building-a-slack-bot-with-node-js-and-chuck-norris-super-powers) has been published to explain every single line of code for norrisbot. It also explains you how to deploy the bot on a free Heroku instance.


## License

Licensed under [MIT License](LICENSE). ©2016 Jimmy Cann
