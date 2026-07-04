const express = require('express');
const fs = require('fs').promises; 
const path = require('path');

const router = express.Router();
const dataFilePath = path.join(__dirname, '../../data/reservas.json');



const getReservas = async () => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};

const saveReservas = async (reservas) => {
    const tempPath = `${dataFilePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(reservas, null, 2));
    await fs.rename(tempPath, dataFilePath);
};

const isDataValida = (data) => data instanceof Date && !isNaN(data.getTime());

//Rotas de Reservas 

router.post('/reservas', async (req, res) => {
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
            return res.status(400).json({ erro: 'Não é possível reservar em um horário no passado' });
        }

        const reservas = await getReservas();

 
        const hasConflict = reservas.some(reserva => {
            if (reserva.salaId !== salaId) return false;
            
            const reservaInicio = new Date(reserva.inicio);
            const reservaFim = new Date(reserva.fim);

   
            return dataInicio < reservaFim && dataFim > reservaInicio;
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

        reservas.push(novaReserva);
        await saveReservas(reservas);

        return res.status(201).json(novaReserva);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

router.get('/reservas', async (req, res) => {
    try {
        const { sala, dataInicio, dataFim } = req.query;
        let reservas = await getReservas();

        if (sala) {
            reservas = reservas.filter(r => r.salaId === sala);
        }

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

        return res.status(200).json(reservas);
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

router.delete('/reservas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const reservas = await getReservas();
        
        const index = reservas.findIndex(r => r.id === id);
        if (index === -1) {
            return res.status(404).json({ erro: 'Reserva não encontrada' });
        }

        reservas.splice(index, 1);
        await saveReservas(reservas);

        return res.status(200).json({ mensagem: 'Reserva cancelada com sucesso' });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

router.get('/salas/:id/disponibilidade', async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = req.query;

        if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            return res.status(400).json({ erro: 'Parâmetro data (YYYY-MM-DD) é obrigatório' });
        }

        const reservas = await getReservas();
        
        const reservasDoDia = reservas.filter(r => {
            return r.salaId === id && r.inicio.startsWith(data);
        });

        reservasDoDia.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

        const horarioAbertura = new Date(`${data}T08:00:00Z`);
        const horarioFechamento = new Date(`${data}T22:00:00Z`);

        const horariosLivres = [];
        let ponteiroTempo = horarioAbertura;

        reservasDoDia.forEach(reserva => {
            const inicioReserva = new Date(reserva.inicio);
            const fimReserva = new Date(reserva.fim);

            if (ponteiroTempo < inicioReserva) {
                horariosLivres.push({
                    inicio: ponteiroTempo.toISOString(),
                    fim: inicioReserva.toISOString()
                });
            }
            
            if (ponteiroTempo < fimReserva) {
                ponteiroTempo = fimReserva;
            }
        });

        if (ponteiroTempo < horarioFechamento) {
            horariosLivres.push({
                inicio: ponteiroTempo.toISOString(),
                fim: horarioFechamento.toISOString()
            });
        }

        return res.status(200).json({ disponivel: horariosLivres });
    } catch (error) {
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

module.exports = router;