import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

function Cadastro() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [perfil, setPerfil] = useState("SUPERVISORA")

  // 🌟 ESTADOS PARA GERENCIAR OS AVISOS NA TELA
  const [mensagemSucesso, setMensagemSucesso] = useState("")
  const [mensagemErro, setMensagemErro] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuario"))
    
    // 💡 REGRA DO UPPERCASE: Garante que o perfil do administrador logado 
    // seja validado em maiúsculo, permitindo a entrada na tela de cadastro.
    const perfilFormatado = usuarioLogado?.perfil?.toUpperCase()
    
    if (!usuarioLogado || perfilFormatado !== "ADMIN") {
      alert("Acesso negado! Apenas administradores podem gerenciar usuários.")
      navigate("/dashboard")
    }
  }, [navigate])

  async function fazerCadastro(e) {
    e.preventDefault()

    // Limpa os avisos anteriores ao tentar cadastrar de novo
    setMensagemSucesso("")
    setMensagemErro("")

    if (!usuario.trim() || !senha.trim()) {
      setMensagemErro("Por favor, preencha todos os campos do formulário.")
      return
    }

    try {
      // 🌟 URL DINÂMICA: Usa a variável da Vercel ou o localhost caso dê erro
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

      // Envia o perfil transformado em UPPERCASE para a API
      await axios.post(`${API_URL}/usuario`, {
        usuario,
        senha,
        perfil: perfil.toUpperCase()
      })

      // 🌟 Define o aviso de sucesso na tela
      setMensagemSucesso(`Usuário [${usuario}] cadastrado com sucesso como ${perfil}!`)
      
      // Reseta os campos do formulário
      setUsuario("")
      setSenha("")
      setPerfil("SUPERVISORA")
    } catch (error) {
      console.log(error)
      // 🌟 Captura o erro exato vindo do backend ou uma mensagem padrão se o servidor estiver fora
      const textoErro = error.response?.data?.mensagem || "Erro de conexão: Não foi possível alcançar o servidor."
      setMensagemErro(textoErro)
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

        {/* 🌟 BANNER DE AVISO DE SUCESSO */}
        {mensagemSucesso && (
          <div className="alert alert-success border-0 shadow-sm mb-3 small" style={{ borderRadius: "6px" }}>
            ✅ {mensagemSucesso}
          </div>
        )}

        {/* 🌟 BANNER DE AVISO DE ERRO */}
        {mensagemErro && (
          <div className="alert alert-danger border-0 shadow-sm mb-3 small" style={{ borderRadius: "6px" }}>
            ❌ {mensagemErro}
          </div>
        )}
        
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
              <option value="SUPERVISORA">Supervisora (Acesso Operacional)</option>
              <option value="ADMIN">Administrador (Acesso Total)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn text-white px-4 fw-semibold w-100" // Coloquei w-100 para o botão ocupar a largura total e ficar mais elegante
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