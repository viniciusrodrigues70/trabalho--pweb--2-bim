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
    const {id} = req.params
    const sala = salas.find(sala => sala.id === id)

    if (sala) {
        return res.json(sala)
    }

    return res.status(404).send("A Sala com este ID não foi encontrada!")
});
app.put("/rooms/:id", (req, res) =>{
    const {id} = req.params
    const index = salas.findIndex(sala => sala.id == id);

    if (index !== -1) {
        const { name, capacidade, recursos, status } = req.body;
        const salaAtualizada = {
            id, 
            name: name || salas[index].name,
            //Propriedade capacidade: Se a resposta for sim (verdadeiro), ele transforma esse valor em número e salva na propriedade, se a resposta for não (falso/undefined), ele ignora o começo e pega o valor antigo que já estava guardado na array.
            capacidade: capacidade ? Number(capacidade) : salas[index].capacidade,
            recursos: recursos || salas[index].recursos,
            status: status || salas[index].status
        };

        salas[index] = salaAtualizada
        return res.status(200).send("Sala atualizada com sucesso!")
    }
    return res.status(404).send("A Sala com este ID não foi encontrada!")
});
app.delete("/rooms/:id", (req, res) => {
    const {id}= req.params
    const index = salas.findIndex(sala => sala.id == id);

    if(index !== -1){
        salas.splice(index, 1)
        return res.status(200).send("Sala removida com sucesso!")
    }
    return res.status(404).send("A Sala com este ID não foi encontrada!")
});
app.listen(3000, () => {
    console.log("Rodando em https://localhost:3000")
});