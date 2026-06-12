import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate // 🛠️ Importado para fazer o redirecionamento automático
} from "react-router-dom"

import Login from "./pages/Login"
import Cadastro from "./pages/Cadastro"
import Dashboard from "./pages/Dashboard"
import Materiais from "./pages/Materiais"
import Sidebar from "./components/Sidebar"
import Movimentacao from "./pages/Movimentacao"

function LayoutPrivado() {
  const token = localStorage.getItem("token")

  // 🔒 TRAVA DE SEGURANÇA GLOBAL: Se não tiver token, chuta para a tela de Login na hora
  if (!token || token === "undefined" || token.trim() === "") {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    return <Navigate to="/" replace />
  }

  // Se tiver token, renderiza a estrutura com a Sidebar e a página solicitada
  return (
    <div
      className="d-flex"
      style={{
        backgroundColor: "#f1f5f9",
        minHeight: "100vh"
      }}
    >
      <Sidebar />

      <div className="flex-grow-1 p-4 d-flex flex-column justify-content-between">
        <Outlet />
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* 🛡️ Todas as rotas aqui dentro herdam a Sidebar e a verificação do Token automática */}
        <Route element={<LayoutPrivado />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/materiais"
            element={<Materiais />}
          />

          <Route
            path="/cadastro"
            element={<Cadastro />}
          />
          
          <Route
            path="/movimentacao"
            element={<Movimentacao />} 
          />
            
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App