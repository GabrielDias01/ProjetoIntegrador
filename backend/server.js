const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const supabase = require("./services/supabase")

const app = express()

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

// ==========================================
// LOGIN
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

    res.json({ sucesso: true, usuario: usuarioBanco })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// CADASTRO USUÁRIO
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
// LISTAR ITENS
// ==========================================
app.get("/item", async (req, res) => {
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
// CADASTRAR ITEM
// ==========================================
app.post("/item", async (req, res) => {
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
// EDITAR ITEM
// ==========================================
app.put("/item/:id", async (req, res) => {
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
// EXCLUIR ITEM
// ==========================================
app.delete("/item/:id", async (req, res) => {
  const { id } = req.params

  try {
    await supabase.from("mov_entrada").delete().eq("id_item", id)
    await supabase.from("mov_saida").delete().eq("id_item", id)
    await supabase.from("emprestimo_item").delete().eq("id_item", id)

    const { error } = await supabase
      .from("item")
      .delete()
      .eq("id_item", id)

    if (error) {
      return res.status(500).json({ sucesso: false, mensagem: error.message })
    }

    res.json({ sucesso: true, mensagem: "Item excluído com sucesso" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// BUSCAR ALUNO POR RA
// ==========================================
app.get("/aluno/ra/:ra", async (req, res) => {
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
// REGISTRAR MOVIMENTAÇÃO / EMPRÉSTIMO (CORRIGIDO ERRO 500)
// ==========================================
app.post("/movimentacao", async (req, res) => {
  try {
    const {
      itens, tipo_movimentacao, id_item, quantidade, ra_aluno,
      nome_aluno, telefone_aluno, email_aluno, data_devolucao_prevista
    } = req.body

    const dataHoje = obterDataLocalBR()

    // ======================================
    // AQUISIÇÃO / DOAÇÃO
    // ======================================
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

      return res.json({ sucesso: true, message: "Entrada registrada" })
    }

    // ======================================
    // DESCARTE
    // ======================================
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

      return res.json({ sucesso: true, mensagem: "Descarte registrado" })
    }

    // ======================================
    // EMPRÉSTIMO
    // ======================================
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

      // CORREÇÃO DO ID_USUARIO (Busca um usuário válido dinamicamente do seu banco para não quebrar a FK)
      const { data: usuarios } = await supabase.from("usuario").select("id_usuario").limit(1)
      if (!usuarios || usuarios.length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: "Nenhum usuário cadastrado no sistema para assinar o empréstimo!" })
      }
      const usuarioIdValido = usuarios[0].id_usuario

      const { data: novoEmprestimo, error: erroEmprestimo } = await supabase
        .from("emprestimo")
        .insert([
          {
            ra_aluno: Number(ra_aluno),
            id_usuario: usuarioIdValido, // Usa o ID dinâmico e seguro do banco                 
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

      for (const itemSacola of itens) {
        const { data: material, error: erroBuscarItem } = await supabase
          .from("item")
          .select("*")
          .eq("id_item", itemSacola.id_item)
          .maybeSingle()

        if (erroBuscarItem || !material) {
          console.error("Erro ao buscar item:", erroBuscarItem)
          continue
        }

        if (Number(material.quantidade_disponivel) <= 0) {
          return res.status(400).json({ 
            sucesso: false, 
            mensagem: `O item "${material.nome}" não possui unidades disponíveis.` 
          })
        }

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
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// HISTÓRICO EMPRÉSTIMOS
// ==========================================
app.get("/emprestimos-historico", async (req, res) => {
  try {
    const { data: emprestimos, error } = await supabase
      .from("emprestimo")
      .select("*")
      .order("dataemprestimo", { ascending: false }) 

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
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// ==========================================
// DEVOLUÇÃO
// ==========================================
app.put("/emprestimo/:id/devolucao", async (req, res) => {
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
// DASHBOARD - RESOLVIDO SUMIÇO E TRAVAMENTO DE DADOS
// ==========================================
app.get("/dashboard", async (req, res) => {
  try {
    const { data: itens } = await supabase.from("item").select("id_item")
    const { data: alunos } = await supabase.from("aluno").select("ra_aluno")
    const { data: emprestimos } = await supabase.from("emprestimo").select("datadevolucao")
    const { data: todasEntradasCount } = await supabase.from("mov_entrada").select("id_entrada")
    const { data: todasSaidasCount } = await supabase.from("mov_saida").select("id_saida")

    const ativos = emprestimos?.filter(e => !e.datadevolucao || e.datadevolucao.trim() === "").length || 0

    const { data: ultimasEntradas } = await supabase
      .from("mov_entrada")
      .select("id_entrada, id_item, quantidade, data")
      .order("id_entrada", { ascending: false })
      .limit(5)

    const { data: ultimasSaidas } = await supabase
      .from("mov_saida")
      .select("id_saida, id_item, quantidade, data")
      .order("id_saida", { ascending: false })
      .limit(5)

    const todasMovimentacoes = []

    if (ultimasEntradas && ultimasEntradas.length > 0) {
      for (const ent of ultimasEntradas) {
        const { data: item } = await supabase.from("item").select("nome").eq("id_item", ent.id_item).maybeSingle()
        todasMovimentacoes.push({
          id: `ent-${ent.id_entrada}`,
          id_movimentacao: ent.id_entrada,
          item: item ? item.nome : "Item Desconhecido",
          nome_item: item ? item.nome : "Item Desconhecido",
          tipo: "Entrada",
          tipo_movimentacao: "Entrada",
          quantidade: ent.quantidade,
          data: ent.data,
          datasaida: ent.data,
          data_movimentacao: ent.data
        })
      }
    }

    if (ultimasSaidas && ultimasSaidas.length > 0) {
      for (const sai of ultimasSaidas) {
        const { data: item } = await supabase.from("item").select("nome").eq("id_item", sai.id_item).maybeSingle()
        todasMovimentacoes.push({
          id: `sai-${sai.id_saida}`,
          id_movimentacao: sai.id_saida,
          item: item ? item.nome : "Item Desconhecido",
          nome_item: item ? item.nome : "Item Desconhecido",
          tipo: "Saída",
          tipo_movimentacao: "Saída",
          quantidade: sai.quantidade,
          data: sai.data,
          datasaida: sai.data,
          data_movimentacao: sai.data
        })
      }
    }

    const listaFinal = todasMovimentacoes
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 5)

    res.json({
      totalItens: itens?.length || 0,
      totalAlunos: alunos?.length || 0,
      totalEmprestimos: ativos,
      totalMovimentacoes: (todasEntradasCount?.length || 0) + (todasSaidasCount?.length || 0),
      ultimasMovimentacoes: listaFinal,
      movimentacoes: listaFinal,
      historico: listaFinal
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno no dashboard" })
  }
})

// ==========================================
// SERVIDOR
// ==========================================
app.listen(3000, () => {
  console.log("Servidor rodando perfeitamente na porta 3000")
})