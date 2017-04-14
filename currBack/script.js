/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */




  var messageBox;
  var markerArray = [];
  // Initializes ErwinWifiMap.
  function WifiMap() {
    this.checkSetup();

    // Shortcuts to DOM Elements.
    this.messageList = document.getElementById('messages');
    this.messageForm = document.getElementById('message-form');
    this.messageInput = document.getElementById('message');
    this.submitButton = document.getElementById('submit');
    
    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');
    this.signInSnackbar = document.getElementById('must-signin-snackbar');

    // Saves message on form submit.
    //currently using mouseover event to reenable submit button
    this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));

    // Toggle for the button.
    var buttonTogglingHandler = this.toggleButton.bind(this);
    buttonTogglingHandler();

    this.messageInput.addEventListener('change', buttonTogglingHandler);


    this.initFirebase();
  }

  // Sets up shortcuts to Firebase features and initiate firebase auth.
  WifiMap.prototype.initFirebase = function() {
    // shortcuts to firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
    //initiates firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

  };

  // Loads chat messages history and listens for upcoming ones.
  WifiMap.prototype.loadMessages = function() {
    // Reference to the /messages/ database path.
    this.messagesRef = this.database.ref('messages');

    // Make sure we remove all previous listeners.
    this.messagesRef.off();

    // Loads the last 12 messages and listens for new ones.
    var setMessage = function(data) {
      var val = data.val();
      this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
    }.bind(this);
    this.messagesRef.limitToLast(12).on('child_added', setMessage);
    this.messagesRef.limitToLast(12).on('child_changed', setMessage);
  };
  //*********************************************************************************************
  //loads locations to the map and listens for new ones.
  WifiMap.prototype.loadLocations = function() {
      //reference the /messages/ database path
      this.locationsRef = this.database.ref().child('Locations');
      alert("This is what's in locationsRef" + this.locationsRef.val());



      //remove any event listeners on those messages
      //this.locationsRef.off();

  //     var rootRef = firebase.database().ref().child("Users");

  // rootRef.on("child_added", snap => {
  //   var name = snap.child("Name").val();
  //   var email = snap.child("Email").val();
  //   $("#table_body").append("<tr><td>" + name + "</td><td>" + email +
  //                       "</td><td><button>Remove</button></td></tr>");
  // });




      //load all the messages as the locations they are to markers array
      // var setLocation = function(data) {
      //     var val = data.val();
      //     this.displayLocation(data.key, val.name, val.text, val.photoUrl);
      // }.bind(this);
      // this.messagesRef.on('child_added', setLocation);
      // this.messagesRef.on('child_changed', setLocation);
  }//loadLocations()
  // Saves a new message on the Firebase DB.
  WifiMap.prototype.saveMessage = function(e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (this.messageInput.value && this.checkSignedInWithMessage()) {
      var currentUser = this.auth.currentUser;
      // Add a new message entry to the Firebase Database.
      this.messagesRef.push({
        name: currentUser.displayName,
        text: this.messageInput.value,
        photoUrl: currentUser.photoURL || '../images/profile_placeholder.png'
      }).then(function() {
        //clear message text field and SEND button state.
        WifiMap.resetMaterialTextfield(this.messageInput);
        this.toggleButton();
      }.bind(this)).catch(function(error) {
        console.error('Error writing new message to Firebase Database.', error);
      });
    }
  };

  // Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
  WifiMap.prototype.setImageUrl = function(imageUri, imgElement) {
    // If image is a Cloud Storage URI we fetch the URL.
    if (imageUri.startsWith('gs://')) {
      imgElement.src = WifiMap.LOADING_IMAGE_URL; // display a loading image first.
      this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
        imgElement.src = metadata.downloadURLs[0];
      });
    } else {
      imgElement.src = imageUri;
    }
  };


  // Signs-in Friendly Chat.
  WifiMap.prototype.signIn = function() {
    // Sign in firebase using popup auth and Google as the identity provider,
    //I would like to try using something that doesn't require a popup!!
    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithRedirect(provider);
    //this.auth.signInWithPopup(provider);
  };

  // Signs-out of Friendly Chat.
  WifiMap.prototype.signOut = function() {
    // Sign out of Firebase.
    this.auth.signOut();
  };

  // Triggers when the auth state change for instance when the user signs-in or signs-out.
  WifiMap.prototype.onAuthStateChanged = function(user) {
    if (user) { // User is signed in!
      // Get profile pic and user's name from the Firebase user object.
      var profilePicUrl = user.photoURL;   // TODO(DEVELOPER): Get profile pic.
      var userName = user.displayName;        // TODO(DEVELOPER): Get user's name.

      // Set the user's profile pic and name.
      this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
      this.userName.textContent = userName;

      // Show user's profile and sign-out button.
      this.userName.removeAttribute('hidden');
      this.userPic.removeAttribute('hidden');
      this.signOutButton.removeAttribute('hidden');

      // Hide sign-in button.
      this.signInButton.setAttribute('hidden', 'true');

      // We load currently existing chant messages.
      this.loadMessages();

        //we load currently existing locations
        this.loadLocations();

      // We save the Firebase Messaging Device token and enable notifications.
      this.saveMessagingDeviceToken();
    } else { // User is signed out!
      // Hide user's profile and sign-out button.
      this.userName.setAttribute('hidden', 'true');
      this.userPic.setAttribute('hidden', 'true');
      this.signOutButton.setAttribute('hidden', 'true');

      // Show sign-in button.
      this.signInButton.removeAttribute('hidden');
    }
  };

  // Returns true if user is signed-in. Otherwise false and displays a message.
  WifiMap.prototype.checkSignedInWithMessage = function() {
    // return true if the user is signed IN firebase
    if (this.auth.currentUser) {
      return true;
    }
    // Display a message to the user using a Toast.
    var data = {
      message: 'You must sign-in first',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return false;
  };

  // Saves the messaging device token to the datastore.
  WifiMap.prototype.saveMessagingDeviceToken = function() {
    firebase.messaging().getToken().then(function(currentToken) {
      if (currentToken) {
        console.log('Got FCM device token:', currentToken);
        // Saving the Device Token to the datastore.
        firebase.database().ref('/fcmTokens').child(currentToken).set(firebase.auth().currentUser.uid);
      } else {
        // Need to request permission to show notifications.
        this.requestNotificationsPermissions();
      }
    }.bind(this)).catch(function(error) {
      console.error('Unable to get messaging token.', error);
    });
  };

  // Requests permissions to show notifications.
  WifiMap.prototype.requestNotificationsPermissions = function() {
    console.log('Requesting notifications permission...');
    firebase.messaging().requestPermission().then(function() {
      // Notification permission granted.
      this.saveMessagingDeviceToken();
    }.bind(this)).catch(function(error) {
      console.error('Unable to get permission to notify.', error);
    });
  };

  // Resets the given MaterialTextField.
  WifiMap.resetMaterialTextfield = function(element) {
    element.value = '';
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
  };

  // Template for messages.
  WifiMap.MESSAGE_TEMPLATE =
      '<div class="message-container">' +
        '<div class="spacing"><div class="pic"></div></div>' +
        '<div class="message"></div>' +
        '<div class="name"></div>' +
      '</div>';

  // A loading image URL.
  WifiMap.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

  // Displays a Message in the UI.
  WifiMap.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
    var div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    if (!div) {
      var container = document.createElement('div');
      container.innerHTML = WifiMap.MESSAGE_TEMPLATE;
      div = container.firstChild;
      div.setAttribute('id', key);
      this.messageList.appendChild(div);
    }
    if (picUrl) {
      div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
    }
    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');
    if (text) { // If the message is text.
      messageElement.textContent = text;
      // Replace all line breaks by <br>.
      messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
    } else if (imageUri) { // If the message is an image.
      var image = document.createElement('img');
      image.addEventListener('load', function() {
        this.messageList.scrollTop = this.messageList.scrollHeight;
      }.bind(this));
      this.setImageUrl(imageUri, image);
      messageElement.innerHTML = '';
      messageElement.appendChild(image);
    }
    // Show the card fading-in.
    setTimeout(function() {div.classList.add('visible')}, 1);
    this.messageList.scrollTop = this.messageList.scrollHeight;
    this.messageInput.focus();
  };
  //****************************************************************************************************
  //display locations in the UI
  WifiMap.prototype.displayLocation = function() {
    alert("display location");
  }









  // Enables or disables the submit button depending on the values of the input
  // fields.
  //if (this.messageInput.value) {
  WifiMap.prototype.toggleButton = function() {
    if (true) {
      this.submitButton.removeAttribute('disabled');
    } else {
      this.submitButton.setAttribute('disabled', 'true');
    }
  };

  // Checks that the Firebase SDK has been correctly setup and configured.
  WifiMap.prototype.checkSetup = function() {
    if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
      window.alert('You have not configured and imported the Firebase SDK. ' +
          'Make sure you go through the codelab setup instructions.');
    } else if (config.storageBucket === '') {
      window.alert('Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
          'actually a Firebase bug that occurs rarely. ' +
          'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
          'and make sure the storageBucket attribute is not empty. ' +
          'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
          'displayed there.');
    }
  };

  window.onload = function() {
    window.wifiMap = new WifiMap();
  };
//WifiMap.prototype.displayLocation();
      function reverseGeocodeAddress(geocoder, resultsMap) {
        $('#message').empty();
        var address = "";  
        geocoder.geocode({'address': point}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            WifiMap.prototype.toggleButton = true;
            resultsMap.setCenter(results[0].geometry.location);

              addressString = results[0].formatted_address;
              //alert(results[0].geometry.location);
              console.log("This is what's in the addressString var: " + addressString);
              addressNode = document.createTextNode(addressString);
              
              $('#message').val(addressString + "; \n" + results[0].geometry.location);
              //document.getElementById("message").appendChild(addressNode);
              // $('#testAppend').empty();
              // $('#testAppend').append(addressNode);
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }//reverseGeocodeAddress()  
      WifiMap.prototype.loadLocations();      
      function gatherLocations() {
        alert("gathering locations");
      }





      function addMarkers(geocoder, resultsMap) {

      }