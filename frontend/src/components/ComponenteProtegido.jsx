import { Navigate, Outlet } from "react-router-dom"

function ComponenteProtegido() {
  const token = localStorage.getItem("token")

  // Se não tem token válido, chuta imediatamente de volta para o login
  if (!token || token === "undefined" || token.trim() === "") {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    return <Navigate to="/" replace />
  }

  // Se o token existe, renderiza a página que o usuário tentou acessar
  return <Outlet />
}

export default ComponenteProtegido