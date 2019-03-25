var input = '39,10,2016/12/04 20:43:24,0,4,ND20161204204234,2016/12/04 20:42:21,33.1,141.7,福島県沖,10,4.1,7,1,0';

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
var twitter = require('twitter'), // Loading Libraries
    fs      = require('fs'),
    request = require('request'),
    exec    = require('child_process').exec,
    path    = '***';
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

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
    final          = (data[3] == "8" || data[3] == "9") ? true : false;
    cancel         = (data[0] == "39") ? true : false;

if (cancel === true) {
  var cancel_msg_subtitle = '緊急地震速報はキャンセルされました',
      cancel_msg_body     = '\\[第' + number + '報]（❌キャンセル）';

  exec('terminal-notifier -title 【■■■キャンセル報■■■】 -subtitle ' + cancel_msg_subtitle + ' -message "' + cancel_msg_body + '" -group ' + eew_id + ' -appIcon "' + path + 'icon.png"');

} else {
  console.log('not cancel');
}
