// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCnT-oALVJjjBShKGKb6ZYlcZR0xjjnVwA",
    authDomain: "fabrica-vidrebany.firebaseapp.com",
    databaseURL: "https://fabrica-vidrebany-default-rtdb.firebaseio.com",
    projectId: "fabrica-vidrebany",
    storageBucket: "fabrica-vidrebany.appspot.com",
    messagingSenderId: "88093443045",
    appId: "1:88093443045:web:bb52cc8353ef2359bde50c",
    measurementId: "G-ZCBV8X1EWW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const storage = getStorage();


