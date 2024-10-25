function proximaPag(){
    document.querySelector('.product-info').style.display = 'none'
    document.querySelector('.product-card').style.display = 'none'

    document.querySelector('.funcionamento').style.display = 'flex'
}

function voltarPag(){
    document.querySelector('.product-info').style.display = 'block'
    document.querySelector('.product-card').style.display = 'grid'

    document.querySelector('.funcionamento').style.display = 'none'
}

function toggleButtons(dia){
    const toggleButton = document.querySelector(`.${dia} .toggle-btn`);
        
        if (toggleButton.classList.contains('active')) {
            toggleButton.textContent = 'FECHADO';
            document.querySelector(`.${dia} .desativa_pick`).style.display = 'none';
            toggleButton.classList.toggle('active');
        } else {
            
            toggleButton.textContent = 'ABERTO';
            document.querySelector(`.${dia} .desativa_pick`).style.display = 'flex';
            toggleButton.classList.toggle('active');
        }
 }

 // Função para mostrar o modal
function mostrarEscolherHora(dia) {
            
    document.querySelector(`.${dia} .overlay`).style.display = 'block';
    document.querySelector(`.${dia} .escolher_hora`).style.display = 'flex';
    
}

// Função para esconder o modal
function esconderEscolherHora(dia) {
    const toggleButton = document.querySelector(`.${dia} .toggle-btn`);
    document.querySelector(`.${dia} .overlay`).style.display = 'none';
    document.querySelector(`.${dia} .escolher_hora`).style.display = 'none';

    if (toggleButton.classList.contains('active')) {
        const iniHora = document.querySelector(`.${dia} #start-time`).value
        const fimHora = document.querySelector(`.${dia} #end-time`).value
        
        document.querySelector(`.${dia} .h3_hora`).innerHTML = `${iniHora} - ${fimHora}`;
    } else {
        document.querySelector(`.${dia} .h3_hora`).innerHTML = `FECHADO`;
    }
}

window.onload = function () {
    const lat = localStorage.getItem('latitude');
    const lng = localStorage.getItem('longitude');

    if (lat && lng) {
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
        initMap(parseFloat(lat), parseFloat(lng));
    }
};

function initMap(lat, lng) {
    const location = { lat: lat, lng: lng };
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: location
    });
    
    var styles = {
        default: null,
        hide: [
            {
            featureType: 'poi.business',
            stylers: [{visibility: 'off'}]
        },
        {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{visibility: 'off'}]
      }
    ]
  };

  map.setOptions({styles: styles['hide']});

    // Adiciona o marcador na localização especificada
    new google.maps.Marker({
        position: location,
        map: map,
        icon: {
            url: 'imagem/LocalizacaoYOU-PNG.png',
            scaledSize: new google.maps.Size(30, 30)
        }
    });
}




