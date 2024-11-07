function renderProducts(products) {
    const trendingSection = document.querySelector('.products');
    trendingSection.innerHTML = ''; 


    products.forEach(product => {
        const { titulo_prod, valor_prod, imagens, media_avaliacao } = product;

        // Verifica se valor_prod é válido e converte para número
        const preco = Number(valor_prod);
        const precoFormatado = !isNaN(preco) ? preco.toFixed(2) : "0.00";
        const parcelaFormatada = !isNaN(preco) ? (preco / 6).toFixed(2) : "0.00";

{/* <img src="${imagens.length > 0 ? imagens[0] : 'default-image.jpg'}" alt="${titulo_prod}"></img> */}

        const productHTML = `
        
        <section class="row">
            <a href="/product-page/${product.id_prod}">
                <img src="/uploads/${imagens[0]}" alt="${titulo_prod}">
            </a>
            <section class="product-text">
                <h5>NEW</h5>
            </section>
            <section class="heart-icon">
                <i class='bx bx-heart'></i>
            </section>
            <section class="ratting">
                ${renderStars(media_avaliacao || 0)} <!-- Usa valor padrão se não houver avaliação -->
            </section>
            <section class="price">
                <h4>${titulo_prod}</h4>
                <section class="desc-price">
                    <section class="preco">
                        <p>$ ${precoFormatado} no PIX</p>
                        <p>6 x R$${parcelaFormatada}</p>
                    </section>
                    
                </section>
                
            </section>
        </section>
        
        `;

        trendingSection.insertAdjacentHTML('beforeend', productHTML); // Adiciona o HTML do produto
    });
}

{/* <p class="desconto">-13%</p> */}
// Função para renderizar estrelas de avaliação
function renderStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<i class="bx bxs-star"></i>';
        } else {
            starsHTML += '<i class="bx bx-star"></i>';
        }
    }
    return starsHTML;
}

// Fazer a requisição para pegar os produtos
fetch('/pegarProdutoBanco')
    .then(response => response.json())
    .then(products => {
        renderProducts(products); // Renderiza todos os produtos
    })
    .catch(err => {
        console.error('Erro ao carregar produtos:', err);
    });
