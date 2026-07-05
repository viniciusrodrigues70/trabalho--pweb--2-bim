const express = require('express');
const router = express.Router();
const { ler } = require('../db'); // Importa o banco unificado

// 1. Rota de Taxa de Ocupação
router.get('/ocupacao', (req, res) => {
    try {
        const banco = ler();
        const salas = banco.salas || [];
        const reservas = banco.reservas || [];
        
        if (salas.length === 0) {
            return res.json({ porcentagemOcupacao: "0%" });
        }

        // Remove duplicatas para saber quantas salas únicas têm pelo menos uma reserva
        const salasReservadas = [...new Set(reservas.map(r => r.salaId))];
        const porcentagem = (salasReservadas.length / salas.length) * 100;

        return res.json({ porcentagemOcupacao: `${porcentagem.toFixed(0)}%` });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno ao calcular ocupação' });
    }
});

// 2. Rota de Horário de Pico
router.get('/pico', (req, res) => {
    try {
        const banco = ler();
        const reservas = banco.reservas || [];
        
        if (reservas.length === 0) {
            return res.json({ mensagem: "Nenhuma reserva feita até o momento" });
        }

        const contagemHoras = {};
        
        // Agrupa as reservas pela hora de início
        reservas.forEach(r => {
            const hora = new Date(r.inicio).getHours();
            contagemHoras[hora] = (contagemHoras[hora] || 0) + 1;
        });

        // Descobre qual hora teve o maior número de reservas
        const horaPico = Object.keys(contagemHoras).reduce((a, b) => 
            contagemHoras[a] > contagemHoras[b] ? a : b
        );

        return res.json({ 
            horarioDePico: `${horaPico}:00`, 
            totalReservasNesteHorario: contagemHoras[horaPico] 
        });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno ao calcular horário de pico' });
    }
});

module.exports = router;