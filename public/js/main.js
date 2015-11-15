var socket = null;
var username = null;
var textColor = 0;

function generateId() {
  var d = new Date().getTime();
  var id = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  });
  console.log(id);
  return id;
};

/**
 * Attempts to log the user in with the provided username
 */
function attemptLogin(username) {
  console.log('attempting to login', username);
  socket.emit('login', username);
}

$(document).ready(function() {
  socket = io.connect('http://localhost:3000/');
  socket.on('connect',function() {
    console.log('connected');
    attemptLogin(generateId());
  });

  socket.on('init', function(data) {
    console.log('init');
    attemptLogin(generateId());
  });

  socket.on('onlineUsers', function(data) {
    // TODO: update user list
    console.log(data);
  });

  socket.on('prompt', function(data) {
    // TODO: update the story prompt
    console.log(data);
  })

  socket.on('story', function(data) {
    // TODO: set story contents
    console.log(data);
  });

  socket.on('storyUpdate', function(data) {
    // TODO: add to story contents
    console.log(data);
  });

  socket.on('loginNameBad', function(data) {
    // TODO: inform user that username is invalid
    console.log(data);
    attemptLogin(generateId());
  });

  socket.on('loginNameExists', function(data) {
    // TODO: inform user that username exists
    console.log(data);
    attemptLogin(generateId());
  });

  socket.on('userJoined', function(data) {
    var jsonData = JSON.parse(data);
    if (username == jsonData.username) {
      // TODO: set text color
      //textColor = jsonData.textColor;
      socket.emit('requestUsers', {});
      socket.emit('requestPrompt', {});
      socket.emit('requestStory', {});
      socket.emit('requestProgress', {});
      socket.emit('requestUserTurn', {});
      return;
    }
    // TODO: new user has joined the room - add them to the list
  });

  socket.on('userLeft', function(username) {
    if (username == username) {
      // do nothing, this user has left the room
      return;
    }
    // TODO: user has left the room - remove them from the list
    console.log(data);
  });

  socket.on('storyProgress', function(data) {
    // TODO: user has typed new text for the story
    console.log(data);
  });

  socket.on('beginTurn', function(data) {
    // TODO: begin turn animation
    console.log(data);
  })

  socket.on('endTurn', function(data) {
    // TODO: end turn animation, submit written text
    console.log(data);
  });

  socket.on('userTurn', function(data) {
    // TODO: update sidebar with current user's turn, set color
    console.log(data);
  });

});
