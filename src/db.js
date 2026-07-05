const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../data/database.json');

function ler() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify({ salas: [], reservas: [], usuarios: [] }, null, 2));
        }
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch (erro) {
        return { salas: [], reservas: [], usuarios: [] };
    }
}

function salvar(dados) {
    fs.writeFileSync(dbPath, JSON.stringify(dados, null, 2));
}

module.exports = { ler, salvar };