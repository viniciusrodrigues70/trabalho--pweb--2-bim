document.addEventListener('DOMContentLoaded', () => {
    const vitrineContainer = document.getElementById('container-vitrine-salas');
    if (vitrineContainer) {
        carregarVitrineSalas();
        document.getElementById('btn-filtrar').addEventListener('click', () => {
            const capMin = document.getElementById('filtro-capacidade').value;
            carregarVitrineSalas(capMin);
        });
    }

    const crudContainer = document.getElementById('lista-controle-salas');
    if (crudContainer) {
        carregarGerenciadorSalas();
        document.getElementById('form-crud-sala').addEventListener('submit', salvarSala);
        document.getElementById('btn-cancelar-edicao').addEventListener('click', resetarFormulario);
    }
});

async function carregarVitrineSalas(capacidadeMin = '') {
    const container = document.getElementById('container-vitrine-salas');
    try {
        let url = capacidadeMin ? `/salas?capacidadeMin=${capacidadeMin}` : '/salas';
        const response = await fetch(url);
        const salas = await response.json();
        
        container.innerHTML = '';
        const imagens = [
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&q=80",
            "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&q=80"
        ];

        if (salas.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Nenhuma sala encontrada.</p>`;
            return;
        }

        salas.forEach((sala, idx) => {
            const img = imagens[idx % imagens.length];
            const recursos = Array.isArray(sala.recursos) ? sala.recursos.join(' • ') : (sala.recursos || 'Padrão');
            container.innerHTML += `
                <div class="card">
                    <div class="card-media">
                        <img src="${img}" class="card-img" alt="Cinema">
                        <div class="card-badges">
                            <span class="badge-id">ID: ${sala.id}</span>
                            <span class="badge-cap">${sala.capacidade} LUG</span>
                        </div>
                    </div>
                    <div class="card-info">
                        <h3 class="card-title">${sala.name || sala.nome}</h3>
                        <p class="card-resources">${recursos}</p>
                        <a href="reservas.html?salaId=${sala.id}" class="btn" style="width: 100%;">Reservar</a>
                    </div>
                </div>
            `;
        });
    } catch (error) { console.error(error); }
}

async function carregarGerenciadorSalas() {
    const container = document.getElementById('lista-controle-salas');
    try {
        const res = await fetch('/salas');
        const salas = await res.json();
        container.innerHTML = '';

        if(salas.length === 0) {
            container.innerHTML = `<div style="padding: 30px; text-align:center;">Nenhuma sala cadastrada.</div>`;
            return;
        }

        salas.forEach(sala => {
            const recursos = Array.isArray(sala.recursos) ? sala.recursos.join(', ') : (sala.recursos || 'Nenhum');
            container.innerHTML += `
                <div class="data-row">
                    <div class="data-info-block">
                        <span class="badge-id">ID: ${sala.id}</span>
                        <h4 style="margin-top: 6px;">${sala.name || sala.nome}</h4>
                        <div class="data-subtext">
                            <span><strong>Cap:</strong> ${sala.capacidade} assentos</span> • <span>${recursos}</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-gold" style="padding: 8px 14px;" onclick="carregarDetalhes('${sala.id}')">Editar</button>
                        <button class="btn btn-danger" style="padding: 8px 14px;" onclick="deletarSala('${sala.id}')">Remover</button>
                    </div>
                </div>
            `;
        });
    } catch (err) { console.error(err); }
}

async function salvarSala(e) {
    e.preventDefault();
    const idControle = document.getElementById('sala-id-controle').value;
    const recInput = document.getElementById('recursos-sala').value;
    
    const payload = {
        name: document.getElementById('nome-sala').value,
        capacidade: parseInt(document.getElementById('capacidade-sala').value),
        recursos: recInput ? recInput.split(',').map(r => r.trim()) : []
    };

    const url = idControle ? `/salas/${idControle}` : '/salas';
    const metodo = idControle ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if(res.ok) {
        alert('Operação realizada com sucesso!');
        resetarFormulario();
        carregarGerenciadorSalas();
    }
}

window.carregarDetalhes = async function(id) {
    const res = await fetch(`/salas/${id}`);
    const sala = await res.json();

    document.getElementById('sala-id-controle').value = sala.id;
    document.getElementById('nome-sala').value = sala.name || sala.nome;
    document.getElementById('capacidade-sala').value = sala.capacidade;
    document.getElementById('recursos-sala').value = Array.isArray(sala.recursos) ? sala.recursos.join(', ') : (sala.recursos || '');

    document.getElementById('form-titulo').innerText = "Atualizar Sala (PUT)";
    document.getElementById('btn-cancelar-edicao').style.display = "inline-flex";
};

window.deletarSala = async function(id) {
    if(confirm('Remover permanentemente esta sala?')) {
        const res = await fetch(`/salas/${id}`, { method: 'DELETE' });
        if(res.ok) carregarGerenciadorSalas();
    }
};

function resetarFormulario() {
    document.getElementById('form-crud-sala').reset();
    document.getElementById('sala-id-controle').value = '';
    document.getElementById('form-titulo').innerText = "Cadastrar Nova Sala (POST)";
    document.getElementById('btn-cancelar-edicao').style.display = "none";
}