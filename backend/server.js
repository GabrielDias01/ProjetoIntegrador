const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")

const supabase = require("./services/supabase")

const app = express()

app.use(cors())
app.use(express.json())

// LOGIN

app.post("/login", async (req, res) => {

  const { usuario, senha } = req.body

  const { data, error } = await supabase
    .from("usuario")
    .select("*")
    .eq("usuario", usuario)

  if (error) {

    return res.status(500).json(error)

  }

  if (data.length === 0) {

    return res.status(401).json({
      sucesso: false,
      mensagem: "Usuário inválido"
    })

  }

  const usuarioBanco = data[0]

  const senhaCorreta = await bcrypt.compare(
    senha,
    usuarioBanco.senha
  )

  if (!senhaCorreta) {

    return res.status(401).json({
      sucesso: false,
      mensagem: "Senha inválida"
    })

  }

  res.json({
    sucesso: true,
    usuario: data
  })

})

// CADASTRO

app.post("/usuario", async (req, res) => {

  const { usuario, senha } = req.body

  const senhaHash = await bcrypt.hash(
    senha,
    10
  )

  const { data, error } = await supabase
    .from("usuario")
    .insert([
      {
        usuario,
        senha: senhaHash
      }
    ])
    .select()

  if (error) {

    return res.status(500).json(error)

  }

  res.json({
    sucesso: true,
    usuario: data
  })

})

app.listen(3000, () => {

  console.log("Servidor rodando na porta 3000")

})