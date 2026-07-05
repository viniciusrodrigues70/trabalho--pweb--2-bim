const express = require('express');
const router = express.Router();
const { ler, salvar } = require('../db');

router.post('/', (req, res) => {
    const { nome, email, departamento } = req.body;
    
    if (!nome || !email || !departamento) {
        return res.status(400).json({ erro: "Campos obrigatórios: nome, email, departamento" });
    }

    const banco = ler();
    const novoUsuario = { 
        id: Date.now().toString(), 
        nome, 
        email, 
        departamento 
    };
    
    banco.usuarios.push(novoUsuario);
    salvar(banco); 

    return res.status(201).json(novoUsuario);
});

router.get('/:id/reservas', (req, res) => {
    const userId = req.params.id;
    const banco = ler();
    const reservas = banco.reservas || [];

    const reservasDoUsuario = reservas.filter(r => r.responsavel === userId);
    return res.json(reservasDoUsuario);
});

module.exports = router;
