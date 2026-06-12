const jwt = require("jsonwebtoken")

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Pega o token após o "Bearer"

  if (!token) {
    return res.status(401).json({ 
      sucesso: false, 
      mensagem: "Acesso negado. Faça login para acessar esta página." 
    })
  }

  // 🛠️ TRECHO CORRIGIDO: Agora usa a mesma chave padrão que a rota de Login usa quando o .env falha
  jwt.verify(token, process.env.JWT_SECRET || "chave_padrao_temporaria", (err, usuarioDecodificado) => {
    if (err) {
      return res.status(403).json({ 
        sucesso: false, 
        mensagem: "Sessão expirada ou token inválido. Faça login novamente." 
      })
    }
    
    // Salva os dados do usuário logado na requisição para uso posterior
    req.usuarioLogado = usuarioDecodificado
    next() // Autorizado! Vai para a rota solicitada
  })
}

module.exports = autenticarToken