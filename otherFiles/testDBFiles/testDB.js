

//use jquery to make things easier
$(document).ready(function() {
 var rootRef = firebase.database().ref().child("messages");

  rootRef.on("child_added", snap => {
    //var name = snap.child("name").val();
    var text = snap.child("text").val();
    $("#clickedAddress").append(""+name+"" + text);
  });


});