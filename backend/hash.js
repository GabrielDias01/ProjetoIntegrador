const bcrypt = require("bcrypt")

async function gerarHash() {

  const hash = await bcrypt.hash("123", 10)

  console.log(hash)

}

gerarHash()