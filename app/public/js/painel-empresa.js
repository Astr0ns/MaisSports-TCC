
// Função para formatar o horário
function formatarHorario(horarioString) {
    const [horas, minutos, segundos] = horarioString.split(':');
    return `${horas}:${minutos}`;
}


function mudarpag(element, num){

    const activeElement = document.querySelector('.active');
    
    // Se o elemento clicado já é o ativo, não faz nada
    if (element.classList.contains('active')) {
        return;
    }

    activeElement.classList.remove('active');

    // Adiciona a classe 'active' ao elemento clicado
    element.classList.add('active');
    
    if(num === 1){
        document.querySelector(".reservas").style.display = "none";
        document.querySelector(".locaisReservas").style.display = "none";
        document.querySelector(".products").style.display = "grid";

        document.querySelector(".bt-product").style.display = "block";
        document.querySelector(".bt-local").style.display = "none";

        document.querySelector("h1").innerHTML = "Seus Produtos:";
    }
    

    if(num === 2){

        document.querySelector(".reservas").style.display = "none";
        document.querySelector(".locaisReservas").style.display = "grid";
        document.querySelector(".products").style.display = "none";

        document.querySelector(".bt-product").style.display = "none";
        document.querySelector(".bt-local").style.display = "block";

        document.querySelector("h1").innerHTML = "Seus Locais:";
    }

    if(num === 3){

        document.querySelector(".reservas").style.display = "grid";
        document.querySelector(".locaisReservas").style.display = "none";
        document.querySelector(".products").style.display = "none";

        document.querySelector(".bt-product").style.display = "none";
        document.querySelector(".bt-local").style.display = "none";
        
        document.querySelector("h1").innerHTML = "Reservas Feitas:";
    }
}


function renderLocais(locais) {
    const trendingSection = document.querySelector('.locaisReservas');
    let id_local_igual = []
    
    if (locais.length === 0) {
        console.log("fudeo")
    }

    locais.forEach(local => {
        const { id_local_premium, nome_local_premium, preco_hora, id_reserva, data_reserva, horario_inicio, horario_fim, preco_total, nome_cliente, sobrenome_cliente, imagens} = local;

        const horarioInicioFormatado = formatarHorario(horario_inicio);
        const horarioFimFormatado = formatarHorario(horario_fim);
        

{/* <img src="${imagens.length > 0 ? imagens[0] : 'default-image.jpg'}" alt="${titulo_prod}"></img> */}

        if ( !id_local_igual.includes(id_local_premium)) {
            const productHTML = `

            <div  class="reservaCardDiv">
                <section class="reservaCard">
                    <a href="/local-page/${id_local_premium}">
                        <img src="uploads/mostrarQuadra5.jpg" alt="${nome_local_premium}">   
                    </a>
                    <section class="infoReserva">

                        <div style="display: flex; flex-direction: row;">
                            <span class="linha"></span>
                            <h2>+Sport Reservas</h2> 
                            <span class="linha"></span>
                        </div>
                        
                        <p style="font-size: 1.2em; margin-bottom: 5px;">Local: ${nome_local_premium}</p>
                        <p style="font-size: 1.2em;">valor: R$${preco_hora}/ Hora</p>

                        <button class="editar_prod_bt">Editar</button>
                        
                        <span class="linha" style="margin:0 0 10px;"></span>
                    </section>     
                </section>
                <a href="/local-page/${id_local_premium}">
                    <p>Clique Aqui para entrar na pagina do local</p>
                </a>
            </div>
            
            `;
            id_local_igual =+ id_local_premium

            trendingSection.insertAdjacentHTML('beforeend', productHTML); // Adiciona o HTML do produto
        }


        
    });
}

function renderReservas(locais) {
    const trendingSection = document.querySelector('.reservas');
    
    if (locais.length === 0) {
        console.log("fudeo")
    }

    // Função para formatar a data


    


    locais.forEach(local => {
        const { id_local_premium, nome_local_premium, preco_hora, nome_espaco, id_reserva, data_reserva, horario_inicio, horario_fim, preco_total, nome_cliente, sobrenome_cliente, imagens} = local;


        const horarioInicioFormatado = formatarHorario(horario_inicio);
        const horarioFimFormatado = formatarHorario(horario_fim);
        

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
                        <h2>+Sport Reservas</h2> 
                        <span class="linha"></span>
                    </div>
                    
                    <p style="margin-top: 10px;">reservado por: <span>${nome_cliente}  ${sobrenome_cliente}</span></p>
                    <p style="font-size: 1.2em;">valor: R$${preco_total}</p>
                    <p style="font-size: 1.2em;">${nome_espaco}</p>
                    <p style="margin-top: 10px;">inicio <span>${horarioInicioFormatado}</span>  -  fim <span>${horarioFimFormatado}</span></p>
                    <p style="font-size: 1.2em; margin-bottom: 5px;">${data_reserva}</p>
                    <p style="font-size: 1.2em; margin-bottom: 5px;">Local: ${nome_local_premium}</p>
                    
                    <span class="linha" style="margin:0 0 10px;"></span>
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
        renderLocais(locais); // Renderiza todos os produtos
    })
    .catch(err => {
        console.error('Erro ao carregar locais:', err);
    });