

function renderProducts(products) {
    const trendingSection = document.getElementById('trending');
    trendingSection.innerHTML = ''; // Limpa a seção antes de renderizar

    products.forEach(product => {
        trendingSection.innerHTML += `
        <section class="trending-products" id="trending">
            <section class="products">
                <section class="row">
                    <a href="/product-page"><img
                            src="https://imgnike-a.akamaihd.net/768x768/01113851A10.jpg"
                            alt="" srcset=""></a>
                    <section class="product-text">
                        <h5>NEW</h5>
                    </section>
                    <section class="heart-icon">
                        <i class='bx bx-heart'></i>
                    </section>
                    <section class="ratting">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-half"></i>
                    </section>
                    <section class="price">
                        <h4>Nike Air Force 1 Mid "07</h4>
                        <section class="desc-price">
                            <p class="desconto">-13%</p>
                            <section class="preco">
                                <p>$ 854,99 no PIX</p>
                                <p>6 x R$119,98</p>
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
 fetch('pegarProdutoBanco')
 .then(response => response.json())
 .then(products => {
     renderProducts(products); // Renderiza os produtos no include
 })
 .catch(err => {
     console.error('Erro ao carregar produtos:', err);
 });
