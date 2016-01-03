'use strict';

var util = require('util');
var Bot = require('slackbots');
var ChileanJokes = require('../data/chileanjokes');
var unirest = require('unirest');
var moment = require('moment');
var _ = require('lodash');

var BeeliBot = function Constructor(settings) {
    this.settings = settings;
    this.settings.name = this.settings.name || 'beelibot';
    this.user = null;
};
// inherits methods and properties from the Bot constructor
util.inherits(BeeliBot, Bot);

BeeliBot.prototype.run = function () {
    BeeliBot.super_.call(this, this.settings);
    console.log("\n== beelibot started ==\n")
    this.on('start', this._onStart);
    this.on('message', this._onMessage);


};

BeeliBot.prototype._getUserById = function (id) {
    var self = this;
    var user = this.users.filter(function (user) {
        return user.id === id;
    })[0];
    return user;
};


BeeliBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

BeeliBot.prototype._welcomeMessage = function () {
  var self = this;
  this.channels.forEach(function(channel){
    self.postMessageToChannel(channel.name, 'Hola chicos, soy `Beelibot` su ayudante virtual ! \nPueden llamarme con tan solo mencionarme por mi nombre o enviandome un PM, trabajo 24x7 :smirk: :smirk:' +
        '\n (Para ver la lista de comandos esribe `beelibot ayuda` o `beelibot comandos`)',
        {as_user: true});
  });

};

BeeliBot.prototype._onStart = function () {

  this._loadBotUser();
  this._welcomeMessage();
  console.log("\n== beelibot doing his job ==\n")
};
BeeliBot.prototype._onMessage = function (message) {
  //console.log("\nMessage: \n",message);

  // Detect messages in channels who mention beelibot
  if (this._isChatMessage(message) &&
      this._isChannelConversation(message) &&
      !this._isFromBeeliBot(message) &&
      (this._isMentioningBeelibot(message) || this._isTaggingBeelibot(message))
  ) {
    // Detect what they want
    var messageText = message.text.toLowerCase();

    if( this._isAskingForCommandList(messageText) ) {
      this._sendCommandList(message);
    }else if( this._isAskingForShifts(messageText) ){
      this._sendShifts(message);
    }else if( this._isAskingForReportsStats(messageText) ){
      this._sendReportStats(message);
    }else if( this._isAskingForJokes(messageText) ){
      this._sendJoke(message);
    }else{
      this._replyWithRandomJoke(message);
    }
  }



};
BeeliBot.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};
BeeliBot.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' &&
      message.channel[0] === 'C';
};
BeeliBot.prototype._isFromBeeliBot = function (message) {
  return message.user === this.user.id;
};
BeeliBot.prototype._isMentioningBeelibot = function (message) {
  return message.text.toLowerCase().indexOf('beelibot') > -1 ||
      message.text.toLowerCase().indexOf(this.name) > -1;
};
BeeliBot.prototype._isTaggingBeelibot = function (message) {
  return message.text.indexOf('<@'+this.user.id+'>') > -1;
};

BeeliBot.prototype._replyWithRandomJoke = function (originalMessage) {
  var self = this;
  var channel = self._getChannelById(originalMessage.channel);
  var joke = (new ChileanJokes()).getRandomJoke();

  var post = 'No se que lo es que quieres :disappointed_relieved:, pero te puedo contar un chiste?\n' + joke.text;
  self.postMessageToChannel(channel.name, post, {as_user: true});
};

BeeliBot.prototype._isAskingForCommandList = function(message){
  var tagged = ('<@'+this.user.id+'>').toLowerCase();
  return message.indexOf('beelibot ayuda') > -1 ||
      message.indexOf('beelibot comandos') > -1 ||
      message.indexOf(tagged+': comandos') > -1 ||
      message.indexOf(tagged+': ayuda') > -1;
};
BeeliBot.prototype._isAskingForShifts = function(message){
  var tagged = ('<@'+this.user.id+'>').toLowerCase();
  return message.indexOf('beelibot turnos') > -1 ||
         message.indexOf(tagged+': turnos') > -1;
};
BeeliBot.prototype._isAskingForReportsStats = function(message){
  var tagged = ('<@'+this.user.id+'>').toLowerCase();
  return message.indexOf('beelibot reportes') > -1 ||
         message.indexOf(tagged + ': reportes') > -1;
};
BeeliBot.prototype._isAskingForJokes = function(message){
  var tagged = ('<@'+this.user.id+'>').toLowerCase();
  return message.indexOf('beelibot chiste') > -1 ||
         message.indexOf(tagged + ': chiste') > -1;
};

