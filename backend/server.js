const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const supabase = require("./services/supabase")

const app = express()

const jwt = require("jsonwebtoken") 
const autenticarToken = require("./middlewares/auth") 

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json())

// ==========================================
// DATA BRASIL (Garante formato YYYY-MM-DD estável)
// ==========================================
const obterDataLocalBR = () => {
  const dataBr = new Date().toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo"
  })
  const [dia, mes, ano] = dataBr.split("/")
  return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`
}

// Helper para tratar problemas de fuso horário na ordenação do JS
const normalizarDataParaOrdenacao = (dataStr) => {
  if (!dataStr) return new Date(0)
  if (dataStr.includes("-") && !dataStr.includes("T")) {
    return new Date(`${dataStr}T12:00:00`)
  }
  return new Date(dataStr)
}

// ==========================================
// LOGIN (Rota Pública)
// ==========================================
app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body

  try {
    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("usuario", usuario)

    if (error) return res.status(500).json(error)
    if (!data || data.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: "Usuário inválido" })
    }

    const usuarioBanco = data[0]
    const senhaCorreta = await bcrypt.compare(senha, usuarioBanco.senha)

    if (!senhaCorreta) {
      return res.status(401).json({ sucesso: false, mensagem: "Senha inválida" })
    }

    const token = jwt.sign(
      { id: usuarioBanco.id_usuario, perfil: usuarioBanco.perfil },
      process.env.JWT_SECRET || "chave_padrao_temporaria",
      { expiresIn: "8h" }
    )

    res.json({ 
      sucesso: true, 
      usuario: { id: usuarioBanco.id_usuario, usuario: usuarioBanco.usuario, perfil: usuarioBanco.perfil },
      token 
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, message: "Erro interno" })
  }
})

// ==========================================
// CADASTRO USUÁRIO (Rota Pública)
// ==========================================
app.post("/usuario", async (req, res) => {
  const { usuario, senha, perfil } = req.body

  try {
    const { data: usuarioExistente } = await supabase
      .from("usuario")
      .select("*")
      .eq("usuario", usuario)

    if (usuarioExistente && usuarioExistente.length > 0) {
      return res.status(400).json({ sucesso: false, mensagem: "Usuário já existe" })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const { data, error } = await supabase
      .from("usuario")
      .insert([
        {
          usuario,
          senha: senhaHash,
          perfil: perfil || "SUPERVISORA"
        }
      ])
      .select()

    if (error) return res.status(500).json(error)

    res.json({ sucesso: true, usuario: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// LISTAR ITENS (TRAVADO 🔒)
// ==========================================
app.get("/item", autenticarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("item")
      .select("*")
      .order("id_item", { ascending: false })

    if (error) return res.status(500).json(error)

    res.json(data || [])
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// CADASTRAR ITEM (TRAVADO 🔒)
// ==========================================
app.post("/item", autenticarToken, async (req, res) => {
  try {
    const {
      nome, tipo, faixaetaria, quantidade_total, quantidade_disponivel,
      estagiocognitivo, areadesenvolvimento, classificacao_jogo_id,
      classificacao_brinquedo_id, status
    } = req.body

    const total = Number(quantidade_total || 0)
    const disponivel = Number(quantidade_disponivel || 0)

    if (total < 0 || disponivel < 0) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: "A quantidade de estoque não pode ser um número negativo!" 
      })
    }

    const payload = {
      nome,
      tipo: tipo !== undefined && tipo !== null && tipo !== "" ? Number(tipo) : null,
      faixaetaria: faixaetaria || null,
      quantidade_total: total,
      quantidade_disponivel: disponivel,
      estagiocognitivo: estagiocognitivo ? Number(estagiocognitivo) : null,
      areadesenvolvimento: areadesenvolvimento ? Number(areadesenvolvimento) : null,
      classificacao_jogo_id: classificacao_jogo_id ? Number(classificacao_jogo_id) : null,
      classificacao_brinquedo_id: classificacao_brinquedo_id ? Number(classificacao_brinquedo_id) : null,
      status: status !== undefined && status !== null && status !== "" ? Number(status) : 1,
      datacadastro: obterDataLocalBR()
    }

    const { data, error } = await supabase
      .from("item")
      .insert([payload])
      .select()

    if (error) {
      console.error(error)
      return res.status(500).json(error)
    }

    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// EDITAR ITEM (TRAVADO 🔒)
// ==========================================
app.put("/item/:id", autenticarToken, async (req, res) => {
  const { id } = req.params

  try {
    const {
      nome, tipo, faixaetaria, quantidade_total,
      estagiocognitivo, areadesenvolvimento, classificacao_jogo_id,
      classificacao_brinquedo_id, status
    } = req.body

    const novoTotal = Number(quantidade_total || 0)

    if (novoTotal < 0) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: "A quantidade total não pode ser um número negativo!" 
      })
    }

    const { data: itemAtual } = await supabase
      .from("item")
      .select("quantidade_total, quantidade_disponivel")
      .eq("id_item", id)
      .maybeSingle()

    if (!itemAtual) {
      return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado" })
    }

    const itensEmprestados = Number(itemAtual.quantidade_total) - Number(itemAtual.quantidade_disponivel)
    const novaQuantidadeDisponivel = novoTotal - itensEmprestados

    if (novaQuantidadeDisponivel < 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: `Não é possível reduzir o total para ${novoTotal}, pois já existem ${itensEmprestados} unidades emprestadas no momento!`
      })
    }

    const payload = {
      nome,
      tipo: tipo !== undefined && tipo !== null && tipo !== "" ? Number(tipo) : null,
      faixaetaria: faixaetaria || null,
      quantidade_total: novoTotal,
      quantidade_disponivel: novaQuantidadeDisponivel,
      estagiocognitivo: estagiocognitivo ? Number(estagiocognitivo) : null,
      areadesenvolvimento: areadesenvolvimento ? Number(areadesenvolvimento) : null,
      classificacao_jogo_id: classificacao_jogo_id ? Number(classificacao_jogo_id) : null,
      classificacao_brinquedo_id: classificacao_brinquedo_id ? Number(classificacao_brinquedo_id) : null,
      status: status !== undefined && status !== null && status !== "" ? Number(status) : 1
    }

    const { data, error } = await supabase
      .from("item")
      .update(payload)
      .eq("id_item", id)
      .select()

    if (error) return res.status(500).json(error)

    res.json({ sucesso: true, item: data })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// EXCLUIR ITEM (TRAVADO 🔒)
// ==========================================
app.delete("/item/:id", autenticarToken, async (req, res) => {
  const { id } = req.params

  try {
    const { data: vinculos, error: erroVinculo } = await supabase
      .from("emprestimo_item")
      .select("id_emprestimo")
      .eq("id_item", id)

    if (erroVinculo) {
      return res.status(500).json({ sucesso: false, mensagem: "Erro ao verificar vínculos do item." })
    }

    if (vinculos && vinculos.length > 0) {
      const idsEmprestimos = vinculos.map(v => v.id_emprestimo)

      const { data: emprestimosAtivos, error: erroEmprestimo } = await supabase
        .from("emprestimo")
        .select("id_emprestimo")
        .in("id_emprestimo", idsEmprestimos)
        .is("datadevolucao", null)

      if (erroEmprestimo) {
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao validar status dos empréstimos." })
      }

      if (emprestimosAtivos && emprestimosAtivos.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Não é possível excluir este item porque ele possui um ou mais empréstimos ativos no momento!"
        })
      }
    }

    await supabase.from("mov_entrada").delete().eq("id_item", id)
    await supabase.from("mov_saida").delete().eq("id_item", id)
    await supabase.from("emprestimo_item").delete().eq("id_item", id)

    const { error: erroDeletarItem } = await supabase
      .from("item")
      .delete()
      .eq("id_item", id)

    if (erroDeletarItem) {
      return res.status(500).json({ sucesso: false, mensagem: erroDeletarItem.message })
    }

    res.json({ sucesso: true, mensagem: "Item excluído com sucesso" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// BUSCAR ALUNO POR RA (TRAVADO 🔒)
// ==========================================
app.get("/aluno/ra/:ra", autenticarToken, async (req, res) => {
  const { ra } = req.params

  try {
    const { data, error } = await supabase
      .from("aluno")
      .select("*")
      .eq("ra_aluno", ra)
      .maybeSingle()

    if (error) return res.status(500).json(error)

    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// REGISTRAR MOVIMENTAÇÃO / EMPRÉSTIMO (TRAVADO 🔒)
// ==========================================
app.post("/movimentacao", autenticarToken, async (req, res) => {
  try {
    const {
      itens, tipo_movimentacao, id_item, quantidade, ra_aluno,
      nome_aluno, telefone_aluno, email_aluno, data_devolucao_prevista
    } = req.body

    const dataHoje = obterDataLocalBR()

    // 1. TRATAMENTO PARA AQUISIÇÃO / DOAÇÃO
    if (tipo_movimentacao === "Aquisição" || tipo_movimentacao === "Doação") {
      const { data: item } = await supabase
        .from("item")
        .select("*")
        .eq("id_item", id_item)
        .maybeSingle()

      if (!item) {
        return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado" })
      }

      await supabase.from("mov_entrada").insert([
        {
          id_item,
          quantidade: Number(quantidade),
          data: dataHoje
        }
      ])

      await supabase
        .from("item")
        .update({
          quantidade_total: Number(item.quantidade_total) + Number(quantidade),
          quantidade_disponivel: Number(item.quantidade_disponivel) + Number(quantidade)
        })
        .eq("id_item", id_item)

      return res.json({ sucesso: true, mensagem: "Entrada registrada com sucesso!" })
    }

    // 2. TRATAMENTO PARA DESCARTE
    if (tipo_movimentacao === "Descarte") {
      const { data: item } = await supabase
        .from("item")
        .select("*")
        .eq("id_item", id_item)
        .maybeSingle()

      if (!item) {
        return res.status(404).json({ sucesso: false, mensagem: "Item não encontrado" })
      }

      await supabase.from("mov_saida").insert([
        {
          id_item,
          quantidade: Number(quantidade),
          data: dataHoje
        }
      ])

      await supabase
        .from("item")
        .update({
          quantidade_total: Number(item.quantidade_total) - Number(quantidade),
          quantidade_disponivel: Number(item.quantidade_disponivel) - Number(quantidade)
        })
        .eq("id_item", id_item)

      return res.json({ sucesso: true, mensagem: "Descarte registrado com sucesso!" })
    }

    // 3. TRATAMENTO PARA EMPRÉSTIMO
    if (tipo_movimentacao === "Empréstimo") {
      if (!itens || itens.length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: "Adicione itens na sacola!" })
      }

      if (data_devolucao_prevista) {
        const apenasDataPrevista = data_devolucao_prevista.split("T")[0]
        if (apenasDataPrevista < dataHoje) {
          return res.status(400).json({ 
            sucesso: false, 
            mensagem: "A data de devolução prevista não pode ser menor que o dia atual!" 
          })
        }
      } else {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Por favor, selecione uma data de devolução prevista."
        })
      }

      // Verifica ou cadastra o aluno
      const { data: alunoExistente, error: erroBuscarAluno } = await supabase
        .from("aluno")
        .select("*")
        .eq("ra_aluno", Number(ra_aluno))
        .maybeSingle()

      if (erroBuscarAluno) {
        console.error("Erro ao buscar aluno:", erroBuscarAluno)
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao verificar aluno", detalhe: erroBuscarAluno.message })
      }

      if (!alunoExistente) {
        const { error: erroInserirAluno } = await supabase.from("aluno").insert([
          {
            ra_aluno: Number(ra_aluno),
            nome: nome_aluno,
            telefone: telefone_aluno || null,
            email: email_aluno || null,
            datacadastro: dataHoje
          }
        ])

        if (erroInserirAluno) {
          console.error("Erro ao cadastrar aluno:", erroInserirAluno)
          return res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar novo aluno", detalhe: erroInserirAluno.message })
        }
      }

      // Busca um usuário válido para assinar o empréstimo
      const { data: usuarios } = await supabase.from("usuario").select("id_usuario").limit(1)
      if (!usuarios || usuarios.length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: "Nenhum usuário cadastrado no sistema para assinar o empréstimo!" })
      }
      const usuarioIdValido = usuarios[0].id_usuario

      // Criar cabeçalho do empréstimo (Usando dataemprestimo correto)
      const { data: novoEmprestimo, error: erroEmprestimo } = await supabase
        .from("emprestimo")
        .insert([
          {
            ra_aluno: Number(ra_aluno),
            id_usuario: usuarioIdValido,                  
            dataemprestimo: dataHoje, 
            dataprevista: data_devolucao_prevista.split("T")[0]
          }
        ])
        .select()
        .single()

      if (erroEmprestimo) {
        console.error("ERRO AO CRIAR EMPRÉSTIMO:", erroEmprestimo)
        return res.status(500).json({ 
          sucesso: false, 
          mensagem: "Erro ao criar cabeçalho do empréstimo.", 
          detalhe: erroEmprestimo.message 
        })
      }

      const idEmprestimoGerado = novoEmprestimo.id_emprestimo

      // Percorre os itens da sacola salvando as relações e dando baixa no estoque
      for (const itemSacola of itens) {
        const { data: material, error: erroBuscarItem } = await supabase
          .from("item")
          .select("*")
          .eq("id_item", itemSacola.id_item)
          .maybeSingle()

        if (erroBuscarItem || !material) {
          console.error("Erro ao buscar item da sacola:", erroBuscarItem)
          continue
        }

        if (Number(material.quantidade_disponivel) <= 0) {
          return res.status(400).json({ 
            sucesso: false, 
            mensagem: `O item "${material.nome}" não possui unidades disponíveis.` 
          })
        }

        // Vincula na tabela intermediária (id_emprestimo e id_item)
        const { error: erroRelacao } = await supabase
          .from("emprestimo_item")
          .insert([
            {
              id_emprestimo: idEmprestimoGerado,
              id_item: material.id_item
            }
          ])

        if (erroRelacao) {
          console.error("Erro ao vincular item ao empréstimo:", erroRelacao)
          return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao salvar itens vinculados ao empréstimo.",
            detalhe: erroRelacao.message
          })
        }

        // Registra a movimentação de saída para o estoque físico
        const { error: erroMovSaida } = await supabase.from("mov_saida").insert([
          {
            id_item: material.id_item,
            quantidade: 1,
            data: dataHoje
          }
        ])

        if (erroMovSaida) {
          console.error("Erro ao registrar movimentação de saída:", erroMovSaida)
        }

        // Atualiza a quantidade disponível do material decrementando 1
        const { error: erroUpdateItem } = await supabase
          .from("item")
          .update({
            quantidade_disponivel: Number(material.quantidade_disponivel) - 1
          })
          .eq("id_item", material.id_item)

        if (erroUpdateItem) {
          console.error("Erro ao atualizar estoque do item:", erroUpdateItem)
        }
      }

      return res.json({ sucesso: true, mensagem: "Empréstimo realizado com sucesso!" })
    }

    res.json({ sucesso: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno no servidor" })
  }
})
// ==========================================
// HISTÓRICO EMPRÉSTIMOS (TRAVADO 🔒)
// ==========================================
app.get("/emprestimos-historico", autenticarToken, async (req, res) => {
  try {
    const { data: emprestimos, error } = await supabase
      .from("emprestimo")
      .select("*")
      .order("id_emprestimo", { ascending: false }) 

    if (error) {
      console.error(error)
      return res.status(500).json({ sucesso: false, detalhe: error.message })
    }

    if (!emprestimos || emprestimos.length === 0) {
      return res.json([])
    }

    const historicoCompleto = await Promise.all(
      emprestimos.map(async (emp) => {
        let alunoObj = null
        let itensVinculados = []

        if (emp.ra_aluno) {
          const { data: alunoData } = await supabase
            .from("aluno")
            .select("nome")
            .eq("ra_aluno", emp.ra_aluno)
            .maybeSingle()
          alunoObj = alunoData
        }

        const { data: relacoes } = await supabase
          .from("emprestimo_item")
          .select("id_item")
          .eq("id_emprestimo", emp.id_emprestimo)

        if (relacoes && relacoes.length > 0) {
          itensVinculados = await Promise.all(
            relacoes.map(async (rel) => {
              const { data: itemData } = await supabase
                .from("item")
                .select("nome")
                .eq("id_item", rel.id_item)
                .maybeSingle()
              return itemData ? itemData.nome : "Item desconhecido"
            })
          )
        }

        return {
          ...emp,
          aluno: alunoObj,
          item: { nome: itensVinculados.join(", ") } 
        }
      })
    )

    res.json(historicoCompleto)
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, message: "Erro interno" })
  }
})

// ==========================================
// DEVOLUÇÃO (TRAVADO 🔒)
// ==========================================
app.put("/emprestimo/:id/devolucao", autenticarToken, async (req, res) => {
  const { id } = req.params

  try {
    const { data: report } = await supabase
      .from("emprestimo")
      .select("*")
      .eq("id_emprestimo", id)
      .maybeSingle()

    if (!report) {
      return res.status(404).json({ sucesso: false, message: "Empréstimo não encontrado" })
    }

    if (report.datadevolucao) {
      return res.status(400).json({ sucesso: false, mensagem: "Este empréstimo já foi devolvido anteriormente." })
    }

    const dataHoje = obterDataLocalBR()

    await supabase
      .from("emprestimo")
      .update({ datadevolucao: dataHoje })
      .eq("id_emprestimo", id)

    const { data: relacoes } = await supabase
      .from("emprestimo_item")
      .select("id_item")
      .eq("id_emprestimo", id)

    if (relacoes) {
      for (const rel of relacoes) {
        const { data: item } = await supabase
          .from("item")
          .select("*")
          .eq("id_item", rel.id_item)
          .maybeSingle()

        if (item) {
          await supabase
            .from("item")
            .update({
              quantidade_disponivel: Number(item.quantidade_disponivel) + 1
            })
            .eq("id_item", item.id_item)

          await supabase.from("mov_entrada").insert([
            {
              id_item: item.id_item,
              quantidade: 1,
              data: dataHoje
            }
          ])
        }
      }
    }

    res.json({ sucesso: true, mensagem: "Devolução realizada com sucesso!" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// DASHBOARD - FEED GLOBAL UNIFICADO (TRAVADO 🔒)
// ==========================================
app.get("/dashboard", autenticarToken, async (req, res) => {
  try {
    const { data: itens } = await supabase.from("item").select("id_item")
    const { data: alunos } = await supabase.from("aluno").select("ra_aluno")
    const { data: emprestimos } = await supabase.from("emprestimo").select("datadevolucao")
    
    const { data: todasEntradasCount } = await supabase.from("mov_entrada").select("*")
    const { data: todasSaidasCount } = await supabase.from("mov_saida").select("*")

    const ativos = emprestimos?.filter(e => !e.datadevolucao || e.datadevolucao.trim() === "").length || 0

    const feedGlobal = []

    // 1. BUSCAR ENTRADAS (AQUISIÇÕES)
    const { data: entradas, error: erroEntrada } = await supabase
      .from("mov_entrada")
      .select("*")

    if (erroEntrada) console.error("Erro ao ler mov_entrada:", erroEntrada)

    if (entradas && entradas.length > 0) {
      for (const ent of entradas) {
        const { data: item } = await supabase.from("item").select("nome").eq("id_item", ent.id_item).maybeSingle()
        const nomeItem = item ? item.nome : "Item Desconhecido"
        
        const tipoFinal = ent.quantidade === 1 ? "Aquisição / Entrada" : "Aquisição"

        feedGlobal.push({
          id: `ent-${ent.id_entrada || Math.random()}`,
          id_movimentacao: ent.id_entrada,
          item: nomeItem,
          nome_item: nomeItem,
          itemObj: { nome: nomeItem },
          tipo: tipoFinal,
          tipo_movimentacao: tipoFinal,
          quantidade: ent.quantidade || 1,
          data: ent.data || ent.datacadastro || ent.created_at || "2026-05-29",
          data_movimentacao: ent.data || ent.datacadastro || ent.created_at || "2026-05-29",
          aluno: { nome: "Estoque Central" },
          nome_aluno: "Estoque Central",
          ra_aluno: "-"
        })
      }
    }

    // 2. BUSCAR SAÍDAS (DESCARTES)
    const { data: saidas, error: erroSaida } = await supabase
      .from("mov_saida")
      .select("*")

    if (erroSaida) console.error("Erro ao ler mov_saida:", erroSaida)

    if (saidas && saidas.length > 0) {
      for (const sai of saidas) {
        const { data: item } = await supabase.from("item").select("nome").eq("id_item", sai.id_item).maybeSingle()
        const nomeItem = item ? item.nome : "Item Desconhecido"

        feedGlobal.push({
          id: `sai-${sai.id_saida || Math.random()}`,
          id_movimentacao: sai.id_saida,
          item: nomeItem,
          nome_item: nomeItem,
          itemObj: { nome: nomeItem },
          tipo: "Descarte",
          tipo_movimentacao: "Descarte",
          quantidade: sai.quantidade || 1,
          data: sai.data || sai.created_at || "2026-05-29",
          data_movimentacao: sai.data || sai.created_at || "2026-05-29",
          aluno: { nome: "Descarte / Baixa" },
          nome_aluno: "Descarte / Baixa",
          ra_aluno: "-"
        })
      }
    }

    // 3. BUSCAR EMPRÉSTIMOS E DEVOLUÇÕES REAIS
    const { data: ultimosEmprestimos } = await supabase
      .from("emprestimo")
      .select("*")
      .order("id_emprestimo", { ascending: false })
      .limit(20)

    if (ultimosEmprestimos) {
      for (const emp of ultimosEmprestimos) {
        let alunoObj = { nome: "Não Identificado" }
        let itensVinculados = []

        if (emp.ra_aluno) {
          const { data: alunoData } = await supabase.from("aluno").select("nome").eq("ra_aluno", emp.ra_aluno).maybeSingle()
          if (alunoData) alunoObj = alunoData
        }

        const { data: relacoes } = await supabase.from("emprestimo_item").select("id_item").eq("id_emprestimo", emp.id_emprestimo)
        if (relacoes) {
          for (const rel of relacoes) {
            const { data: itemData } = await supabase.from("item").select("nome").eq("id_item", rel.id_item).maybeSingle()
            if (itemData) itensVinculados.push(itemData.nome)
          }
        }
        const nomeDoItem = itensVinculados.length > 0 ? itensVinculados.join(", ") : "Item Desconhecido"

        const dataOriginalEmp = emp.dataemprestimo || emp.datapretimo || "2026-05-29"

        feedGlobal.push({
          id: `emp-${emp.id_emprestimo}`,
          id_movimentacao: emp.id_emprestimo,
          item: nomeDoItem,
          nome_item: nomeDoItem,
          itemObj: { nome: nomeDoItem },
          tipo: "Empréstimo",
          tipo_movimentacao: "Empréstimo",
          quantidade: 1,
          data: dataOriginalEmp,
          data_movimentacao: dataOriginalEmp,
          aluno: alunoObj,
          nome_aluno: alunoObj.nome,
          ra_aluno: emp.ra_aluno
        })

        if (emp.datadevolucao && emp.datadevolucao.trim() !== "") {
          feedGlobal.push({
            id: `dev-${emp.id_emprestimo}`,
            id_movimentacao: emp.id_emprestimo,
            item: nomeDoItem,
            nome_item: nomeDoItem,
            itemObj: { nome: nomeDoItem },
            tipo: "Devolução",
            tipo_movimentacao: "Devolução",
            quantidade: 1,
            data: emp.datadevolucao,
            data_movimentacao: emp.datadevolucao,
            aluno: alunoObj,
            nome_aluno: alunoObj.nome,
            ra_aluno: emp.ra_aluno
          })
        }
      }
    }

    const listaFinalDashboard = feedGlobal
      .sort((a, b) => normalizarDataParaOrdenacao(b.data) - normalizarDataParaOrdenacao(a.data))
      .slice(0, 15) 

    const totalCalculadoMov = (todasEntradasCount?.length || 0) + (todasSaidasCount?.length || 0)

    res.json({
      totalItens: itens?.length || 0,
      totalAlunos: alunos?.length || 0,
      totalEmprestimos: ativos,
      totalMovimentacoes: totalCalculadoMov > 0 ? totalCalculadoMov : feedGlobal.length,
      ultimasMovimentacoes: listaFinalDashboard,
      movimentacoes: listaFinalDashboard,
      historico: listaFinalDashboard
    })
  } catch (error) {
    console.error("Erro interno no dashboard:", error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno no dashboard" })
  }
})

// ==========================================
// SERVIDOR
// ==========================================
app.listen(3000, () => {
  console.log("Servidor rodando perfeitamente na porta 3000")
})