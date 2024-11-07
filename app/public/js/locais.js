
let map; 
let service; 
let infowindow; 
let markers = []; 
let currentLocation = { lat: -23.5372544, lng: -46.8516864 }; 
let userMarker; 
let geocoder; 
let autocomplete; 
let sidePanelContent = ''; 
let mapSelectionEnabled = false;
let currentMarker = null;
let locationMethod = ''; // 'current' ou 'map'





function initMap() { 
    geocoder = new google.maps.Geocoder(); 
    autocomplete = new google.maps.places.Autocomplete( 
        document.getElementById('address'), {  
            types: ['geocode'] // Aceita endereço completo, bairro e cidade 
            
        }); 
    autocomplete.addListener('place_changed', onPlaceChanged); 

    if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition( 
            (position) => { 
                currentLocation = { 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude 
                }; 
                initializeMap(); 
            }, 
            () => initializeMap() 
        ); 
    } else { 
        initializeMap(); 
    } 
} 



function initializeMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: currentLocation,
        zoom: 13
    });

    service = new google.maps.places.PlacesService(map);
    infowindow = new google.maps.InfoWindow();
    userMarker = new google.maps.Marker({
        position: currentLocation,
        map: map,
        title: 'Sua Localização',
        icon: {
            url: 'imagem/LocalizacaoYOU-PNG.png',
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    // Adiciona o evento de clique aos botões de filtro móvel
    document.querySelectorAll('.filters_mobile .filter-button').forEach(button => {
        button.addEventListener('click', handleMobileFilterClick);
    });

    // Adiciona o evento de clique ao mapa
    map.addListener('click', handleMapClick);

    // Adiciona o evento de mudança para os checkboxes
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    document.getElementById('centerButton').addEventListener('click', centerMapOnUser);
    document.getElementById('toggleFiltersButton').addEventListener('click', toggleFilters);

    updateMap();
}

function handleMobileFilterClick(event) {
    const button = event.target;
    const value = button.getAttribute('value');

    // Marca/desmarca o checkbox correspondente ao botão de filtro móvel
    const checkbox = document.querySelector(`.checkbox-group input[type="checkbox"][value="${value}"]`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        handleCheckboxChange({ target: checkbox }); // Atualiza o mapa com base na nova seleção
    }

    // Opcional: você pode alterar a aparência do botão para indicar que está selecionado ou não
    button.classList.toggle('selected');
}




function handleCheckboxChange(event) { 
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]'); 
    checkboxes.forEach(checkbox => { 
        if (checkbox !== event.target) { 
            checkbox.checked = false; // Desmarca todos os outros checkboxes 
        } 
    }); 
    updateMap(); // Atualiza o mapa com base na seleção atual 
} 



function updateMap() {
    clearMarkers();

    const selectedType = getSelectedType();
    if (!selectedType) return;

    // Adiciona os locais do banco de dados, filtrando pela categoria selecionada
    fetch(`/locaisBanco?categoria=${selectedType}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(locaisBanco => {

            locaisBanco.forEach(local => {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(local.latitude), lng: parseFloat(local.longitude) },
                    map: map,
                    title: local.nome_local,
                    icon: {
                        url: 'imagem/LocalizacaoLOCAIS-PNG.png',
                        scaledSize: new google.maps.Size(35, 35)
                    }
                });

                google.maps.event.addListener(marker, 'click', () => {
                    infowindow.setContent(generateContentFromLocal(local)); // Use a nova função para locais do banco
                    infowindow.open(map, marker);
                });

                markers.push(marker);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar locais do banco:', error);
        });

    // Adiciona os locais do banco de dados, filtrando pela categoria selecionada
    fetch(`/locaisBancoPremium?categoria=${selectedType}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(locaisBancoPremium => {
            

            locaisBancoPremium.forEach(local => {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(local.latitude), lng: parseFloat(local.longitude) },
                    map: map,
                    title: local.nome_local,
                    icon: {
                        url: 'imagem/pincrown9.png',
                        scaledSize: new google.maps.Size(45, 45)
                    }
                });

                google.maps.event.addListener(marker, 'click', () => {
                    infowindow.setContent(generateContentFromLocalPremium(local)); // Use a nova função para locais do banco
                    infowindow.open(map, marker);
                });

                markers.push(marker);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar locais do banco:', error);
        });

    // Busca os locais do Google Maps
    const request = {
        location: currentLocation,
        radius: '10000',
        keyword: getKeywords(selectedType)
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => {
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    icon: {
                        url: 'imagem/LocalizacaoLOCAIS-PNG.png',
                        scaledSize: new google.maps.Size(35, 35)
                    }
                });

                google.maps.event.addListener(marker, 'click', () => {
                    infowindow.setContent(generateContent(place));
                    infowindow.open(map, marker);
                });

                markers.push(marker);
            });
        } else {
            console.error('Erro na busca de locais do Google Maps:', status);
        }
    });
}







