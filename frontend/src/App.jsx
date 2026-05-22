import {
  BrowserRouter,
  Routes,
  Route,
  Outlet
} from "react-router-dom"

import Login from "./pages/Login"
import Cadastro from "./pages/Cadastro"
import Dashboard from "./pages/Dashboard"
import Materiais from "./pages/Materiais"
import Sidebar from "./components/Sidebar"

function LayoutPrivado() {
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
        <Route
          path="/"
          element={<Login />}
        />

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
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App