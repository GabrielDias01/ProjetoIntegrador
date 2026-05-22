import axios from "axios"
import { 
  TIPO_ITEM, 
  TIPOS_JOGOS, 
  TIPOS_BRINQUEDOS, 
  ESTAGIO_COGNITIVO, 
  AREA_DESENVOLVIMENTO 
} from "../utils/enums"

function TabelaItens({ itens, buscarItens, iniciarEdicao }) {

  async function deletarItem(id) {
    if (window.confirm("Tem certeza que deseja excluir este material permanentemente?")) {
      try {
        await axios.delete(`http://localhost:3000/item/${id}`)
        alert("Material excluído com sucesso!")
        buscarItens()
      } catch (error) {
        console.error(error)
        alert("Erro ao excluir o material.")
      }
    }
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr>
            <th className="text-black fw-bold bg-transparent" style={{ fontSize: "14px", paddingLeft: "16px" }}>Nome</th>
            <th className="text-black fw-bold bg-transparent" style={{ fontSize: "14px" }}>Categoria</th>
            <th className="text-black fw-bold bg-transparent" style={{ fontSize: "14px" }}>Classificação / Tipo</th>
            <th className="text-black fw-bold bg-transparent" style={{ fontSize: "14px" }}>Faixa Etária</th>
            <th className="text-black fw-bold bg-transparent" style={{ fontSize: "14px" }}>Qtd Total</th>
            <th className="text-black fw-bold bg-transparent" style={{ fontSize: "14px" }}>Qtd Disp.</th>
            <th className="text-black fw-bold bg-transparent" style={{ fontSize: "14px" }}>Regra de Desenvolvimento</th>
            <th className="text-black fw-bold bg-transparent text-end" style={{ fontSize: "14px", paddingRight: "16px" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted py-4" style={{ fontSize: "14px" }}>
                Nenhum material cadastrado no momento.
              </td>
            </tr>
          ) : (
            itens.map((item) => (
              <tr key={item.id_item}>
                <td className="text-black fw-semibold" style={{ fontSize: "14px", paddingLeft: "16px" }}>{item.nome}</td>
                <td>
                  <span className={`badge ${item.tipo === 1 ? 'bg-primary' : 'bg-success'}`} style={{ fontSize: "12px" }}>
                    {TIPO_ITEM[item.tipo] || "Não definido"}
                  </span>
                </td>
                <td className="text-black" style={{ fontSize: "14px" }}>
                  {item.tipo === 1 
                    ? (TIPOS_JOGOS[item.classificacao_jogo_id] || "—") 
                    : (TIPOS_BRINQUEDOS[item.classificacao_brinquedo_id] || "—")}
                </td>
                <td className="text-black" style={{ fontSize: "14px" }}>{item.faixaetaria || "Livre"}</td>
                <td className="text-black" style={{ fontSize: "14px" }}>{item.quantidade_total}</td>
                <td className="text-black" style={{ fontSize: "14px" }}>{item.quantidade_disponivel}</td>
                <td className="text-black" style={{ fontSize: "13px" }}>
                  <span style={{ color: "#000000", opacity: "0.8" }}>
                    {item.tipo === 1 
                      ? `Estágio: ${ESTAGIO_COGNITIVO[item.estagiocognitivo] || "—"}` 
                      : `Área: ${AREA_DESENVOLVIMENTO[item.areadesenvolvimento] || "—"}`}
                  </span>
                </td>
                <td className="text-end" style={{ paddingRight: "16px" }}>
                  <button 
                    className="btn me-2 fw-semibold"
                    data-bs-toggle="modal" 
                    data-bs-target="#modalItem"
                    onClick={() => iniciarEdicao(item)}
                    style={{
                      backgroundColor: "transparent",
                      color: "#1d4ed8",
                      border: "1px solid #1d4ed8",
                      fontSize: "13px",
                      height: "32px",
                      padding: "0 12px",
                      borderRadius: "4px"
                    }}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn fw-semibold"
                    onClick={() => deletarItem(item.id_item)}
                    style={{
                      backgroundColor: "transparent",
                      color: "#64748b",
                      border: "1px solid #cbd5e1",
                      fontSize: "13px",
                      height: "32px",
                      padding: "0 12px",
                      borderRadius: "4px"
                    }}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default TabelaItens