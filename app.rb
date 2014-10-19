
require 'thin'
require 'sinatra/base'
require 'em-websocket'

EventMachine.run do
  class App < Sinatra::Base

    HOST = '0.0.0.0'

    get '/' do
      random_port = (2000..65000).to_a.sample
      erb :introduction, :locals => {:random_port => random_port}
    end

    # setup a given chatroom by port number
    # e.g. localhost:3000/4001 opens port 4001
    get '/:rando' do
      socket_up!(params[:rando])
      erb :index, :locals => {:port_number => port_from(params[:rando])}
    end

    get '/halt' do
      puts "ALL CONNECTIONS TERMINATED."
      EventMachine.stop
    end

    private

    # TODO: This should generated a valid port in a repeatable way
    # from a given URL string, instead of specifying one explicitly
    def port_from(random_string)
      random_string
    end

    def socket_up!(port = '3333')

      @clients = []

      begin
        EM::WebSocket.start(host: HOST, port: port) do |ws|
          ws.onopen do |handshake|
            @clients << ws
            ws.send("Connected to #{handshake.path}.")
          end

          ws.onclose do
            ws.send "Closed."
            @clients.delete(ws)
          end

          ws.onmessage do |msg|
            @clients.each do |socket|
              socket.send(msg)
            end
          end
        end
      rescue => e
        # Connection already exists, so don't bother making it!
        nil
      end
    end
  end

  App.run! :port => (ENV['PORT'] || 3000)
end
