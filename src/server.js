const express = require('express');
const path = require('path');
const rotasSalas = require('./routes/salas');
const rotasReservas = require('./routes/reservas');
const rotasUsuarios = require('./routes/usuarios');
const rotasRelatorios = require('./routes/relatorios'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.json({ project: "Sistema de Reserva de Salas", status: "ok" });
});

app.use('/salas', rotasSalas);
app.use('/reservas', rotasReservas);
app.use('/usuarios', rotasUsuarios);
app.use('/relatorios', rotasRelatorios); 

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso em http://localhost:${PORT}`);
});

module.exports = app;