import { useState, useEffect } from "react"
import axios from "axios"

function Movimentacao() {
  const [itens, setItens] = useState([])
  const [historico, setHistorico] = useState([])
  const [erroApi, setErroApi] = useState(null)

  // Campos do Formulário
  const [idItem, setIdItem] = useState("")
  const [tipoMov, setTipoMov] = useState("Aquisição")
  const [quantidade, setQuantidade] = useState("1")
  const [dataMov, setDataMov] = useState(new Date().toISOString().split("T")[0])
  const [dataDevPrevista, setDataDevPrevista] = useState("")
  const [observacoes, setObservacoes] = useState("")

  // Estado para gerenciar a sacola de itens do empréstimo (modelo locadora)
  const [sacola, setSacola] = useState([])

  // Campos Estruturados do Aluno
  const [raAluno, setRaAluno] = useState("")
  const [nomeAluno, setNomeAluno] = useState("")
  const [telefoneAluno, setTelefoneAluno] = useState("")
  const [emailAluno, setEmailAluno] = useState("")
  const [isNovoAluno, setIsNovoAluno] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setErroApi(null)
      const resItens = await axios.get("http://localhost:3000/item")
      setItens(resItens.data || [])

      const resHist = await axios.get("http://localhost:3000/emprestimos-historico")
      setHistorico(resHist.data || [])
    } catch (err) {
      setErroApi(err.response?.data?.mensagem || err.message)
    }
  }

  async function verificarAluno(ra) {
    if (!ra) {
      setNomeAluno("")
      setTelefoneAluno("")
      setEmailAluno("")
      setIsNovoAluno(false)
      return
    }
    try {
      const res = await axios.get(`http://localhost:3000/aluno/ra/${ra}`)
      if (res.data) {
        setNomeAluno(res.data.nome)
        setTelefoneAluno(res.data.telefone || "")
        setEmailAluno(res.data.email || "")
        setIsNovoAluno(false)
      } else {
        setNomeAluno("")
        setTelefoneAluno("")
        setEmailAluno("")
        setIsNovoAluno(true)
      }
    } catch (err) {
      console.log("Erro ao validar RA", err)
    }
  }

  function adicionarNaSacola() {
    if (!idItem) return alert("Selecione um material primeiro!")

    const itemSelecionado = itens.find(i => String(i.id_item) === String(idItem) || String(i.id) === String(idItem))
    if (!itemSelecionado) return

    const idReal = itemSelecionado.id_item || itemSelecionado.id

    const jaExiste = sacola.some(s => String(s.id_item) === String(idReal))
    if (jaExiste) {
      alert(`O item "${itemSelecionado.nome}" já está na sacola! Só é permitido 1 unidade por tipo.`)
      return
    }

    setSacola([...sacola, { id_item: idReal, nome: itemSelecionado.nome }])
    setIdItem("") 
  }

  function removerDaSacola(id) {
    setSacola(sacola.filter(s => String(s.id_item) !== String(id)))
  }

  async function salvarMovimentacao(e) {
    e.preventDefault()

    if (tipoMov === "Empréstimo") {
      if (!raAluno || !nomeAluno) {
        alert("Por favor, preencha o RA e o Nome do aluno.")
        return
      }
      if (sacola.length === 0) {
        alert("Adicione pelo menos 1 item na sacola antes de salvar o empréstimo.")
        return
      }
    } else {
      if (!idItem || !quantidade) {
        alert("Selecione o material e defina a quantidade.")
        return
      }
    }

    const payload = {
      tipo_movimentacao: tipoMov,
      data: dataMov,
      ra_aluno: tipoMov === "Empréstimo" ? raAluno : null,
      nome_aluno: tipoMov === "Empréstimo" ? nomeAluno : null,
      telefone_aluno: tipoMov === "Empréstimo" ? telefoneAluno : null,
      email_aluno: tipoMov === "Empréstimo" ? emailAluno : null,
      data_devolucao_prevista: tipoMov === "Empréstimo" ? dataDevPrevista : null,
      itens: tipoMov === "Empréstimo" ? sacola : null,
      id_item: tipoMov !== "Empréstimo" ? idItem : null,
      quantidade: tipoMov !== "Empréstimo" ? quantidade : null
    }

    try {
      const res = await axios.post("http://localhost:3000/movimentacao", payload)
      alert(res.data.mensagem || "Movimentação salva!")
      
      setIdItem("")
      setQuantidade("1")
      setRaAluno("")
      setNomeAluno("")
      setTelefoneAluno("")
      setEmailAluno("")
      setObservacoes("")
      setDataDevPrevista("")
      setIsNovoAluno(false)
      setSacola([]) 
      
      carregarDados()
    } catch (error) {
      alert(error.response?.data?.mensagem || "Ocorreu um erro ao salvar.")
    }
  }

  async function darBaixaDevolucao(idEmprestimo, idItemLinha, quantidadeLinha) {
    if (!idEmprestimo) {
      alert("Erro: ID do empréstimo não encontrado.")
      return
    }

    try {
      const payloadDevolucao = {
        id_item: idItemLinha,
        quantidade: Number(quantidadeLinha) || 1
      }

      const res = await axios.put(`http://localhost:3000/emprestimo/${idEmprestimo}/devolucao`, payloadDevolucao)
      
      if (res.data.sucesso) {
        alert(res.data.mensagem || "Devolução concluída com sucesso!")
      } else {
        alert("Aviso: " + res.data.mensagem)
      }
      
      carregarDados()
    } catch (error) {
      console.error("Erro detalhado na devolução:", error)
      alert(error.response?.data?.mensagem || "Erro ao processar devolução.")
    }
  }

  function formatarDataBR(dataString) {
    if (!dataString) return "-"
    const apenasData = dataString.split("T")[0]
    const partes = apenasData.split("-")
    if (partes.length !== 3) return dataString
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <div className="p-4" style={{ textAlign: "left", width: "100%" }}>
      <h2 className="fw-bold text-dark mb-1" style={{ fontSize: "28px" }}>Entradas e Saídas</h2>
      <p className="text-muted mb-4" style={{ fontSize: "14px" }}>Registre movimentações de materiais na brinquedoteca</p>

      {erroApi && (
        <div className="alert alert-warning small font-monospace mb-4">Aviso: {erroApi}</div>
      )}

      <div className="row g-4">
        {/* FORMULÁRIO */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "10px", backgroundColor: "#ffffff" }}>
            <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "16px" }}>Registrar Movimentação</h5>
            <p className="text-muted small mb-4">Insira uma nova entrada ou saída de material</p>

            <form onSubmit={salvarMovimentacao}>
              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small">Tipo de Movimentação</label>
                <select className="form-select" style={{ fontSize: "14px" }} value={tipoMov} onChange={(e) => { setTipoMov(e.target.value); setSacola([]); }}>
                  <option value="Aquisição">Aquisição</option>
                  <option value="Doação">Doação</option>
                  <option value="Descarte">Descarte</option>
                  <option value="Empréstimo">Empréstimo para Aluno (-)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small">Material</label>
                <div className="d-flex gap-2">
                  <select className="form-select text-muted" style={{ fontSize: "14px" }} value={idItem} onChange={(e) => setIdItem(e.target.value)}>
                    <option value="">Selecione um material</option>
                    {itens.map(i => (
                      <option key={i.id_item || i.id} value={i.id_item || i.id}>
                        {i.nome} (Disp: {i.quantidade_disponivel ?? i.quantidade_total ?? 0})
                      </option>
                    ))}
                  </select>
                  {tipoMov === "Empréstimo" && (
                    <button type="button" className="btn btn-secondary btn-sm fw-bold" onClick={adicionarNaSacola}>
                      +Sacola
                    </button>
                  )}
                </div>
              </div>

              {tipoMov !== "Empréstimo" && (
                <div className="mb-3">
                  <label className="form-label text-secondary fw-semibold small">Quantidade</label>
                  <input type="number" className="form-control" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-secondary fw-semibold small">Data da Ação</label>
                <input type="date" className="form-control" value={dataMov} onChange={(e) => setDataMov(e.target.value)} />
              </div>

              {tipoMov === "Empréstimo" && sacola.length > 0 && (
                <div className="mb-3 p-3 bg-light border rounded">
                  <span className="text-secondary fw-semibold small d-block mb-2">Sacola de Itens (Máx 1 de cada):</span>
                  <div className="d-flex flex-wrap gap-2">
                    {sacola.map(s => (
                      <span key={s.id_item} className="badge bg-primary d-flex align-items-center gap-2 p-2" style={{ fontSize: "12px" }}>
                        {s.nome} (1x)
                        <button type="button" className="btn-close btn-close-white" style={{ fontSize: "9px" }} onClick={() => removerDaSacola(s.id_item)}></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tipoMov === "Empréstimo" && (
                <div className="p-3 mb-3 border rounded shadow-sm" style={{ backgroundColor: "#fafafa" }}>
                  <div className="mb-2">
                    <label className="form-label text-secondary fw-semibold small">RA do Aluno</label>
                    <input 
                      type="number" 
                      className="form-control form-control-sm" 
                      placeholder="Digite o RA"
                      value={raAluno}
                      onChange={(e) => setRaAluno(e.target.value)}
                      onBlur={(e) => verificarAluno(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-secondary fw-semibold small">Nome do Aluno</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Nome completo"
                      value={nomeAluno}
                      onChange={(e) => setNomeAluno(e.target.value)}
                      disabled={!isNovoAluno && raAluno !== "" && nomeAluno !== ""}
                    />
                  </div>

                  {isNovoAluno && (
                    <>
                      <div className="form-text text-primary small fw-medium mb-2">
                        Novo cadastro! Preencha as informações adicionais:
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary fw-semibold small">Telefone</label>
                        <input type="text" className="form-control form-control-sm" placeholder="(00) 00000-0000" value={telefoneAluno} onChange={(e) => setTelefoneAluno(e.target.value)} />
                      </div>
                      <div className="mb-2">
                        <label className="form-label text-secondary fw-semibold small">E-mail</label>
                        <input type="email" className="form-control form-control-sm" placeholder="estudante@escola.com" value={emailAluno} onChange={(e) => setEmailAluno(e.target.value)} />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="form-label text-secondary fw-semibold small">Prazo de Devolução</label>
                    <input type="date" className="form-control form-control-sm" value={dataDevPrevista} onChange={(e) => setDataDevPrevista(e.target.value)} />
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label text-secondary fw-semibold small">Observações</label>
                <textarea className="form-control" rows="2" placeholder="Informações adicionais..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} style={{ fontSize: "14px" }}></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold" style={{ fontSize: "14px", padding: "10px" }}>
                {tipoMov === "Empréstimo" ? "Finalizar Empréstimo da Sacola" : "+ Registrar Movimentação"}
              </button>
            </form>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "10px", backgroundColor: "#ffffff" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold text-dark mb-1" style={{ fontSize: "16px" }}>Histórico de Movimentações</h5>
                <small className="text-muted">{historico.length} registros encontrados</small>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light text-secondary small">
                  <tr>
                    <th>Material</th>
                    <th>Tipo</th>
                    <th>Aluno / RA</th>
                    <th>Data</th>
                    <th>Qtd</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {historico.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted py-4">Nenhuma ação registrada.</td></tr>
                  ) : (
                    historico.map((e) => {
                      // Descobre o ID correto do empréstimo vindo do banco (id ou id_emprestimo)
                      const idEmprestimoReal = e.id || e.id_emprestimo;
                      // Descobre a data de devolução real (datadevolucao ou data_devolucao_real)
                      const dataDevolvidaReal = e.datadevolucao || e.data_devolucao_real;
                      // Descobre a data de empréstimo (dataemprestimo ou data_emprestimo)
                      const dataDoEmprestimo = e.dataemprestimo || e.data_emprestimo;

                      return (
                        <tr key={idEmprestimoReal}>
                          {/* 1. MATERIAL */}
                          <td className="fw-semibold text-dark">{e.item?.nome || "Material Desconhecido"}</td>
                          
                          {/* 2. TIPO */}
                          <td><span className="badge bg-light text-dark border">Empréstimo</span></td>
                          
                          {/* 3. ALUNO / RA */}
                          <td>{e.aluno?.nome || `RA: ${e.ra_aluno || e.id_aluno}`}</td>
                          
                          {/* 4. DATA */}
                          <td>{formatarDataBR(dataDoEmprestimo)}</td>
                          
                          {/* 5. QUANTIDADE */}
                          <td>{e.quantidade || 1}</td>
                          
                          {/* 6. AÇÕES */}
                          <td>
                            {!dataDevolvidaReal ? (
                              <button 
                                type="button"
                                className="btn btn-warning btn-sm fw-bold"
                                onClick={() => darBaixaDevolucao(idEmprestimoReal, e.id_item, e.quantidade || 1)}
                              >
                                Receber
                              </button>
                            ) : (
                              <span className="badge bg-success">Devolvido ({formatarDataBR(dataDevolvidaReal)})</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Movimentacao