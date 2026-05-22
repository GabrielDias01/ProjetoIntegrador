import { useLocation } from "react-router-dom"

function Navbar() {
  const location = useLocation()

  // Define o título com base na rota atual
  let tituloPagina = "Brinquedoteca"
  
  if (location.pathname === "/dashboard") {
    tituloPagina = "Dashboard"
  } else if (location.pathname === "/materiais") {
    tituloPagina = "Materiais"
  } else if (location.pathname === "/cadastro") {
    tituloPagina = "Controle de Acessos"
  }

  return (
    <div 
      className="card border-0 shadow-sm p-3 mb-4 text-start" 
      style={{ 
        borderRadius: "8px", 
        backgroundColor: "#ffffff" 
      }}
    >
      <h5 className="fw-bold text-black mb-0">{tituloPagina}</h5>
    </div>
  )
}

export default Navbar