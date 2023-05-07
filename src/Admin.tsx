import { ChangeEvent, useEffect, useState } from 'react'
import './App.css'
import { Formik, Field, Form } from 'formik'

import { getDatabase, ref, update } from 'firebase/database'
import { uploadBytes, ref as refStorage, getDownloadURL, getStorage } from "firebase/storage";

import { app } from './firebase'
import FileUpload from './utils/FileUpload'
import { ModeloMueble, SerieMueble } from './types'
import { getMueblesFromFirebase } from './utils/Client';

const db = getDatabase(app)










function Admin() {
    const [muebleSerieId, setMuebleSerieId] = useState(0)
    const [muebleModeloId, setMuebleModeloId] = useState(0)
    const [muebles, setMuebles] = useState<SerieMueble[]>([{
        id: 0,
        serie: '',
        modelos: [{
            id: 0,
            nombre: '',
            img: null
        }]
    }])

    //add first mueble of muebles to firebase, the parent key identifies with id of the moble and child has all the content of the moble
    const addMuebleToFirebase = async (serieModel: string, models: ModeloMueble[]) => {
        await update(ref(db, '/muebles/' + muebles.length), {
            id: muebles.length,
            serie: serieModel,
        })

        //add all mobles to firebase that are in the models array
        models.forEach(async model => {
            await update(ref(db, '/muebles/' + muebles.length + '/modelos/' + model.id), {
                id: model.id,
                nombre: model.nombre,
                img: model.img,
            })
        })
    }


    //send to firebase storage even if there are no imports
    const addRenderToStorage = async (serie: string, models: ModeloMueble[]) => {
        models.forEach(async model => {
            //check if model.img is of type File
            if (!(model.img instanceof File)) {
                return
            }
            const storage = refStorage(getStorage(), 'images/' + model.img.name);
            await uploadBytes(storage, model.img).then((snapshot) => {
                //get the url of the image
                getDownloadURL(snapshot.ref).then((url) => {
                    model.img = url
                })
                console.log('Uploaded a blob or file!');
            });

            addMuebleToFirebase(serie, models)

        });

    }

    useEffect(() => {
        getMueblesFromFirebase().then((data) => {
            if (data !== null) {
                setMuebles(data)
            }
        })


    }, [])


    useEffect(() => {
        console.log('muebles changed')

    }, [muebles])

    const [modelsUploadList, setModelsUploadList] = useState<ModeloMueble[]>([{ id: 1, nombre: '', img: null }])



    return (
        <div className='container'>
            <div>
                {muebleSerieId !== 0 && muebleModeloId !== 0 && <img src={muebles[muebleSerieId].modelos[muebleModeloId].img?.toString()} className="img-fluid" alt="moble renderitzat" />}
            </div>
            <h1>Admin mobles renderitzats</h1>
            <button className='btn btn-primary m-2' type="button" data-bs-toggle="collapse" data-bs-target="#addCollapse" aria-expanded="false" aria-controls="collapseExample">Afegir un nou moble</button>
            <div className="collapse" id="addCollapse">
                <Formik
                    initialValues={{ serie: '', models: modelsUploadList, }}
                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(async () => {
                            alert(JSON.stringify(values, null, 2));

                            await addRenderToStorage(values.serie, values.models)

                            /*await addMuebleToFirebase(values.serie)
                            if (values.image !== null)
                                await addRenderToStorage(values.image)*/
                            setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ values, setFieldValue }) => (

                        <Form className='d-flex justify-content-center align-items-center flex-column'>
                            {/*name model*/}
                            <Field name="serie" type="text" className="form-control m-2" placeholder="Nom de la sèrie" />


                            {modelsUploadList.map((model) => {
                                return (
                                    <div className='d-flex flex-direction-column align-items-center justify-content-center' key={model.id}>
                                        <div className=''>
                                            <Field name="model" type="text" className="form-control m-2" placeholder="Model" onChange={(e: ChangeEvent<HTMLFormElement>) => {
                                                const newModels = [...modelsUploadList]
                                                newModels[model.id - 1].nombre = e.target.value
                                                setModelsUploadList(newModels)
                                                setFieldValue('models', newModels)

                                            }}
                                                key={model.id} />
                                            <Field
                                                name="image"
                                                modelId={model.id}
                                                values={values}
                                                modelsUploadList={modelsUploadList}
                                                setModelsUploadList={setModelsUploadList}
                                                component={FileUpload} />
                                        </div>
                                        <div>
                                            <button type="button" className="btn btn-danger p-2 m-4" onClick={() => {
                                                setModelsUploadList(modelsUploadList.filter((modela) => modela.id !== model.id))
                                                setFieldValue('models', modelsUploadList.filter((modela) => modela.id !== model.id))
                                            }}>🗑️</button>
                                        </div>
                                    </div>
                                )
                            })}


                            <button type="button" className="btn btn-success" onClick={() => {
                                setModelsUploadList([...modelsUploadList, { id: modelsUploadList.length + 1, nombre: '', img: null }])
                                setFieldValue('models', [...modelsUploadList, { id: modelsUploadList.length + 1, nombre: '', img: null }])
                            }}>➕</button>
                            <button type="submit" className="btn btn-primary m-2">Afegir moble</button>
                        </Form>)}
                </Formik>
            </div>
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
                <p>Seleccionar model:</p>
                <form>
                    <select value={muebleModeloId} onChange={(e) => { setMuebleModeloId(parseInt(e.target.value)); console.log("serie id: " + muebleSerieId + " modelo id: " + muebleModeloId) }} className="form-select" aria-label="Default select example">
                        <option value={0}
                            key={0}
                        >
                            {'Escollir model'}
                        </option>
                        {
                            muebleSerieId !== 0 && muebles[muebleSerieId].modelos?.map((modelo) => {
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

            {muebles.map((mueble) => {
                return (
                    <div className="card" key={mueble.id}>
                        <div className="card-body">
                            <h5 role="button" data-bs-target={"#model" + mueble.id} data-bs-toggle="collapse" className="card-title">{mueble.serie}</h5>
                            <div id={"model" + mueble.id} className='collapse'>
                                <p className="card-text">Models:</p>
                                <ul className="list-group list-group-flush">
                                    {mueble.modelos.map((modelo) => {
                                        return (
                                            <li className="list-group-item" key={modelo.id}>{modelo.nombre}
                                                <button type="button" className="btn btn-danger p-2 m-4" onClick={() => {

                                                    //deleteRenderFromStorage(mueble.serie, modelo.nombre)
                                                    const mueblesTemp = muebles.slice(0)
                                                    
                                                    delete mueblesTemp[mueble.id].modelos[modelo.id]

                                                    setMuebles(mueblesTemp)





                                                }}>🗑️</button>
                                            </li>
                                        )
                                    }
                                    )}
                                </ul>
                                <button type="submit" className="btn btn-primary m-2">Afegir model</button>
                            </div>
                        </div>
                    </div>
                )
            })}

            <p className="read-the-docs">
                © Vidre!BANY 2023
            </p>

        </div>
    )
}

export default Admin
