const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota inicial — já implementada. Use-a para verificar que o servidor sobe.
// Os testes de correção esperam que GET / responda com status 200.
app.get("/", (req, res) => {
  res.json({
    project: "Sistema de Reserva de Salas",
    status: "ok",
    message: "Servidor no ar. Implemente as rotas descritas no README.",
  });
});

// TODO: implemente aqui as rotas do trabalho (veja o README.md).
//       Sugestão: organize por recurso em src/routes/ e use express.Router().

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
