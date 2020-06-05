
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
  var emailField = document.getElementById("register-email-field")
  var passwordField = document.getElementById("register-password-field")

  firebase.auth().createUserWithEmailAndPassword(emailField.value, passwordField.value).catch(function(error){
    //Handle errors here
    //Not necessary for now
  });
}

var huntList;

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("if (user) was triggered");
    // Now do things here
    // Send user to main page
    if(window.location.pathname == "/login.html"){
      window.location.replace("/main.html")
    }

    var huntUl = document.getElementById("hunt-ul");


    // User is signed in.
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
        huntLi.onclick = displayHunt(hunt.title);
        huntUl.appendChild(huntLi);

        huntList[i] = hunt;
        i++;


      });
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });




  } else {
    // User is signed out.
    // User should be redirected to login.html
    console.log("else was triggered");
    if(window.location.pathname != "/login.html"){
      window.location.replace("/login.html")
    }
  }
});


function displayHunt(huntTitle){
  console.log("displayHunt was called");
  huntList.forEach((item, i) => {
    console.log("checking item: " + item);
    console.log("item has title " + item.title);
    console.log("huntTitle is " + huntTitle);
    if(item.title == huntTitle){
      var huntModal = document.getElementById("hunt-modal");
      huntModal.style.display='block';

    }
  });


}

function onLogoutClick(){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}