function clearMarkers() { 
    for (let i = 0; i < markers.length; i++) { 
        markers[i].setMap(null); 
    } 
    markers = []; 
} 



function getSelectedType() { 
    const selectedCheckbox = document.querySelector('.checkbox-group input[type="checkbox"]:checked'); 
    return selectedCheckbox ? selectedCheckbox.value : ''; 
} 


function getKeywords(type) { 
    switch (type) { 
        case 'gym': 
            return ['gym', 'fitness center', 'academia']; 
        case 'football': 
            return ['campo', 'soccer', 'futsal', 'futebol', 'quadra', 'society', 'campo de futebol']; 
        case 'skatepark': 
            return ['skate park', 'skateboarding park', 'pista', 'skate']; 
        case 'bicycle': 
            return ['bike park', 'bicycle park']; 
        case 'tennis': 
            return ['tennis court', 'quadra de tênis', 'tennis', 'tenis', 'club de tênis', 'clube de tênis', 'tennis stadium', 'campo de tênis']; 
        case 'basketball': 
            return ['court', 'basketball stadium', 'quadra', 'basquete']; 
        case 'park': 
            return ['park', 'parque']; 
        case 'volleyball': 
            return ['volleyball court', 'volleyball', 'volei', 'voleibol']; 
        case 'swimming': 
            return ['swimming pool', 'pool', 'swimming']; 
        default: 
            return []; 
    } 
}



// card pin google maps
function generateContent(place) {
    let content = `<div class="card_local"><strong>${place.name}</strong>`;
    content += `<p>recomendado por: <span class="google_color">Google Maps</span></p>`;

    if (place.photos && place.photos.length > 0) {
        const photoUrl = place.photos[0].getUrl({ maxWidth: 200, maxHeight: 150 });
        content += `<img src="${photoUrl}" class="place-photo"><br>`;
    } else {
        content += `<p>Imagem não disponível</p>`;
    }

    if (place.vicinity) {
        content += `<p class="break">${place.vicinity}</p>`;
    }

    if (place.rating) {
        content += `<p>Avaliação: ${getStarRatingHtml(place.rating)}</p>`;
    } else {
        content += `<p>Avaliação não disponível</p>`;
    }
    
    content += `<button class="saiba_mais" onclick="showSidePanel('${place.place_id}')">Saiba Mais</button></div>`;
    return content;
}


// informações que vem do bancos estilo
function generateContentFromLocal(local) {
    // Adiciona latitude e longitude como parâmetros
    const { latitude, longitude } = local;
    
    // Cria o objeto Geocoder
    const geocoder = new google.maps.Geocoder();

    // Geocodifica a localização
    geocoder.geocode({ location: { lat: parseFloat(latitude), lng: parseFloat(longitude) } }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            let content = `<div class="card_local"><strong>${local.nome_local}</strong>`;
            content += `<p>recomendado por: <span class="google_color">+Sport</span></p>`;

            if (local.imagens && local.imagens.length > 0) {
                content += `<img src="uploads/${local.imagens[0]}" class="place-photo" style="width:100%;"><br>`;
            } else {
                content += `<p>Imagem não disponível</p>`;
            }

            // Usa o primeiro resultado como endereço
            const endereco = results[0] ? results[0].formatted_address : 'Endereço não disponível';
            content += `<p class="break">${endereco}</p>`;

            if (local.media_avaliacao) {
                content += `<p>Avaliação: ${getStarRatingHtml(local.media_avaliacao)}</p>`;
            } else {
                content += `<p>Avaliação não disponível</p>`;
            }

            // Chama a função showSidePanelFromLocal passando o ID do local do banco
            content += `<button class="saiba_mais" onclick="showSidePanelFromLocal('${local.id}')">Saiba Mais</button></div>`;

            // Atualiza a infowindow com o conteúdo gerado
            infowindow.setContent(content);
            infowindow.open(map, marker); // Presuma que 'marker' esteja acessível aqui
        } else {
            console.error('Geocoding falhou devido a: ' + status);
            infowindow.setContent('<p>Erro ao obter o endereço.</p>');
            infowindow.open(map, marker); // Presuma que 'marker' esteja acessível aqui
        }
    });
}

