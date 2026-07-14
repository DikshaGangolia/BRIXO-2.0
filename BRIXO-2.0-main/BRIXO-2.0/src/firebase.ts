import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAzRpCIiWWkqpa80NWs4QXFgyZtSIriBLA",
  authDomain: "brixo-15ece.firebaseapp.com",
  projectId: "brixo-15ece",
  storageBucket: "brixo-15ece.firebasestorage.app",
  messagingSenderId: "262298142637",
  appId: "1:262298142637:web:c36d7228abd9545de20324"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);