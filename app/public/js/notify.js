document.addEventListener('DOMContentLoaded', () => {
    const flashMessage = document.querySelector('.flash-message');

    if (flashMessage) {
        const progressBarInner = flashMessage.querySelector('.progress-bar-inner');

        // Adicionar um pequeno atraso para garantir que não apareça imediatamente
        setTimeout(() => {
            flashMessage.style.display = 'block';

            // Start the progress bar animation
            setTimeout(() => {
                progressBarInner.style.width = '100%';
            }, 0); // Start immediately

            setTimeout(() => {
                flashMessage.style.opacity = '0';
                setTimeout(() => {
                    flashMessage.style.display = 'none';
                    // Redirecionar para a página de login se for uma mensagem de sucesso
                    if (window.location.search.includes('success=true')) {
                        window.location.href = '/login';
                    }
                }, 500); // Tempo para a animação de fade-out
            }, 3000); // Tempo que a mensagem ficará visível
        }, 100); // Pequeno atraso para garantir que não apareça imediatamente
    }
});
