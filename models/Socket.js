
// 'Global' variables
var connectedUsers = [];
var currentUserTurn = 0;
var currentPrompt = null;
var currentStory = null;
var nextStoryUpdate = null;

// User Model
var User = function(args) {
  var self = this;

  // Socket field
  self.socket = args.socket;

  // username field
  self.username = args.username;

  // TODO: user's color
  // user's color
  // self.textColor = args.textColor;
}


/**
 * Iterates over the list of clients connected to the namespace
 * and checks to see if their room matches the roomId.
 * If it does, they are added to a list and the list is returned
 * after iteration.
 */
function getClients(namespace, roomId) {
  var res = [], ns = io.of(namespace ||"/");

  if (ns) {
    for (var id in ns.connected) {
      if(roomId) {
        var index = ns.connected[id].rooms.indexOf(roomId) ;
        if(index !== -1) {
          res.push(ns.connected[id]);
        }
      } else {
        res.push(ns.connected[id]);
      }
    }
  }
  return res;
}


function setListeners(user) {
  user.socket.on('requestUsers', function(data) {
    // Add user attributes to JSON array to send
    var users = [];
    var numberOfClients = connectedUsers.length;
    for (var i = 0; i < numberOfClients; i++) {
      users.push({
        username: connectedUsers[i].username
        // TODO: store text color
        // textColor: connectedUsers[i].textColor
      });
    }
    user.socket.emit('onlineUsers', users);
  });

  user.socket.on('requestPrompt', function(data) {
    // Send current prompt to user
    if (prompt) {
      user.socket.emit('prompt', prompt);
    }
  });

  user.socket.on('requestStory', function(data) {
    // Send the current story so far to user
    if (currentStory) {
      user.socket.emit('story', currentStory);
    }
  });

  user.socket.on('requestProgress', function(data) {
    // Send the current story progress to the user
    if (nextStoryUpdate) {
      user.socket.emit('storyProgress', nextStoryUpdate);
    }
  });

  user.socket.on('requestUserTurn', function(data) {
    // Send the current user whose turn it is turn to the user
    user.socket.emit('userTurn', currentUserTurn);
  });
}

exports.init = function(options) {

  var io = options.io;

  /**
  * Handling new socket io connections
  */
  io.on('connection', function(socket) {
    console.log('new connection');

    socket.on('error', function() {
      console.log("Error Occured")
    });

    // Invoked when client responds with login info
    socket.on('login', function(loginInfo) {
      console.log('Login attempt:', loginInfo);

      // Check if the name is a valid string
      var nameBad = !loginInfo || loginInfo.length < 3 || loginInfo.length > 10 || !(/^[a-z0-9-]+$/i.test(loginInfo));
      if (nameBad) {
        socket.emit('loginNameBad', loginInfo);
        return;
      }

      // Check if a user already has the name
      var nameExists = _.some(connectedUsers, function(item) {
        return item.username == loginInfo;
      });

      if (nameExists) {
        socket.emit('loginNameExists', loginInfo);
        return;
      } else {
        // Create new instance of user model
        var newUser = new User({
          username: loginInfo,
          socket: socket
        });

        connectedUsers.push(newUser);
        setListeners(newUser);
        io.sockets.emit('userJoined', {
          username: newUser.username
          // TODO: store text color
          // textColor: newUser.textColor
        });
      }
    });

    socket.on('disconnect', function() {
      self = this;
      var numberOfClients = connectedUsers.length;
      var clientUsername = null;
      for (var i = 0; i < numberOfClients; i++) {
        if (self == connectedUsers[i].socket) {
          clientUsername = connectedUsers[i].username;
          break;
        }
      }
      console.log('Socket disconnected');
      io.sockets.emit('userLeft', clientUsername);
    });
  });
}
