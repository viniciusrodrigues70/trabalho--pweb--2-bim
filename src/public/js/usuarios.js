document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form-cadastro-usuario').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            nome: document.getElementById('nome-user').value,
            email: document.getElementById('email-user').value,
            departamento: document.getElementById('depto-user').value
        };

        const res = await fetch('/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            alert('Usuário criado! Consulte o back-end para pegar o ID.');
            document.getElementById('form-cadastro-usuario').reset();
        }
    });

    document.getElementById('btn-buscar-reservas-user').addEventListener('click', async () => {
        const userId = document.getElementById('input-busca-user-id').value.trim();
        if(!userId) return alert('Informe o ID.');

        const container = document.getElementById('container-historico-usuario');
        container.innerHTML = `<div style="padding: 30px; text-align:center;">Buscando...</div>`;

        try {
            const res = await fetch(`/usuarios/${userId}/reservas`);
            if(!res.ok) {
                container.innerHTML = `<div style="padding: 30px; color: red; text-align:center;">Usuário sem reservas ou não encontrado.</div>`;
                return;
            }
            const reservas = await res.json();
            container.innerHTML = '';

            if(reservas.length === 0) return container.innerHTML = `<div style="padding: 30px; text-align:center;">Nenhum bilhete.</div>`;

            reservas.forEach(r => {
                container.innerHTML += `
                    <div class="data-row">
                        <div class="data-info-block">
                            <span class="badge-id">ID: ${r.id}</span>
                            <h4 style="margin-top:6px;">Sala: ${r.salaId}</h4>
                            <div class="data-subtext">
                                <span>Início: ${new Date(r.inicio).toLocaleString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        } catch (err) { console.error(err); }
    });
});