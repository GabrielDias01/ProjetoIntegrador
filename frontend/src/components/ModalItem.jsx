import { useState, useEffect } from "react"
import axios from "axios"
import { 
  TIPO_ITEM, 
  TIPOS_JOGOS, 
  TIPOS_BRINQUEDOS, 
  ESTAGIO_COGNITIVO, 
  AREA_DESENVOLVIMENTO 
} from "../utils/enums" // Ajuste o caminho se necessário

function ModalItem({ buscarItens, itemParaEditar, limparSelecao }) {
  const [nome, setNome] = useState("")
  const [tipo, setTipo] = useState(1)
  const [faixaEtaria, setFaixaEtaria] = useState("")
  const [quantidade, setQuantidade] = useState(0)

  const [estagioCognitivo, setEstagioCognitivo] = useState(1)
  const [areaDesenvolvimento, setAreaDesenvolvimento] = useState(1)
  
  const [classificacaoJogo, setClassificacaoJogo] = useState(1)
  const [classificacaoBrinquedo, setClassificacaoBrinquedo] = useState(1)

  // Escuta as alterações do componente pai para saber se está editando ou criando
  useEffect(() => {
    if (itemParaEditar) {
      setNome(itemParaEditar.nome || "")
      setTipo(itemParaEditar.tipo || 1)
      setFaixaEtaria(itemParaEditar.faixaetaria || "")
      setQuantidade(itemParaEditar.quantidade_total || 0)
      setEstagioCognitivo(itemParaEditar.estagiocognitivo || 1)
      setAreaDesenvolvimento(itemParaEditar.areadesenvolvimento || 1)
      setClassificacaoJogo(itemParaEditar.classificacao_jogo_id || 1)
      setClassificacaoBrinquedo(itemParaEditar.classificacao_brinquedo_id || 1)
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
      alert("Por favor, preencha o nome do material.")
      return
    }

    try {
      const payload = {
        nome,
        tipo: Number(tipo),
        faixaetaria: faixaEtaria,
        quantidade_total: Number(quantidade),
        quantidade_disponivel: Number(quantidade),
        status: 1, // Ativo por padrão
        estagiocognitivo: Number(tipo) === 1 ? Number(estagioCognitivo) : null,
        classificacao_jogo_id: Number(tipo) === 1 ? Number(classificacaoJogo) : null,
        areadesenvolvimento: Number(tipo) === 2 ? Number(areaDesenvolvimento) : null,
        classificacao_brinquedo_id: Number(tipo) === 2 ? Number(classificacaoBrinquedo) : null
      }

      if (itemParaEditar) {
        // Rota de Atualização (PUT)
        await axios.put(`http://localhost:3000/item/${itemParaEditar.id_item}`, payload)
        alert("Material atualizado com sucesso!")
      } else {
        // Rota de Cadastro (POST)
        await axios.post("http://localhost:3000/item", payload)
        alert("Material cadastrado com sucesso!")
      }

      buscarItens()
      fecharEClearModal()

    } catch (error) {
      console.error(error.response?.data)
      alert("Erro ao salvar o material na brinquedoteca.")
    }
  }

  function fecharEClearModal() {
    document.getElementById("fecharModal").click()
    resetaCampos()
    if (limparSelecao) limparSelecao() // Avisa o componente Pai para limpar o item selecionado
  }

  return (
    <div className="modal fade" id="modalItem" tabIndex="-1" data-bs-backdrop="static">
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">
              {itemParaEditar ? "📝 Editar Material" : "✨ Adicionar Novo Material"}
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={fecharEClearModal} />
          </div>

          <div className="modal-body">
            <label className="form-label fw-bold">Nome do Material</label>
            <input
              className="form-control mb-3"
              placeholder="Ex: Quebra-Cabeça de Animais, Bola de Basquete"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label className="form-label fw-bold">Categoria</label>
            <select
              className="form-select mb-3"
              value={tipo}
              onChange={(e) => setTipo(Number(e.target.value))}
            >
              {Object.keys(TIPO_ITEM).map((key) => (
                <option key={key} value={key}>{TIPO_ITEM[key]}</option>
              ))}
            </select>

            <label className="form-label fw-bold">Faixa Etária</label>
            <input
              className="form-control mb-3"
              placeholder="Ex: 3-5 anos, 10+, Livre"
              value={faixaEtaria}
              onChange={(e) => setFaixaEtaria(e.target.value)}
            />

            <label className="form-label fw-bold">Quantidade Inicial</label>
            <input
              type="number"
              className="form-control mb-3"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
            />

            {/* --- SE FOR JOGO (TIPO 1) --- */}
            {Number(tipo) === 1 && (
              <>
                <label className="form-label fw-bold text-primary">Tipo de Jogo</label>
                <select
                  className="form-select mb-3"
                  value={classificacaoJogo}
                  onChange={(e) => setClassificacaoJogo(Number(e.target.value))}
                >
                  {Object.keys(TIPOS_JOGOS).map((key) => (
                    <option key={key} value={key}>{TIPOS_JOGOS[key]}</option>
                  ))}
                </select>

                <label className="form-label fw-bold text-primary">Estágio de Desenvolvimento Cognitivo (Piaget)</label>
                <select
                  className="form-select mb-3"
                  value={estagioCognitivo}
                  onChange={(e) => setEstagioCognitivo(Number(e.target.value))}
                >
                  {Object.keys(ESTAGIO_COGNITIVO).map((key) => (
                    <option key={key} value={key}>{key} - {ESTAGIO_COGNITIVO[key]}</option>
                  ))}
                </select>
              </>
            )}

            {/* --- SE FOR BRINQUEDO (TIPO 2) --- */}
            {Number(tipo) === 2 && (
              <>
                <label className="form-label fw-bold text-success">Tipo de Brinquedo</label>
                <select
                  className="form-select mb-3"
                  value={classificacaoBrinquedo}
                  onChange={(e) => setClassificacaoBrinquedo(Number(e.target.value))}
                >
                  {Object.keys(TIPOS_BRINQUEDOS).map((key) => (
                    <option key={key} value={key}>{TIPOS_BRINQUEDOS[key]}</option>
                  ))}
                </select>

                <label className="form-label fw-bold text-success">Área de Desenvolvimento</label>
                <select
                  className="form-select mb-3"
                  value={areaDesenvolvimento}
                  onChange={(e) => setAreaDesenvolvimento(Number(e.target.value))}
                >
                  {Object.keys(AREA_DESENVOLVIMENTO).map((key) => (
                    <option key={key} value={key}>{key} - {AREA_DESENVOLVIMENTO[key]}</option>
                  ))}
                </select>
              </>
            )}

          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal" id="fecharModal" onClick={fecharEClearModal}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={salvar}>
              {itemParaEditar ? "Atualizar" : "Salvar"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ModalItem