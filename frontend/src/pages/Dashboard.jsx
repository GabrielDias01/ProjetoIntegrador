import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"

import Navbar from "../components/Navbar"
import CardDashboard from "../components/CardDashboard"
import TabelaMovimentacoes from "../components/TabelaMovimentacoes"
import Footer from "../components/Footer"

function Dashboard() {
  const navigate = useNavigate()

  const [dados, setDados] = useState({
    totalItens: 0,
    totalAlunos: 0,
    totalEmprestimos: 0,
    totalMovimentacoes: 0,
    movimentacoes: []
  })
  const [carregando, setCarregando] = useState(true)
  const [autenticado, setAutenticado] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    
    if (!token || token === "undefined" || token.trim() === "") {
      localStorage.removeItem("token")
      localStorage.removeItem("usuario")
      setAutenticado(false)
      navigate("/")
      return
    }

    setAutenticado(true)
    buscarDados(token)
  }, [navigate])

  async function buscarDados(token) {
    try {
      setCarregando(true)
      
      const response = await axios.get("http://localhost:3000/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      const respostaApi = response.data || {}
      const listaExtraida = 
        respostaApi.movimentacoes || 
        respostaApi.ultimasMovimentacoes || 
        respostaApi.historico || 
        []

      setDados({
        totalItens: respostaApi.totalItens || 0,
        totalAlunos: respostaApi.totalAlunos || 0,
        totalEmprestimos: respostaApi.totalEmprestimos || 0,
        totalMovimentacoes: respostaApi.totalMovimentacoes || 0,
        movimentacoes: listaExtraida
      })

    } catch (error) {
      console.error("Erro ao buscar dados do Dashboard:", error)
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error("Sua sessão expirou! Faça login novamente.", { id: "session-error" })
        localStorage.removeItem("token")
        localStorage.removeItem("usuario")
        setAutenticado(false)
        setTimeout(() => { navigate("/") }, 1000)
      }
    } finally {
      setCarregando(false)
    }
  }

  if (!autenticado) {
    return <Toaster position="top-right" reverseOrder={false} />
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", backgroundColor: "#f8fafc" }}>
      <Toaster position="top-right" reverseOrder={false} />
      
      <Navbar />

      {/* Área interna de conteúdo com rolagem controlada */}
      <div className="container-fluid px-4 flex-grow-1 d-flex flex-column" style={{ overflowY: "auto", paddingBottom: "20px" }}>
        
        <div className="mb-3 mt-3 text-start">
          <div className="d-flex align-items-center gap-3">
            <h2 className="fw-bold text-black mb-1" style={{ fontSize: "24px" }}>Dashboard</h2>
            {carregando && (
              <div className="spinner-border spinner-border-sm text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>
          <p className="mb-0" style={{ color: "#000000", opacity: "0.7", fontSize: "14px" }}>
            Visão geral dos indicadores e movimentações da brinquedoteca.
          </p>
        </div>

        <div className="row g-3 mb-4 text-start">
          <div className="col-md-3">
            <CardDashboard titulo="Itens" valor={dados.totalItens} />
          </div>
          <div className="col-md-3">
            <CardDashboard titulo="Alunos" valor={dados.totalAlunos} />
          </div>
          <div className="col-md-3">
            <CardDashboard titulo="Empréstimos" valor={dados.totalEmprestimos} />
          </div>
          <div className="col-md-3">
            <CardDashboard titulo="Movimentações" valor={dados.totalMovimentacoes} />
          </div>
        </div>

        {/* Card com rolagem interna para a tabela não esticar a tela */}
        <div className="card border-0 shadow-sm p-4 mb-3 text-start flex-grow-1 d-flex flex-column" style={{ borderRadius: "12px", backgroundColor: "#ffffff", minHeight: "250px" }}>
          <h4 className="fw-bold text-black mb-3" style={{ fontSize: "16px" }}>Últimas Movimentações</h4>
          <div className="flex-grow-1" style={{ overflowY: "auto", borderRadius: "8px" }}>
            {carregando ? (
              <p className="text-muted small">Carregando movimentações...</p>
            ) : (
              <TabelaMovimentacoes movimentacoes={dados.movimentacoes} />
            )}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}

export default Dashboard