// informações que vem do bancos estilo
function generateContentFromLocalPremium(local) {
    // Adiciona latitude e longitude como parâmetros
    const { latitude, longitude } = local;
    
    
    // Cria o objeto Geocoder
    const geocoder = new google.maps.Geocoder();

    // Geocodifica a localização
    geocoder.geocode({ location: { lat: parseFloat(latitude), lng: parseFloat(longitude) } }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            let content = `<div class="card_local"><strong>${local.nome_local_premium}</strong>`;
            content += `<p>recomendado por: <span class="google_color">+Sport</span></p>`;

            if (local.imagens && local.imagens.length > 0) {
                content += `<img src="uploads/${local.imagens[0]}" class="place-photo" style="width:100%;"><br>`;
            } else {
                content += `<p>Imagem não disponível</p>`;
            }

            // Usa o primeiro resultado como endereço
            const endereco = results[0] ? results[0].formatted_address : 'Endereço não disponível';
            content += `<p class="break">${endereco}</p>`;

            if (local.media_avaliacao) {
                content += `<p>Avaliação: ${getStarRatingHtml(local.media_avaliacao)}</p>`;
            } else {
                content += `<p>Avaliação não disponível</p>`;
            }

            // Chama a função showSidePanelFromLocal passando o ID do local do banco
            content += `<a href="/local-page/${local.id_local_premium}"><button class="saiba_mais">Conheça Mais!</button></a></div>`;

            // Atualiza a infowindow com o conteúdo gerado
            infowindow.setContent(content);
            infowindow.open(map, marker); // Presuma que 'marker' esteja acessível aqui
        } else {
            console.error('Geocoding falhou devido a: ' + status);
            infowindow.setContent('<p>Erro ao obter o endereço.</p>');
            infowindow.open(map, marker); // Presuma que 'marker' esteja acessível aqui
        }
    });
}





// estrela na avaliação
function getStarRatingHtml(rating) {
    const maxStars = 5;
    let starsHtml = '';

    for (let i = 1; i <= maxStars; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fas fa-star" style="color: #d12089;"></i>'; // Estrela preenchida
        } else {
            starsHtml += '<i class="far fa-star" style="color: #d12089;"></i>'; // Estrela vazia
        }
    }

    return starsHtml;
}


// começa avaliação estrela pelo usuario
function selectRating(selectedStar) {
    const ratingValue = selectedStar.getAttribute('data-value');
    const stars = document.querySelectorAll('.rating .star');
    const ratingSelect = document.getElementById('ratingSelect');

    // Preenche as estrelas até a estrela selecionada
    stars.forEach(star => {
        const icon = star.querySelector('i');
        if (parseInt(star.getAttribute('data-value')) <= ratingValue) {
            icon.classList.remove('far'); // Remove a classe 'far' para a estrela preenchida
            icon.classList.add('fas');    // Adiciona a classe 'fas' para a estrela preenchida
        } else {
            icon.classList.remove('fas'); // Remove a classe 'fas' para a estrela vazia
            icon.classList.add('far');     // Adiciona a classe 'far' para a estrela vazia
        }
    });

    ratingSelect.value = ratingValue; // Atualiza o valor no campo oculto
}

function hoverRating(hoveredStar) {
    const hoverValue = hoveredStar.getAttribute('data-value');
    const stars = document.querySelectorAll('.rating .star');

    // Preenche as estrelas até a estrela que está sendo passada o mouse
    stars.forEach(star => {
        const icon = star.querySelector('i');
        if (parseInt(star.getAttribute('data-value')) <= hoverValue) {
            icon.classList.remove('far'); // Remove a classe 'far' para a estrela em hover
            icon.classList.add('fas');    // Adiciona a classe 'fas' para a estrela em hover
        } else {
            icon.classList.remove('fas'); // Remove a classe 'fas' para a estrela não em hover
            icon.classList.add('far');     // Adiciona a classe 'far' para a estrela não em hover
        }
    });
}

function resetRating() {
    const stars = document.querySelectorAll('.rating .star');
    const ratingValue = document.getElementById('ratingSelect').value;

    // Retorna as estrelas à sua classificação original
    stars.forEach(star => {
        const icon = star.querySelector('i');
        if (parseInt(star.getAttribute('data-value')) <= ratingValue) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });
}





