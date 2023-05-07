import { get, getDatabase, ref } from "firebase/database";
import { app } from "../firebase";

const db = getDatabase(app)


export const getMueblesFromFirebase = async () => {
    const mueblesRef = ref(db, '/muebles');
    const mueblesSnapshot = await get(mueblesRef);
    if (mueblesSnapshot.exists()) {
        return mueblesSnapshot.val()
    } else {
        console.log("No data available");
        return null
    }
}