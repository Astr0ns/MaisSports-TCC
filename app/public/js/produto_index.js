function renderProducts(products) {
    const trendingSection = document.querySelector('.products');
    trendingSection.innerHTML = ''; 


    products.forEach(product => {
        const { id, titulo_prod, valor_prod, imagens, media_avaliacao } = product;

        let favoritado = "";

        const preco = Number(valor_prod);
        const precoFormatado = !isNaN(preco) ? preco.toFixed(2) : "0.00";
        const parcelaFormatada = !isNaN(preco) ? (preco / 6).toFixed(2) : "0.00";

        let email = document.querySelector('.userEmail').innerHTML;

        if (email.length === 0) {
            const productHTML = `
                <section class="row">
                    <a href="/product-page/${id}">
                        <img src="/uploads/${imagens[0]}" alt="${titulo_prod}">
                    </a>
                    <section class="product-text">
                        <h5>NEW</h5>
                    </section>
                    <section class="heart-icon">
                        <i class="bx bx-heart" onclick="redirecionarPag()" style="margin-right:5px;"></i>
                    </section>
                    <section class="ratting">
                        ${renderStars(media_avaliacao || 0)}
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
                        </section>
                    </section>
                </section>
            `;

            trendingSection.insertAdjacentHTML('beforeend', productHTML);
        } else {
            const verificarFavorito = async () => {
                try {
                    const response = await fetch(`/verSeProdFav/${id}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.message === "Produto favoritado") {
                            favoritado = 1;
                        } else {
                            favoritado = 2;
                        }
                    } else {
                        throw new Error(response.statusText);
                    }
                } catch (error) {
                    console.error("Erro na solicitação:", error);
                }

                const productHTML = `
                <section class="row">
                    <a href="/product-page/${id}">
                        <img src="/uploads/${imagens[0]}" alt="${titulo_prod}">
                    </a>
                    <section class="product-text">
                        <h5>NEW</h5>
                    </section>
                    <section class="heart-icon">
                        ${email.length === 0 ? `
                            <i class="bi bi-heart-fill" onclick="toggleHeart(event); favDesFav(${id});" style="display: none; margin-right:5px;"></i>
                            <i class="bx bx-heart" onclick="toggleHeart(event); favDesFav(${id});" style="margin-right:5px;"></i>
                        ` : (favoritado == 1 ? `
                            <i class="bi bi-heart-fill" onclick="toggleHeart(event); favDesFav(${id});" style="display: none; margin-right:5px;"></i>
                            <i class="bx bx-heart" onclick="toggleHeart(event); favDesFav(${id});" style="margin-right:5px;"></i>
                        ` : `
                            <i class="bi bi-heart-fill" onclick="toggleHeart(event); favDesFav(${id});" style="margin-right:5px;"></i>
                            <i class="bx bx-heart" onclick="toggleHeart(event); favDesFav(${id});" style="display: none; margin-right:5px;"></i>
                        `)}
                    </section>
                    <section class="ratting">
                        ${renderStars(media_avaliacao || 0)}
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
                        </section>
                    </section>
                </section>
                `;

                trendingSection.insertAdjacentHTML('beforeend', productHTML);
            };

            verificarFavorito();
        }
    });
}

function redirecionarPag(){
    window.location.href = "/login";
}

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

function toggleHeart(event) {
    const alvo = event.currentTarget;
    const coracaoPreenchido = alvo.parentNode.querySelector('.bi-heart-fill');
    const coracaoVazio = alvo.parentNode.querySelector('.bx-heart');

    if (coracaoPreenchido.style.display === 'none') {
        coracaoPreenchido.style.display = 'block';
        coracaoVazio.style.display = 'none';
        coracaoPreenchido.classList.add('animate');
    } else {
        coracaoPreenchido.style.display = 'none';
        coracaoVazio.style.display = 'block';
        coracaoVazio.classList.add('animate');
    }

    setTimeout(() => {
        coracaoPreenchido.classList.remove('animate');
        coracaoVazio.classList.remove('animate');
    }, 500);
}

function favDesFav(id) {
    fetch(`/favoritarProd/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error(res.statusText);
    })
    .then(data => {
        if (data.message === "Produto favoritado com sucesso!") {
            console.log("Produto adicionado aos favoritos:", data);
        } else {
            console.error("Erro ao favoritar o produto:", data.message);
        }
    })
    .catch(error => {
        console.error("Erro na solicitação:", error);
    });
}

fetch('/pegarProdutoBanco')
    .then(response => response.json())
    .then(products => {
        renderProducts(products);
        console.log('Produtos recebidos:', products);
    })
    .catch(err => {
        console.error('Erro ao carregar produtos:', err);
    });
