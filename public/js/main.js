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

    
    function test() {
        var overlay = document.getElementById('loading-overlay');
        overlay.style.height = "100%";
    }
    
    // ajax call instead of false data
    var userData = [
        {name:"Cole Clifford", color:""},
        {name:"Joseph Roque", color:""},
        {name:"Bob Dylan", color:""},
        {name:"Tim Teabow", color:""},
        {name:"Bruce Lee", color:""}
    ],
        color = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#9E9E9E', '#607D8B'],
        endingSVGText = " height='24' width='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'><path d='M0 0h24v24H0z' fill='none'></path></path></svg>",
        sideBar = $('#side-bar');
    
    for(i=0; i<userData.length; i++) {
        var randomNumForColor = Math.random() * 17,
            userColor = color[Math.floor(randomNumForColor)],
            text = "<div class='name-tag'> <svg fill=" + userColor + endingSVGText + " <p class='name' style='color:" + userColor + "'>" + userData[i].name + "</p></div>";
        
        userData[i].color = userColor;
        sideBar.append(text);
        
    }
    
//    setTimeout(test, 1000);
    

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

