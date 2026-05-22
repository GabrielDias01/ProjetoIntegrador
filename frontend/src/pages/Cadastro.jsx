import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function Cadastro() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [perfil, setPerfil] = useState("supervisora")

  const navigate = useNavigate()

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))
    
    if (!usuarioLogado || usuarioLogado.perfil !== "admin") {
      alert("Acesso negado! Apenas administradores podem gerenciar usuários.")
      navigate("/dashboard")
    }
  }, [navigate])

  async function fazerCadastro(e) {
    e.preventDefault()

    if (!usuario.trim() || !senha.trim()) {
      alert("Por favor, preencha todos os campos.")
      return
    }

    try {
      await axios.post("http://localhost:3000/usuario", {
        usuario,
        senha,
        perfil
      })

      alert(`Usuário [${usuario}] cadastrado com sucesso como ${perfil}!`)
      setUsuario("")
      setSenha("")
      setPerfil("supervisora")
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.mensagem || "Erro ao cadastrar usuário")
    }
  }

  return (
    <div>
      <Navbar />

      <div className="mb-4 mt-2 text-start">
        <h2 className="fw-bold text-dark mb-1">Controle de Acessos</h2>
        <p style={{ color: "#64748b", fontSize: "15px" }}>
          Área administrativa para criação e gerenciamento de novas contas de usuário.
        </p>
      </div>

      <div 
        className="card border-0 shadow-sm p-4 mx-auto mt-5 text-start" 
        style={{ 
          maxWidth: "460px", 
          borderRadius: "8px",
          backgroundColor: "#ffffff" 
        }}
      >
        <div className="mb-4">
          <h4 className="fw-bold text-dark mb-1">Novo Usuário</h4>
          <p className="text-muted small">Preencha as credenciais para liberar o acesso</p>
        </div>
        
        <form onSubmit={fazerCadastro}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">Nome de Usuário</label>
            <input
              type="text"
              className="form-control px-3"
              placeholder="Digite o nome do usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              style={{ height: "40px", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">Senha de Acesso</label>
            <input
              type="password"
              className="form-control px-3"
              placeholder="Digite uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{ height: "40px", borderRadius: "6px", fontSize: "14px" }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold text-secondary small">Nível de Permissão (Perfil)</label>
            <select
              className="form-select px-3"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              style={{ height: "40px", borderRadius: "6px", fontSize: "14px" }}
            >
              <option value="supervisora">Supervisora (Acesso Operacional)</option>
              <option value="admin">Administrador (Acesso Total)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn text-white px-4 fw-semibold"
            style={{
              height: "40px",
              borderRadius: "6px",
              backgroundColor: "#2563eb",
              fontSize: "14px"
            }}
          >
            Cadastrar Usuário
          </button>
        </form>
      </div>

      <Footer />
    </div>
  )
}

export default Cadastro