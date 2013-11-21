// Your accountSid and authToken from twilio.com/user/account
var settings = require('./settings.json');
var client = require('twilio')(settings.accountSid, settings.authToken);

exports.sendMessage = function(message, callback) {
  client.sms.messages.create(message, function(err, res) {
    console.log(err, res.sid);
    callback(err, res.sid);
  });
}