const express = require('express');
const router = express.Router();
const { ler, salvar } = require('../db');

router.post('/', (req, res) => {
    const { name, id, capacidade, recursos, status } = req.body;
    const banco = ler();
    
    const novaSala = {
        name,
        id: id || Date.now().toString(),
        capacidade: Number(capacidade),
        recursos: recursos || [],
        status: status || "Disponível"
    };
    
    banco.salas.push(novaSala);
    salvar(banco);
    return res.status(201).json(novaSala);
});

router.get('/', (req, res) => {
    const { capacidadeMin } = req.query;
    const banco = ler();
    const salas = banco.salas || [];
    
    if (capacidadeMin) {
        const min = Number(capacidadeMin);
        const salasFiltradas = salas.filter(sala => sala.capacidade >= min);
        return res.json(salasFiltradas);
    }
    return res.json(salas);
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    const banco = ler();
    const sala = banco.salas.find(sala => sala.id === id);

    if (sala) return res.json(sala);
    return res.status(404).send("A Sala com este ID não foi encontrada!");
});

router.put("/:id", (req, res) => {
    const { id } = req.params;
    const banco = ler();
    const index = banco.salas.findIndex(sala => sala.id == id);

    if (index !== -1) {
        const { name, capacidade, recursos, status } = req.body;
        const salaAtualizada = {
            id, 
            name: name || banco.salas[index].name,
            capacidade: capacidade ? Number(capacidade) : banco.salas[index].capacidade,
            recursos: recursos || banco.salas[index].recursos,
            status: status || banco.salas[index].status
        };

        banco.salas[index] = salaAtualizada;
        salvar(banco);
        return res.status(200).send("Sala atualizada com sucesso!");
    }
    return res.status(404).send("A Sala com este ID não foi encontrada!");
});

router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const banco = ler();
    const index = banco.salas.findIndex(sala => sala.id == id);

    if (index !== -1) {
        banco.salas.splice(index, 1);
        salvar(banco);
        return res.status(200).send("Sala removida com sucesso!");
    }
    return res.status(404).send("A Sala com este ID não foi encontrada!");
});

router.get('/:id/disponibilidade', (req, res) => {
    const { id } = req.params;
    const { data } = req.query;
    if (!data) return res.status(400).json({ erro: 'Data é obrigatória' });

    const banco = ler();
    const reservasDoDia = (banco.reservas || []).filter(r => r.salaId === id && r.inicio.startsWith(data));
    reservasDoDia.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

    const abertura = new Date(${data}T08:00:00Z);
    const fechamento = new Date(${data}T22:00:00Z);
    const livres = [];
    let ponteiro = abertura;

    reservasDoDia.forEach(r => {
        const rIn = new Date(r.inicio);
        const rFi = new Date(r.fim);
        if (ponteiro < rIn) livres.push({ inicio: ponteiro.toISOString(), fim: rIn.toISOString() });
        if (ponteiro < rFi) ponteiro = rFi;
    });
    if (ponteiro < fechamento) livres.push({ inicio: ponteiro.toISOString(), fim: fechamento.toISOString() });

    return res.json({ disponivel: livres });
});
module.exports = router;
