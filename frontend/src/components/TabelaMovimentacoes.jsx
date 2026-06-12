function TabelaMovimentacoes({ movimentacoes }) {
  
  // Função auxiliar para deixar as datas bonitas no padrão DD/MM/YYYY
  const formatarDataBR = (dataStr) => {
    if (!dataStr) return "-"
    if (dataStr.includes("/")) return dataStr
    
    const apenasData = dataStr.split("T")[0]
    const partes = apenasData.split("-")
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }
    return dataStr
  }

  // 🎨 PALETA DE CORES PROFISSIONAL (Fundo Claro + Texto Escuro)
  const mapeamentoEstilos = {
    "Aquisição": {
      backgroundColor: "#eff6ff", // Azul suave
      color: "#1e40af",
      border: "1px solid #bfdbfe"
    },
    "Doação": {
      backgroundColor: "#f0fdf4", // Verde suave
      color: "#166534",
      border: "1px solid #bbf7d0"
    },
    "Empréstimo": {
      backgroundColor: "#fffbeb", // Âmbar/Amarelo suave
      color: "#92400e",
      border: "1px solid #fef3c7"
    },
    "Devolução": {
      backgroundColor: "#f0fdf4", // Verde suave (Tratado como retorno/entrada)
      color: "#166534",
      border: "1px solid #bbf7d0"
    },
    "Descarte": {
      backgroundColor: "#fef2f2", // Vermelho/Melancia suave
      color: "#991b1b",
      border: "1px solid #fee2e2"
    }
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: "8px" }}>
      <div className="p-4 border-bottom">
        <h5 className="fw-bold mb-0 text-black">Movimentações Recentes da Brinquedoteca</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-secondary small">
            <tr>
              <th className="text-black fw-semibold">Jogo / Brinquedo</th>
              <th className="text-black fw-semibold">Operação / Tipo</th>
              <th className="text-center text-black fw-semibold">Quantidade</th>
              <th className="text-black fw-semibold">Data Ocorrência</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "13px" }}>
            {movimentacoes && movimentacoes.length > 0 ? (
              movimentacoes.map((mov, index) => {
                let tipoAtual = mov.tipo || mov.tipo_movimentacao || "";
                
                // 🧹 TRATAMENTO: Corrige os nomes misturados vindos do banco de dados
                if (tipoAtual.includes("Aquisição")) {
                  tipoAtual = "Aquisição";
                }

                const estiloBadge = mapeamentoEstilos[tipoAtual] || {
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #e2e8f0"
                };

                return (
                  <tr key={mov.id || index}>
                    <td className="fw-semibold text-black">
                      {mov.material || mov.nome_item || (mov.item && mov.item.nome) || "Não identificado"}
                    </td>

                    <td>
                      <span 
                        className="fw-semibold" 
                        style={{ 
                          ...estiloBadge, 
                          borderRadius: "6px", 
                          fontSize: "12px",
                          display: "inline-block",
                          padding: "6px 12px", // 🌟 Adicionado respiro perfeito (Cima/Baixo e Lados)
                          lineHeight: "1"
                        }}
                      >
                        {tipoAtual}
                      </span>
                    </td>

                    <td className="text-center fw-bold text-black">
                      {mov.quantidade || 1}
                    </td>

                    <td className="text-muted">
                      {formatarDataBR(mov.data || mov.data_movimentacao)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-5 text-muted">
                  <i className="bi bi-inbox d-block fs-2 mb-2"></i>
                  Nenhum jogo ou brinquedo movimentado até o momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TabelaMovimentacoes