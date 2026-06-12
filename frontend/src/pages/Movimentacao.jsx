import { useState, useEffect } from "react"
import axios from "axios"

function Movimentacao() {
  const [itens, setItens] = useState([])
  const [historico, setHistorico] = useState([])
  const [erroApi, setErroApi] = useState(null)

  // 🌟 ESTADOS PARA GERENCIAR OS AVISOS VISUAIS NA TELA
  const [mensagemSucesso, setMensagemSucesso] = useState("")
  const [mensagemErro, setMensagemErro] = useState("")

  // Campos do Formulário
  const [idItem, setIdItem] = useState("")
  const [tipoMov, setTipoMov] = useState("Aquisição")
  const [quantidade, setQuantidade] = useState("1")
  const [dataMov, setDataMov] = useState(new Date().toISOString().split("T")[0])
  
  // Guardando a data escolhida no padrão esperado pelo formulário
  const [dataDevPrevista, setDataDevPrevista] = useState("")

  // Estado para gerenciar a sacola de itens do empréstimo (modelo locadora)
  const [sacola, setSacola] = useState([])

  // Campos Estruturados do Aluno
  const [raAluno, setRaAluno] = useState("")
  const [nomeAluno, setNomeAluno] = useState("")
  const [telefoneAluno, setTelefoneAluno] = useState("")
  const [emailAluno, setEmailAluno] = useState("")
  const [isNovoAluno, setIsNovoAluno] = useState(false)

  // 🌟 DEFINIÇÃO DA URL DA API (Lê da Vercel ou usa o localhost)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setErroApi(null)
      const token = localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const resItens = await axios.get(`${API_URL}/item`, config)
      setItens(resItens.data || [])

      const resHist = await axios.get(`${API_URL}/emprestimos-historico`, config)
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
      const token = localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const res = await axios.get(`${API_URL}/aluno/ra/${ra}`, config)
      if (res.data) {
        setNomeAluno(res.data.nome)
        setTelefoneAluno(res.data.telefone || "")
        setEmailAluno(res.data.email || "")
        setIsNovoAluno(false)
        setMensagemSucesso(`Aluno [${res.data.nome}] localizado no sistema!`)
        setMensagemErro("")
      } else {
        setNomeAluno("")
        setTelefoneAluno("")
        setEmailAluno("")
        setIsNovoAluno(true)
        setMensagemSucesso("RA não cadastrado. Preencha os campos abaixo para registrar este aluno.")
        setMensagemErro("")
      }
    } catch (err) {
      console.log("Erro ao validar RA", err)
    }
  }

  function adicionarNaSacola() {
    setMensagemSucesso("")
    setMensagemErro("")

    if (!idItem) {
      setMensagemErro("Selecione um material primeiro antes de adicionar à sacola!")
      return
    }

    const itemSelecionado = itens.find(i => String(i.id_item) === String(idItem) || String(i.id) === String(idItem))
    if (!itemSelecionado) return

    const idReal = itemSelecionado.id_item || itemSelecionado.id

    const jaExiste = sacola.some(s => String(s.id_item) === String(idReal))
    if (jaExiste) {
      setMensagemErro(`O item "${itemSelecionado.nome}" já está na sacola! Só é permitido 1 unidade por tipo.`)
      return
    }

    setSacola([...sacola, { id_item: idReal, nome: itemSelecionado.nome }])
    setIdItem("") 
    setMensagemSucesso(`"${itemSelecionado.nome}" adicionado à sacola!`)
  }

  function removerDaSacola(id) {
    setSacola(sacola.filter(s => String(s.id_item) !== String(id)))
    setMensagemSucesso("Item removido da sacola.")
  }

  async function salvarMovimentacao(e) {
    e.preventDefault()
    setMensagemSucesso("")
    setMensagemErro("")

    if (tipoMov === "Empréstimo") {
      if (!raAluno || !nomeAluno) {
        setMensagemErro("Por favor, preencha o RA e o Nome do aluno.")
        return
      }
      if (sacola.length === 0) {
        setMensagemErro("Adicione pelo menos 1 item na sacola antes de salvar o empréstimo.")
        return
      }
      if (!dataDevPrevista) {
        setMensagemErro("Por favor, selecione uma data de devolução prevista.")
        return
      }
    } else {
      if (!idItem || !quantidade) {
        setMensagemErro("Selecione o material e defina a quantidade.")
        return
      }
      
      // Validação rápida no Front-end para o Descarte
      if (tipoMov === "Descarte") {
        const itemSelecionado = itens.find(i => String(i.id_item) === String(idItem) || String(i.id) === String(idItem))
        const qtdDisponivel = itemSelecionado?.quantidade_disponivel ?? itemSelecionado?.quantidade_total ?? 0
        if (qtdDisponivel <= 0) {
          setMensagemErro(`Não é possível descartar. O item "${itemSelecionado?.nome}" já está com estoque zerado!`)
          return
        }
        if (Number(quantidade) > qtdDisponivel) {
          setMensagemErro(`Quantidade de descarte (${quantidade}) é maior do que o estoque disponível (${qtdDisponivel}).`)
          return
        }
      }
    }

    const payload = {
      tipo_movimentacao: tipoMov,
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
      const token = localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const res = await axios.post(`${API_URL}/movimentacao`, payload, config)
      
      // Mensagem customizada dependendo da operação executada
      if (tipoMov === "Empréstimo") {
        setMensagemSucesso(`Empréstimo realizado com sucesso para o aluno ${nomeAluno}!`)
      } else {
        setMensagemSucesso(res.data.mensagem || "Movimentação registrada com sucesso!")
      }
      
      setIdItem("")
      setQuantidade("1")
      setRaAluno("")
      setNomeAluno("")
      setTelefoneAluno("")
      setEmailAluno("")
      setDataDevPrevista("")
      setIsNovoAluno(false)
      setSacola([]) 
      
      carregarDados()
    } catch (error) {
      setMensagemErro(error.response?.data?.mensagem || "Ocorreu um erro ao salvar a movimentação.")
    }
  }

  async function darBaixaDevolucao(idEmprestimo) {
    setMensagemSucesso("")
    setMensagemErro("")

    if (!idEmprestimo) {
      setMensagemErro("Erro: ID do empréstimo não encontrado.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const res = await axios.put(`${API_URL}/emprestimo/${idEmprestimo}/devolucao`, {}, config)
      
      setMensagemSucesso(res.data.mensagem || "Devolução concluída! O material voltou ao estoque.")
      carregarDados()
    } catch (error) {
      console.error("Erro detalhado na devolução:", error)
      setMensagemErro(error.response?.data?.mensagem || "Erro ao processar devolução.")
    }
  }

  function formatarDataBR(dataString) {
    if (!dataString) return "-"
    const apenasData = dataString.split("T")[0]
    const partes = apenasData.split("-")
    if (partes.length !== 3) return dataString
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  const estiloLabel = {
    color: "#475569",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "5px"
  }

  const estiloInput = {
    height: "38px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    boxShadow: "none"
  }

  return (
    <div className="p-4" style={{ textAlign: "left", width: "100%", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <h2 className="fw-bold mb-1" style={{ fontSize: "24px", color: "#0f172a", letterSpacing: "-0.5px" }}>Entradas e Saídas</h2>
      <p className="mb-4" style={{ fontSize: "14px", color: "#64748b" }}>Registre movimentações de materiais na brinquedoteca</p>

      {erroApi && (
        <div className="alert alert-warning small font-monospace mb-4">Aviso: {erroApi}</div>
      )}

      {/* 🌟 EXIBIÇÃO DINÂMICA DE SUCESSO GLOBAL NA TELA */}
      {mensagemSucesso && (
        <div className="alert alert-success border-0 shadow-sm mb-4 small" style={{ borderRadius: "8px" }}>
          ✅ {mensagemSucesso}
        </div>
      )}

      {/* 🌟 EXIBIÇÃO DINÂMICA DE ERROS GLOBAL NA TELA */}
      {mensagemErro && (
        <div className="alert alert-danger border-0 shadow-sm mb-4 small" style={{ borderRadius: "8px" }}>
          ❌ {mensagemErro}
        </div>
      )}

      <div className="row g-4 align-items-start">
        {/* FORMULÁRIO */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "12px", backgroundColor: "#ffffff" }}>
            <h5 className="fw-bold mb-1" style={{ fontSize: "15px", color: "#1e293b", letterSpacing: "-0.3px" }}>Registrar Movimentação</h5>
            <p className="small mb-4" style={{ color: "#64748b", fontSize: "12px" }}>Insira uma nova entrada ou saída de material</p>

            <form onSubmit={salvarMovimentacao}>
              <div className="mb-3">
                <label style={estiloLabel}>Tipo de Movimentação</label>
                <select className="form-select" style={estiloInput} value={tipoMov} onChange={(e) => { setTipoMov(e.target.value); setSacola([]); setMensagemSucesso(""); setMensagemErro(""); }}>
                  <option value="Aquisição">Aquisição</option>
                  <option value="Doação">Doação</option>
                  <option value="Descarte">Descarte</option>
                  <option value="Empréstimo">Empréstimo para Aluno</option>
                </select>
              </div>

              <div className="mb-3">
                <label style={estiloLabel}>Material</label>
                <div className="d-flex w-100" style={{ gap: "8px" }}>
                  <select className="form-select flex-grow-1" style={{ ...estiloInput, minWidth: "0" }} value={idItem} onChange={(e) => setIdItem(e.target.value)}>
                    <option value="">Selecione um material</option>
                    {itens.map(i => (
                      <option key={i.id_item || i.id} value={i.id_item || i.id}>
                        {i.nome} (Disp: {i.quantidade_disponivel ?? i.quantidade_total ?? 0})
                      </option>
                    ))}
                  </select>
                  {tipoMov === "Empréstimo" && (
                    <button 
                      type="button" 
                      className="btn fw-semibold text-nowrap d-inline-flex align-items-center justify-content-center px-3" 
                      onClick={adicionarNaSacola}
                      style={{ 
                        height: "38px", 
                        borderRadius: "6px", 
                        backgroundColor: "#475569", 
                        color: "#ffffff",
                        border: "none", 
                        fontSize: "12px"
                      }}
                    >
                      + Sacola
                    </button>
                  )}
                </div>
              </div>

              {tipoMov !== "Empréstimo" && (
                <div className="mb-3">
                  <label style={estiloLabel}>Quantidade</label>
                  <input type="number" className="form-control" style={estiloInput} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
                </div>
              )}

              <div className="mb-3">
                <label style={estiloLabel}>Data da Ação</label>
                <input type="date" className="form-control" style={estiloInput} value={dataMov} onChange={(e) => setDataMov(e.target.value)} />
              </div>

              {tipoMov === "Empréstimo" && sacola.length > 0 && (
                <div className="mb-3 p-3 border rounded" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                  <span style={estiloLabel} className="d-block mb-2">Sacola de Itens (Máx 1 de cada):</span>
                  <div className="d-flex flex-wrap gap-2">
                    {sacola.map(s => (
                      <span key={s.id_item} className="badge d-flex align-items-center gap-2 px-2.5 py-1.5" style={{ fontSize: "12px", fontWeight: "500", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px" }}>
                        {s.nome} (1x)
                        <button type="button" className="btn-close" style={{ fontSize: "9px" }} onClick={() => removerDaSacola(s.id_item)}></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tipoMov === "Empréstimo" && (
                <div className="p-3 mb-4 border rounded" style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}>
                  <div className="mb-2.5">
                    <label style={estiloLabel}>RA do Aluno</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={estiloInput}
                      placeholder="Digite o RA"
                      value={raAluno}
                      onChange={(e) => setRaAluno(e.target.value)}
                      onBlur={(e) => verificarAluno(e.target.value)}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label style={estiloLabel}>Nome do Aluno</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={estiloInput}
                      placeholder="Nome completo"
                      value={nomeAluno}
                      onChange={(e) => setNomeAluno(e.target.value)}
                      disabled={!isNovoAluno && raAluno !== "" && nomeAluno !== ""}
                    />
                  </div>

                  {isNovoAluno && (
                    <>
                      <div className="small fw-semibold mb-2" style={{ color: "#2563eb", fontSize: "12px" }}>
                        RA não encontrado! Insira os dados para cadastrá-lo ao salvar:
                      </div>
                      <div className="mb-2.5">
                        <label style={estiloLabel}>Telefone</label>
                        <input type="text" className="form-control" style={estiloInput} placeholder="(00) 00000-0000" value={telefoneAluno} onChange={(e) => setTelefoneAluno(e.target.value)} />
                      </div>
                      <div className="mb-2.5">
                        <label style={estiloLabel}>E-mail</label>
                        <input type="email" className="form-control" style={estiloInput} placeholder="estudante@escola.com" value={emailAluno} onChange={(e) => setEmailAluno(e.target.value)} />
                      </div>
                    </>
                  )}

                  <div>
                    <label style={estiloLabel}>Prazo de Devolução</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      style={estiloInput} 
                      value={dataDevPrevista} 
                      onChange={(e) => setDataDevPrevista(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn text-white w-100 fw-semibold text-nowrap" 
                style={{ fontSize: "13px", height: "40px", borderRadius: "6px", backgroundColor: "#2563eb", border: "none", transition: "background-color 0.2s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
              >
                {tipoMov === "Empréstimo" ? "Finalizar Empréstimo" : "Registrar Movimentação"}
              </button>
            </form>
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "12px", backgroundColor: "#ffffff" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1" style={{ fontSize: "15px", color: "#1e293b", letterSpacing: "-0.3px" }}>Histórico de Empréstimos</h5>
                <small style={{ color: "#64748b", fontSize: "12px" }}>{historico.length} registros encontrados</small>
              </div>
            </div>

            <div className="table-responsive" style={{ borderRadius: "8px", overflowX: "auto", overflowY: "auto", maxHeight: "530px" }}>
              <table className="table table-hover align-middle mb-0">
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }}>Material</th>
                    <th style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }}>Tipo</th>
                    <th style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }}>Aluno / RA</th>
                    <th style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }}>Data</th>
                    <th style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }} className="text-center">Qtd</th>
                    <th style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }} className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px", color: "#334155" }}>
                  {historico.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>Nenhuma ação registrada.</td></tr>
                  ) : (
                    historico.map((e) => {
                      const idEmprestimoReal = e.id || e.id_emprestimo;
                      const dataDevolvidaReal = e.datadevolucao || e.data_devolucao_real;
                      const dataDoEmprestimo = e.dataSample || e.dataemprestimo || e.datapretimo || e.data_emprestimo;
                      
                      const nomeDoMaterial = 
                        e.item?.nome || 
                        e.nome_item || 
                        (e.itens && e.itens[0]?.nome) || 
                        (e.emprestimo_itens && e.emprestimo_itens[0]?.item?.nome) || 
                        "Material Deletado";

                      return (
                        <tr key={idEmprestimoReal}>
                          <td className="fw-semibold" style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", color: "#1e293b" }}>{nomeDoMaterial}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                            <span style={{ fontSize: "11px", fontWeight: "600", padding: "4px 8px", borderRadius: "6px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>Empréstimo</span>
                          </td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{e.aluno?.nome || e.nome_aluno || `RA: ${e.ra_aluno || e.id_aluno}`}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{formatarDataBR(dataDoEmprestimo)}</td>
                          <td className="text-center fw-medium" style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", color: "#475569" }}>{e.quantidade || 1}</td>
                          <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }} className="text-end">
                            {!dataDevolvidaReal ? (
                              <button 
                                type="button"
                                onClick={() => darBaixaDevolucao(idEmprestimoReal)}
                                style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "500", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", color: "#d97706", cursor: "pointer", transition: "all 0.2s ease" }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#d97706"; e.currentTarget.style.backgroundColor = "#fffbeb"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.backgroundColor = "#ffffff"; }}
                              >
                                Receber
                              </button>
                            ) : (
                              <span style={{ fontSize: "11px", fontWeight: "600", padding: "4px 8px", borderRadius: "6px", backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                                Devolvido ({formatarDataBR(dataDevolvidaReal)})
                              </span>
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