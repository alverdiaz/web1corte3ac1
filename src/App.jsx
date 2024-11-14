import React, { useState } from 'react'
import { firebase } from './firebase'
import './App.css'

function App() {
  const [lista, setLista] = useState([])
  const [producto, setProducto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [id, setId] = useState('') 
  const [modoEdicion, setModoEdicion] = useState(false)


  React.useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const db = firebase.firestore()
        const data = await db.collection('productos').get()
        const arrayData = data.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setLista(arrayData)
      } catch (error) {
        console.log(error)
      }
    }
    obtenerDatos()
  }, [])


  const registrardatos = async (e) => {
    e.preventDefault()

    if (!producto) {
      alert('Por favor, ingresa el nombre del producto.')
      return
    }

    if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) {
      alert('Por favor, ingresa una cantidad válida (un número mayor que 0).')
      return
    }

    const db = firebase.firestore()
    try {
      if (modoEdicion) {

        await db.collection('productos').doc(id).update({
          producto,
          cantidad: Number(cantidad),
        })


        setLista((prevLista) => 
          prevLista.map((item) =>
            item.id === id ? { ...item, producto, cantidad: Number(cantidad) } : item
          )
        )

        setModoEdicion(false) // Regresar a modo de agregar
        alert('Producto actualizado correctamente.')
      } else {

        const docRef = await db.collection('productos').add({
          producto,
          cantidad: Number(cantidad),
        })


        setLista([
          ...lista,
          { id: docRef.id, producto, cantidad: Number(cantidad) }
        ])

        alert('Producto registrado correctamente.')
      }


      setProducto('')
      setCantidad('')
    } catch (error) {
      console.error('Error al registrar/editar producto:', error)
      alert('Hubo un error. Intenta nuevamente.')
    }
  }


  const eliminarProducto = async (id) => {
    const db = firebase.firestore()
    try {
      await db.collection('productos').doc(id).delete() // Eliminar el producto de Firebase
      setLista(lista.filter((producto) => producto.id !== id)) // Actualizar la lista
      alert('Producto eliminado correctamente.')
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Hubo un error al eliminar el producto. Intenta nuevamente.')
    }
  }

  const editarProducto = (user) => {
    setProducto(user.producto)
    setCantidad(user.cantidad)
    setId(user.id)
    setModoEdicion(true)
  }

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6">
            <h1 className="text-center">Registro de productos</h1>
            <form onSubmit={registrardatos} className="formulario-registro">
              <input
                type="text"
                placeholder="Ingresa el nombre del producto"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
              />
              <input
                type="number"
                placeholder="Ingresa la cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
              <button type="submit">{modoEdicion ? 'Actualizar Producto' : 'Registrar Producto'}</button>
            </form>
          </div>

          <div className="col-12 col-md-6">
            <h1 className="text-center">Productos registrados</h1>
            <ul>
              {lista.map((user) => (
                <li key={user.id} className="producto-item">
                  {user.producto} - {user.cantidad}
                  <button onClick={() => editarProducto(user)} className="btn btn-warning">
                    Editar
                  </button>
                  <button onClick={() => eliminarProducto(user.id)} className="btn btn-danger">
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