function centerMapOnUser() { 
    map.setCenter(currentLocation); 
    map.setZoom(12); 
} 
function onPlaceChanged() { 
    const place = autocomplete.getPlace(); 
    if (place.geometry) { 
        currentLocation = place.geometry.location; 
        map.setCenter(currentLocation); 
        map.setZoom(15); 
        if (userMarker) { 
            userMarker.setPosition(currentLocation); 
        } else { 
            userMarker = new google.maps.Marker({ 
                position: currentLocation, 
                map: map, 
                title: 'Sua Localização', 
                icon: { 
                    url: 'imagem/LocalizacaoLOCAIS-PNG.png', 
                    scaledSize: new google.maps.Size(30, 30)
                } 
            }); 
        } 
        updateMap(); // Atualiza a busca de pontos de interesse para a nova localização 
    } else { 

        console.error('Nenhum resultado encontrado para o endereço fornecido.'); 
    } 
} 


function toggleFilters() { 
    const moreCheckboxes = document.querySelector('.more-checkboxes'); 
    const toggleButton = document.getElementById('toggleFiltersButton'); 
    if (moreCheckboxes.style.display === 'none') {
        moreCheckboxes.style.display = 'block'; 
        toggleButton.textContent = 'Ver Menos'; 
    } else { 
        moreCheckboxes.style.display = 'none'; 
        toggleButton.textContent = 'Ver Mais'; 
    } 
} 



