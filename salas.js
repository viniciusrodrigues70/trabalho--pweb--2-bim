const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))

const salas = [];

app.post('/createRoom', (req, res) => {
    const {name, id, capacidade, recursos, status} = req.body
    const novaSala = {
        name,
        id,
        capacidade: Number(capacidade),
        recursos,
        status
    }
    salas.push(novaSala)
    return res.status(201).json(novaSala)
});
app.get('/rooms', (req, res) => {
    const {capacidadeMin} = req.query;
    
    if(capacidadeMin){
        const min = Number(capacidadeMin)

        const salasFiltradas = salas.filter(sala => sala.capacidade >= min)
        return res.json(salasFiltradas)
    }
    return res.json(salas)
});
app.get('/rooms/:id', (req, res) => {
    const { id } = req.params;
    const sala = salas.find(sala => sala.id == id);

    if (sala) {
        return res.json(sala);
    }

    return res.status(404).json({
        error: "Sala não encontrada com este ID!"
    })
});
app.listen(3000, () => {
    console.log("Rodando em https://localhost3000")
});