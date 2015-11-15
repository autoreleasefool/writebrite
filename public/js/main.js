var socket = io(),
    storyContainer = $("#padded-story-container"),
    story = $("#story"),
    storyProgress = $("#progress"),
    userData = '';

$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('onlineUsers', function(users) {
    
    console.log(users);
    
    userData = JSON.parse(users);
    
    var sideBar = $('#side-bar'),
        stringSection1 = "<div class='name-tag'> <svg fill='grey' id=",
        stringSection2 = " height='24' width='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'><path d='M0 0h24v24H0z' fill='none'></path></path></svg>",
        stringSection3 = " <p class='name' style='color: ",
        stringSection4 = " '> ",
        stringSection5 = "</p></div>";
        
    
    for(i in users) {
        var text = stringSection1 + users[i].username + stringSection2 + stringSection3 + users[i].textColor + stringSection4 + users[i].username + stringSection5;
        sideBar.append(text);
    }
    
  //$('#messages').append($('<li>').text(msg));
  /*

  [{
    username: 'username',
    textColor: '#ffffff'
  },
  {
    username: 'username',
    textColor: '#ffffff'
  }
  ]

  */
});

socket.on('prompt', function(prompt) {
    console.log(prompt);
    // prompt is a string
    story.append("<h1>" + prompt + "</h1></br></br>")
});

socket.on('story', function(fullStory) {
  // [
  //   update: {
  //     user: {
  //       username: 'username',
  //       textColor: '#ffffff'
  //     },
  //     body: 'this is the beginning'
  //   },
  //   update: {
  //     user: {
  //       username: 'username',
  //       textColor: '#ffffff'
  //     },
  //     body: 'this is the middle'
  //   },
  //   update: {
  //     user: {
  //       username: 'username',
  //       textColor: '#ffffff'
  //     },
  //     body: 'this is the end'
  //   }
  // ]
});

socket.on('storyUpdate', function(update) {
    
    console.log(update);
    
    story.append("<p color='" + update.textColor + "'>" + update.body + "</p>");
    
  // addition to the story - append to the end
  // {
  //   textColor: "#ffffff",
  //   body: 'this is an update'
  // }
});

socket.on('storyProgress', function(progress) {
    console.log(progress);
    storyProgress.text(progress);
  // Constant update
  // {
  //   textColor: "#ffffff",
  //   body: 'this is the next update'
  // }
});

function startTimer(textColor) {
    console.log(textColor);
    var barOverlay = $("#loading-bar-overlay");
    
    $("#loading-bar").css("border-color", textColor);
    barOverlay.removeClass("loading-timer");
    barOverlay.addClass("loading-timer");
}

socket.on('userTurn', function(userTurn) {
    console.log(userTurn);
    // userTurn is a string, username of the user's whose turn is beginning
    for(i in userData) {
        if(userTurn == userData[i].username) {
            startTimer(userData[i].textColor);
        }
    }
    storyContainer.append("<textarea id='storyTextArea'></textarea>")
});

socket.on('endTurn', function(endTurn) {
    console.log(endTurn);
  // User's turn ends - send back text
    for(i in userData) {
        if(endTurn == userData[i].username) {
            var text = $("#storyTextArea").val();
            $("#storyTextArea").remove();
            socket.emit("storyUpdate", text);
        } else {
            socket.emit("storyUpdate", storyProgress);
            storyProgress.text('');
        }
    }
});


$(document).ready(function() {

    function login() {
        socket.emit("login", "1234");
    }
    
    function test() {
        var overlay = document.getElementById('loading-overlay');
        overlay.style.height = "100%";
    }


    setTimeout(login, 1000);


});
