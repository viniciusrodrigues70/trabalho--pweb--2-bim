document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resPico = await fetch('/relatorios/pico');
        if(resPico.ok) {
            const dataPico = await resPico.json();
            document.getElementById('metric-pico').innerText = dataPico.horarioPico || dataPico.horario || '14:00';
        }

        const resOcup = await fetch('/relatorios/ocupacao');
        const container = document.getElementById('container-ocupacao-salas');
        container.innerHTML = '';

        if(resOcup.ok) {
            const dados = await resOcup.json();
            if(dados.length === 0) return container.innerHTML = `<div style="padding:30px; text-align:center;">Sem dados.</div>`;

            dados.forEach(item => {
                container.innerHTML += `
                    <div class="data-row">
                        <div class="data-info-block">
                            <span class="badge-id">ID: ${item.salaId}</span>
                            <h4 style="margin-top:6px;">${item.nomeSala || item.nome || 'Sala'}</h4>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 20px; font-weight:800; color: var(--gold);">${item.taxaOcupacao || item.taxa || 0}%</span>
                        </div>
                    </div>
                `;
            });
        }
    } catch (err) { console.error(err); }
});