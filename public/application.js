
// Websocket client logic!

var socket,
    userID,
    // toggle to ignore and not double-display outgoing broadcasts
    outgoingToggle = false;

function logMessage(msg) {
  $("#chat-log").append("<p class='log-text'>" + msg + "</p>");
}

function addOutgoing(msg) {
  outgoingToggle = true;
  $("#chat-log").append("<p class='me-text'> &lt;" + userID + "&gt;: " + msg + "</p>");
}

function addIncoming(msg) {
  if (isFirstMessage(msg)) {
    ensureCaptureUserId(msg);
  } else if (!outgoingToggle) {
    escaped_msg = msg
      .replace(/^\[MSG\]\s/, '')
      .replace(/>/g, "&gt;")
      .replace(/</g, "&lt;");
    $("#chat-log").append("<p class='them-text'>" + escaped_msg + "</p>");
  }
  outgoingToggle = false;
}

function scrollToBottom() {
  var scrollBottom = $(window).scrollTop() + $(window).height();
  $(window).scrollTop(scrollBottom);
}

function isFirstMessage(msg) {
  return (userID === undefined && isBroadcast(msg)) ? true : false;
}

// capture userID on the FIRST broadcast
function ensureCaptureUserId(msg) {
  var my_id = msg.match(/Anon_\d/)[0];
  setUserID(my_id);
}

// bool if channel message is a BROADCAST (non ANNOUNCE, non ME)
function isBroadcast(msg) {
  return !!msg.match(/^\[BROADCAST/);
}

// executes ONCE onLoad to set current user's userID
function setUserID(id_str) {
  $('#user_name').html(id_str + " >");
  userID = id_str;
}

function broadcast(text) {
  if (text == '') {
    logMessage("Please Enter a Message");
    return;
  }

  try {
    socket.send(text);
    addOutgoing(text)
  } catch(exception) {
    logMessage("Failed to Send")
  }

  $("#message_container").val('');
}

function connect() {
  try {
    socket = new WebSocket(host);

    logMessage("Socket State: " + socket.readyState);

    socket.onopen = function() {
      logMessage("Socket Status: " + socket.readyState + " (open)");
    }

    socket.onclose = function() {
      logMessage("Socket Status: " + socket.readyState + " (closed)");
    }

    socket.onmessage = function(msg) {
      addIncoming(msg.data);
      scrollToBottom();
    }
  } catch(exception) {
    logMessage("Error: " + exception);
  }
}

// set doc title to room number
function setTitleByPath() {
  var page_path = window.location.href.split('/');
  var port = page_path[page_path.length - 1];
  document.title = "Chat Hole - Room #" + port;
}

$('#message_container').keypress(function(event) {
  if (event.keyCode == '13') {
    var message_text = $("#message_container").val();
    broadcast(message_text);
  }
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

window.onbeforeunload = closingCode;
function closingCode(){
    socket.close();
    return null;
}

$(function() {
  connect();
  setTitleByPath();
});
