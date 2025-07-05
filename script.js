
// #################################### CRIAÇÃO DO MAPA ####################################

// Define os limites da visualização do mapa
var southWest = L.latLng(39.43211982527226, -8.511630700569013); // Coordenada do sudoeste
var northEast = L.latLng(39.501296069292856, -8.442622829123167); // Coordenada do nordeste
var bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    maxBounds: bounds, // Limites de visualização
    maxBoundsViscosity: 0.2 // Controle de quão pegajosos são os limites
}).locate({setView: true, maxZoom: 14});

map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    minZoom: 13,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Função de pesquisa de geocodificação restrita ao Entroncamento
function searchInEntroncamento(query) {
    var apiUrl = 'https://nominatim.openstreetmap.org/search';
    var params = {
        q: query + ', Entroncamento, Portugal',
        format: 'json',
        addressdetails: 1,
        limit: 1
    };

// Verifica se o marcador existe na lista de marcadores
var foundMarker = markers.find(marker => marker.getPopup().getContent().toLowerCase().includes(query.toLowerCase()));
if (foundMarker) {
    map.setView(foundMarker.getLatLng(), 18);
    foundMarker.openPopup();
    return;
}

// Realiza a requisição AJAX para a API do Nominatim
fetch(apiUrl + '?' + new URLSearchParams(params))
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.length > 0) {
            var result = data[0];
            var lat = result.lat;
            var lon = result.lon;
            map.setView([lat, lon], 17);
        } else {
            alert('Nenhum resultado encontrado para "' + query + '" no Entroncamento.');
        }
    })
    .catch(function(error) {
        console.error('Erro na pesquisa:', error);
    });
    }

// Cria um controle personalizado de geocodificação
var searchControl = L.Control.extend({
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar');

        var input = L.DomUtil.create('input', '', container);
        input.type = 'text';
        input.placeholder = 'Pesquisar rua ou local...';

        // Botão de pesquisa
        var button = L.DomUtil.create('button', '', container);
        button.innerHTML = 'Pesquisar';
        button.onclick = function() {
            searchInEntroncamento(input.value);
        };

        return container;
    }
});

// Adiciona o controle personalizado ao mapa
map.addControl(new searchControl({ position: 'topright' }));



// ############################## ÍCONE PERSONALIZADO ##############################

var customIcon = L.icon({
    iconUrl: 'images/pessoa_icon-removebg-preview.png',
    iconSize: [25, 25],
    iconAnchor: [13, 27],
    popupAnchor: [0, -30]
});

var userLocation = {
    marker: null,
    circle: null,
    latlng: null
};

var firstTimeLocationFound = true;

// ############################## LOCALIZAÇÃO ENCONTRADA ##############################

function onLocationFound(e) {
    if (userLocation.marker) map.removeLayer(userLocation.marker);
    if (userLocation.circle) map.removeLayer(userLocation.circle);

    userLocation.latlng = e.latlng;

    userLocation.marker = L.marker(e.latlng, { icon: customIcon }).addTo(map)
        .bindPopup("<b>Estás aqui</b>")
        .openPopup();  // <- Só abre aqui, depois da localização

    userLocation.circle = L.circle(e.latlng, {
        weight: 3,
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.3,
        radius: 25
    }).addTo(map);

    if (firstTimeLocationFound) {
        map.setView(e.latlng, 16);
        firstTimeLocationFound = false;
    }
}

map.on('locationfound', onLocationFound);

// ############################## ERRO DE LOCALIZAÇÃO ##############################

function onLocationError(e) {
    console.warn("Erro de geolocalização:", e.message);
}

map.on('locationerror', onLocationError);

// ############################## ATIVAR LOCALIZAÇÃO ##############################

map.locate({
    setView: false,
    maxZoom: 16,
    watch: false,
    timeout: 15000 // <- 15 segundos, mais razoável
});