BeeliBot.prototype._sendCommandList = function(originalMessage){
  var self = this;
  var channel = self._getChannelById(originalMessage.channel);
  var commandList = 'Para interactuar conmigo sólo debes llamarme (`beelibot [comando]`) o etiquetarme (`@beelibot [comando]`)\n' +
                    '\n*Por el momento* cuento con las siguientes funcionalidades:\n\n' +
                    '• `beelibot turnos`: Despliega tus turnos asignados para la semana actual (~pronto podré decir tus turnos de semanas proximas~)\n'+
                    //'• `beelibot reportes`: Despliega un resumen de tus reportes para la semana actual\n'+
                    '• `beelibot chiste`: Te cuento alguna tallita pa\' alegrarte el día :grin:\n'
  self.postMessageToChannel(channel.name, commandList, {as_user: true});
};
BeeliBot.prototype._sendShifts = function(originalMessage){
  var self = this;
  var channel = self._getChannelById(originalMessage.channel);
  var fromUser = self._getUserById(originalMessage.user);
  setMomentLanguage(fromUser.tz);
  var email = fromUser.profile.email;
  var tzOffset = fromUser.tz_offset;
  var date = moment.unix(originalMessage.ts);

  var start = getWeekBounds(date).start;
  var end   = getWeekBounds(date).end;

  unirest.get(this.settings.endpoint)
    .type('json')
    .header('Accept', 'application/json')
    .send({ "slack_email": email, "start": start, "end": end })
    .end(function (response) {
      var grouped = groupShiftByDay(response.body);
      var text = '¡Hola ' + fromUser.real_name + '!, estos son tus turnos para la semana actual: \n';
      var weekDays = getWeekDays();
      _.each(grouped, function(value, index){
        text = text + '\n_*'+weekDays[index]+'*_ \n';
        if(_.isEmpty(value)){
          text = text + '\t ~No hay asignaciones~';
        }else{
          _.each(value, function(assignment){
            var shift = '\n• ['+moment(assignment.assignment_start).format('HH:mm')+' - '+moment(assignment.assignment_end).format('HH:mm')+'] ';
            shift = shift + '*'+assignment.shift_type_name+'* ';
            if(assignment.shift_type_code === "DEALER"){
              shift = shift + assignment.brand_name + ' - ' + assignment.store_name;
            }else{
              shift = shift + 'Area: '+assignment.area_name;
            }
            text = text + shift;
          });
        }
      });

      if(self._isChannelConversation(originalMessage)){
        var channel = self._getChannelById(originalMessage.channel);
        self.postMessageToChannel(channel.name, 'Acabo de enviar tus turnos por PM *'+fromUser.real_name+'*', {as_user: true});
      }
      self.postMessageToUser(fromUser.name, text, {as_user: true});
    });
};
BeeliBot.prototype._sendReportStats = function(originalMessage){
  var self = this;
  var channel = self._getChannelById(originalMessage.channel);

};
BeeliBot.prototype._sendJoke = function(originalMessage){
  var self = this;
  var channel = self._getChannelById(originalMessage.channel);
  var joke = (new ChileanJokes()).getRandomJoke();
  var post = joke.text;
  self.postMessageToChannel(channel.name, post, {as_user: true});
};

BeeliBot.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
      return item.id === channelId;
  })[0];
};

var getWeekBounds = function(date){
  var start = date.startOf('week').format();
  var end = date.endOf('week').format();
  return {
    start: start,
    end: end
  };
};

var setMomentLanguage = function(timezone){
  var timezone = timezone.toLowerCase();
  if(timezone.indexOf('america/santiago') > -1 ){
    moment.locale('es');
  }
};

var groupShiftByDay = function(assignments){
  if(assignments.length === 0) return [];
  var group = [ [], [], [], [], [], [], [] ];
  _.forEach(assignments, function(val){
    group[ moment(val.assignment_start).day() ].push(val);
  });
  if(moment.localeData(). firstDayOfWeek() === 1){
    var tmp = group[0];
    var rest = _.rest(group);
    rest.push(tmp);
    group = rest;
  }
  return group;
}
var getWeekDays = function(){
  var days = moment.weekdays();
  if(moment.localeData().firstDayOfWeek() === 1){
    var tmp = days[0];
    var rest = _.rest(days);
    rest.push(tmp);
    days = rest;
  }
  return days;
};
module.exports = BeeliBot;
