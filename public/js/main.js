
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyA5QZxa0KrS3dPUPG0t_2DhIqJ2abNhMwc",
  authDomain: "ageless-lamp-278509.firebaseapp.com",
  databaseURL: "https://ageless-lamp-278509.firebaseio.com",
  projectId: "ageless-lamp-278509",
  storageBucket: "ageless-lamp-278509.appspot.com",
  messagingSenderId: "547568656781",
  appId: "1:547568656781:web:bccb74778f022bf8595dc4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

//Login function
//Takes info from the fields and then attempts a Firebase Auth login
function onLoginClick(){
  var emailField = document.getElementById("email-field")
  var passwordField = document.getElementById("password-field")

  firebase.auth().signInWithEmailAndPassword(emailField.value, passwordField.value).catch

  (function(error){
    //Handle errors here
    //Not necessary for now
  });
}

//Register function
//Takes info from the fields and then attempts a Firebase Auth registration
function onRegisterClick(){
  var emailField = document.getElementById("register-email-field");
  var passwordField = document.getElementById("register-password-field");
  var firstnameField = document.getElementById("register-firstname-field");
  var lastnameField = document.getElementById("register-lastname-field");

  var docData = {
    firstname: firstnameField.value,
    lastname: lastnameField.value
  }
  
  db.collection("users").doc(emailField.value).set(docData).then(function() {
    console.log("Document successfully written!");
    firebase.auth().createUserWithEmailAndPassword(emailField.value, passwordField.value).catch(function(error){
      //Handle errors here
      //Not necessary for now
    });
  });



}

var huntList;
var locationList;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is logged in
    if(window.location.pathname == "/login.html"){
      window.location.replace("/main.html")
    }else if (window.location.pathname == "/main.html") {

      // On main page we want to load the main page elements (such as hunt list)
      var huntUl = document.getElementById("hunt-ul");
      // Here we should load the user's hunts and display user specific information
      db.collection("hunts").where("owner", "==", user.email)
      .get()
      .then(function(querySnapshot) {
        huntList = [querySnapshot.size];
        var i = 0;
        querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());

          // Create a hunt using the document database
          // Then add that to the list

          var hunt = {
            title: doc.id,
            description: doc.data().description,
            locations: doc.data().locations
          }


          var huntLi = document.createElement("li");
          huntLi.appendChild(document.createTextNode(hunt.title))
          huntLi.onclick = function() { displayHunt(hunt.title); };
          //huntLi.value = "Kristianstad Top 10";
          huntUl.appendChild(huntLi);

          huntList[i] = hunt;
          i++;


        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });

    }else if (window.location.pathname == "/createhunt.html") {
      // Here we need to populate the locations list so the user can select some for their hunt
      // On main page we want to load the main page elements (such as hunt list)
      var locationUl = document.getElementById("location-ul");
      // Here we should load the user's hunts and display user specific information
      db.collection("locations")
      .get()
      .then(function(querySnapshot) {
        locationList = [querySnapshot.size];
        var i = 0;
        querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());

          // Create a location using the document database
          // Then add that to the list

          var location = {
            title: doc.id,
            description: doc.data().description,
            location: doc.data().location,
            owner: doc.data().owner,
            photo: doc.data().photo
          }

          var locationLi = document.createElement("li");
          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = location.title + "checkbox";

          locationLi.appendChild(checkbox);
          locationLi.appendChild(document.createTextNode(location.title))

          locationUl.appendChild(locationLi);

          locationList[i] = location;
          i++;
        });
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });
    }
  } else {
    // User is signed out.
    // User should be redirected to login.html
    console.log("else was triggered");
    if(window.location.pathname != "/login.html"){
      window.location.replace("/login.html")
    }
  }
});

// Displays a modal that shows information on the selected hunt
function displayHunt(huntTitle){
  //huntTitle = huntTitle.value;
  console.log("displayHunt was called");
  huntList.forEach(function(item, i){
    console.log("checking item: " + item);
    console.log("item has title " + item.title);
    console.log("huntTitle is " + huntTitle);
    if(item.title == huntTitle){
      var huntModal = document.getElementById("hunt-modal");
      huntModal.style.display='block';
      // Set modal elements to display the right information
      document.getElementById("modal-hunt-title").innerHTML = item.title;
      document.getElementById("modal-hunt-description").innerHTML = item.description;
      var locationUl = document.getElementById("modal-location-ul");


      item.locations.forEach(function(item2, i2){
        item2
        .get()
        .then(function(doc) {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            var locationLi = document.createElement("li");
            locationLi.appendChild(document.createTextNode(doc.id));
            locationUl.appendChild(locationLi);
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch(function(error) {
          console.log("Error getting document:", error);
        });
      });
    }
  });
}

function createHunt(){
  // Get all of the information
  // Then store it in the database
  var title = document.getElementById("create-hunt-title").value;
  console.log(title);
  var description = document.getElementById("create-hunt-description").value;
  console.log(description);

  var locationsToAdd = [];
  var user = firebase.auth().currentUser;
  var j = 0;

  // Run through locations
  locationList.forEach(function(item, i){
    var checkbox = document.getElementById(item.title + "checkbox");

    // Check each checkbox
    // If the box is checked the location should be added
    if(checkbox.checked){
      locationsToAdd[j] = db.doc("locations/" + item.title);
      j++;
    }
  });

  var docData = {
    description: description,
    locations: locationsToAdd,
    owner: user.email
  }

  console.log(docData);

  db.collection("hunts").doc(title).set(docData).then(function() {
    console.log("Document successfully written!");
    window.location.replace("/main.html");
  });




}

// Logs the user out
function onLogoutClick(){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}
