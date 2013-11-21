/**
 * Module dependencies.
 */

var express = require('express');

var http = require('http');
var path = require('path');

var app = express();
var ejs = require('ejs');

var settings = require('./settings.json');
var twilio = require('twilio');
var client = twilio(settings.accountSid, settings.authToken);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/messages', function(req, res) {
  res.render('message.html', {
    title: 'Send Messages'
  });
});

app.post('/messages/send', function(req, res) {
  console.log('/messages/send', req.body);
  client.sendMessage(req.body, function(err, data) {
    if (err) {
      console.error('/messages/send error:', err, data);
      res.send(200, err);
      res.end();
      return
    }
    console.log('/messages/send success:', err, data);
    res.send(200, {
      sid: data.sid,
      date_created: data.date_created,
      from: data.from,
      to: data.to,
      body: data.body,
      price: data.price,
      status: data.status
    });
    res.end();
  });
});

app.post('/messages/receive', function(req, res) {

  console.log('/messages/receive body', req.body);

  //Create TwiML response
  var twiml = new twilio.TwimlResponse();

  // TODO see: https://www.twilio.com/docs/api/twiml/sms/twilio_request req.body.Body
  twiml.message('Really? Well what do you mean with: ' + req.body.Body);
  res.type('text/xml');
  res.send(200, twiml.toString());

});

app.post('/voice/combox', function(req, res) {

  console.log('/voice/combox body', req.body);

  //Create TwiML response
  var twiml = new twilio.TwimlResponse();

  // TODO see: https://www.twilio.com/docs/api/twiml/sms/twilio_request req.body.Body
  twiml.say('Leave your message after the beep', {
    voice: 'woman',
    language: 'en-gb'
  }).record({
    transcribe: 'true',
    timeout: '6',
    playBeep: 'true',
    action: '/voice/thankyou',
    method: 'POST'
  });

  res.type('text/xml');
  res.send(200, twiml.toString());

});


app.post('/voice/receive', function(req, res) {

  console.log('/voice/receive body', req.body);

  //Create TwiML response
  var twiml = new twilio.TwimlResponse();

  // TODO see: https://www.twilio.com/docs/api/twiml/sms/twilio_request req.body.Body
  twiml.say('Pinkepank der Schmid ist krank, wo soll er wohnen unten oder oben?', {
    voice: 'woman',
    language: 'de'
  }).pause({
    length: '1'
  }).gather({
    timeout: '8',
    finishOnKey: '1234567890',
    action: '/voice/receive/gather',
    method: 'POST'
  }, function() {
    this.say('To repeat press 1, for oben press 2, for unten press 3', {
      voice: 'men',
      language: 'en'
    })
  });

  res.type('text/xml');
  res.send(200, twiml.toString());

});


app.post('/voice/receive/gather', function(req, res) {

  console.log('/voice/receive/gather body', req.body.Digits, req.body);

  //Create TwiML response
  var twiml = new twilio.TwimlResponse();

  var digits = req.body.Digits;
  if (digits === 1) twiml.redirect('/voice/receive', {
    method: 'POST'
  });

  var answer = Math.round(Math.random());
  console.log('/voice/receive/gather answer', answer);

  if (digits === answer) {
    twiml.say('you cracked Pinkepank, congratulations. cheers.', {
      voice: 'woman',
      language: 'en-gb'
    }).pause({
      length: '1'
    }).hangup();
  } else {
    twiml.say('sorry, no luck this time. cheers.', {
      voice: 'woman',
      language: 'en-gb'
    }).pause({
      length: '1'
    }).hangup();
  }
  
  res.type('text/xml');
  res.send(200, twiml.toString());

});

app.post('/voice/thankyou', function(req, res) {
  console.log('/voice/combox body', req.body);

  //Create TwiML response
  var twiml = new twilio.TwimlResponse();

  // TODO see: https://www.twilio.com/docs/api/twiml/sms/twilio_request req.body.Body
  twiml.say('Thank you', {
    voice: 'woman',
    language: 'en-gb'
  }).hangup();

  res.type('text/xml');
  res.send(200, twiml.toString());

});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});