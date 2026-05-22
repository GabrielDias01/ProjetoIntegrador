const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")

const supabase = require("./services/supabase")

const app = express()

app.use(cors())
app.use(express.json())

// =====================
// LOGIN
// =====================
app.post("/login", async (req, res) => {
  const { usuario, senha } = req.body

  try {
    const { data, error } = await supabase
      .from("usuario")
      .select("*")
      .eq("usuario", usuario)

    if (error) return res.status(500).json(error)

    if (!data || data.length === 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário inválido"
      })
    }

    const usuarioBanco = data[0]
    const senhaCorreta = await bcrypt.compare(senha, usuarioBanco.senha)

    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Senha inválida"
      })
    }

    res.json({
      sucesso: true,
      usuario: usuarioBanco
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno"
    })
  }
})

// =====================
// CADASTRO USUÁRIO (100% CORRIGIDO)
// =====================
app.post("/usuario", async (req, res) => {
  // Captura o perfil enviado pelo React front-end
  const { usuario, senha, perfil } = req.body

  try {
    const { data: existe } = await supabase
      .from("usuario")
      .select("*")
      .eq("usuario", usuario)

    if (existe?.length > 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Usuário já existe"
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    // Grava explicitamente o campo perfil recebido na requisição
    const { data, error } = await supabase
      .from("usuario")
      .insert([{
        usuario,
        senha: senhaHash,
        perfil: perfil || "supervisora" 
      }])
      .select()

    if (error) {
      console.log("ERRO AO SALVAR NO SUPABASE:", error)
      return res.status(500).json(error)
    }

    res.json({
      sucesso: true,
      usuario: data
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno"
    })
  }
})

// =====================
// DASHBOARD
// =====================
app.get("/dashboard", async (req, res) => {
  try {
    const { data: itens } = await supabase.from("item").select("*")
    const { data: alunos } = await supabase.from("aluno").select("*")
    const { data: emprestimos } = await supabase.from("emprestimo").select("*")

    const { data: entradas } = await supabase
      .from("mov_entrada")
      .select(`*, item (nome)`)

    const { data: saidas } = await supabase
      .from("mov_saida")
      .select(`*, item (nome)`)

    const movimentacoesEntrada = (entradas || []).map(i => ({
      material: i.item?.nome || "Sem nome",
      tipo: "Entrada",
      quantidade: i.quantidade,
      data: i.data
    }))

    const movimentacoesSaida = (saidas || []).map(i => ({
      material: i.item?.nome || "Sem nome",
      tipo: "Saída",
      quantidade: i.quantidade,
      data: i.data
    }))

    const movimentacoes = [
      ...movimentacoesEntrada,
      ...movimentacoesSaida
    ]

    res.json({
      sucesso: true,
      totalItens: itens?.length || 0,
      totalAlunos: alunos?.length || 0,
      totalEmprestimos: emprestimos?.length || 0,
      totalMovimentacoes: movimentacoes.length,
      movimentacoes
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno"
    })
  }
})

// =====================
// LISTAR ITENS
// =====================
app.get("/item", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("item")
      .select("*")
      .order("id_item", { ascending: false })

    if (error) return res.status(500).json(error)
    res.json(data)
  } catch (error) {
    console.log(error)
    res.status(500).json({ sucesso: false })
  }
})

// =====================
// CADASTRAR ITEM
// =====================
app.post("/item", async (req, res) => {
  try {
    const {
      nome,
      tipo,
      faixaetaria,
      quantidade_total,
      quantidade_disponivel,
      estagiocognitivo,
      areadesenvolvimento,
      status,
      classificacao_jogo_id,
      classificacao_brinquedo_id
    } = req.body

    const payload = {
      nome,
      tipo: Number(tipo),
      faixaetaria: faixaetaria || null,
      quantidade_total: Number(quantidade_total),
      quantidade_disponivel: Number(quantidade_disponivel),
      estagiocognitivo: estagiocognitivo || null,
      areadesenvolvimento: areadesenvolvimento || null,
      status: Number(status),
      classificacao_jogo_id: classificacao_jogo_id || null,
      classificacao_brinquedo_id: classificacao_brinquedo_id || null,
      datacadastro: new Date()
    }

    const { data, error } = await supabase
      .from("item")
      .insert([payload])
      .select()

    if (error) {
      console.log("SUPABASE ERROR:", error)
      return res.status(500).json(error)
    }

    res.json(data)
  } catch (error) {
    console.log(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// =====================
// EDITAR ITEM
// =====================
app.put("/item/:id", async (req, res) => {
  const { id } = req.params
  try {
    const {
      nome,
      tipo,
      faixaetaria,
      quantidade_total,
      quantidade_disponivel,
      estagiocognitivo,
      areadesenvolvimento,
      status,
      classificacao_jogo_id,
      classificacao_brinquedo_id
    } = req.body

    const payload = {
      nome,
      tipo: Number(tipo),
      faixaetaria: faixaetaria || null,
      quantidade_total: Number(quantidade_total),
      quantidade_disponivel: Number(quantidade_disponivel),
      estagiocognitivo: estagiocognitivo || null,
      areadesenvolvimento: areadesenvolvimento || null,
      status: Number(status),
      classificacao_jogo_id: classificacao_jogo_id || null,
      classificacao_brinquedo_id: classificacao_brinquedo_id || null
    }

    const { data, error } = await supabase
      .from("item")
      .update(payload)
      .eq("id_item", id)
      .select()

    if (error) {
      console.log("SUPABASE UPDATE ERROR:", error)
      return res.status(500).json(error)
    }

    res.json({ sucesso: true, data })
  } catch (error) {
    console.log(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// =====================
// DELETAR ITEM
// =====================
app.delete("/item/:id", async (req, res) => {
  const { id } = req.params
  try {
    const { error } = await supabase
      .from("item")
      .delete()
      .eq("id_item", id)

    if (error) {
      console.log("SUPABASE DELETE ERROR:", error)
      return res.status(500).json(error)
    }

    res.json({ sucesso: true, mensagem: "Item excluído com sucesso!" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ sucesso: false, mensagem: "Erro interno" })
  }
})

// =====================
// START
// =====================
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000")
})