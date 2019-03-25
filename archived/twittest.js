var twitter  = require('twit'), // Loading Libraries
    fs       = require('fs'),
    request  = require('request'),
    exec     = require('child_process').exec,
    tw       = new twitter({ // API Keys
      consumer_key:        '***',
      consumer_secret:     '***',
      access_token:        '***',
      access_token_secret: '***',
      timeout_ms:          60*1000
    }),
    path     = '***';

var stream = tw.stream('statuses/filter', {follow: '720137752591773696'});

stream.on('connect', function() {
  console.log('Connecting...');
});

stream.on('connected', function() {
  console.log('Connected!');
});

stream.on('tweet', function(tweet){
  console.log(tweet.text);
});

stream.on('reconnect', function(req, res, interval) {
  console.log('Reconnecting in ' + interval);
});

stream.on('diconnect', function() {
  console.log('Disconnected!');
});

stream.on('error', function(e) {
  console.log(e);
});
