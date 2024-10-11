
document.addEventListener("DOMContentLoaded", function() {
    const tipoProdSelect = document.querySelector('.tipo_prod');
    const roupaProdSection = document.getElementById('roupa_prod');
    const roupaSelect = document.querySelector('select[name="roupa_prod"]');

    tipoProdSelect.addEventListener('change', function() {
        if (this.value === 'roupa') {
            roupaProdSection.style.display = 'block';
        } else {
            roupaProdSection.style.display = 'none';
            roupaSelect.selectedIndex = 0; // Reseta para "Selecione"
        }
    });
});

