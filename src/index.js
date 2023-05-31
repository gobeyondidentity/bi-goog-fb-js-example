//file /src/index.js contents
import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, OAuthProvider, signOut, onAuthStateChanged, getRedirectResult, signInWithCredential } from "firebase/auth";

//UI elements
let btnSignInWithBI = document.getElementById('btnSignInWithBI');
let btnCheckSignIn = document.getElementById('btnCheckSignIn');
let btnSignOut = document.getElementById('btnSignOut');
let statusResult = document.getElementById('statusResult')
let working = document.getElementById('working')
let columnDiv = document.getElementById('columndiv')

const firebaseConfig = {
   //your firebase web app config here:
   apiKey: "AIzaSyCD0dZ60icWgu2752gLsBjpq_skX9f1PV8",
   authDomain: "growthanalytics.firebaseapp.com",
   projectId: "growthanalytics",
   storageBucket: "growthanalytics.appspot.com",
   messagingSenderId: "974483203513",
   appId: "1:974483203513:web:f7560da60a9209034f8268"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//create provider
const provider = new OAuthProvider("oidc.bi-oidc");

//add scope to request email claim
provider.addScope('email');

//create auth object (auth functions take this as parameter)
const auth = getAuth(app);

//common page updater for getRedirectResult and authStateObserver
//expects an idTokenResult, the return from user.getIdTokenResult():
function updatePage(idTokenResult) {
      //if there is a signed in user in the context, show UI elements for signout and show id token:
        if (idTokenResult) {
          //statusResult.innerHTML = `<p>user is signed in as ${userEmail}</p>`;
          statusResult.innerHTML = `<p>user is signed in as <b>${idTokenResult.claims.email}</b></p>` + `\n<p>token issuer: ${idTokenResult.claims.iss}</p>`;
        } else {
          statusResult.innerHTML = `<p>no token</p>`;
        }
}

//get results of the 'await signInWithRedirect(auth, provider);' call
//returns null if we are just refreshing the page
//upon returning from a signin via redirect, will return a UserCredential or an error
getRedirectResult(auth).then((result) => {
  if (result) {
    console.log(result);
    result.user.getIdTokenResult().then((idTokenResult) => {updatePage(idTokenResult)} );
    }
  }).catch((error) => {
    console.log(error.message);
    statusResult.innerHTML = `<p>${error.message}</p>`;
  })

//auth state change observer - this will fire each time auth state changes or page refreshes
async function authStateObserver(user) {
    //initialize button display
    working.style.display = "none";
    columnDiv.style.display = "flex";
    statusResult.style.display = "block";
      //if there is a signed in user in the context, show UI elements for signout and show id token:
      if (user) {
        columnDiv.style.display = "flex";
        btnSignInWithBI.style.display = "none";
        btnSignOut.style.display = "block";
        btnCheckSignIn.style.display = "block";
        statusResult.style.display = "block";
    
        //get id token (this is just to show it in the UI for demo purposes)
        //let idToken = await user.getIdToken();
        //getIdToken() gets the base64 encoded token, whereas getIdTokenResult() parses it for you
        let idTokenResult = await user.getIdTokenResult();
        
        console.log(idTokenResult);

        if (idTokenResult) {
          updatePage(idTokenResult);
        } else {
          statusResult.innerHTML = `<p>no token</p>`;
        }
  
    //if there is no signed in user, indicate that in the UI and show signin button
      } else {
        btnSignInWithBI.style.display = "block";
        btnSignOut.style.display = "none";
        btnCheckSignIn.style.display = "block";
        statusResult.style.display = "block";
        columnDiv.style.display = "flex";
      }
  }
  
  //function to check user context and return the signed in email or null (for interactive signin check)
  async function isUserSignedIn() {
    const currentUser = getAuth().currentUser;
    
    if (currentUser) {
      //get id token - the getIDTokenResult function parses the jwt token for you (vs the getIdToken which gets you the b64 encoded token)
      let idTokenResult = await currentUser.getIdTokenResult();
      return idTokenResult;
    } else {
      return false;
    }
  }
  
  //initiate signin flow using redirect (vs popup)
  async function signInWithBIRedirect() {
    console.log('signin via redirect...');
  
    await signInWithRedirect(auth, provider);
  
  }
  
  //initiate signout
  function signOutUser() {
    signOut(getAuth());
    statusResult.innerHTML = ``;
  }
  
  //common sign in / sign out function, based on user signin context
  async function signInSignOut() {
    let signedIn = await isUserSignedIn();
  
    if (signedIn) {
      signOutUser();
  
    } else {
      await signInWithBIRedirect();
  
    }
  }

  async function checkUserSignIn() {
    let signedIn = await isUserSignedIn();
  
    if (signedIn) {
      updatePage(signedIn);
      statusResult.innerHTML += `\n<p>\(we promise\)</p>`;
     
    } else {
      statusResult.innerHTML = `<p>not signed in</p>`;  
    }

  }
  
  //button click handlers
  btnSignInWithBI.onclick = signInSignOut;
  btnCheckSignIn.onclick = checkUserSignIn;
  btnSignOut.onclick = signInSignOut;
  
  //subscribe to auth state changes
  onAuthStateChanged(auth, authStateObserver);
  
  working.style.display = "block";  //the page has loaded but we don't have an auth state change yet to trigger the observer

console.log('debug me');