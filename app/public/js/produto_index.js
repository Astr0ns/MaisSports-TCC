function renderStars(media) {
    const maxStars = 5;
    let fullStars = Math.floor(media); // Estrelas completas
    let halfStar = media % 1 !== 0; // Se houver uma metade de estrela
    let emptyStars = maxStars - fullStars - (halfStar ? 1 : 0); // Estrelas vazias

    let starsHtml = '';

    // Adiciona as estrelas completas
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="bi bi-star-fill"></i>';
    }

    // Adiciona a meia estrela, se existir
    if (halfStar) {
        starsHtml += '<i class="bi bi-star-half"></i>';
    }

    // Adiciona as estrelas vazias
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="bi bi-star"></i>';
    }

    return starsHtml;
}



function renderProducts(products) {
    const trendingSection = document.getElementById('trending');
    trendingSection.innerHTML = ''; // Limpa a seção antes de renderizar

    products.forEach(product => {
        const { titulo_prod, valor_prod, imagens, media_avaliacao } = product;

        trendingSection.innerHTML += `
        <section class="trending-products">
            <section class="products">
                <section class="row">
                    <a href="/product-page">
                        <img src="${imagens.length > 0 ? imagens[0] : 'default-image.jpg'}" alt="${titulo_prod}">
                    </a>
                    <section class="product-text">
                        <h5>NEW</h5>
                    </section>
                    <section class="heart-icon">
                        <i class='bx bx-heart'></i>
                    </section>
                    <section class="ratting">
                        <!-- Aqui você pode usar a função para renderizar as estrelas de acordo com a média -->
                        ${renderStars(media_avaliacao)}
                    </section>
                    <section class="price">
                        <h4>${titulo_prod}</h4>
                        <section class="desc-price">
                            <p class="desconto">-13%</p>
                            <section class="preco">
                                <p>$ ${valor_prod.toFixed(2)} no PIX</p>
                                <p>6 x R$${(valor_prod / 6).toFixed(2)}</p>
                            </section>
                        </section>
                        <section class="desc-outher">
                            <p class="estoque">em estoque</p>
                            <section class="prod-colors">
                                <p class="cores">cores</p>
                                <section class="ballwht"></section>
                            </section>
                        </section>
                    </section>
                </section>
            </section>
        </section>
        `;
    });
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

