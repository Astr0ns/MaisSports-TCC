function toggleButtons(dia){
    const toggleButton = document.querySelector(`.${dia} .toggle-btn`);
        
        if (toggleButton.classList.contains('active')) {
            toggleButton.textContent = 'FECHADO';
            document.querySelector(`.${dia} .desativa_pick`).style.display = 'none';
            toggleButton.classList.toggle('active');
        } else {
            
            toggleButton.textContent = 'ABERTO';
            document.querySelector(`.${dia} .desativa_pick`).style.display = 'flex';
            toggleButton.classList.toggle('active');
        }
 }

 // Função para mostrar o modal
function mostrarEscolherHora(dia) {
            
    document.querySelector(`.${dia} .overlay`).style.display = 'block';
    document.querySelector(`.${dia} .escolher_hora`).style.display = 'flex';
    
}

// Função para esconder o modal
function esconderEscolherHora(dia) {
    
    document.querySelector(`.${dia} .overlay`).style.display = 'none';
    document.querySelector(`.${dia} .escolher_hora`).style.display = 'none';
}