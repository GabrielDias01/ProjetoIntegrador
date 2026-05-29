function TabelaMovimentacoes({ movimentacoes }) {
  
  // Função auxiliar para deixar as datas bonitas no padrão DD/MM/YYYY
  const formatarDataBR = (dataStr) => {
    if (!dataStr) return "-"
    // Se já estiver formatada com barra, retorna direto
    if (dataStr.includes("/")) return dataStr
    
    // Trata o formato YYYY-MM-DD retirando possíveis partes de hora
    const apenasData = dataStr.split("T")[0]
    const partes = apenasData.split("-")
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`
    }
    return dataStr
  }

  // Função para dar uma cor e estilo personalizado para cada tipo de movimentação
  const obterEstiloBadge = (tipo) => {
    switch (tipo) {
      case "Aquisição":
      case "Entrada":
        return "badge bg-success text-white fw-bold" // Verde para novas compras/entradas
      case "Devolução":
      case "Retorno / Entrada":
        return "badge bg-info text-dark fw-bold" // Azul claro/Ciano para quando o item volta
      case "Empréstimo":
        return "badge bg-warning text-dark fw-bold" // Amarelo para alertas de itens fora
      case "Descarte":
        return "badge bg-danger text-white fw-bold" // Vermelho para baixas e descartes
      default:
        return "badge bg-secondary text-white" // Cor padrão cinza caso mude algo
    }
  }

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: "14px" }}>
      <div className="p-4 border-bottom">
        <h5 className="fw-bold mb-0">Movimentações Recentes</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Material / Item</th>
              <th>Operação / Tipo</th>
              <th className="text-center">Quantidade</th>
              <th>Data Ocorrência</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes && movimentacoes.length > 0 ? (
              movimentacoes.map((mov, index) => (
                <tr key={mov.id || index}>
                  {/* Identifica o nome do item de qualquer uma das formas enviadas */}
                  <td className="fw-semibold">
                    {mov.material || mov.nome_item || mov.item || "Item não identificado"}
                  </td>

                  {/* Badges coloridos dinâmicos baseados no tipo exato */}
                  <td>
                    <span className={obterEstiloBadge(mov.tipo || mov.tipo_movimentacao)}>
                      {mov.tipo || mov.tipo_movimentacao}
                    </span>
                  </td>

                  {/* Quantidade centralizada e organizada */}
                  <td className="text-center fw-bold">
                    {mov.quantidade || 1}
                  </td>

                  {/* Data convertida lindamente para o formato BR */}
                  <td className="text-muted">
                    {formatarDataBR(mov.data || mov.data_movimentacao)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-5 text-muted">
                  <i className="bi bi-inbox d-block fs-2 mb-2"></i>
                  Nenhuma movimentação registrada no sistema até o momento.
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