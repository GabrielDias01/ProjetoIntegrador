import { useState, useEffect } from "react"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { 
  TIPO_ITEM, 
  TIPOS_JOGOS, 
  TIPOS_BRINQUEDOS, 
  ESTAGIO_COGNITIVO, 
  AREA_DESENVOLVIMENTO 
} from "../utils/enums"

function ModalItem({ buscarItens, itemParaEditar, limparSelecao }) {
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState(1)
  const [faixaEtaria, setFaixaEtaria] = useState("")
  const [quantidade, setQuantidade] = useState(0)

  const [estagioCognitivo, setEstagioCognitivo] = useState(1)
  const [areaDesenvolvimento, setAreaDesenvolvimento] = useState(1)
  
  const [classificacaoJogo, setClassificacaoJogo] = useState(1)
  const [classificacaoBrinquedo, setClassificacaoBrinquedo] = useState(1)

  useEffect(() => {
    if (itemParaEditar) {
      setNome(itemParaEditar.nome || "")
      setTipo(Number(itemParaEditar.tipo) || 1)
      setFaixaEtaria(itemParaEditar.faixaetaria || "")
      setQuantidade(itemParaEditar.quantidade_total || 0)
      setEstagioCognitivo(Number(itemParaEditar.estagiocognitivo) || 1)
      setAreaDesenvolvimento(Number(itemParaEditar.areadesenvolvimento) || 1)
      setClassificacaoJogo(Number(itemParaEditar.classificacao_jogo_id) || 1)
      setClassificacaoBrinquedo(Number(itemParaEditar.classificacao_brinquedo_id) || 1)
    } else {
      resetaCampos()
    }
  }, [itemParaEditar])

  function resetaCampos() {
    setNome("")
    setTipo(1)
    setFaixaEtaria("")
    setQuantidade(0)
    setEstagioCognitivo(1)
    setAreaDesenvolvimento(1)
    setClassificacaoJogo(1)
    setClassificacaoBrinquedo(1)
  }

  async function salvar() {
    if (!nome.trim()) {
      toast.error("Por favor, preencha o nome do jogo ou brinquedo!")
      return
    }

    try {
      // 🔑 BUSCA O TOKEN DE SEGURANÇA NO NAVEGADOR
      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      const payload = {
        nome,
        tipo: Number(tipo),
        faixaetaria: faixaEtaria,
        quantidade_total: Number(quantidade),
        quantidade_disponivel: Number(quantidade),
        status: 1, 
        estagiocognitivo: Number(tipo) === 1 ? Number(estagioCognitivo) : null,
        classificacao_jogo_id: Number(tipo) === 1 ? Number(classificacaoJogo) : null,
        areadesenvolvimento: Number(tipo) === 2 ? Number(areaDesenvolvimento) : null,
        classificacao_brinquedo_id: Number(tipo) === 2 ? Number(classificacaoBrinquedo) : null
      }

      if (itemParaEditar) {
        const idItem = itemParaEditar.id_item || itemParaEditar.id
        // 🔑 Passa a 'config' com o token como terceiro parâmetro no PUT
        const res = await axios.put(`http://localhost:3000/item/${idItem}`, payload, config)
        toast.success(res.data?.mensagem || "Item atualizado com sucesso!")
      } else {
        // 🔑 Passa a 'config' com o token como terceiro parâmetro no POST
        const res = await axios.post("http://localhost:3000/item", payload, config)
        toast.success(res.data?.mensagem || "Item cadastrado com sucesso!")
      }

      buscarItens()
      fecharEClearModal()

    } catch (error) {
      console.error("Erro completo ao salvar:", error)
      
      if (error.response && error.response.data && error.response.data.mensagem) {
        toast.error(`Não foi possível salvar: ${error.response.data.mensagem}`)
      } 
      else if (error.request) {
        toast.error("O servidor da brinquedoteca está inacessível. Verifique sua conexão.")
      } 
      else {
        toast.error("Erro interno ao processar os dados da brinquedoteca.")
      }
    }
  }

  function fecharEClearModal() {
    const btnFechar = document.getElementById("fecharModal")
    if (btnFechar) btnFechar.click()
    resetaCampos()
    if (limparSelecao) limparSelecao()
  }

  const estiloModal = { borderRadius: "12px", border: "none" }
  const estiloLabel = { fontSize: "14px", color: "#000000" }
  const estiloInput = { height: "40px", borderRadius: "6px", fontSize: "14px", color: "#000000" }
  const estiloBotaoSalvar = { height: "40px", borderRadius: "6px", backgroundColor: "#1d4ed8", border: "none", fontSize: "14px" }
  const estiloBotaoCancelar = { height: "40px", borderRadius: "6px", backgroundColor: "#64748b", border: "none", fontSize: "14px" }
  const containerPedagogico = { backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }

  return (
    <div className="modal fade" id="modalItem" tabIndex="-1" data-bs-backdrop="static">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow" style={estiloModal}>

          <div className="modal-header px-4 py-3 border-bottom-0">
            <h5 className="modal-title fw-bold text-black" style={{ fontSize: "18px" }}>
              {itemParaEditar ? "Editar Item da Brinquedoteca" : "Novo Jogo ou Brinquedo"}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={fecharEClearModal} />
          </div>

          <div className="modal-body px-4 py-2 text-start">
            <div className="mb-3">
              <label className="form-label fw-semibold mb-1" style={estiloLabel}>Nome do Jogo / Brinquedo</label>
              <input
                className="form-control"
                style={estiloInput}
                placeholder="Ex: Quebra-Cabeça de Animais, Carrinho de Madeira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold mb-1" style={estiloLabel}>Categoria</label>
              <select
                className="form-select"
                style={estiloInput}
                value={tipo}
                onChange={(e) => setTipo(Number(e.target.value))}
              >
                {Object.keys(TIPO_ITEM).map((key) => (
                  <option key={key} value={Number(key)}>{TIPO_ITEM[key]}</option>
                ))}
              </select>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold mb-1" style={estiloLabel}>Faixa Etária</label>
                <input
                  className="form-control"
                  style={estiloInput}
                  placeholder="Ex: 3-5 anos, 10+"
                  value={faixaEtaria}
                  onChange={(e) => setFaixaEtaria(e.target.value)}
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold mb-1" style={estiloLabel}>Quantidade Inicial</label>
                <input
                  type="number"
                  className="form-control"
                  style={estiloInput}
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                />
              </div>
            </div>

            {Number(tipo) === 1 && (
              <div className="p-3 mb-3 shadow-sm" style={containerPedagogico}>
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1 text-black small">Classificação do Jogo</label>
                  <select
                    className="form-select"
                    style={estiloInput}
                    value={classificacaoJogo}
                    onChange={(e) => setClassificacaoJogo(Number(e.target.value))}
                  >
                    {Object.keys(TIPOS_JOGOS).map((key) => (
                      <option key={key} value={Number(key)}>{TIPOS_JOGOS[key]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label fw-semibold mb-1 text-black small">Estágio Cognitivo (Piaget)</label>
                  <select
                    className="form-select"
                    style={estiloInput}
                    value={estagioCognitivo}
                    onChange={(e) => setEstagioCognitivo(Number(e.target.value))}
                  >
                    {Object.keys(ESTAGIO_COGNITIVO).map((key) => (
                      <option key={key} value={Number(key)}>{key} - {ESTAGIO_COGNITIVO[key]}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {Number(tipo) === 2 && (
              <div className="p-3 mb-3 shadow-sm" style={containerPedagogico}>
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-1 text-black small">Classificação do Brinquedo</label>
                  <select
                    className="form-select"
                    style={estiloInput}
                    value={classificacaoBrinquedo}
                    onChange={(e) => setClassificacaoBrinquedo(Number(e.target.value))}
                  >
                    {Object.keys(TIPOS_BRINQUEDOS).map((key) => (
                      <option key={key} value={Number(key)}>{TIPOS_BRINQUEDOS[key]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label fw-semibold mb-1 text-black small">Área de Desenvolvimento</label>
                  <select
                    className="form-select"
                    style={estiloInput}
                    value={areaDesenvolvimento}
                    onChange={(e) => setAreaDesenvolvimento(Number(e.target.value))}
                  >
                    {Object.keys(AREA_DESENVOLVIMENTO).map((key) => (
                      <option key={key} value={Number(key)}>{key} - {AREA_DESENVOLVIMENTO[key]}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

          </div>

          <div className="modal-footer px-4 py-3 border-top-0 gap-2">
            <button 
              className="btn text-white fw-semibold px-4" 
              style={estiloBotaoCancelar}
              data-bs-dismiss="modal" 
              id="fecharModal" 
              onClick={fecharEClearModal}
            >
              Cancelar
            </button>
            <button 
              className="btn text-white fw-semibold px-4" 
              style={estiloBotaoSalvar}
              onClick={salvar}
            >
              {itemParaEditar ? "Atualizar Dados" : "Salvar na Brinquedoteca"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ModalItem