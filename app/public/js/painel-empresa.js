


function renderReservas(locais) {
    const trendingSection = document.querySelector('.reservas');
    
    if (locais.length === 0) {
        console.log("fudeo")
    }


    locais.forEach(local => {
        const { id_local_premium, nome_local_premium, preco_hora, id_reserva, data_reserva, horario_inicio, horario_fim, preco_total, nome_cliente, sobrenome_cliente, imagens} = local;

        

{/* <img src="${imagens.length > 0 ? imagens[0] : 'default-image.jpg'}" alt="${titulo_prod}"></img> */}


        const productHTML = `

        <div  class="reservaCardDiv">
            <section class="reservaCard">
                <a href="/local-page/${id_local_premium}">
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


fetch('/pegarReservasEmpresa')
    .then(responseL => responseL.json())
    .then(locais => {
        console.log('Locais recebidos:', locais); // Log dos produtos
        renderReservas(locais); // Renderiza todos os produtos
    })
    .catch(err => {
        console.error('Erro ao carregar locais:', err);
    });