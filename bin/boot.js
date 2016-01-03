#!/usr/bin/env node

'use strict';


var BeeliBot = require('../bots/beelibot');

var beeliBotToken = process.env.BOT_API_KEY || require('../beelibottoken');
var beeliBotApiEndpoint = process.env.BOT_API_ENDPOINT || 'http://0.0.0.0:3000/api/users/getShiftsResume';
var beelibot = new BeeliBot({
    token: beeliBotToken,
    endpoint: beeliBotApiEndpoint,
    name: 'beelibot'
});

beelibot.run();
