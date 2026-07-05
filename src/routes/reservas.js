const express = require('express');
const router = express.Router();
const { ler, salvar } = require('../db');

const isDataValida = (data) => data instanceof Date && !isNaN(data.getTime());

router.post('/', (req, res) => {
    try {
        const { salaId, responsavel, inicio, fim } = req.body;

        if (!salaId || !responsavel || !inicio || !fim) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        const dataInicio = new Date(inicio);
        const dataFim = new Date(fim);
        const agora = new Date();

        if (!isDataValida(dataInicio) || !isDataValida(dataFim)) {
            return res.status(400).json({ erro: 'Formato de data inválido' });
        }
        if (dataInicio >= dataFim) {
            return res.status(400).json({ erro: 'O início deve ser anterior ao fim' });
        }
        if (dataInicio < agora) {
            return res.status(400).json({ erro: 'Não é possível reservar no passado' });
        }

        const banco = ler();
        const reservas = banco.reservas || [];

        const hasConflict = reservas.some(reserva => {
            if (reserva.salaId !== salaId) return false;
            const resInicio = new Date(reserva.inicio);
            const resFim = new Date(reserva.fim);
            return dataInicio < resFim && dataFim > resInicio; 
        });

        if (hasConflict) {
            return res.status(409).json({ erro: 'Conflito de horário nesta sala' });
        }

        const novaReserva = {
            id: Date.now().toString(),
            salaId,
            responsavel,
            inicio: dataInicio.toISOString(),
            fim: dataFim.toISOString()
        };

        banco.reservas.push(novaReserva);
        salvar(banco);

        return res.status(201).json(novaReserva);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno' });
    }
});

router.get('/', (req, res) => {
    try {
        const { sala, dataInicio, dataFim } = req.query;
        const banco = ler();
        let reservas = banco.reservas || [];

        if (sala) reservas = reservas.filter(r => r.salaId === sala);

        if (dataInicio && dataFim) {
            const filtroInicio = new Date(dataInicio);
            const filtroFim = new Date(dataFim);

            if (isDataValida(filtroInicio) && isDataValida(filtroFim)) {
                reservas = reservas.filter(r => {
                    const rInicio = new Date(r.inicio);
                    return rInicio >= filtroInicio && rInicio <= filtroFim;
                });
            }
        }
        return res.json(reservas);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const banco = ler();
        const index = banco.reservas.findIndex(r => r.id === id);
        
        if (index === -1) return res.status(404).json({ erro: 'Reserva não encontrada' });

        banco.reservas.splice(index, 1);
        salvar(banco);

        return res.json({ mensagem: 'Reserva cancelada com sucesso' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno' });
    }
});

module.exports = router;