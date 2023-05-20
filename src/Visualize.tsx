import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMueblesFromFirebase } from './utils/Client'
import { SerieMueble } from './types'

import './App.css'


const Visualize = () => {
    const navigate = useNavigate()

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
        <div className="container">
            <h1>Models Vidre!BANY</h1>
            <br />
            <div className="row">
                {Object.entries(muebles).map(([key, serie]: [string, SerieMueble]) => {
                    return (
                        <div className="col border" key={key}>
                            <h3 className='text-break' style={{ maxHeight: '10%', whiteSpace: 'nowrap' }}>{serie.serie}</h3>
                            {/*Get the first element of modelos object*/}
                            {
                                serie.modelos && Object.values(serie.modelos).map((modelo, index) => {

                                    if (index === 0) {
                                        return (
                                            <div className="row" key={key}>
                                                <div className="col">
                                                    {
                                                        typeof modelo.img === 'string' && modelo.img !== '' &&
                                                        <img src={modelo.img} className="img-fluid h-75" alt="moble renderitzat" />
                                                    }
                                                    {/*Button to download the image*/}
                                                    <button className="btn btn-primary m-2" onClick={() => {
                                                        //navigate to "#/model/:id"
                                                        navigate(`/models/`, {
                                                            state: {
                                                                serieId: serie.id,
                                                                muebles: muebles
                                                            }
                                                        })
                                                    }}><div style={{ display: 'flex', whiteSpace: 'nowrap', justifyContent: 'center', alignItems: 'center' }}>Obrir model</div></button>
                                                </div>
                                            </div>
                                        )
                                    }

                                })

                            }
                        </div>
                    )
                })}
            </div>
        </div >

    )
}

export default Visualize