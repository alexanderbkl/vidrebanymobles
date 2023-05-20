import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ModeloMueble, SerieMueble } from "./types";

const Models = () => {
    const location = useLocation();

    const muebleSerieId = location.state.serieId;

    const [muebleModeloId, setMuebleModeloId] = useState('')

    const muebles = location.state.muebles;


    useEffect(() => {
        if (muebleModeloId === '') {
            Object.keys(muebles).map((muebleKey) => {
                if (muebleKey === muebleSerieId) {
                    const modelos = muebles[muebleKey as unknown as number].modelos
                    Object.values(modelos).map((modelo, index) => {
                        const modeloCast = modelo as ModeloMueble
                        if (index === 0) {
                            setMuebleModeloId(modeloCast.id.toString())
                        }
                    })
                }
            })
        }

    }, [muebleModeloId, muebleSerieId, muebles]);

    const navigate = useNavigate();
    return (
        <div>
            <button style={{ backgroundColor: "#000000" }} className="btn btn-primary m-2" onClick={() => {
                navigate(`/`)
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-arrow-return-left" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5z" />
                </svg>
                <b>{" Tornar"}</b>
            </button>


            <div className='container'>
                <div className="row">
                    <h1>Catàleg de mobles</h1>

                    <div className="col-sm-6 card">
                        {muebleSerieId !== '0' && muebleModeloId !== '0' &&
                            <img src={muebles[muebleSerieId as unknown as number]?.modelos[muebleModeloId as unknown as number]?.img?.toString()} className="img-fluid" alt="moble renderitzat" />}
                        {/*Button to download the image*/}
                        {muebleSerieId !== '0' && muebleModeloId !== '0' &&
                            <button className="btn btn-primary m-2" onClick={() => {
                                const link = document.createElement('a');
                                link.download = muebles[muebleSerieId as unknown as number]?.modelos[muebleModeloId as unknown as number].nombre + ".jpg";
                                const imgUrl = muebles[muebleSerieId as unknown as number]?.modelos[muebleModeloId as unknown as number].img?.toString();
                                if (imgUrl !== undefined) {
                                    link.href = imgUrl;
                                    link.target = '_blank';
                                }
                                link.click();
                            }}>Descarregar imatge</button>}

                    </div>

                    <div className="col-sm-6 card">


                        <p>
                            Sel·leccionar sèrie i model del <code>moble renderitzat</code>.
                        </p>
                        {Object.keys(muebles)?.map((serieKey) => {
                            //check if serie can be in object.values
                            const serie = muebles[serieKey as unknown as number] as SerieMueble
                            if (serie.id === muebleSerieId) {
                                const modelo = Object.values(serie.modelos)?.map((modelo, index: number) => {
                                    const modeloMueble = modelo as ModeloMueble
                                    const buttonClass = muebleModeloId === modeloMueble.id ? "btn btn-primary m-2 w-100 active shadow-none" : "btn btn-primary m-2 w-100 rounded-0"
                                    //add style to button (make the background color light brown (like the wood)) if the button is not active, else, make it darker brown
                                    const buttonStyle = muebleModeloId === modeloMueble.id ? { backgroundColor: "#B08A5A" } : { backgroundColor: "#D3B48F" }
                                    return (<div key={index}>
                                        <button style={buttonStyle} className={buttonClass} onClick={() => {
                                            setMuebleModeloId(modeloMueble.id.toString())
                                        }}>
                                            <b>{modeloMueble.nombre}</b>
                                        </button>
                                    </div>)
                                })
                                return modelo
                            }
                        })
                        }

                    </div>
                    <p className="read-the-docs">
                        © Vidre!BANY 2023
                    </p>

                </div>
            </div>
        </div>
    )
}

export default Models;