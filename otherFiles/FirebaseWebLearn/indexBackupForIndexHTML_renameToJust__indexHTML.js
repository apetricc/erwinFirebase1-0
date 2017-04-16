var mainText = document.getElementById("mainText");
var submitBtn = document.getElementById("submitBtn");
var fireHeading = document.getElementById("fireHeading");


//we want this to happen no matter what so we're putting it outside the click function
//have to make a new ref in that case
var firebaseHeadingRef = firebase.database().ref().child("Heading");

//firebaseHeadingRef.on('value', function(datasnapshot) {
//  fireHeading.innerText = datasnapshot.val();
//});

var messagesRef = firebase.database().ref().child("messages");
    messagesRef.on('value', function(datasnapshot) {
        fireHeading.innerText = datasnapshot.child("latlng").val();
       // console.log(messagesRef);
});


function pullLatLngs() {
          //   
   var rootRef = firebase.database().ref().child("messages");

   rootRef.on("child_added", snap => {
     var latlng = snap.child("latlng").val();
     var streetAddress = snap.child("streetAddress").val();   
     markerArray.push({address:streetAddress, location: latlng});
       //console.log("Marker array contents: " + markerArray);
     $("#testAppend").append("<tr><td>" + latlng + streetAddress + "</td><td>" +
                         "</td><td><button>Remove</button></td></tr>");
        console.log("stuff in child: " + latlng);
       
   });
};



function submitClick() {
  //check that function is working
  window.alert("click detected, function initiated.");

  //Initialize firebase database & store in var
  var firebaseRef = firebase.database().ref();

//create new var to hold the value of the text in the mainText id
//which we already got at the top when we passed document.getElementById("mainText")
//to the var mainText-->accessed with ".value"
  var messageText = mainText.value;

//pushing to database, & setting what we push as the var with our value in it
  firebaseRef.push().set(messageText);

  //don't need to reference database again since it's being done in the html file
  //https://fir-web-learn-2f50a.firebaseio.com/
}//submitClick()
