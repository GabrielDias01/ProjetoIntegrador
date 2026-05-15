import { useState } from "react"
import axios from "axios"
import {
  Link,
  useNavigate
} from "react-router-dom"

function Cadastro() {

  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")

  const navigate = useNavigate()

  async function cadastrar() {

    try {

      const response = await axios.post(
        "http://localhost:3000/usuario",
        {
          usuario,
          senha
        }
      )

      console.log(response.data)

      alert("Usuário cadastrado com sucesso")

      navigate("/")

    } catch (error) {

      console.log(error)

      alert(
        error.response?.data?.mensagem ||
        "Erro ao cadastrar"
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
              backgroundColor: "#16a34a",
              borderRadius: "14px",
              fontSize: "28px"
            }}
          >

            👤

          </div>

          <h2
            className="fw-bold mb-1"
            style={{
              color: "#0f172a"
            }}
          >
            Cadastro
          </h2>

          <p
            style={{
              color: "#64748b",
              fontSize: "14px"
            }}
          >
            Criar novo usuário
          </p>

        </div>

        <div className="mb-3">

          <label className="form-label fw-semibold">
            Usuário
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Digite o usuário"
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
            placeholder="Digite a senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{
              height: "46px",
              borderRadius: "10px"
            }}
          />

        </div>

        <button
          className="btn w-100 fw-semibold mb-3"
          onClick={cadastrar}
          style={{
            height: "46px",
            borderRadius: "10px",
            backgroundColor: "#16a34a",
            color: "white"
          }}
        >

          Cadastrar

        </button>

        <Link
          to="/"
          className="btn w-100 fw-semibold"
          style={{
            height: "46px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
            color: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >

          Voltar login

        </Link>

      </div>

    </div>

  )

}

export default Cadastro