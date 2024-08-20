
let map;
let service;
let infowindow;
let markers = [];
let currentLocation = { lat: -23.5372544, lng: -46.8516864 };
let userMarker;
let geocoder;
let autocomplete;

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
            url: 'https://cdn-icons-png.flaticon.com/512/811/811872.png',
            scaledSize: new google.maps.Size(30, 30)
        }
    });

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
                    title: place.name
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
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            return checkbox.value;
        }
    }
    return null; // Nenhum checkbox selecionado
}

function getKeywords(type) {
    switch (type) {
        case 'football':
            return ['soccer field', 'football field', 'soccer stadium', 'football stadium', 'soccer', 'futsal', 'futebol', 'quadra', 'society', 'campo de futebol'];
        case 'skatepark':
            return ['skate park', 'skateboarding park', 'pista','skate'];
        case 'bicycle':
            return ['bike park', 'bicycle park'];
        case 'tennis':
            return ['tennis court', 'tennis stadium', 'quadra' ];
        case 'basketball':
            return ['court', 'basketball stadium', 'quadra', 'basquete' ];
        case 'park':
            return ['park', 'parque'];
        case 'gym':
            return ['gym', 'fitness center'];
        default:
            return [];
    }
}

function generateContent(place) {
    let content = `<div><strong>${place.name}</strong><br>`;
   
    if (place.photos && place.photos.length > 0) {
        const photoUrl = place.photos[0].getUrl({ maxWidth: 200, maxHeight: 150 });
        content += `<img src="${photoUrl}" class="place-photo"><br>`;
    } else {
        content += `<p>Imagem não disponível</p>`;
    }
   
    if (place.vicinity) {
        content += `<p>${place.vicinity}</p>`;
    }
   
    content += `</div>`;
    return content;
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
                    url: 'https://cdn-icons-png.flaticon.com/512/811/811872.png',
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

window.onload = initMap;