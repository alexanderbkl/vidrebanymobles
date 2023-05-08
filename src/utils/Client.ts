import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase";
import { SerieMueble } from "../types";

const db = getDatabase(app)


export const getMueblesFromFirebase = async () => {
    const mueblesRef = ref(db, '/muebles');

    const dataFinal: SerieMueble[] = await new Promise((res) => {

        onValue(mueblesRef, (snapshot) => {
            const data = snapshot.val();
            if (snapshot.exists()) {
                res(data)
            } else {
                console.log("No data available");
                res([])
            }
        });


    }) 
    return dataFinal
    
}