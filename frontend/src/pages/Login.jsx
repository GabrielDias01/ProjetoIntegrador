import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")

  const navigate = useNavigate()

  async function fazerLogin() {
    if (!usuario.trim() || !senha.trim()) {
      alert("Por favor, preencha todos os campos.")
      return
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        {
          usuario,
          senha
        }
      )

      console.log(response.data)

      // 🔥 IMPORTANTE: Guarda os dados do usuário (com a coluna perfil) na sessão do navegador
      if (response.data.sucesso) {
        localStorage.setItem("usuario", JSON.stringify(response.data.usuario))
        navigate("/dashboard")
      }

    } catch (error) {
      console.log(error)
      alert(
        error.response?.data?.mensagem ||
        "Erro no login"
      )
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: "#f1f5f9"
      }}
    >
      <div
        className="card border-0 shadow-sm p-4"
        style={{
          width: "400px",
          borderRadius: "14px"
        }}
      >
        <div className="text-center mb-4">
          <div
            className="mx-auto mb-3 d-flex justify-content-center align-items-center"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#2563eb",
              borderRadius: "14px"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#ffffff" viewBox="0 0 16 16">
              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
            </svg>
          </div>

          <h2
            className="fw-bold mb-1"
            style={{
              color: "#0f172a"
            }}
          >
            Brinquedoteca
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Sistema de Gestão de Brinquedoteca
          </p>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">
            Usuário
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite seu usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              height: "46px",
              borderRadius: "10px"
            }}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold">
            Senha
          </label>
          <input
            type="password"
            className="form-control"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{
              height: "46px",
              borderRadius: "10px"
            }}
          />
        </div>

        <button
          className="btn w-100 fw-semibold"
          onClick={fazerLogin}
          style={{
            height: "46px",
            borderRadius: "10px",
            backgroundColor: "#2563eb",
            color: "white"
          }}
        >
          Entrar
        </button>

        {/* 🔥 O LINK ANTIGO DE "CRIAR CONTA" FOI EXCLUÍDO TOTALMENTE DAQUI */}
      </div>
    </div>
  )
}

export default Login