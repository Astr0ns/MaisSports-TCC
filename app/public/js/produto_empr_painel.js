function renderProducts(products) {
    const trendingSection = document.querySelector('.products');
    trendingSection.innerHTML = ''; // Limpa a seção antes de renderizar

    

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
                <img src="uploads/${imagens[0]}" alt="${titulo_prod}">
            </a>
            <section class="product-text">
                <h5>NEW</h5>
            </section>
            
            <section class="price">
                <h4>${titulo_prod}</h4>
                <section class="desc-price">
                    
                    <section class="preco">
                        <p>$ ${precoFormatado} no PIX</p>
                        <p>6 x R$${parcelaFormatada}</p>
                    </section>
                    <p class="desconto">-13%</p>
                </section>
                <section class="desc-outher">
                    <p class="estoque">em estoque</p>
                    <section class="prod-colors">
                        <p class="cores">cores</p>
                        <section class="ballwht"></section>
                    </section>
                </section>
                <section class="editar_prod_sect">
                    <a href="/product-editar/${product.id_prod}">
                        <button class="editar_prod_bt">Editar</button>
                    </a>
                </section>
            </section>
        </section>
        
        `;

        trendingSection.insertAdjacentHTML('beforeend', productHTML); // Adiciona o HTML do produto
    });
}


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
