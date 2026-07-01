const express = require('express');
const app = express();
const { ler, salvar } = require('./db');

app.use(express.json());

// 1. Cadastrar Usuário
app.post('/usuarios', (req, res) => {
    const { id, nome } = req.body;
    const banco = ler();

    // Cria o novo objeto do usuário
    const novoUsuario = { id: id || Date.now().toString(), nome };
    
    banco.usuarios.push(novoUsuario);
    salvar(banco); // Grava no database.json

    res.status(201).send({ msg: "Usuário cadastrado com sucesso!", usuario: novoUsuario });
});

// 2. Listar Reservas de um Usuário específico
app.get('/usuarios/:id/reservas', (req, res) => {
    const userId = req.params.id;
    const banco = ler();
    const reservas = banco.reservas || [];

    // Filtra as reservas onde o idUsuario bate com o id da URL
    const reservasDoUsuario = reservas.filter(r => r.idUsuario === userId);

    res.send(reservasDoUsuario);
});

// 3. Relatório de Ocupação: Mostra a porcentagem de salas que têm pelo menos uma reserva
app.get('/relatorios/ocupacao', (req, res) => {
    const banco = ler();
    const salas = banco.salas || [];
    const reservas = banco.reservas || [];
    
    const totalSalas = salas.length;
    if (totalSalas === 0) return res.send({ porcentagemOcupacao: "0%" });

    // Pega IDs únicos das salas que possuem reservas
    const salasReservadas = [...new Set(reservas.map(r => r.idSala))];
    const porcentagem = (salasReservadas.length / totalSalas) * 100;

    res.send({ porcentagemOcupacao: `${porcentagem.toFixed(0)}%` });
});

// 4. Relatório de Pico: Mostra qual ID de sala é o mais reservado de todos
app.get('/relatorios/pico', (req, res) => {
    const banco = ler();
    const reservas = banco.reservas || [];
    
    if (reservas.length === 0) return res.send({ salaPico: "Nenhuma reserva feita" });

    // Conta quantas vezes cada sala aparece nas reservas
    const contagem = {};
    reservas.forEach(r => contagem[r.idSala] = (contagem[r.idSala] || 0) + 1);

    // Descobre qual ID de sala tem o maior número de reservas
    const salaMaisReservada = Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b);

    res.send({ idSalaMaisReservada: salaMaisReservada, totalReservas: contagem[salaMaisReservada] });
});

app.listen(3000, () => console.log('Servidor ON na porta 3000'));