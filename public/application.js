
// Websocket client logic!

var socket;

function addMessage(msg) {
  $("#chat-log").append(msg + "<br>");
}

function addOutgoing(msg) {
  $("#chat-log").append("<p class='me-text'>  ME: " + msg + "</p><br>");
}

function addIncoming(msg) {
  $("#chat-log").append("<p class='them-text'>THEM: " + msg + "</p><br>");
}

function scrollToBottom() {
  var scrollBottom = $(window).scrollTop() + $(window).height();
  $(window).scrollTop(scrollBottom);
}

function send() {
  var text = $("#message").val();

  if (text == '') {
    addMessage("Please Enter a Message");
    return;
  }

  try {
    socket.send(text);
    addOutgoing(text)
  } catch(exception) {
    addMessage("Failed to Send")
  }

  $("#message").val('');
}

function connect() {
  try {
    socket = new WebSocket(host);

    addMessage("Socket State: " + socket.readyState);

    socket.onopen = function() {
      addMessage("Socket Status: " + socket.readyState + " (open)");
    }

    socket.onclose = function() {
      addMessage("Socket Status: " + socket.readyState + " (closed)");
    }

    socket.onmessage = function(msg) {
      addIncoming(msg.data);
      scrollToBottom();
    }
  } catch(exception) {
    addMessage("Error: " + exception);
  }
}

$('#message').keypress(function(event) {
  if (event.keyCode == '13') { send(); }
});

$("#disconnect").click(function() {
  socket.close();
})

$("#disconnect-all").click(function() {
    $.ajax({
        url:"halt",
        success: function(result){
          // YAY!
        },
        error: function(result) {
          // BOO!
        }
    });
  socket.close();
})

$(function() {
  connect();
});
