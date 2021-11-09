import firebase from "firebase";

var firebaseConfig = {
  // apiKey: "", // Add API Key
  // databaseURL:"" // Add databaseURL
  apiKey: "AIzaSyC36L67iXobi1gEUo8tPPpmRSYIJ35uKbE",
  databaseURL: "https://web-meet-f4b8b-default-rtdb.asia-southeast1.firebasedatabase.app",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const db = firebase;

var firepadRef = firebase.database().ref();

export let userName = "";
if (window.location.pathname == "/meet") {
  userName = prompt("Masukkan nama Anda :");
  
  const urlparams = new URLSearchParams(window.location.search);
  const roomId = urlparams.get("id");

  if (roomId) {
    firepadRef = firepadRef.child(roomId);
  } else {
    firepadRef = firepadRef.push();
    window.history.replaceState(null, "Meet", "?id=" + firepadRef.key);
  }
}

export default firepadRef;