//mostrar mais informações do local quando clica em saiba mais
function showSidePanel(placeId) {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `<button id="closePanel" onclick="hideSidePanel()" style="z-index: 11;position: absolute; top: 10px; right: 10px;">×</button>`;
    let currentImageIndex = 0; // Index para controlar a imagem atual
    let nome = document.querySelector('.userNome').innerHTML;
    let email = document.querySelector('.userEmail').innerHTML;
    
    

    const request = {
        placeId: placeId,
        fields: ['name', 'vicinity', 'rating', 'photos', 'reviews'] // Inclui reviews aqui
    };

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            sidePanel.innerHTML += `
                <div class="sidepanel_card" style="position: relative;">
                    ${place.photos && place.photos.length > 0 ? `<img id="placeImage" src="${place.photos[0].getUrl({ maxWidth: 500, maxHeight: 300 })}" alt="Foto do local" style="width:100%; height:auto;">` : ''}
                    <div class="overlay"></div>
                    <h2>${place.name}</h2>
                    ${place.photos && place.photos.length > 1 ? `
                        <span id="prevImage" class="image-nav left-arrow" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer;">&#10094;</span>
                        <span id="nextImage" class="image-nav right-arrow" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer;">&#10095;</span>
                    ` : ''}
                </div>
                
                <section class="sidepanel_info">
                    <p class="endereco_local">${place.vicinity}</p>
                    <p><strong>Avaliação:</strong> ${place.rating ? getStarRatingHtml(place.rating) : 'Não disponível'} <span>${place.rating ? place.rating.toFixed(1) : ''}</span></p>

                    <hr class="separator">

                    <div class="sidePanelInteracao">
                        <p id="avaliarButton" onclick="toggleSidePanelAvaliacao()"><i class='fas fa-edit' style="font-size: 2em;"></i><br>Avaliar</p>
                        <p class="like-button">
                            <i class="bi bi-heart-fill" onclick="toggleHeart(event); favDesFav('${placeId}');" style="font-size: 2em;display: none;"></i>
                            <i class="bx bx-heart" onclick="toggleHeart(event); favDesFav('${placeId}');" style="font-size: 2em;"></i>
                            <br>favoritar</p>
                        <p><i class='fas fa-exclamation-triangle' style="font-size: 2em;"></i><br>Comunicar</p>
                    </div>

                    

                        `;
                        if( email.length === 0){
                            sidePanel.innerHTML += `
                            <div class="sidePanelAvaliar" id="sidePanelAvaliar">
                                <hr class="separator"> 
                                <div class="info_logar">
                                    <p>você não esta logado!</p> 
                                    <a href="/login">
                                        <button type="submit">LOGAR</button>
                                    </a>
                                </div>
                            </div> `;
                        } else {
                            sidePanel.innerHTML += `
                            <div class="sidePanelAvaliar" id="sidePanelAvaliar">
                                <hr class="separator">
                                <form action="/avaliarLocais" method="post" enctype="application/x-www-form-urlencoded">

                                    <input type="hidden" name="placeId" id="placeId" value="${placeId}">

                                    <!-- Campo oculto para armazenar o email do usuário -->
                                    <input type="hidden" name="email" id="email" value="${email}"> <!-- Substituir por email dinâmico -->
                                    <h3><span> ${nome}</span></h3>

                                    <div class="rating" id="rating">
                                        <span class="star" data-value="1" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                        <span class="star" data-value="2" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                        <span class="star" data-value="3" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                        <span class="star" data-value="4" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                        <span class="star" data-value="5" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                    </div>

                                    <!-- Campo oculto para armazenar o valor da avaliação -->
                                    <input type="hidden" name="rating" id="ratingSelect" value="">

                                    <!-- Campo oculto para armazenar o valor da avaliação -->
                                    <input type="hidden" name="placeId_google" value="${placeId}">

                                    <section class="grp-form">
                                        <input type="text" name="comentario" id="addComentario" placeholder="Comentario" required>
                                    </section>

                                    <div class="group-button">
                                    <button class="cancelarAvaliar" onclick="toggleSidePanelAvaliacao()" type="button">Cancelar</button>
                                    <button type="submit">Avaliar</button>
                                    </div>
                                </form>
                            </div>
                            `;
                        }

                        
                        sidePanel.innerHTML += `
                        
                        

                    <hr class="separator">
                        <section class="comentarios_local">
                            ${place.reviews && place.reviews.length > 0 ? `
                                <h3>Comentários:</h3>
                                <ul>
                                    ${place.reviews.map(review => `
                                        <li>
                                            <strong>${review.author_name}:</strong> 
                                            ${review.rating ? getStarRatingHtml(review.rating) : 'Sem nota'}<br>
                                            ${review.text} <br>
                                        </li>
                                    `).join('')}
                                </ul>` : '<p>Sem comentários disponíveis</p>'}
                        </section>
                
                </section>
            `;
            checkCurtir(placeId)

            // Adiciona eventos para navegação entre as imagens
            if (place.photos && place.photos.length > 1) {
                document.getElementById('prevImage').addEventListener('click', () => {
                    currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : place.photos.length - 1;
                    document.getElementById('placeImage').src = place.photos[currentImageIndex].getUrl({ maxWidth: 500, maxHeight: 300 });
                });

                document.getElementById('nextImage').addEventListener('click', () => {
                    currentImageIndex = (currentImageIndex < place.photos.length - 1) ? currentImageIndex + 1 : 0;
                    document.getElementById('placeImage').src = place.photos[currentImageIndex].getUrl({ maxWidth: 500, maxHeight: 300 });
                });
            }
        } else {
            console.error('Erro ao buscar detalhes do local:', status);
            sidePanel.innerHTML += '<p>Não foi possível carregar informações detalhadas.</p>';
        }


        if (window.innerWidth > 768) { // Verifique se a largura da tela é maior que 768px (ou o valor que preferir)
            sidePanel.style.display = 'block';
            // Aplicar animação de abertura
            setTimeout(() => {
                sidePanel.style.width = '500px'; // Largura desejada da aba lateral
                sidePanel.style.opacity = 1;
            }, 10); // Um pequeno delay para garantir que a transição seja visível
        } else {
            sidePanel.style.display = 'block';
            // Aplicar animação de abertura
            setTimeout(() => {
                sidePanel.style.width = '100%'; // Largura desejada da aba lateral
                sidePanel.style.opacity = 1;
            }, 10); // Um pequeno delay para garantir que a transição seja visível
        }

        
    });

    
}


