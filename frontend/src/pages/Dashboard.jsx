import { useEffect, useState } from "react"
import axios from "axios"

import Navbar from "../components/Navbar"
import CardDashboard from "../components/CardDashboard"
import TabelaMovimentacoes from "../components/TabelaMovimentacoes"
import Footer from "../components/Footer"

function Dashboard() {
  // Iniciamos com um objeto preenchido por zeros para a tela já nascer montada
  const [dados, setDados] = useState({
    totalItens: 0,
    totalAlunos: 0,
    totalEmprestimos: 0,
    totalMovimentacoes: 0
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    buscarDados()
  }, [])

  async function buscarDados() {
    try {
      const response = await axios.get("http://localhost:3000/dashboard")
      setDados(response.data)
    } catch (error) {
      console.log(error)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div>
      <Navbar />

      <div className="mb-4 mt-2 text-start">
        <div className="d-flex align-items-center gap-3">
          <h2 className="fw-bold text-black mb-1">Dashboard</h2>
          {carregando && (
            <div className="spinner-border spinner-border-sm text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>
        <p style={{ color: "#000000", opacity: "0.7", fontSize: "15px" }}>
          Visão geral dos indicadores e movimentações da brinquedoteca.
        </p>
      </div>

      {/* Os cards sempre vão existir na tela, evitando o flash de desmontagem */}
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

      <div className="card border-0 shadow-sm p-4 mb-4 text-start" style={{ borderRadius: "8px", backgroundColor: "#ffffff" }}>
        <h4 className="fw-bold text-black mb-4">Últimas Movimentações</h4>
        <TabelaMovimentacoes />
      </div>

      <Footer />
    </div>
  )
}

export default Dashboard