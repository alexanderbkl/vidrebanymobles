import { useState } from 'react'

import Born_120_Fresno from './assets/born120/Born120Fresno.jpg'
import Born_120_Neva from './assets/born120/Born120Neva.jpg'
import Test_120_Olmo from './assets/born120/Test120Olmo.jpg'
import './App.css'


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


function App() {
  const [muebleId, setMuebleId] = useState(0)
  const [muebleModelo, setMuebleModelo] = useState(0)


  return (
    <div className='container'>
      <div>
        <img src={muebles[muebleId].modelos[muebleModelo].img ? muebles[muebleId].modelos[muebleModelo].img : ''} className="img-fluid" alt="React logo" />
      </div>
      <h1>Moble renderitzat</h1>

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

export default App
