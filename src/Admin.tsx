import { ChangeEvent, useEffect, useState } from 'react'
import './App.css'
import { Formik, Field, Form } from 'formik'
import { getDatabase, ref, update, remove, push } from 'firebase/database'
import { uploadBytes, ref as refStorage, getDownloadURL, getStorage, deleteObject } from "firebase/storage";

import { app } from './firebase'
import FileUpload from './utils/FileUpload'
import { ModeloMueble, SerieMueble } from './types'
import { getMueblesFromFirebase } from './utils/Client';
import DeleteModal from './components/DeleteModal';

const db = getDatabase(app)

//TODO fix uploading new mueble error that it uploads for each model a new series
//TODO add functionality to the edit model and edit serie buttons


function Admin() {
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
    const addMuebleToFirebase = async (model: ModeloMueble, newMuebleKey: string | null) => {
        //push new mueble to firebase get key


        //add all mobles to firebase that are in the models array
        const newModelKey = await push(ref(db, '/muebles/' + newMuebleKey + '/modelos/')).key

        await update(ref(db, '/muebles/' + newMuebleKey + '/modelos/' + newModelKey), {
            id: newModelKey,
            nombre: model.nombre,
            img: model.img,
        })
        console.log(2)

        const data = await getMueblesFromFirebase()
        if (data !== null) {
            setMuebles(data)
        }
        console.log(3)

    }


    //send to firebase storage even if there are no imports
    const addRendersToStorage = async (serie: string, models: ModeloMueble[]) => {
        const newMuebleKey = await push(ref(db, '/muebles/')).key


        await update(ref(db, '/muebles/' + newMuebleKey), {
            id: newMuebleKey,
            serie: serie,
        })

        models.forEach(async model => {
            //check if model.img is of type File
            if (!(model.img instanceof File)) {
                return
            }
            const storage = await refStorage(getStorage(), 'images/' + model.img.name);
            const snapshot = await uploadBytes(storage, model.img)
            //get the url of the image
            const url = await getDownloadURL(snapshot.ref)
            model.img = url
            await addMuebleToFirebase(model, newMuebleKey)
            console.log('Uploaded a blob or file!');

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


        return url

    }


    useEffect(() => {
        getMueblesFromFirebase().then((data) => {
            if (data !== null) {
                setMuebles(data)
            }
        })


    }, [])



    const [modelsUploadList, setModelsUploadList] = useState<ModeloMueble[]>([{ id: 1, nombre: '', img: null }])

    const deleteRenderFromStorage = async (img: string | null) => {

        if (img == null || img === '') {
            console.log("image is null or empty")
            return
        }

        //delete from firebase storage using refFromURL

        const storage = getStorage();

        const storageRefFromDownloadURL = refStorage(storage, img);

        await deleteObject(storageRefFromDownloadURL).then(() => {
            console.log('File deleted successfully');
        }).catch((error) => {
            console.log('Uh-oh, an error occurred!: ' + error);
        })

    }

    const deleteModelFromFirebase = async (serieId: number | string, modelId: number | string) => {
        await remove(ref(db, '/muebles/' + serieId + '/modelos/' + modelId))
    }

    const addModelToFirebase = async (serieId: number | string, nombre: string, img: File) => {
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

    const deleteMueble = async (serieId: number | string) => {
        //remove all models from firebase storage first
        try {
            Object.keys(muebles[serieId as number].modelos).forEach(async modelKey => {
                const model = muebles[serieId as number].modelos[modelKey as unknown as number]
                if (model.img instanceof File) {
                    return
                }
                await deleteRenderFromStorage(model.img).catch((error) => {
                    console.log('Uh-oh, an error occurred!: ' + error);
                })
            })
        } catch (error) {
            console.log(error)
        }

        //remove mueble from firebase
        await remove(ref(db, '/muebles/' + serieId))
        //remove mueble from state (using Object)
        const newMuebles = Object.assign({}, muebles)
        delete newMuebles[serieId as number]
        setMuebles(newMuebles)
    }



    return (
        <div className='container'>
            <h1>Admin mobles renderitzats</h1>
            <button className='btn btn-primary m-2' type="button" data-bs-toggle="collapse" data-bs-target="#addCollapse" aria-expanded="false" aria-controls="collapseExample">Afegir un nou moble</button>
            <div className="collapse" id="addCollapse">
                <Formik
                    initialValues={{ serie: '', models: modelsUploadList, }}
                    onSubmit={(values, { setSubmitting, setFieldValue }) => {
                        setTimeout(async () => {

                            await addRendersToStorage(values.serie, values.models)

                            //set field values to initial values
                            setFieldValue('serie', '')
                            setFieldValue('models', [{ id: 1, nombre: '', img: null }])


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
                                            <Field name="model" type="text" className="form-control m-2" placeholder="Nom del model" onChange={(e: ChangeEvent<HTMLFormElement>) => {
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
                                            }}>❌</button>
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


            {
                Object.keys(muebles).length !== 0 &&
                Object.keys(muebles).map((muebleKey) => {
                    const mueble = muebles[muebleKey as unknown as number]
                    return (
                        <div className="card " key={mueble.id}>
                            <div className="card-body">
                                {/*<button type="button" className="btn btn-secondary p-2 m-4">✏️</button>*/}
                                <button type="button" className="btn btn-danger p-2 m-4" data-bs-toggle="modal" data-bs-target={"#deleteSerieModal" + mueble.id} onClick={(() => {
                                    //toggle the modal

                                })}>🗑️</button>
                                <DeleteModal muebleId={mueble.id} onDelete={deleteMueble} />

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
                                                                        getMueblesFromFirebase().then((data) => {
                                                                            if (data !== null) {
                                                                                setMuebles(data)
                                                                            }
                                                                        })
                                                                    })
                                                            })



                                                    }}>🗑️</button>
                                                </li>
                                            )
                                        }
                                        ) :
                                            mueble.modelos === undefined ? <li className="list-group-item">No hi ha models</li> :
                                                Object.keys(mueble.modelos).map((modelKey: string) => {
                                                    const modelo = mueble.modelos[modelKey as unknown as number]
                                                    return (
                                                        <li className="list-group-item" key={modelo.id}>
                                                            <p>
                                                                {modelo.nombre}
                                                            </p>
                                                            <img width={200} src={modelo.img !== null && !(modelo.img instanceof File) ? modelo.img : ''} alt="model" className="img-thumbnail" />
                                                            <div>
                                                                {/*<button type="button" className="btn btn-secondary w-25 p-2 m-4">✏️</button>*/}
                                                                <button type="button" className="btn btn-danger w-25 p-2 m-4" onClick={() => {
                                                                    if (modelo.img !== null && !(modelo.img instanceof File))
                                                                        deleteRenderFromStorage(modelo.img).then(() => {
                                                                            //delete from firebase
                                                                            deleteModelFromFirebase(mueble.id, modelo.id).then(() => {
                                                                                console.log("deleted model from firebase")
                                                                                getMueblesFromFirebase().then((data) => {
                                                                                    if (data !== null) {
                                                                                        setMuebles(data)
                                                                                    }
                                                                                })
                                                                            })
                                                                        })


                                                                }}>🗑️</button>
                                                            </div>
                                                        </li>

                                                    )
                                                })}
                                    </ul>
                                    <div id={"addModel" + mueble.id} className='collapse'>
                                        {/*form for adding a new model*/}
                                        <Formik
                                            initialValues={{ nombre: '', img: null }}
                                            onSubmit={(values, { setSubmitting, setFieldValue }) => {
                                                setSubmitting(true)
                                                //add model to firebase
                                                console.log(values)
                                                setSubmitting(false)
                                                if (values.img != null) {
                                                    addModelToFirebase(mueble.id, values.nombre, values.img).then(() => {
                                                        getMueblesFromFirebase().then((data) => {
                                                            if (data !== null) {
                                                                setMuebles(data)
                                                            }
                                                        })
                                                        setSubmitting(false)
                                                        document.getElementById("addModel" + mueble.id)?.classList.remove("show")
                                                        //remove fields
                                                        setFieldValue("nombre", "")
                                                        setFieldValue("img", null)
                                                    })
                                                } else {
                                                    alert("Selecciona una imatge")
                                                    document.getElementById("addModel" + mueble.id)?.classList.remove("show")
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


                                                        <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>Afegir</button>
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
