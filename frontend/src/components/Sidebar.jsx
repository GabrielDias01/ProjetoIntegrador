import { Link, useNavigate } from "react-router-dom"

function Sidebar() {
  const navigate = useNavigate()

  const usuarioLogado = JSON.parse(localStorage.getItem("usuario")) || {}
  const isAdmin = usuarioLogado.perfil === "admin"

  function fazerLogout() {
    localStorage.removeItem("usuario")
    navigate("/")
  }

  return (
    <div
      className="bg-dark text-white p-4 d-flex flex-column justify-content-between"
      style={{
        width: "250px",
        minHeight: "100vh"
      }}
    >
      <div>
        <h3 className="mb-4 text-white fw-bold" style={{ fontSize: "22px" }}>
          Brinquedoteca
        </h3>

        <ul className="nav flex-column gap-2">
          <li>
            <Link
              to="/dashboard"
              className="btn btn-dark w-100 text-start border-0 text-white"
              style={{ fontSize: "14px", padding: "10px 16px" }}
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/materiais"
              className="btn btn-dark w-100 text-start border-0 text-white"
              style={{ fontSize: "14px", padding: "10px 16px" }}
            >
              Materiais
            </Link>
          </li>

          {isAdmin && (
            <li>
              <Link
                to="/cadastro"
                className="btn btn-dark w-100 text-start border-0 text-white"
                style={{ fontSize: "14px", padding: "10px 16px" }}
              >
                Criar Usuário
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div>
        <hr style={{ backgroundColor: "#ffffff", opacity: "0.2" }} />
        <button
          onClick={fazerLogout}
          className="btn btn-dark w-100 text-start border-0 text-white"
          style={{ fontSize: "14px", padding: "10px 16px", opacity: "0.8" }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}

export default Sidebar