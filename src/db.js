const fs = require('fs');
const path = require('path');
// Aponta para o database.json dentro da pasta 'data' que seu amigo criou
const dbPath = path.join(__dirname, '../data/database.json');

function ler() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function salvar(dados) {
    fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));
}

module.exports = { ler, salvar };