import { ChangeEvent, useEffect, useState } from 'react'
import './App.css'
import { Formik, Field, Form } from 'formik'

import { getDatabase, ref, update, remove, push } from 'firebase/database'
import { uploadBytes, ref as refStorage, getDownloadURL, getStorage, deleteObject } from "firebase/storage";

import { app } from './firebase'
import FileUpload from './utils/FileUpload'
import { ModeloMueble, SerieMueble } from './types'
import { getMueblesFromFirebase } from './utils/Client';

const db = getDatabase(app)










function Admin() {
    const [muebleSerieId, setMuebleSerieId] = useState(0)
    const [muebleModeloId, setMuebleModeloId] = useState('')
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
    const addRendersToStorage = async (serie: string, models: ModeloMueble[]) => {
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

    //send a single render to firebase storage and return the url
    const addRenderToStorage = async (model: ModeloMueble) => {
        //check if model.img is of type File
        if (!(model.img instanceof File)) {
            return
        }
        let url = ''
        const storage = refStorage(getStorage(), 'images/' + model.img.name);
        const snapshot = await uploadBytes(storage, model.img)

        url = await getDownloadURL(snapshot.ref)


        model.img = url

        console.log(url)

        return url

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

    const deleteRenderFromStorage = async (img: string | null) => {
        const storage = refStorage(getStorage(), 'images/' + img);
        await deleteObject(storage).catch((error) => {
            console.log('Uh-oh, an error occurred!: ' + error);
        });
    }

    const deleteModelFromFirebase = async (serieId: number | string, modelId: number | string) => {
        await remove(ref(db, '/muebles/' + serieId + '/modelos/' + modelId))
    }

    const addModelToFirebase = async (serieId: number, nombre: string, img: File) => {
        const newModelKey = await push(ref(db, '/muebles/' + serieId + '/modelos/')).key

        if (newModelKey === null) {
            return
        }

        //upload image to firebase storage
        const model: ModeloMueble = {
            id: newModelKey,
            nombre: nombre,
            img: img
        }

        const url = await addRenderToStorage(model)



        //add model to firebase
        if (model.img !== null) {
            console.log(url)
            await update(ref(db, '/muebles/' + serieId + '/modelos/' + newModelKey),
                {
                    id: newModelKey,
                    nombre: nombre,
                    img: url
                })
        }





    }



    return (
        <div className='container'>
            <p>{muebleModeloId}</p>
            <div>
                {muebleSerieId !== 0 && muebleModeloId !== '0' && <img src={muebles[muebleSerieId].modelos[muebleModeloId as unknown as number].img?.toString()} className="img-fluid" alt="moble renderitzat" />}
            </div>
            <h1>Admin mobles renderitzats</h1>
            <button className='btn btn-primary m-2' type="button" data-bs-toggle="collapse" data-bs-target="#addCollapse" aria-expanded="false" aria-controls="collapseExample">Afegir un nou moble</button>
            <div className="collapse" id="addCollapse">
                <Formik
                    initialValues={{ serie: '', models: modelsUploadList, }}
                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(async () => {
                            alert(JSON.stringify(values, null, 2));

                            await addRendersToStorage(values.serie, values.models).then(() => {
                                addMuebleToFirebase(values.serie, values.models)
                            })

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
                                                if (typeof model.id !== 'number') {
                                                    return
                                                }
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
                <p>Seleccionar model:</p>
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

            {muebles.map((mueble) => {
                return (
                    <div className="card " key={mueble.id}>
                        <div className="card-body">
                            <h5 role="button" data-bs-target={"#model" + mueble.id} data-bs-toggle="collapse" className="card-title">{mueble.serie}</h5>
                            <div id={"model" + mueble.id} className='collapse'>
                                <p className="card-text">Models:</p>
                                <ul className="list-group list-group-flush">
                                    {Array.isArray(mueble.modelos) ? mueble.modelos?.map((modelo) => {
                                        return (
                                            <li className="list-group-item" key={modelo.id}>{modelo.nombre}
                                                <button type="button" className="btn btn-danger p-2 m-4" onClick={() => {
                                                    if (modelo.img !== null && !(modelo.img instanceof File))
                                                        deleteRenderFromStorage(modelo.img).then(() => {
                                                            //delete from firebase
                                                            if (modelo.id !== undefined && mueble.id !== undefined)
                                                                deleteModelFromFirebase(mueble.id, modelo.id).then(() => {
                                                                    console.log("deleted model from firebase")
                                                                })
                                                        })
                                                    const mueblesTemp = muebles.slice(0)

                                                    delete mueblesTemp[mueble.id].modelos[modelo.id as unknown as number]

                                                    setMuebles(mueblesTemp)





                                                }}>🗑️</button>
                                            </li>
                                        )
                                    }
                                    ) :
                                        mueble.modelos === undefined ? <li className="list-group-item">No hi ha models</li> :
                                            Object.keys(mueble.modelos).map((modelKey: string) => {
                                                const modelo = mueble.modelos[modelKey as unknown as number]
                                                return (
                                                    <li className="list-group-item" key={modelo.id}>{modelo.nombre}
                                                        <button type="button" className="btn btn-danger p-2 m-4" onClick={() => {
                                                            if (modelo.img !== null && !(modelo.img instanceof File))
                                                                deleteRenderFromStorage(modelo.img).then(() => {
                                                                    //delete from firebase
                                                                    deleteModelFromFirebase(mueble.id, modelo.id).then(() => {
                                                                        console.log("deleted model from firebase")
                                                                    })
                                                                })
                                                            const mueblesTemp = muebles.slice(0)

                                                            delete mueblesTemp[mueble.id].modelos[modelo.id as unknown as number]

                                                            setMuebles(mueblesTemp)





                                                        }}>🗑️</button>
                                                    </li>
                                                )
                                            })}
                                </ul>
                                <div id={"addModel" + mueble.id} className='collapse'>
                                    {/*form for adding a new model*/}
                                    <Formik
                                        initialValues={{ nombre: '', img: null }}
                                        onSubmit={(values, { setSubmitting }) => {
                                            setSubmitting(true)
                                            //add model to firebase
                                            console.log(values)
                                            setSubmitting(false)
                                            if (values.img !== null) {
                                                addModelToFirebase(mueble.id, values.nombre, values.img).then((modelId) => {
                                                    //add model to state
                                                    const mueblesTemp = muebles.slice(0)
                                                    if (mueblesTemp[mueble.id].modelos === undefined)
                                                        mueblesTemp[mueble.id].modelos = []
                                                    mueblesTemp[mueble.id].modelos[modelId as unknown as number] = { id: modelId as unknown as number, nombre: values.nombre, img: values.img }
                                                    setMuebles(mueblesTemp)
                                                    setSubmitting(false)
                                                })
                                            } else {
                                                alert("Selecciona una imatge")
                                                setSubmitting(false)
                                            }

                                        }}
                                    >
                                        {({ isSubmitting, setFieldValue, setSubmitting }) => (
                                            <Form>
                                                <div className="form-group">
                                                    <label htmlFor="nombre">Nom del model</label>
                                                    <Field name="nombre" type="text" className="form-control" />
                                                    <label htmlFor="img">Imatge del model</label>
                                                    <input name="img" type="file" className="form-control" onChange={(event) => {
                                                        if (event.currentTarget.files !== null)
                                                            setFieldValue("img", event.currentTarget.files[0])
                                                    }} />


                                                    <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>Afegir model</button>
                                                    <button type="button" className="btn btn-secondary mt-3" onClick={() => {
                                                        setFieldValue("nombre", "")
                                                        setFieldValue("img", null)
                                                        setSubmitting(false)
                                                    }}>Netejar</button>
                                                    <button type="button" className="btn btn-danger mt-3" onClick={() => {
                                                        setFieldValue("nombre", "")
                                                        setFieldValue("img", null)
                                                        document.getElementById("addModel" + mueble.id)?.classList.remove("show")
                                                    }}>Tancar</button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>

                                </div>
                                <button role="button" data-bs-target={"#addModel" + mueble.id} data-bs-toggle="collapse" className="btn btn-primary m-2">Afegir model</button>
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
