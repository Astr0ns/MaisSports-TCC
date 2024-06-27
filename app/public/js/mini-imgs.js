  // Obtém todas as imagens pequenas
  const smallimagem = document.querySelectorAll('.small-img');

  // Obtém a imagem principal
  const mainImage = document.getElementById('MainImg');

  // Adiciona um ouvinte de evento de clique a cada imagem pequena
  smallimagem.forEach((smallImg) => {
      smallImg.addEventListener('click', () => {
          // Obtém o URL da imagem clicada usando o atributo data-src
          const newimagemrc = smallImg.getAttribute('src');

          // Define o URL da imagem principal para o novo URL
          mainImage.src = newimagemrc;
      });
  });