function showSidePanelFromLocal(localId) {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `<button id="closePanel" onclick="hideSidePanel()" style="z-index: 11;position: absolute; top: 10px; right: 10px;">×</button>`;
    let currentImageIndex = 0;
    let nome = document.querySelector('.userNome').innerHTML;
    let email = document.querySelector('.userEmail').innerHTML;

    // Função para atualizar a exibição da imagem
    function updateImageDisplay(local) {
        const imageContainer = document.getElementById('localImage');
        if (local.imagens && local.imagens.length > 0) {
            imageContainer.src = `uploads/${local.imagens[currentImageIndex]}`;
        }
    }

    // Função para formatar os comentários
    function formatComment(comment) {
        const { cliente, avaliacao_estrela_locais, comentario_local } = comment;
        const nomeCliente = cliente || "Anônimo";
        const avaliacao = avaliacao_estrela_locais ? `${getStarRatingHtml(avaliacao_estrela_locais)}` : "Sem avaliação";
        const comentario = comentario_local ? comentario_local : "Sem comentário";
        

        return `<li><strong>${nomeCliente}:</strong> Avaliação: ${avaliacao} <br> Comentário: ${comentario}</li>`;
    }

    // Faz uma requisição para buscar as informações detalhadas do local
    fetch(`/getLocalFromId?id=${localId}`)
        .then(response => response.json())
        .then(localArray => {
            const local = localArray[0];  // Acessa o primeiro local do array
            

            if (local) {
                sidePanel.innerHTML += `
                    <div class="sidepanel_card" style="position: relative;">
                        ${local.imagens && local.imagens.length > 0 ? `<img id="localImage" src="uploads/${local.imagens[0]}" alt="Foto do local" style="width:100%; height: auto;">` : ''}
                        <div class="overlay"></div>
                        <h2>${local.nome_local}</h2>
                        ${local.imagens && local.imagens.length > 1 ? `
                            <span id="prevImage" class="image-nav left-arrow" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer;">&#10094;</span>
                            <span id="nextImage" class="image-nav right-arrow" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 2em; cursor: pointer;">&#10095;</span>
                        ` : ''}
                    </div>

                    <section class="sidepanel_info">
                        <p class="endereco_local">${local.endereco || 'Endereço não disponível'}</p>
                        <p><strong>Avaliação:</strong> ${local.media_avaliacao ? getStarRatingHtml(local.media_avaliacao) : 'Não disponível'}<span>${local.media_avaliacao ? Number(local.media_avaliacao).toFixed(1) : ''}</span></p>

                        <hr class="separator">
                        
                        <div class="sidePanelInteracao">
                            <p id="avaliarButton" onclick="toggleSidePanelAvaliacao()"><i class='fas fa-edit' style="font-size: 2em;"></i><br>Avaliar</p>
                            <p class="like-button">
                            <i class="bi bi-heart-fill" onclick="toggleHeart(event); favDesFav(${localId});" style="font-size: 2em;display: none;"></i>
                            <i class="bx bx-heart" onclick="toggleHeart(event); favDesFav(${localId});" style="font-size: 2em;"></i>
                            <br>favoritar</p>
                            <p><i class='fas fa-exclamation-triangle' style="font-size: 2em;"></i><br>Comunicar</p>
                        </div>

                        `;
                        if( email.length === 0){
                            sidePanel.innerHTML += `
                            <div class="sidePanelAvaliar" id="sidePanelAvaliar">
                                <hr class="separator"> 
                                <div class="info_logar">
                                    <p>você não esta logado!</p> 
                                    <a href="/login">
                                        <button type="submit">LOGAR</button>
                                    </a>
                                </div>
                            </div> `;
                        } else {
                            sidePanel.innerHTML += `
                            <div class="sidePanelAvaliar" id="sidePanelAvaliar">
                        
                            <form action="/avaliarLocaisBanco" method="post" enctype="application/x-www-form-urlencoded">

                                <input type="hidden" name="placeId" id="placeId" value="${localId}">

                                <!-- Campo oculto para armazenar o email do usuário -->
                                <input type="hidden" name="email" id="email" value="${email}"> <!-- Substituir por email dinâmico -->
                                <h3><span> ${nome}</span></h3>

                                <div class="rating" id="rating">
                                    <span class="star" data-value="1" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                    <span class="star" data-value="2" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                    <span class="star" data-value="3" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                    <span class="star" data-value="4" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                    <span class="star" data-value="5" onclick="selectRating(this)" onmouseover="hoverRating(this)" onmouseout="resetRating()"><i class="far fa-star"></i></span>
                                </div>

                                <!-- Campo oculto para armazenar o valor da avaliação -->
                                <input type="hidden" name="rating" id="ratingSelect" value="">

                                <!-- Campo oculto para armazenar o valor da avaliação -->
                                <input type="hidden" name="localId" value="${localId}">

                                <section class="grp-form">
                                    <input type="text" name="comentario" id="addComentario" placeholder="Comentario" required>
                                </section>

                                <div class="group-button">
                                    <button class="cancelarAvaliar" onclick="toggleSidePanelAvaliacao()" type="button">Cancelar</button>
                                    <button type="submit">Avaliar</button>
                                </div>
                            </form>
                        </div>
                            `;
                        }

                        
                        sidePanel.innerHTML += `
                        
                        

                        <hr class="separator">
                        <section class="comentarios_local">
                            ${local.comentarios && local.comentarios.length > 0 ? `
                                <h3>Comentários:</h3>
                                <ul>
                                    ${local.comentarios.map(formatComment).join('')}
                                    </ul>` : '<p>Sem comentários disponíveis</p>'}
                            </section>
                    </section>
                `;
                checkCurtir(localId)

                // Adicionar evento de navegação de imagens se houver mais de uma imagem
                if (local.imagens && local.imagens.length > 1) {
                    document.getElementById('prevImage').addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : local.imagens.length - 1;
                        updateImageDisplay(local);
                    });

                    document.getElementById('nextImage').addEventListener('click', () => {
                        currentImageIndex = (currentImageIndex < local.imagens.length - 1) ? currentImageIndex + 1 : 0;
                        updateImageDisplay(local);
                    });
                }
            } else {
                sidePanel.innerHTML += '<p>Local não encontrado.</p>';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar os detalhes do local:', error);
            sidePanel.innerHTML += '<p>Não foi possível carregar informações detalhadas.</p>';
        });

    
        if (window.innerWidth > 768) { // Verifique se a largura da tela é maior que 768px (ou o valor que preferir)
            sidePanel.style.display = 'block';
            // Aplicar animação de abertura
            setTimeout(() => {
                sidePanel.style.width = '500px'; // Largura desejada da aba lateral
                sidePanel.style.opacity = 1;
            }, 10); // Um pequeno delay para garantir que a transição seja visível
        } else {
            sidePanel.style.display = 'block';
            setTimeout(() => {
                sidePanel.style.width = '100%';
                sidePanel.style.opacity = 1;
            }, 10);
        } 
}



