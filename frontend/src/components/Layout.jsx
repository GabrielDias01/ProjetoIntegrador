import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

function Layout() {
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

export default Layout