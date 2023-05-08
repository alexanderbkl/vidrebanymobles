import { useEffect, useState } from 'react'


import './App.css'
import { getMueblesFromFirebase } from './utils/Client'
import { SerieMueble } from './types'




function App() {
    const [muebleSerieId, setMuebleSerieId] = useState(0)
    const [muebleModeloId, setMuebleModeloId] = useState('')
    const [muebles, setMuebles] = useState<SerieMueble[]>([])


    useEffect(() => {
        getMueblesFromFirebase().then((data) => {
            if (data !== null) {
                setMuebles(data)

                console.log(data[2])
            }
        })


    }, [])


    return (
        <div className='container'>
            <div>
                {muebleSerieId !== 0 && muebleModeloId !== '0' &&
                    <img src={muebles[muebleSerieId].modelos[muebleModeloId as unknown as number].img?.toString()} className="img-fluid" alt="moble renderitzat" />}
            </div>
            <h1>Catàleg de mobles</h1>

            <div className="card">
                <p>Sel·leccionar sèrie:</p>
                <form>
                    <select onChange={(e) => {
                        setMuebleSerieId(parseInt(e.target.value))
                        setMuebleModeloId('0')
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
                    <select value={muebleModeloId} onChange={(e) => { setMuebleModeloId(e.target.value); console.log("serie id: " + muebleSerieId + " modelo id: " + muebleModeloId) }} className="form-select" aria-label="Default select example">
                        <option value={0}
                            key={0}
                        >
                            {'Escollir model'}
                        </option>
                        {
                            muebleSerieId !== 0 && Object.keys(muebles[muebleSerieId].modelos)?.map((modeloKey) => {
                                const modelo = muebles[muebleSerieId].modelos[modeloKey as unknown as number]
                                return <option value={modelo.id}
                                    key={modelo.id}
                                >
                                    {modelo.nombre}
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
