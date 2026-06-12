import { useEffect, useState } from "react"
import axios from "axios"
import { Toaster } from "react-hot-toast"

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
      const token = localStorage.getItem("token")
      
      const response = await axios.get("http://localhost:3000/item", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setItens(response.data)
    } catch (error) {
      console.log("Erro ao buscar itens:", error)
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

  // ==========================================
  // 🎨 ESTILOS PREMIUM DO LAYOUT (PADRÃO SAAS/DASHBOARD)
  // ==========================================
  const estiloTituloPagina = {
    color: "#0f172a",
    fontSize: "24px",
    letterSpacing: "-0.5px"
  }

  const estiloSubtitulo = {
    color: "#64748b",
    fontSize: "14px"
  }

  const estiloTituloCard = {
    color: "#1e293b",
    fontSize: "16px",
    letterSpacing: "-0.3px"
  }

  const estiloLabelFiltro = {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px"
  }

  const estiloInputFiltro = {
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease"
  }

  const estiloBotaoAdicionar = {
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#2563eb", 
    border: "none",
    fontSize: "14px",
    transition: "background-color 0.2s ease"
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Configuração centralizada para os alertas durarem 4 segundos na tela */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }
        }} 
      />
      
      <Navbar />

      <div className="container-fluid px-4">
        
        {/* Header Superior Limpo */}
        <div className="mb-4 mt-4 text-start px-1">
          <h2 className="fw-bold mb-1" style={estiloTituloPagina}>Materiais</h2>
          <p className="mb-0" style={estiloSubtitulo}>
            Gerencie os jogos e brinquedos registrados na Brinquedoteca.
          </p>
        </div>

        {/* Card Principal do Painel */}
        <div 
          className="card border-0 shadow-sm p-4 mb-5 text-start" 
          style={{ borderRadius: "12px", backgroundColor: "#ffffff" }}
        >
          {/* Topo do Painel com Botão Alinhado */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0" style={estiloTituloCard}>Lista de Jogos/Brinquedos</h4>
            <button
              className="btn text-white px-4 fw-semibold d-inline-flex align-items-center gap-2"
              data-bs-toggle="modal"
              data-bs-target="#modalItem"
              onClick={iniciarCadastro}
              style={estiloBotaoAdicionar}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
            >
              <span>+ Adicionar Jogos/Brinquedos</span>
            </button>
          </div>

          {/* Campo de Filtro Minimalista */}
          <div className="mb-4" style={{ maxWidth: "320px" }}>
            <label style={estiloLabelFiltro}>Filtrar por nome</label>
            <input
              type="text"
              className="form-control px-3"
              placeholder="Digite para pesquisar na Brinquedoteca..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              style={estiloInputFiltro}
              onFocus={(e) => e.currentTarget.style.borderColor = "#bfdbfe"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* CONTAINER COM ROLAGEM INTERNA */}
          <div 
            style={{ 
              borderRadius: "8px", 
              overflowX: "auto", 
              overflowY: "auto", 
              maxHeight: "550px",
              border: "1px solid #e2e8f0" 
            }}
          >
            <TabelaItens 
              itens={itensFiltrados} 
              buscarItens={buscarItens} 
              iniciarEdicao={iniciarEdicao} 
            />
          </div>
          
        </div>
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