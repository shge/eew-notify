#! /usr/bin/env ruby
# coding: utf-8
require 'oauth'

puts "Please input consumer_key: "
consumer_key = gets.chomp
puts "Please input consumer_secret: "
consumer_secret = gets.chomp

oauth = OAuth::Consumer.new(
  consumer_key,
  consumer_secret,
  site: 'https://api.twitter.com'
)

request_token = oauth.get_request_token

puts "Please access this URL: \n#{request_token.authorize_url}"
print "Enter your PIN code: "
pin = gets.chomp

access_token = request_token.get_access_token(oauth_verifier: pin)

puts
puts "client = Twitter::REST::Client.new("
puts "  consumer_key:        '#{consumer_key}',"
puts "  consumer_secret:     '#{consumer_secret}',"
puts "  access_token:        '#{access_token.token}',"
puts "  access_token_secret: '#{access_token.secret}',"
puts ")"
puts
puts "client = Twitter::REST::Client.new{ |config|"
puts "  config.consumer_key        = '#{consumer_key}'"
puts "  config.consumer_secret     = '#{consumer_secret}'"
puts "  config.access_token        = '#{access_token.token}'"
puts "  config.access_token_secret = '#{access_token.secret}'"
puts "}"
