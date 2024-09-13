
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



function initMap() { 
    geocoder = new google.maps.Geocoder(); 
    autocomplete = new google.maps.places.Autocomplete( 
        document.getElementById('address'), {  
            types: ['geocode'] // Aceita endereço completo, bairro e cidade 
        } 
    ); 
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

    const request = {
        location: currentLocation,
        radius: '10000',
        keyword: getKeywords(selectedType)
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (let i = 0; i < results.length; i++) {
                const place = results[i];
                const marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: map,
                    title: place.name,
                    icon: {
                        url: 'imagem/LocalizacaoLOCAIS-PNG.png', // URL do ícone
                        scaledSize: new google.maps.Size(35, 35) // Define o tamanho do ícone
                    }
                    
                });

                google.maps.event.addListener(marker, 'click', () => {
                    infowindow.setContent(generateContent(place));
                    infowindow.open(map, marker);
                });

                markers.push(marker);
            }
        } else {
            console.error('Erro na busca de locais:', status);
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
            return ['gym', 'fitness center']; 
        case 'football': 
            return ['soccer stadium', 'football stadium', 'soccer', 'futsal', 'futebol', 'quadra', 'society', 'campo de futebol']; 
        case 'skatepark': 
            return ['skate park', 'skateboarding park', 'pista', 'skate']; 
        case 'bicycle': 
            return ['bike park', 'bicycle park']; 
        case 'tennis': 
            return ['tennis court', 'tennis stadium', 'quadra']; 
        case 'basketball': 
            return ['court', 'basketball stadium', 'quadra', 'basquete']; 
        case 'park': 
            return ['park', 'parque']; 
        default: 
            return []; 
    } 
} 



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
    sidePanel.innerHTML = `<button id="closePanel" onclick="hideSidePanel()" style="position: absolute; top: 10px; right: 10px;">×</button>`;

    const request = {
        placeId: placeId,
        fields: ['name', 'vicinity', 'rating', 'photos', 'reviews'] // Inclui reviews aqui
    };

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            sidePanel.innerHTML += `
                <h2>${place.name}</h2>
                ${place.photos && place.photos.length > 0 ? `<img src="${place.photos[0].getUrl({ maxWidth: 500, maxHeight: 300 })}" alt="Foto do local" style="width:100%; height:auto;">` : ''}
                <p>${place.vicinity}</p>
                <p>Avaliação: ${place.rating ? getStarRatingHtml(place.rating) : 'Não disponível'}</p>
                ${place.reviews && place.reviews.length > 0 ? `<h3>Comentários:</h3><ul>${place.reviews.map(review => `<li><strong>${review.author_name}:</strong> ${review.text}</li>`).join('')}</ul>` : '<p>Sem comentários disponíveis</p>'}
            `;
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
            map.setCenter(location);
            if (userMarker) userMarker.setPosition(location);
        });
    }
}



// função para pegar localização ao selecionar
function saveCoordinates() {
    const selectedCoordinates = document.getElementById('selectedCoordinates').textContent;
    const latLng = selectedCoordinates.match(/Latitude (-?\d+\.\d+), Longitude (-?\d+\.\d+)/);

    if (latLng) {
        const lat = latLng[1];
        const lng = latLng[2];
        localStorage.setItem('latitude', lat);
        localStorage.setItem('longitude', lng);
        window.location.href = 'proxima-pagina.html';
    } else {
        alert("Selecione uma localização antes de prosseguir.");
    }
}

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
