import { ChangeEvent, useEffect, useRef, useState } from 'react'

import Born_120_Fresno from './assets/born120/Born120Fresno.jpg'
import Born_120_Neva from './assets/born120/Born120Neva.jpg'
import Test_120_Olmo from './assets/born120/Test120Olmo.jpg'
import './App.css'

const muebles = [
    {
        id: 1,
        serie: 'Born 120',
        modelos: [
            {
                id: 1,
                modelo: 'Fresno',
                img: Born_120_Fresno,
            },
            {
                id: 2,
                modelo: 'Neva',
                img: Born_120_Neva,
            },
        ]
    },
    {
        id: 2,
        serie: 'Test 120',
        modelos: [
            {
                id: 1,
                modelo: 'Olmo',
                img: Test_120_Olmo,
            },
        ]
    },
]


function App() {
    const [muebleSerieId, setMuebleSerieId] = useState(0)
    const [muebleModeloId, setMuebleModeloId] = useState(0)




    return (
        <div className='container'>
            <div>
                {muebleSerieId !== 0 && muebleModeloId !== 0 && <img src={muebles[muebleSerieId - 1].modelos[muebleModeloId - 1].img} className="img-fluid" alt="moble renderitzat" />}
            </div>
            <h1>Catàleg de mobles</h1>
            
            <div className="card">
                <p>Sel·leccionar sèrie:</p>
                <form>
                    <select onChange={(e) => {
                        setMuebleSerieId(parseInt(e.target.value))
                        setMuebleModeloId(0)
                    }}
                        className="form-select"
                        aria-label="Default select example">
                        <option value={0}
                            key={0}
                        >
                            {'Escollir sèrie'}
                        </option>
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
                <p>Sel·leccionar model:</p>
                <form>
                    <select value={muebleModeloId} onChange={(e) => { setMuebleModeloId(parseInt(e.target.value)); console.log("serie id: " + muebleSerieId + " modelo id: " + muebleModeloId) }} className="form-select" aria-label="Default select example">
                        <option value={0}
                            key={0}
                        >
                            {'Escollir model'}
                        </option>
                        {
                            muebleSerieId !== 0 && muebles[muebleSerieId - 1].modelos.map((modelo) => {
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

export default App
