
require 'thin'
require 'sinatra/base'
require 'em-websocket'

EventMachine.run do
  class App < Sinatra::Base

    if environment == :production
      HOST = '192.155.84.167'
    else
      HOST = '0.0.0.0'
    end

    get '/' do
      random_port = (2000..65000).to_a.sample
      erb :introduction, :locals => {:random_port => random_port}
    end

    # setup a given chatroom by port number
    # e.g. localhost:3000/4001 opens port 4001
    get '/:rando' do
      socket_up!(params[:rando])
      erb :index, :locals => {:host => HOST, :port_number => port_from(params[:rando])}
    end

    get '/halt' do
      puts "ALL CONNECTIONS TERMINATED."
      EventMachine.stop
    end

    private

    def socket_up!(port = '3333')

      @clients = Hash.new({
        channel: nil#,
        # member_sids: []
      })

      begin
        EM::WebSocket.start(host: HOST, port: port) do |ws|
          @clients[port][:channel] ||= EM::Channel.new
          @channel = @clients[port][:channel]

          ws.onopen do |handshake|
            ws.send("Welcome to Room ##{port}.")

            sid = @channel.subscribe { |msg| ws.send msg }

            @channel.push("[BROADCAST] Anon_#{sid} Logged in.")

            ws.onmessage do |msg|
              @channel.push("[MSG] \<Anon_#{sid}\>: #{msg}")
            end

            ws.onclose {
              ws.send("Disconnecting...")
              @channel.push("[EVENT] Anon_#{sid} has left...")
              @channel.unsubscribe(sid)
            }
          end
        end
      rescue => e
        # Connection already exists, so don't bother making it!
        nil
      end
    end
  end

  # TODO: This should generated a valid port in a repeatable way
  # from a given URL string, instead of specifying one explicitly
  def port_from(random_string)
    random_string
  end

  App.run! :port => (ENV['PORT'] || 3001)
end
