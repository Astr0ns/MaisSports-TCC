let trilho = document.getElementById('trilho');
let body = document.querySelector('body');

// Verifica a preferência ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const modoEscuro = localStorage.getItem('modoEscuro');
    if (modoEscuro === 'true') {
        trilho.classList.add('dark');
        body.classList.add('dark');
    }
});

// Manipula o botão
trilho.addEventListener('click', () => {
    trilho.classList.toggle('dark');
    body.classList.toggle('dark');

    // Armazena a preferência no localStorage
    const modoEscuroAtivo = body.classList.contains('dark');
    localStorage.setItem('modoEscuro', modoEscuroAtivo);
});
