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

    var markerArray = [];
    function pullLatLngs() {
                  //   
           var rootRef = firebase.database().ref().child("messages");
           var str = "";
            var lat = "";
            var lng = "";
            var formattedLatLng = "";
           rootRef.on("child_added", snap => {
             var latlng = snap.child("latlng").val();
             var streetAddress = snap.child("streetAddress").val();   
             lat = latlng.substring(latlng.indexOf('(', 0) + 1, latlng.indexOf(',', 0));
             lng = latlng.substring(latlng.indexOf(',', 0) + 1, latlng.indexOf(')', 0));
             formattedLatLng = "{" + lat + "," + lng + "}";
             markerArray.push({address:streetAddress, location: formattedLatLng});

           });
           markerArray.on('value', function() {
               for (var i = 0; i < markerArray.length; i++) {
                    console.log("Location " + i +" is: " + markerArray[i].location);
               }
           });
    };




function submitClick() {
  //check that function is working
 // window.alert("click detected, function initiated.");

  //Initialize firebase database & store in var
  var firebaseRef = firebase.database().ref();

//create new var to hold the value of the text in the mainText id
//which we already got at the top when we passed document.getElementById("mainText")
//to the var mainText-->accessed with ".value"
  var messageText = mainText.value;

//pushing to database, & setting what we push as the var with our value in it
  //firebaseRef.push().set(messageText);
    pullLatLngs();
  //don't need to reference database again since it's being done in the html file
  //https://fir-web-learn-2f50a.firebaseio.com/
}//submitClick()