function toggleSidePanelAvaliacao() {
    const sidePanelAvaliacao = document.getElementById('sidePanelAvaliar');
    const avaliarButton = document.getElementById('avaliarButton');
    if (sidePanelAvaliacao.style.display === 'none' || sidePanelAvaliacao.style.display === '') {
        sidePanelAvaliacao.style.display = 'block';
        avaliarButton.style.color = '#d12089';
    } else {
        sidePanelAvaliacao.style.display = 'none';
        avaliarButton.style.color = '#333';

    }
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

function checkCurtir(id) {
    const coracaoPreenchido = document.querySelector('.bi-heart-fill');
    const coracaoVazio = document.querySelector('.bx-heart');

    fetch(`/checkCurtirLocal/${id}`, { 
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
.then(response => {
    console.log("Resposta do servidor:", response);

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
        throw new Error(`Erro: ${response.status} ${response.statusText}`);
    }

    return response.json();
})
.then(data => {
    // Manipulação da resposta
    if (data.favoritado) {
        coracaoVazio.style.display = 'none';
        coracaoPreenchido.style.display = 'block'; // Mostra o coração preenchido
    } else {
        coracaoPreenchido.style.display = 'none';
        coracaoVazio.style.display = 'block'; // Mostra o coração vazio
    }
})
.catch(error => {
    console.error("Erro na solicitação:", error);
});
}

function favDesFav(id) {
    
    try {
        const response = fetch(`/favoritarLocal/${id}`, { // Use 'id' aqui
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



// esconde painel
function hideSidePanel() { 
    const sidePanel = document.getElementById('sidePanel'); 
    if (window.innerWidth > 768) { // Verifica se a largura da tela é maior que 768px
        sidePanel.style.width = '0'; // Reduz a largura para 0
        sidePanel.style.opacity = 0;
        setTimeout(() => {
            sidePanel.style.display = 'none'; // Esconde a aba lateral após a animação
        }, 300); // O tempo deve coincidir com a duração da transição
    } else {
        sidePanel.style.width = '0'; // Reduz a largura para 0
        sidePanel.style.opacity = 0;
        setTimeout(() => {
            sidePanel.style.display = 'none'; // Esconde a aba lateral após a animação
        }, 300); // O tempo deve coincidir com a duração da transição
    }
    

} 


// mostra aba de adiconar novo local
function showAddNewLocalWindow() {
    const addNewLocalWindow = document.getElementById('addNewLocalWindow');
    addNewLocalWindow.style.display = 'block';
    document.getElementById('overlay').style.display = "block";
}
function showAddNewLocalPremiumWindow() {
    const addNewLocalWindow = document.querySelector('.premium');
    addNewLocalWindow.style.display = 'block';
}



function hideAddNewLocalWindow() {
    const addNewLocalWindow = document.querySelector('.userN');
    addNewLocalWindow.style.display = 'none';

    const addNewLocalWindow2 = document.querySelector('.premium');
    addNewLocalWindow2.style.display = 'none';
    document.getElementById('overlay').style.display = "none";
}



// mostra aba de adiconar novo local opção select
function showselectLocalConfirm() {
    
    enableMapSelection()
}







// colocar o pin no mapa aonde clicou
function handleMapClick(event) {
    if (!mapSelectionEnabled) return; // Só processa o clique se a seleção estiver ativada

    const latLng = event.latLng;
    const lat = latLng.lat();
    const lng = latLng.lng();

    // Remove o marcador atual, se houver
    if (currentMarker) {
        currentMarker.setMap(null);
    }

    // Cria um novo marcador
    currentMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: `Latitude: ${lat}, Longitude: ${lng}`,
        icon: {
            url: 'imagem/LocalizacaoblueLOCAIS-PNG.png',
            scaledSize: new google.maps.Size(35, 35)
        }
    });

    // Exibe as coordenadas selecionadas
    document.getElementById('selectedCoordinates').textContent = `Coordenadas selecionadas: Latitude ${lat}, Longitude ${lng}`;
    document.getElementById('selectedCoordinatesUser').textContent = `localização selecionada salva`;
    document.getElementById('selectedCoordinatesUserP').textContent = `localização selecionada salva`;

    
    locationMethod = 'map';
    

    // Cria o conteúdo da InfoWindow com o botão de confirmação
    const infoWindowContent = `
        <div style="text-align: center;">
            <button id="confirmLocationBtn" style="padding: 5px 10px; background-color: blue; color: white; border: none; cursor: pointer;">
                Confirmar
            </button>
        </div>
    `;
    

    // Cria a InfoWindow e a exibe sobre o marcador
    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    infoWindow.open(map, currentMarker);

    // Define um listener para o botão de confirmação
    google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        document.getElementById('confirmLocationBtn').addEventListener('click', () => {
            mapSelectionEnabled = false;
            document.getElementById('addNewLocalWindow').style.display = "block";
            document.getElementById('overlay').style.display = "block";
            infoWindow.close(); // Fecha a InfoWindow após a confirmação
        });
    });
}





// habilita o clique no mapa
function enableMapSelection() {
    mapSelectionEnabled = true; // Habilita a seleção
    document.getElementById('selectedCoordinatesUser').textContent = "Clique no mapa para escolher um local.";
    document.getElementById('selectedCoordinatesUserP').textContent = "Clique no mapa para escolher um local.";
    document.getElementById('addNewLocalWindow').style.display = "none";
            document.getElementById('overlay').style.display = "none";
}


// pegar localização atual
function getCurrentLocation() {
    document.getElementById('selectedCoordinatesUser').textContent = "Localização salva";
            document.getElementById('selectedCoordinatesUserP').textContent = "Localização salva";
            map.setCenter(location);
            if (userMarker) userMarker.setPosition(location);
            locationMethod = 'current'; // Atualiza o método de localização
    
}




// função para pegar localização ao selecionar
function saveCoordinates(num) {
    let lat, lng;

    if (locationMethod === 'current') {
        lat = currentLocation.lat; // Usa a localização atual
        lng = currentLocation.lng;
    } else {
        const selectedCoordinates = document.getElementById('selectedCoordinates').textContent;
        const latLng = selectedCoordinates.match(/Latitude (-?\d+\.\d+), Longitude (-?\d+\.\d+)/);

        if (latLng) {
            lat = latLng[1];
            lng = latLng[2];
        } else {
            alert("Selecione uma localização válida antes de prosseguir.");
            return;
        }
    }

    localStorage.setItem('latitude', lat);
    localStorage.setItem('longitude', lng);
    console.log(`Coordenadas salvas: Latitude ${lat}, Longitude ${lng}`);

    if (num === 1){
        window.location.href = '/add-locais';
    } else if(num === 2){
        window.location.href = '/add-locais-premium';
    }

}




// obter o endereço mais próximo do local selecionado
function getNearestAddress(latLng, callback) {
    geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            const address = results[0].formatted_address;
            callback(address);
        } else {
            console.error('Erro ao obter o endereço:', status);
            callback(null);
        }
    });
}


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



window.onload = initMap; 
