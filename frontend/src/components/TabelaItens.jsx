import axios from "axios"
import toast from "react-hot-toast"

function TabelaItens({ itens, buscarItens, iniciarEdicao }) {

  async function handleExcluir(item) {
    const id = item.id_item || item.id;

    if (!id) {
      toast.error("Não foi possível identificar o ID deste material.")
      return
    }

    if (!window.confirm(`Tem certeza que deseja remover "${item.nome}" definitivamente do acervo?`)) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      const res = await axios.delete(`http://localhost:3000/item/${id}`, config)
      
      toast.success(res.data?.mensagem || "Item excluído com sucesso!")
      buscarItens()

    } catch (error) {
      console.error("Erro ao excluir item:", error)
      
      let msgCustomizada = "Não é possível excluir: Este material possui empréstimos ativos ou históricos de movimentação vinculados."
      
      if (error.response && error.response.data && error.response.data.mensagem) {
        msgCustomizada = `Não foi possível excluir: ${error.response.data.mensagem}`
      }

      toast.error(msgCustomizada)
    }
  }

  // ==========================================
  // DICIONÁRIOS DE TRADUÇÃO (BANCO -> INTERFACE)
  // ==========================================
  const estágiosCognitivos = {
    1: "Sensório-Motor",
    2: "Pré-Operatório",
    3: "Operatório-Concreto",
    4: "Operatório-Formal"
  }

  const areasDesenvolvimento = {
    1: "Social",
    2: "Emocional"
  }

  // ==========================================
  // 🎨 ESTILOS PREMIUM E COMPACTOS (ESTILO DASHBOARD)
  // ==========================================
  const estiloCabecalho = { 
    backgroundColor: "#ffffff", 
    color: "#64748b", 
    fontSize: "11px", 
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "12px 16px",
    borderBottom: "2px solid #f1f5f9"
  }

  const estiloLinha = { 
    fontSize: "13px", 
    color: "#334155", 
    verticalAlign: "middle"
  }

  const estiloCelula = {
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9"
  }

  const estiloBotaoTexto = {
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid #e2e8f0",
    backgroundColor: "#ffffff",
    transition: "all 0.2s ease",
    cursor: "pointer"
  }

  return (
    <div className="table-responsive" style={{ borderRadius: "8px", overflow: "hidden" }}>
      <table className="table table-hover align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
        <thead>
          <tr>
            <th style={estiloCabecalho} className="text-start">Nome do Material</th>
            <th style={estiloCabecalho} className="text-start">Categoria</th>
            <th style={estiloCabecalho} className="text-start">Faixa Etária</th>
            <th style={estiloCabecalho} className="text-start">Estágio / Área de Desenv.</th>
            <th style={estiloCabecalho} className="text-center">Qtd. Total</th>
            <th style={estiloCabecalho} className="text-center">Disponível</th>
            <th style={{ ...estiloCabecalho, paddingRight: "24px" }} className="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-5 text-muted" style={{ fontSize: "13px", backgroundColor: "#ffffff" }}>
                Nenhum jogo ou brinquedo encontrado no acervo.
              </td>
            </tr>
          ) : (
            itens.map((item) => {
              const temEstoque = Number(item.quantidade_disponivel) > 0;
              const estiloDisponivel = temEstoque
                ? { backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }
                : { backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fee2e2" };

              const valorBancoCognitivo = item.estagio_cognitivo || item.estagiocognitivo;
              const valorBancoArea = item.area_desenvolvimento || item.areadesenvolvimento;

              const infoDesenvolvimento = item.tipo === 1 
                ? (estágiosCognitivos[valorBancoCognitivo] || "Não informado")
                : (areasDesenvolvimento[valorBancoArea] || "Não informado");

              return (
                <tr key={item.id_item || item.id} style={estiloLinha}>
                  <td style={{ ...estiloCelula, color: "#1e293b" }} className="fw-semibold text-start">
                    {item.nome}
                  </td>
                  
                  <td style={estiloCelula} className="text-start">
                    <span 
                      style={{ 
                        fontSize: "11px", 
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        backgroundColor: item.tipo === 1 ? "#eff6ff" : "#f5f3ff", 
                        color: item.tipo === 1 ? "#2563eb" : "#5b21b6",
                        border: item.tipo === 1 ? "1px solid #bfdbfe" : "1px solid #ddd6fe",
                        display: "inline-block",
                        lineHeight: "1"
                      }}
                    >
                      {item.tipo === 1 ? "Jogo" : "Brinquedo"}
                    </span>
                  </td>
                  
                  <td style={estiloCelula} className="text-start text-muted">
                    {item.faixaetaria || "Livre"}
                  </td>

                  <td style={estiloCelula} className="text-start text-muted fw-medium">
                    {infoDesenvolvimento}
                  </td>
                  
                  <td style={{ ...estiloCelula, color: "#475569" }} className="text-center fw-medium">
                    {item.quantidade_total}
                  </td>
                  
                  <td style={estiloCelula} className="text-center">
                    <span 
                      className="fw-semibold"
                      style={{ 
                        ...estiloDisponivel,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        display: "inline-block",
                        lineHeight: "1"
                      }}
                    >
                      {item.quantidade_disponivel}
                    </span>
                  </td>
                  
                  <td style={{ ...estiloCelula, paddingRight: "24px" }} className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        style={{ ...estiloBotaoTexto, color: "#2563eb" }}
                        data-bs-toggle="modal"
                        data-bs-target="#modalItem"
                        onClick={() => iniciarEdicao(item)}
                        title="Editar dados"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#2563eb";
                          e.currentTarget.style.backgroundColor = "#eff6ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                      >
                        Editar
                      </button>
                      <button
                        style={{ ...estiloBotaoTexto, color: "#dc2626" }}
                        onClick={() => handleExcluir(item)}
                        title="Excluir do acervo"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#dc2626";
                          e.currentTarget.style.backgroundColor = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default TabelaItens