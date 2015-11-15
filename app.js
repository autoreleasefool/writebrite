/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var sass = require('node-sass-middleware');


/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  debug: true,
  outputStyle: 'expanded'
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  if (/api/i.test(req.path)) req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * Primary app routes.
 */
app.get('/', homeController.index);

/**
 * Error Handler.
 */
app.use(errorHandler());

// User Model
var User = function(args) {
  var self = this;

  // username field
  self.username = args.username;

  // user's color
  self.textColor = args.textColor;

  // user's socket
  self.socket = args.socket;

  // user's id
  self.guid = args.guid;
}

// Generate guid
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// Text colors for users
var availableColors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#9E9E9E', '#607D8B'];
var usedColors = [];
for (var i = 0; i < availableColors.length; i++) {
  usedColors.push(false);
}

var currentUser = 0;
var users = [];
var storyBody = [];
var lastStoryProgress = '';
var currentPrompt = '';
var turnEnded = false;
var turnLength = 10;

function updateStory(data) {
  if (!turnEnded) {
    turnEnded = true;
    if (data) {
      var update = JSON.parse(data);
      if (users.length > 0 && update.guid == users[currentUser].guid) {
        // Update from valid user
        io.sockets.emit('storyUpdate', JSON.stringify({
          textColor: users[currentUser].textColor,
          body: update.body
        }));
      }
    } else {
      if (users.length > 0) {
        io.sockets.emit('storyUpdate', JSON.stringify({
          textColor: users[currentUser].textColor,
          body: lastStoryProgress
        }));
      }
    }

    // Begin next user's turn
    if (users.length > 0) {
      currentUser = (currentUser + 1) % users.length;
      io.sockets.emit('userTurn', users[currentUser].username);
      setTimeout(endCurrentTurn, turnLength * 1000);
    } else {
      currentUser = 0;
    }
  }
}

function endCurrentTurn() {
  turnEnded = false;
  if (users.length > 0) {
    io.sockets.emit('endTurn', users[currentUser].username);
  }
  setTimeout(updateStory, 1000);
}

// Client connected
io.on('connection', function(socket) {
  console.log('A user has connected.');

  socket.on('login', function(username) {
    console.log('username requested:', username);
    // Check if the name is a valid string
    var nameBad = !username || username.length < 3 || username.length > 10 || !(/^[a-z0-9-]+$/i.test(username));
    if (nameBad) {
      socket.emit('loginNameBad', username);
      return;
    }

    // Check if a user already has the name
    var nameExists = _.some(users, function(item) {
      return item.username == username;
    });

    if (nameExists) {
      socket.emit('loginNameExists', username);
      return;
    } else {

      var textColorIndex = Math.floor(Math.random() * 17);
      var initialColorIndex = textColorIndex;
      var isRoom = true;
      while (usedColors[textColorIndex]) {
        textColorIndex = (textColorIndex + 1) % usedColors.length;
        if (textColorIndex == initialColorIndex) {
          isRoom = false;
          break;
        }
      }

      if (!isRoom) {
        socket.emit('loginNoRoom', username);
        return;
      } else {
        usedColors[textColorIndex] = true;
      }

      var userId = guid();
      // Create new instance of user model
      var newUser = new User({
        username: username,
        textColor: availableColors[textColorIndex],
        socket: socket,
        guid: userId
      });

      users.push(newUser);
      if (users.length == 1) {
        currentUser = 0;
        setTimeout(endCurrentTurn, turnLength * 1000);
      }

      // Send all info to the user about the story
      usersToSend = [];
      for (var i = 0; i < users.length; i++) {
        usersToSend.push({username: users[i].username, textColor: users[i].textColor});
      }
      io.sockets.emit('onlineUsers', JSON.stringify(usersToSend));
      socket.emit('acceptLogin', newUser.guid);
      socket.emit('prompt', 'Blasphemy!');
      socket.emit('story', storyBody);
      socket.emit('storyProgress', lastStoryProgress);
      socket.emit('userTurn', users[currentUser].username);
    }
  });

  socket.on('storyUpdate', function(data) {
    updateStory(data);
  });

  socket.on('storyProgress', function(data) {
    var progress = JSON.parse(data);
    if (progress.guid == users[currentUser].guid) {
      // Progress from valid user
      lastStoryProgress = progress.body;
      io.sockets.emit('storyProgress', {
        textColor: users[currentUser].textColor,
        body: progress.body
      });
    }
  });

  // Client disconnect
  socket.on('disconnect', function() {
    console.log('A user has disconnected.');
    if (users.length > 0) {
      if (users[currentUser].socket == socket) {
        users.splice(currentUser, 1);
        if (currentUser >= users.length) {
          currentUser = 0;
        }
        if (users.length > 0) {
          io.sockets.emit('userTurn', users[currentUser].username);
        }

        endCurrentTurn();
      }
    }
  });
});

http.listen(3000, function() {
  console.log('Listening on *:3000');
})

module.exports = app;
