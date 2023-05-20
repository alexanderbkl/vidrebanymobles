import { useEffect, useState } from 'react'


import './App.css'
import { getMueblesFromFirebase } from './utils/Client'
import { SerieMueble } from './types'




function App() {
    const [muebleSerieId, setMuebleSerieId] = useState('0')
    const [muebleModeloId, setMuebleModeloId] = useState('0')
    const [muebles, setMuebles] = useState<SerieMueble[]>([{
        id: 0,
        modelos: [],
        serie: ''
    }])


    useEffect(() => {
        getMueblesFromFirebase().then((data) => {
            if (data !== null) {
                setMuebles(data)
            }
        })


    }, [])


    return (
        <div className='container'>
            <div>
                {muebleSerieId !== '0' && muebleModeloId !== '0' &&
                    <img src={muebles[muebleSerieId as unknown as number]?.modelos[muebleModeloId as unknown as number].img?.toString()} className="img-fluid" alt="moble renderitzat" />}
                    {/*Button to download the image*/}
                    {muebleSerieId !== '0' && muebleModeloId !== '0' &&
                    <button className="btn btn-primary m-2" onClick={() => {
                        const link = document.createElement('a');
                        link.download = muebles[muebleSerieId as unknown as number]?.modelos[muebleModeloId as unknown as number].nombre+".jpg";
                        const imgUrl = muebles[muebleSerieId as unknown as number]?.modelos[muebleModeloId as unknown as number].img?.toString();
                        if (imgUrl !== undefined) {
                            link.href = imgUrl;
                            link.target = '_blank';
                        }
                        link.click();
                    }}>Descarregar imatge</button>}

            </div>


            <h1>Catàleg de mobles</h1>

            <div className="card">
                <p>Sel·leccionar sèrie:</p>
                <form>
                    <select onChange={(e) => {
                        setMuebleSerieId(e.target.value)
                        setMuebleModeloId('0')
                    }}
                        className="form-select"
                        aria-label="Default select example">
                        <option value={'0'}
                            key={'0'}
                        >
                            {'Escollir sèrie'}
                        </option>
                        {
                            Object.keys(muebles).map((muebleKey) => {
                                const mueble = muebles[muebleKey as unknown as number]
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
                    <select value={muebleModeloId} onChange={(e) => { setMuebleModeloId(e.target.value);}} className="form-select" aria-label="Default select example">
                        <option value={0}
                            key={0}
                        >
                            {'Escollir model'}
                        </option>
                        {
                            muebleSerieId !== '0' && Object.keys(muebles)?.map((muebleKey) => {
                                if (muebles[muebleKey as unknown as number].id === muebleSerieId) {
                                    const modelos = muebles[muebleKey as unknown as number].modelos

                                    return Object.keys(modelos).map((modeloKey) => {
                                        const modelo = modelos[modeloKey as unknown as number]
                                        return (<option value={modelo.id}
                                            key={modelo.id}
                                        >
                                            {modelo.nombre}
                                        </option>)
                                    })
                                }

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
