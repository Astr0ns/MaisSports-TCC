document.addEventListener('DOMContentLoaded', () => {
    const flashMessage = document.querySelector('.flash-message');

    if (flashMessage && flashMessage.textContent.trim().length > 0) {
        const progressBarInner = flashMessage.querySelector('.progress-bar-inner');

        setTimeout(() => {
            flashMessage.style.display = 'block';

            // Força o navegador a registrar o estado inicial (width: 0) antes de animar
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    progressBarInner.style.width = '100%';
                });
            });

            setTimeout(() => {
                flashMessage.style.opacity = '0';
                setTimeout(() => {
                    flashMessage.style.display = 'none';
                    if (window.location.search.includes('success=true')) {
                        window.location.href = '/login';
                    }
                    if (window.location.search.includes('successEmpr=true')) {
                        window.location.href = '/login-empr';
                    }
                }, 500);
            }, 3000);
        }, 100);
    }
});