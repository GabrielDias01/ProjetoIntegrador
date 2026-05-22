import { useEffect, useState } from "react"
import axios from "axios"

import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import TabelaItens from "../components/TabelaItens"
import ModalItem from "../components/ModalItem"

function Materiais() {
  const [itens, setItens] = useState([])
  const [filtro, setFiltro] = useState("")
  const [itemParaEditar, setItemParaEditar] = useState(null)

  useEffect(() => {
    buscarItens()
  }, [])

  async function buscarItens() {
    try {
      const response = await axios.get("http://localhost:3000/item")
      setItens(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  function iniciarCadastro() {
    setItemParaEditar(null)
  }

  function iniciarEdicao(item) {
    setItemParaEditar(item)
  }

  const itensFiltrados = itens.filter((item) =>
    item.nome?.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <div>
      <Navbar />

      <div className="mb-4 mt-2 text-start">
        <h2 className="fw-bold text-black mb-1">Materiais</h2>
        <p style={{ color: "#000000", opacity: "0.7", fontSize: "15px" }}>
          Gerencie os jogos e brinquedos registrados no sistema.
        </p>
      </div>

      <div className="card border-0 shadow-sm p-4 mb-4 text-start" style={{ borderRadius: "8px", backgroundColor: "#ffffff" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-black mb-0">Lista de Materiais</h4>
          <button
            className="btn text-white px-4 fw-semibold"
            data-bs-toggle="modal"
            data-bs-target="#modalItem"
            onClick={iniciarCadastro}
            style={{
              height: "40px",
              borderRadius: "6px",
              backgroundColor: "#1d4ed8",
              border: "none",
              fontSize: "14px"
            }}
          >
            + Adicionar Material
          </button>
        </div>

        <div className="mb-4" style={{ maxWidth: "300px" }}>
          <label className="form-label fw-semibold text-black small">Filtrar por nome</label>
          <input
            type="text"
            className="form-control px-3"
            placeholder="Digite para pesquisar..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ height: "40px", borderRadius: "6px", fontSize: "14px", color: "#000000" }}
          />
        </div>

        <TabelaItens 
          itens={itensFiltrados} 
          buscarItens={buscarItens} 
          iniciarEdicao={iniciarEdicao} 
        />
      </div>

      <ModalItem
        buscarItens={buscarItens}
        itemParaEditar={itemParaEditar}
        limparSelecao={() => setItemParaEditar(null)}
      />

      <Footer />
    </div>
  )
}

export default Materiais