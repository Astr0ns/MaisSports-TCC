function toggleActive(element, num) {
    const activeElement = document.querySelector('.active');
    
    // Se o elemento clicado já é o ativo, não faz nada
    if (element.classList.contains('active')) {
        return;
    }

    // Remove a classe 'active' do elemento atual
    activeElement.classList.remove('active');

    // Adiciona a classe 'active' ao elemento clicado
    element.classList.add('active');

}


function mudarPag(num){
    if(num == 2){
        document.querySelector(".products").style.display = "none"
        document.querySelector(".reservas").style.display = "grid"
    }

    if(num == 1){
        document.querySelector(".products").style.display = "grid"
        document.querySelector(".reservas").style.display = "none"
    }
}

function renderProducts(products) {
    const trendingSection = document.querySelector('.products');
    
    if (products.length === 0) {
        console.log("fudeo")
    }

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
                <h5 class="like-button">
                    <i class="bi bi-heart-fill" onclick="toggleHeart(event); favDesFav(${product.id_prod});"></i>
                    <i class="bx bx-heart" onclick="toggleHeart(event); favDesFav(${product.id_prod});" style="display: none;"></i>
                </h5>
            </section>

            
            <section class="price">
                <h4>${titulo_prod}</h4>
                <section class="desc-price">
                    
                    <section class="preco">
                        <p>$ ${precoFormatado} no PIX</p>
                        <p>6 x R$${parcelaFormatada}</p>
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
        
        `;

        trendingSection.insertAdjacentHTML('beforeend', productHTML); // Adiciona o HTML do produto
    });
}

function renderLocais(locais) {
    const trendingSection = document.querySelector('.reservas');
    
    if (locais.length === 0) {
        console.log("fudeo")
    }


    locais.forEach(local => {
        const { id_reserva, data_reserva, nome_espaco, horario_inicio, horario_fim, preco_total, id_local_premium, nome_local_premium, nome_cliente, sobrenome_cliente, imagens} = local;

        

{/* <img src="${imagens.length > 0 ? imagens[0] : 'default-image.jpg'}" alt="${titulo_prod}"></img> */}


        const productHTML = `

        <div  class="reservaCardDiv">
            <section class="reservaCard">
                <a href="/local-page/${id_local_premium}" style="margin-top: 10px">
                    <img src="uploads/mostrarQuadra5.jpg" alt="${nome_local_premium}">   
                </a>
                <section class="infoReserva">

                    <div style="display: flex; flex-direction: row;">
                        <span class="linha"></span>
                        <h2>${nome_local_premium}</h2> 
                        <span class="linha"></span>
                    </div>
                    
                    <p style="margin-top: 10px;">reservado por: <span>${nome_cliente}  ${sobrenome_cliente}</span></p>
                    <p style="font-size: 1.1em;">valor: R$${preco_total}</p>
                    <p style="margin-top: 10px;">inicio <span>${horario_inicio}</span>  -  fim <span>${horario_fim}</span></p>
                    <p style="font-size: 1.1em; margin-bottom: 5px;">${data_reserva}</p>
                    <p style="font-size: 1.1em; margin-bottom: 5px;">${nome_espaco}</p>
                    <span class="linha"></span>
                </section>     
            </section>
            <a href="/local-page/${id_local_premium}">
                <p>Clique Aqui para entrar na pagina do local</p>
            </a>
        </div>
        
        `;

        trendingSection.insertAdjacentHTML('beforeend', productHTML); // Adiciona o HTML do produto
    });
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

    // Remove a classe de animação após a animação ser concluída
    setTimeout(() => {
        coracaoPreenchido.classList.remove('animate');
        coracaoVazio.classList.remove('animate');
    }, 500); // 500ms é o tempo da animação

    
}

function favDesFav(id) {
    try {
        const response = fetch(`/favoritarProd/${id}`, { // Use 'id' aqui
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(res.statusText);
            }
        }).then(data => {
            if (data.message === "Produto favoritado com sucesso!") {
                console.log("Produto adicionado aos favoritos:", data);
            } else {
                console.error("Erro ao favoritar o produto:", data.message);
            }
        });
    } catch (error) {
        console.error("Erro na solicitação:", error);
    }
}

function favDesFavLocal(id) {
    try {
        const response = fetch(`/favoritarProd/${id}`, { // Use 'id' aqui
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        response.then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(res.statusText);
            }
        }).then(data => {
            if (data.message === "Produto favoritado com sucesso!") {
                console.log("Produto adicionado aos favoritos:", data);
            } else {
                console.error("Erro ao favoritar o produto:", data.message);
            }
        });
    } catch (error) {
        console.error("Erro na solicitação:", error);
    }
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
fetch('/pegarProdutoCurtido')
    .then(response => response.json())
    .then(products => {
        console.log('Produtos recebidos:', products); // Log dos produtos
        renderProducts(products); // Renderiza todos os produtos
    })
    .catch(err => {
        console.error('Erro ao carregar produtos:', err);
    });

fetch('/pegarReservas')
    .then(responseL => responseL.json())
    .then(locais => {
        console.log('Locais recebidos:', locais); // Log dos produtos
        renderLocais(locais); // Renderiza todos os produtos
    })
    .catch(err => {
        console.error('Erro ao carregar locais:', err);
    });
