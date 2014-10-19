
# app.rb
require 'thin'
require 'sinatra/base'
require 'em-websocket'
require 'socket'
require 'timeout'

EventMachine.run do
  class App < Sinatra::Base
    get '/:rando' do
      socket_up!(params[:rando])
      erb :index, :locals => {:port_number => port_from(params[:rando])}
    end

    def port_from(random_string)
      random_string
      # 3001
    end

  end

  def port_open?(ip, port, seconds=1)
    Timeout::timeout(seconds) do
      begin
        TCPSocket.new(ip, port).close
        true
      rescue Errno::ECONNREFUSED, Errno::EHOSTUNREACH
        false
      end
    end
  rescue Timeout::Error
    false
  end

  def socket_up!(port = '3001')

    @clients = []

    begin
      EM::WebSocket.start(host: '0.0.0.0', port: port) do |ws|
        ws.onopen do |handshake|
          @clients << ws
          ws.send("Connected to #{handshake.path}.")
        end

        ws.onclose do
          ws.send "Closed."
          @clients.delete(ws)
        end

        ws.onmessage do |msg|
          puts "Received Message: #{msg}"
          @clients.each do |socket|
            socket.send(msg)
          end
        end
      end
    rescue => e
      nil
    end
  end

  # socket_up!

  App.run! :port => 3000
end
