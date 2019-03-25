var twitter  = require('twit'), // Loading Libraries
    fs       = require('fs'),
    request  = require('request'),
    exec     = require('child_process').exec,
    log      = require('log4js'),
    tw       = new twitter({ // API Keys
      consumer_key:        '***',
      consumer_secret:     '***',
      access_token:        '***',
      access_token_secret: '***',
      timeout_ms:          60*1000
    }),
    path     = '***',
    intensity_list = ['4', '5弱', '5強', '6弱', '6強', '7'],
    log_info = function(msg) {  log.getLogger('[App]')    .info(msg);  },
    log_tw   = function(msg) {  log.getLogger('[Tweet]')  .info(msg);  },
    log_file = function(msg) {  log.getLogger('[File]')   .info(msg);  },
    log_cmd  = function(msg) {  log.getLogger('[Command]').info(msg);  },
    log_err  = function(msg) {  log.getLogger('[Error]')  .error(msg);  };

log.configure('log-config.json');

log_info('EEW Script Started!');

var stream = tw.stream('statuses/filter', {follow: '214358709'});  // @eewbot

stream.on('connect',    function()             {  log_info('Connecting the server...');  });
stream.on('connected',  function()             {  log_info('Connected to the server successfully!');  });
stream.on('reconnect',  function(req, res, ms) {  log_info('Reconnecting in ' + ms / 1000 + ' seconds...');  });
stream.on('disconnect', function(req, res, ms) {  log_info('Reconnecting in ' + ms / 1000 + ' seconds...');  });
stream.on('error',      function(e)            {  log_err(e);  });

stream.on('tweet', function (tweet) {

  var input = tweet.text;

  log_tw(input);

  var data           = input.split(','), // Parse
      intensity      = data[12],
      intensity_full = data[12].replace(/[0-9]/g, function(s) {
                         return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
                       }),
      magnitude      = data[11],
      depth          = data[10],
      center         = data[9],
      latlng         = data[7] + ',' + data[8],
      eew_id         = data[5],
      number         = data[4].replace(/[0-9]/g, function(s) {
                         return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
                       }),
      final          = (data[3] == '8' || data[3] == '9') ? true : false;
      status         = data[0];

  if (status === '39') { // If cancel

    var cancel_msg_subtitle = '緊急地震速報はキャンセルされました',
        cancel_msg_body     = '\\[第' + number + '報]（❌キャンセル）';

    exec('terminal-notifier -title 【■■■キャンセル報■■■】 -subtitle ' + cancel_msg_subtitle + ' -message "' + cancel_msg_body + '" -group ' + eew_id + ' -appIcon "' + path + 'icon.png"');
    log_cmd('terminal-notifier -title 【■■■キャンセル報■■■】 -subtitle ' + cancel_msg_subtitle + ' -message "' + cancel_msg_body + '" -group ' + eew_id + ' -appIcon "' + path + 'icon.png"');

  } else if (status === '35' || status === '36' || status === '37') {

    if (intensity > 2 || magnitude > 4) {

      if (intensity === "震度不明") { // 震度不明通知音なし
        // Do nothing
      } else if (intensity === 3) { // 震度3はチャイムのみ
        exec('afplay ' + path + 'chime.mp3');
        log_cmd('afplay ' + path + 'chime.mp3');
      } else { // 震度4以上はチャイム＋メッセージ
        exec('afplay ' + path + 'alert.mp3');
        log_cmd('afplay ' + path + 'alert.mp3');
      }

      var msg_title    = (intensity < 5) ? ('【■■■緊急地震速報■■■】')
                                         : ('🔴🔴🔴緊急地震速報🔴🔴🔴'),
          msg_subtitle = (intensity < 5) ? center + 'で震度' + intensity_full + 'の地震が発生'
                                         : center + 'で【震度' + intensity_full + '】の地震が発生',
          msg_body     = (final === true) ? '\\[第' + number + '報]（終）　M' + magnitude + '　深さ' + depth + 'km'
                                          : '\\[第' + number + '報]　M' + magnitude + '　深さ' + depth + 'km',
          msg_icon     = (intensity_list.indexOf(intensity) >= 0) ? path + intensity + '.png'
                                                                  : path + 'icon.png'; // 1〜3、「以上」

      var url  = 'http://maps.google.com/maps/api/staticmap?markers=color:red%7C' + latlng + '&size=100x100&zoom=5&maptype=roadmap&style=element:geometry%7Ccolor:0x999999&style=element:labels%7Cvisibility:off&style=feature:administrative.country%7Celement:geometry.stroke%7Ccolor:0x4b6878&style=feature:administrative.province%7Celement:geometry.stroke%7Ccolor:0x515792%7Cweight:2&style=feature:landscape.natural%7Celement:geometry%7Ccolor:0x999999&style=feature:road%7Cvisibility:off&style=feature:water%7Celement:geometry%7Ccolor:0x515792',
          time = (new Date()).getTime(),
          dest = '/tmp/eew/' + time +'.png';
      exec('mkdir -p /tmp/eew');

      request(url).on('response', function(res) {
        res.pipe(fs.createWriteStream(dest))

          .on('close', function(){

            log_file('Downloaded ' + dest + ' successfully!');

            exec('terminal-notifier -title ' + msg_title + ' -subtitle ' + msg_subtitle + ' -message "' + msg_body + '" -group ' + eew_id + ' -appIcon "' + msg_icon + '" -contentImage "' + dest + '"');
            log_cmd('terminal-notifier -title ' + msg_title + ' -subtitle ' + msg_subtitle + ' -message "' + msg_body + '" -group ' + eew_id + ' -appIcon "' + msg_icon + '" -contentImage "' + dest + '"');

          }).on('error', function() {

            log_file('Failed to download ' + dest + '! Sending a notification without an image.');

            exec('terminal-notifier -title ' + msg_title + ' -subtitle ' + msg_subtitle + ' -message "' + msg_body + '" -group ' + eew_id + ' -appIcon "' + msg_icon + '"');
            log_cmd('terminal-notifier -title ' + msg_title + ' -subtitle ' + msg_subtitle + ' -message "' + msg_body + '" -group ' + eew_id + ' -appIcon "' + msg_icon + '"');

        }); // pipe
      }); // request
    } // if
  } // if
});
