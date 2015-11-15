var socket = io();

$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
});


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
    
    $('#loading-bar').css('border-color', userData[0].color);
    
    setTimeout(test, 1000);


});
