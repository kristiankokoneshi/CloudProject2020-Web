
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
    lastname: lastnameField.value,
    admin: false
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
var admin;
var mymap;
var layerGroup = L.layerGroup();


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is logged in
    if(admin == null){
      console.log("admin was null");
      var docRef = db.collection("users").doc(user.email);

      docRef.get().then(function(doc) {
        if (doc.exists) {
          console.log("Document data:", doc.data());
          if(doc.data().admin == true){
            admin == true;
            // Make admin nav icon visible
            document.getElementById("admin-nav-button").className = "w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white";

          }else if (doc.data().admin == false && window.location.pathname == "/admin.html") {
            window.location.replace("/main.html")
          }
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      }).catch(function(error) {
        console.log("Error getting document:", error);
      });
    }else if(admin == true){
      document.getElementById("admin-nav-button").className = "w3-bar-item w3-button w3-hide-small w3-padding-large w3-hover-white";
    }

    if(window.location.pathname == "/login.html"){
      window.location.replace("/main.html")
    }else if (window.location.pathname == "/main.html") {

      // Setting up map
      mymap = L.map('map').setView([56.031, 14.152], 13);
      L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFydGlqbjE1MiIsImEiOiJja2I2OWtqdGIwNXh3MnlvYjNuc2FldnpyIn0.a7BqJmGsQoUB0OOP0ZbESg'
      }).addTo(mymap);

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
    }else if (window.location.pathname == "/admin.html") {
      db.collection("hunts")
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
            locations: doc.data().locations,
            owner: doc.data().owner
          }

          huntList[i] = hunt;
          i++;

        });
        openFirstTable();
      })
      .catch(function(error) {
        console.log("Error getting documents: ", error);
      });

      db.collection("locations")
      .get()
      .then(function(querySnapshot) {
        locationList = [querySnapshot.size];
        var i = 0;
        querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());

          // Create a hunt using the document database
          // Then add that to the list

          var location = {
            title: doc.id,
            description: doc.data().description,
            location: doc.data().location,
            owner: doc.data().owner,
            photo: doc.data().photo
          }

          locationList[i] = location;
          i++;

        });
        openFirstTable();
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
      //var huntModal = document.getElementById("hunt-modal");
      //huntModal.style.display='block';
      // Set modal elements to display the right information
      document.getElementById("modal-hunt-title").innerHTML = item.title;
      document.getElementById("modal-hunt-description").innerHTML = item.description;
      var locationUl = document.getElementById("modal-location-ul");
      locationUl.innerHTML = "";

      layerGroup.clearLayers();

      item.locations.forEach(function(item2, i2){
        item2
        .get()
        .then(function(doc) {
          if (doc.exists) {
            console.log("Document data:", doc.data());
            var locationLi = document.createElement("li");
            locationLi.appendChild(document.createTextNode(doc.id));
            locationUl.appendChild(locationLi);
            // Add marker to the map
            var latitude = doc.data().location.latitude;
            var longitude = doc.data().location.longitude;
            var marker = L.marker([latitude, longitude]).addTo(layerGroup);
            marker.bindPopup(doc.id);



          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }).catch(function(error) {
          console.log("Error getting document:", error);
        });
      });

      mymap.addLayer(layerGroup);
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

function openFirstTable() {
  var firstTable = document.getElementById("firstTable");
  var secondTable = document.getElementById("secondTable");
  firstTable.style.display = "block";
  secondTable.style.display="none";

  var firstTableBody = document.getElementById("first-table-body");
  var secondTableBody = document.getElementById("second-table-body");
  firstTableBody.innerHTML = "";
  secondTableBody.innerHTML = "";


  huntList.forEach(function(item, i){
    var tableRow = document.createElement("tr");

    var itemTitle = document.createElement("td");
    itemTitle.innerHTML = item.title;
    tableRow.appendChild(itemTitle);

    var itemDescription = document.createElement("td");
    itemDescription.innerHTML = item.description;
    tableRow.appendChild(itemDescription);

    var itemLocations = document.createElement("td");
    itemLocations.innerHTML = item.locations.length;
    tableRow.appendChild(itemLocations);

    var itemOwner = document.createElement("td");
    itemOwner.innerHTML = item.owner;
    tableRow.appendChild(itemOwner);

    var updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() { displayUpdateHunt(item); };
    var updateButtonTd = document.createElement("td");
    updateButtonTd.appendChild(updateButton);
    tableRow.appendChild(updateButtonTd);

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() { displayDeleteHunt(item); };
    var deleteButtonTd = document.createElement("td");
    deleteButtonTd.appendChild(deleteButton);
    tableRow.appendChild(deleteButtonTd);

    firstTableBody.appendChild(tableRow);

  });
}

function openSecondTable() {
  var firstTable = document.getElementById("firstTable");
  var secondTable = document.getElementById("secondTable");
  firstTable.style.display = "none";
  secondTable.style.display="block";

  var firstTableBody = document.getElementById("first-table-body");
  var secondTableBody = document.getElementById("second-table-body");
  firstTableBody.innerHTML = "";
  secondTableBody.innerHTML = "";

  locationList.forEach(function(item, i){
    var tableRow = document.createElement("tr");

    var itemTitle = document.createElement("td");
    itemTitle.innerHTML = item.title;
    tableRow.appendChild(itemTitle);

    var itemDescription = document.createElement("td");
    itemDescription.innerHTML = item.description;
    tableRow.appendChild(itemDescription);

    var itemLocation = document.createElement("td");
    itemLocation.innerHTML = "Lat: " + item.location.latitude + " Long: " + item.location.longitude;
    tableRow.appendChild(itemLocation);

    var itemOwner = document.createElement("td");
    itemOwner.innerHTML = item.owner;
    tableRow.appendChild(itemOwner);

    var itemPhoto = document.createElement("td");
    itemPhoto.innerHTML = item.photo;
    tableRow.appendChild(itemPhoto);

    var updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() { displayUpdateLocation(item); };
    var updateButtonTd = document.createElement("td");
    updateButtonTd.appendChild(updateButton);
    tableRow.appendChild(updateButtonTd);

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() { displayDeleteLocation(item); };
    var deleteButtonTd = document.createElement("td");
    deleteButtonTd.appendChild(deleteButton);
    tableRow.appendChild(deleteButtonTd);

    secondTableBody.appendChild(tableRow);
  });
}


function displayUpdateHunt(hunt){
  // Get the modal
  var modal = document.getElementById("update-hunt-modal");
  modal.style.display = "block";

  // Now populate the modal with the hunt information
  var updateHuntTitle = document.getElementById("update-hunt-title");
  updateHuntTitle.value = hunt.title;

  var updateHuntDescription = document.getElementById("update-hunt-description");
  updateHuntDescription.value = hunt.description;

  var updateHuntButton = document.getElementById("update-hunt-button");
  updateHuntButton.onclick = function() { performHuntUpdate(hunt.title); };



  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  var locationUl = document.getElementById("modal-location-ul");
  locationUl.innerHTML = "";

  hunt.locations.forEach(function(item, i){
    item
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

function performHuntUpdate(title){
  // Now populate the modal with the hunt information
  var updateHuntTitle = document.getElementById("update-hunt-title");
  var updateHuntDescription = document.getElementById("update-hunt-description");


  var huntRef = db.collection("hunts").doc(title);
  huntRef.update({
    description: updateHuntDescription.value
  }).then(function() {
    console.log("Document successfully updated!");
    window.location.reload();
    return false;
  })
  .catch(function(error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  });
}


function displayDeleteHunt(hunt){
  // Get the modal
  var modal = document.getElementById("delete-hunt-modal");
  modal.style.display = "block";

  // Now populate the modal with the hunt information
  var updateHuntTitle = document.getElementById("delete-hunt-title");
  updateHuntTitle.innerHTML = hunt.title;

  var updateHuntDescription = document.getElementById("delete-hunt-description");
  updateHuntDescription.innerHTML = hunt.description;

  var updateHuntButton = document.getElementById("delete-hunt-button");
  updateHuntButton.onclick = function() { performHuntDelete(hunt.title); };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  var locationUl = document.getElementById("delete-modal-location-ul");
  locationUl.innerHTML = "";

  hunt.locations.forEach(function(item, i){
    item
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

function performHuntDelete(title){
  var huntRef = db.collection("hunts").doc(title);
  huntRef.delete().then(function() {
    console.log("Document successfully deleted!");
    window.location.reload();
    return false;
  })
  .catch(function(error) {
    // The document probably doesn't exist.
    console.error("Error deleting document: ", error);
  });
}


function displayUpdateLocation(location){
  // Get the modal
  var modal = document.getElementById("update-location-modal");
  modal.style.display = "block";

  // Now populate the modal with the hunt information
  var updateHuntTitle = document.getElementById("update-location-title");
  updateHuntTitle.value = location.title;

  var updateHuntDescription = document.getElementById("update-location-description");
  updateHuntDescription.value = location.description;

  var updateLocationLatitude = document.getElementById("update-location-latitude");
  updateLocationLatitude.value = location.location.latitude;
  var updateLocationLongitude = document.getElementById("update-location-longitude");
  updateLocationLongitude.value = location.location.longitude;

  var updateHuntButton = document.getElementById("update-location-button");
  updateHuntButton.onclick = function() { performLocationUpdate(location.title); };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function performLocationUpdate(title){
  // Now populate the modal with the hunt information
  var updateHuntTitle = document.getElementById("update-location-title");
  var updateHuntDescription = document.getElementById("update-location-description");
  var updateLocationLatitude = document.getElementById("update-location-latitude");
  var updateLocationLongitude = document.getElementById("update-location-longitude");

  var huntRef = db.collection("locations").doc(title);
  huntRef.update({
    description: updateHuntDescription.value
    ,location: new firebase.firestore.GeoPoint(parseFloat(updateLocationLatitude.value), parseFloat(updateLocationLongitude.value))
  }).then(function() {
    console.log("Document successfully updated!");
    window.location.reload();
    return false;
  })
  .catch(function(error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  });
}


function displayDeleteLocation(location){
  // Get the modal
  var modal = document.getElementById("delete-location-modal");
  modal.style.display = "block";

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}
