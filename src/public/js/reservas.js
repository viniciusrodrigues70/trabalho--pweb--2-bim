document.addEventListener('DOMContentLoaded', () => {
    // Autopreencher sala vinda da vitrine (via URL)
    const params = new URLSearchParams(window.location.search);
    if(params.get('salaId')) {
        document.getElementById('res-sala-id').value = params.get('salaId');
        document.getElementById('disp-sala-id').value = params.get('salaId');
    }

// GET Disponibilidade
    document.getElementById('btn-consultar-disponibilidade').addEventListener('click', async () => {
        const salaId = document.getElementById('disp-sala-id').value.trim();
        const data = document.getElementById('disp-data-alvo').value;
        if(!salaId || !data) return alert('Informe a Sala e a Data.');

        try {
            const res = await fetch(`/salas/${salaId}/disponibilidade?data=${data}`);
            const output = await res.json();
            const div = document.getElementById('wrapper-resposta-disponibilidade');

            // O seu Back-end devolve um array chamado "disponivel"
            if(output.disponivel && output.disponivel.length > 0) {
                
                // Transforma os dados complicados em texto legível (Extrai apenas as horas)
                const blocosFormatados = output.disponivel.map(bloco => {
                    const horaIn = new Date(bloco.inicio).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    const horaFim = new Date(bloco.fim).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
                    return `[${horaIn} às ${horaFim}]`;
                });

                // Verifica se a sala está 100% livre (o Back-end devolve o bloco total 08:00 - 22:00)
                if (blocosFormatados.length === 1 && blocosFormatados[0] === '[08:00 às 22:00]') {
                    div.innerHTML = `✅ Sala totalmente livre neste dia (08:00 às 22:00).`;
                } else {
                    // Mostra as "fatias" de horários que sobraram
                    div.innerHTML = `🕒 Intervalos Livres: <span style="color:#fff;">${blocosFormatados.join(' | ')}</span>`;
                }
                
            } else {
                // Se o array vier vazio, significa que não há espaços livres entre as 08h e as 22h
                div.innerHTML = `❌ Sala totalmente lotada neste dia! Não há horários livres.`;
            }
        } catch (erro) {
            console.error("Erro na consulta:", erro);
            document.getElementById('wrapper-resposta-disponibilidade').innerHTML = `<span style="color:var(--danger)">Erro ao consultar o servidor.</span>`;
        }
    });

    // POST Reserva (Trata erro 409 conflito)
    document.getElementById('form-comprar-reserva').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            salaId: document.getElementById('res-sala-id').value.trim(),
            responsavel: document.getElementById('res-user-id').value.trim(),
            inicio: new Date(document.getElementById('res-inicio').value).toISOString(),
            fim: new Date(document.getElementById('res-fim').value).toISOString()
        };

        const response = await fetch('/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if(response.status === 409) {
            alert('❌ CONFLITO DE HORÁRIO! A sala já está reservada neste período.');
        } else if(response.ok) {
            alert('🎟️ Reserva criada com sucesso!');
            renderizarReservasGerais();
        } else {
            alert('Erro ao criar reserva. Verifique se o horário está no futuro.');
        }
    });

    document.getElementById('btn-filtrar-res').addEventListener('click', () => {
        renderizarReservasGerais(document.getElementById('filtro-res-sala').value);
    });

    renderizarReservasGerais();
});

// GET Reservas e DELETE
async function renderizarReservasGerais(salaFiltro = '') {
    let url = salaFiltro ? `/reservas?sala=${salaFiltro}` : '/reservas';
    const response = await fetch(url);
    const reservas = await response.json();
    const container = document.getElementById('lista-reservas-central');
    
    container.innerHTML = '';
    if(reservas.length === 0) return container.innerHTML = `<div style="padding:30px; text-align:center;">Nenhuma reserva ativa.</div>`;

    reservas.forEach(reserva => {
        container.innerHTML += `
            <div class="data-row">
                <div class="data-info-block">
                    <span class="badge-id">ID: ${reserva.id}</span>
                    <h4 style="margin-top:6px; color:var(--gold);">Sala: ${reserva.salaId}</h4>
                    <div class="data-subtext">
                        <span>De: ${new Date(reserva.inicio).toLocaleString('pt-BR')}</span>
                    </div>
                </div>
                <button class="btn btn-danger" onclick="cancelarReserva('${reserva.id}')">Cancelar</button>
            </div>
        `;
    });
}

window.cancelarReserva = async function(id) {
    if(confirm('Cancelar esta reserva?')) {
        const res = await fetch(`/reservas/${id}`, { method: 'DELETE' });
        if(res.ok) renderizarReservasGerais();
    }
};