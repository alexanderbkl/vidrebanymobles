import { useState } from 'react'

import Born_120_Fresno from './assets/born120/Born120Fresno.jpg'
import Born_120_Neva from './assets/born120/Born120Neva.jpg'
import Test_120_Olmo from './assets/born120/Test120Olmo.jpg'
import './App.css'

import { getDatabase, ref, set, update } from 'firebase/database'
import { uploadBytes, ref as refStorage, getDownloadURL, getStorage } from "firebase/storage";

import { app } from './firebase'

const db = getDatabase(app)

const muebles = [
    {
        id: 0,
        serie: 'Born 120',
        modelos: [
            {
                id: 0,
                modelo: 'Fresno',
                img: Born_120_Fresno,
            },
            {
                id: 1,
                modelo: 'Neva',
                img: Born_120_Neva,
            },
        ]
    },
    {
        id: 1,
        serie: 'Test 120',
        modelos: [
            {
                id: 0,
                modelo: 'Olmo',
                img: Test_120_Olmo,
            },
        ]
    },
]

//add first mueble of muebles to firebase, the parent key identifies with id of the moble and child has all the content of the moble
const sendToFirebase = () => {
    update(ref(db, '/'), {
        muebles: [muebles[0]]
    })

    //add a new moble to firebase
}

//send to firebase storage even if there are no imports
const sendToFirebaseStorage = (file: File) => {
    const storage = refStorage(getStorage(), 'images/' + file.name);
    uploadBytes(storage, file).then((snapshot) => {
        console.log('Uploaded a blob or file!');
    });
}

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('submit')
    //alert the data of the form
    alert(e.target[0].value + ' ' + e.target[1].value);
    //sendToFirebase()
    //sendToFirebaseStorage()
}

function Admin() {
    const [muebleId, setMuebleId] = useState(0)
    const [muebleModelo, setMuebleModelo] = useState(0)


    return (
        <div className='container'>
            <div>
                <img src={muebles[muebleId].modelos[muebleModelo].img ? muebles[muebleId].modelos[muebleModelo].img : ''} className="img-fluid" alt="React logo" />
            </div>
            <h1>Admin mobles renderitzats</h1>
            <button className='btn btn-primary m-2' type="button" data-bs-toggle="collapse" data-bs-target="#addCollapse" aria-expanded="false" aria-controls="collapseExample">Afegir un nou moble</button>
            <div className="collapse" id="addCollapse">
                <form className='d-flex justify-content-center align-items-center flex-column' onSubmit={handleSubmit()}>
                    {/*name model*/}
                    <input type="text" className="form-control m-2" placeholder="Nom del model" />
                    {/*serie*/}
                    <input type="text" className="form-control m-2" placeholder="Sèrie" />
                    <input type="file" className="form-control w-50" />
                    <button type="submit" className="btn btn-primary m-2">Afegir</button>
                </form>
            </div>
            <div className="card">
                <p>Seleccionar sèrie:</p>
                <form>
                    <select onChange={(e) => {
                        setMuebleId(parseInt(e.target.value))
                        setMuebleModelo(0)
                    }}
                        className="form-select"
                        aria-label="Default select example">

                        {
                            muebles.map((mueble) => {
                                return <option value={mueble.id}
                                    key={mueble.id}
                                >
                                    {mueble.serie}
                                </option>
                            })
                        }
                    </select>
                </form>
                <p>Seleccionar model:</p>
                <form>
                    <select onChange={(e) => { setMuebleModelo(parseInt(e.target.value)) }} className="form-select" aria-label="Default select example">
                        {
                            muebles[muebleId].modelos.map((modelo) => {
                                return <option value={modelo.id}
                                    key={modelo.id}
                                >
                                    {modelo.modelo}
                                </option>
                            })
                        }

                    </select>
                </form>
                <p>
                    Sel·leccionar sèrie i model del <code>moble renderitzat</code>.
                </p>
            </div>
            <p className="read-the-docs">
                © Vidre!BANY 2023
            </p>

        </div>
    )
}

export default Admin
