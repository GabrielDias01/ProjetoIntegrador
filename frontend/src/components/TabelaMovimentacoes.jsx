function TabelaMovimentacoes({
  movimentacoes
}) {

  return (

    <div
      className="card border-0 shadow-sm"
      style={{
        borderRadius: "14px"
      }}
    >

      <div className="p-4 border-bottom">

        <h5 className="fw-bold">
          Movimentações Recentes
        </h5>

      </div>

      <div className="table-responsive">

        <table className="table mb-0">

          <thead>

            <tr>

              <th>Material</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Data</th>

            </tr>

          </thead>

          <tbody>

            {movimentacoes?.length > 0 ? (

              movimentacoes.map((item, index) => (

                <tr key={index}>

                  <td>
                    {item.material}
                  </td>

                  <td>

                    <span
                      className={
                        item.tipo === "Entrada"
                          ? "badge bg-primary"
                          : "badge bg-danger"
                      }
                    >

                      {item.tipo}

                    </span>

                  </td>

                  <td>
                    {item.quantidade}
                  </td>

                  <td>
                    {item.data}
                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan="4"
                  className="text-center p-4"
                >

                  Nenhuma movimentação encontrada

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