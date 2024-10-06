
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
            document.getElementById('jsonData').innerText = JSON.stringify(locaisBanco, null, 2);

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
            document.getElementById('jsonData').innerText = 'Erro ao buscar locais do banco.';
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
    let content = `<div class="card_local"><strong>${local.nome_local}</strong>`;
    content += `<p>recomendado por: <span class="google_color">+Sport</span></p>`;

    if (local.imagens && local.imagens.length > 0) {
        content += `<img src="uploads/${local.imagens[0]}" class="place-photo" style="width:100%;"><br>`;
    } else {
        content += `<p>Imagem não disponível</p>`;
    }

    if (local.endereco) {
        content += `<p class="break">${local.endereco}</p>`;
    }

    if (local.media_avaliacao) {
        content += `<p>Avaliação: ${getStarRatingHtml(local.media_avaliacao)}</p>`;
    } else {
        content += `<p>Avaliação não disponível</p>`;
    }

    // Chama a função showSidePanelFromLocal passando o ID do local do banco
    content += `<button class="saiba_mais" onclick="showSidePanelFromLocal('${local.id}')">Saiba Mais</button></div>`;
    return content;
}




// estrela na avaliação
function getStarRatingHtml(rating) {
    const maxStars = 5;
    let starsHtml = '';

    for (let i = 1; i <= maxStars; i++) {
        if (i <= rating) {
            starsHtml += '★'; // Estrela preenchida
        } else {
            starsHtml += '☆'; // Estrela vazia
        }
    }

    return starsHtml;
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
                    <p>${place.vicinity}</p>
                    <p><strong>Avaliação:</strong> ${place.rating ? getStarRatingHtml(place.rating) : 'Não disponível'}</p>

                    <hr class="separator">

                    copiar, favoritar, comunicar

                    <hr class="separator">

                    ${place.reviews && place.reviews.length > 0 ? `<h3>Comentários:</h3><ul>${place.reviews.map(review => `<li><strong>${review.author_name}:</strong> ${review.text}</li>`).join('')}</ul>` : '<p>Sem comentários disponíveis</p>'}
                </section>
            `;

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

        sidePanel.style.display = 'block'; 
        // Aplicar animação de abertura 
        setTimeout(() => { 
            sidePanel.style.width = '500px'; // Largura desejada da aba lateral 
            sidePanel.style.opacity = 1; 
        }, 10); // Um pequeno delay para garantir que a transição seja visível 
    });
}


function showSidePanelFromLocal(localId) {
    const sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `<button id="closePanel" onclick="hideSidePanel()" style="z-index: 11;position: absolute; top: 10px; right: 10px;">×</button>`;
    let currentImageIndex = 0;

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
            document.getElementById('jsonData').innerText = JSON.stringify(localArray, null, 2);

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
                        <p>${local.endereco || 'Endereço não disponível'}</p>
                        <p><strong>Avaliação:</strong> ${local.media_avaliacao ? getStarRatingHtml(local.media_avaliacao) : 'Não disponível'}<span>${local.media_avaliacao ? Number(local.media_avaliacao).toFixed(1) : ''}</span></p>

                        <hr class="separator">
                        copiar, favoritar, comunicar

                        <hr class="separator">

                        ${local.comentarios && local.comentarios.length > 0 ? `<h3>Comentários:</h3><ul>${local.comentarios.map(formatComment).join('')}</ul>` : '<p>Sem comentários disponíveis</p>'}
                    </section>
                `;

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

    sidePanel.style.display = 'block'; 
    // Aplicar animação de abertura 
    setTimeout(() => { 
        sidePanel.style.width = '500px'; // Largura desejada da aba lateral 
        sidePanel.style.opacity = 1; 
    }, 10); // Um pequeno delay para garantir que a transição seja visível 
}








// esconde painel
function hideSidePanel() { 
    const sidePanel = document.getElementById('sidePanel'); 
    sidePanel.style.width = '0'; // Reduz a largura para 0 
    sidePanel.style.opacity = 0; 
    setTimeout(() => {
        sidePanel.style.display = 'none'; // Esconde a aba lateral após a animação 
    }, 300); // O tempo deve coincidir com a duração da transição 

} 


// mostra aba de adiconar novo local
function showAddNewLocalWindow() {
    const addNewLocalWindow = document.getElementById('addNewLocalWindow');
    addNewLocalWindow.style.display = 'block';
}



function hideAddNewLocalWindow() {
    const addNewLocalWindow = document.getElementById('addNewLocalWindow');
    addNewLocalWindow.style.display = 'none';
}


// mostra aba de adiconar novo local opção select
function showselectLocalConfirm() {
    const addNewLocalWindow = document.getElementById('selectLocalConfirm');
    addNewLocalWindow.style.display = 'block';
    enableMapSelection()
}



function hideselectLocalConfirm() {
    const addNewLocalWindow = document.getElementById('selectLocalConfirm');
    addNewLocalWindow.style.display = 'none';
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
        title: `Latitude: ${lat}, Longitude: ${lng}`, // Corrige a sintaxe para a string
        icon: {
            url: 'imagem/LocalizacaoblueLOCAIS-PNG.png', // URL do ícone
            scaledSize: new google.maps.Size(35, 35) // Define o tamanho do ícone
        }
    });

    // Obtém o endereço mais próximo e atualiza o <h1>
    getNearestAddress(latLng, (address) => {
        if (address) {
            document.querySelector('#selectLocalConfirm h1').textContent = address;
        } else {
            document.querySelector('#selectLocalConfirm h1').textContent = 'Endereço não disponível';
        }
    });

    // Exibe as coordenadas selecionadas
    document.getElementById('selectedCoordinates').textContent = `Coordenadas selecionadas: Latitude ${lat}, Longitude ${lng}`; // Corrige a sintaxe para a string

    // Atualiza o método de localização
    locationMethod = 'map'; // Atualiza o método de localização

    // Desativa a seleção
    mapSelectionEnabled = false;
}




// habilita o clique no mapa
function enableMapSelection() {
    mapSelectionEnabled = true; // Habilita a seleção
    document.getElementById('selectedCoordinates').textContent = "Clique no mapa para escolher um local.";
}


// pegar localização atual
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            document.getElementById('selectedCoordinates').textContent = "Localização salva";
            map.setCenter(location);
            if (userMarker) userMarker.setPosition(location);
            locationMethod = 'current'; // Atualiza o método de localização
        });
    }
}




// função para pegar localização ao selecionar
function saveCoordinates() {
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
    window.location.href = '/add-locais';
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






window.onload = initMap; 
