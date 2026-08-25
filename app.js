// --- ESTAT GLOBAL ---
let map = null;
let miniMap = null;
let geojsonLayer = null;
let miniGeojsonLayer = null;

let currentStyle = 'classic';
let usuariActual = 'Josep';

// Dades de prova / estructura de dades
const totalMunicipis = 542;

// Històric de visites (Exemple: codis INE o identificadors dels pobles)
const dadesGlobals = {
    'Josep': ['46001', '46002', '12001', '03001'], // Pobles visitats
    'Maria': ['46001', '12002', '03002']
};

// Capes de mapa base (TileLayers)
const tileLayers = {
    classic: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© CARTO'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: '© Esri'
    })
};

let currentTileLayer = tileLayers.classic;
let totesLesFeatures = null; // Guardarà les dades GeoJSON carregades

// --- INICIALITZACIÓ ---
document.addEventListener('DOMContentLoaded', () => {
    inicialitzarMapa();
    inicialitzarEsdevenimentsCapes();
    carregarDadesGeoJSON();
});

function inicialitzarMapa() {
    // Inicialitza el mapa principal centrat en la Comunitat Valenciana
    map = L.map('map', { zoomControl: true }).setView([39.48, -0.37], 8);
    currentTileLayer.addTo(map);
}

// --- CONTROLS FLOTANTS DE CAPES ---
function inicialitzarEsdevenimentsCapes() {
    const btnToggle = document.getElementById('btn-layers-toggle');
    const btnClose = document.getElementById('btn-close-layers');
    const menu = document.getElementById('layers-menu');

    btnToggle.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    btnClose.addEventListener('click', () => {
        menu.classList.add('hidden');
    });

    document.querySelectorAll('.layer-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const style = e.currentTarget.getAttribute('data-style');
            
            // Canviar opció activa visualment
            document.querySelectorAll('.layer-option').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Commutar capa base en Leaflet
            map.removeLayer(currentTileLayer);
            currentTileLayer = tileLayers[style];
            currentTileLayer.addTo(map);

            currentStyle = style;
            actualitzarEstilGeoJSON(style);
            menu.classList.add('hidden');
        });
    });
}

// Carregador fictici / real del GeoJSON
function carregarDadesGeoJSON() {
    // Substituir per la ruta real del teu GeoJSON (ex: fetch('municipis.json'))
    // En carregar-lo, guardem les dades i dibuixem la capa:
    /*
    fetch('municipis.geojson')
        .then(res => res.json())
        .then(data => {
            totesLesFeatures = data;
            dibuixarGeoJSON();
        });
    */
}

function dibuixarGeoJSON() {
    if (!totesLesFeatures) return;

    if (geojsonLayer) map.removeLayer(geojsonLayer);

    geojsonLayer = L.geoJSON(totesLesFeatures, {
        style: feature => obtenirEstilSegonsEstat(feature, currentStyle)
    }).addTo(map);
}

function actualitzarEstilGeoJSON(estilMapa) {
    if (!geojsonLayer) return;
    geojsonLayer.setStyle(feature => obtenirEstilSegonsEstat(feature, estilMapa));
}

function obtenirEstilSegonsEstat(feature, estilMapa) {
    const id = feature.properties.MUNIINE;
    const visitat = (dadesGlobals[usuariActual] || []).includes(id);

    if (estilMapa === 'dark') {
        return {
            fillColor: visitat ? '#00e676' : '#212529',
            color: visitat ? '#00e676' : '#495057',
            weight: 0.6,
            fillOpacity: visitat ? 0.75 : 0.4
        };
    } else if (estilMapa === 'satellite') {
        return {
            fillColor: visitat ? '#00b4d8' : 'transparent',
            color: visitat ? '#90e0ef' : '#ffffff',
            weight: 0.8,
            fillOpacity: visitat ? 0.45 : 0
        };
    } else { // classic
        return {
            fillColor: visitat ? '#2d6a4f' : '#adb5bd',
            color: '#081c15',
            weight: 0.5,
            fillOpacity: visitat ? 0.75 : 0.35
        };
    }
}

function canviarUsuari(nom) {
    usuariActual = nom;
    actualitzarEstilGeoJSON(currentStyle);
}

// --- EXPORTACIÓ I MODAL TARGETA (SOLUCIÓ AL DESPLAÇAMENT EN CANVAS) ---
function calcularEstadistiquesUsuari(usuari) {
    const visitats = dadesGlobals[usuari] || [];
    // Dades d'exemple de les províncies
    return {
        visitatsCount: visitats.length,
        grups: {
            'Alacant': { visitats: 64, total: 141 },
            'Castelló': { visitats: 24, total: 135 },
            'València': { visitats: 92, total: 266 }
        }
    };
}

function obrirModalTargeta() {
    if (!usuariActual) return;

    const stats = calcularEstadistiquesUsuari(usuariActual);
    const totalPct = Math.round((stats.visitatsCount / totalMunicipis) * 100) || 0;

    document.getElementById('card-name').innerText = usuariActual;
    document.getElementById('card-pct').innerText = `${totalPct}%`;
    document.getElementById('card-visited-count').innerText = stats.visitatsCount;
    document.getElementById('card-total-count').innerText = totalMunicipis;

    const provContainer = document.getElementById('card-prov-list');
    provContainer.innerHTML = '';

    Object.keys(stats.grups).sort().forEach(p => {
        const item = stats.grups[p];
        const pct = Math.round((item.visitats / item.total) * 100) || 0;

        const row = document.createElement('div');
        row.className = 'card-prov-row';
        row.innerHTML = `
            <div class="card-prov-info">
                <span>Província de ${p}</span>
                <span>${item.visitats}/${item.total} (${pct}%)</span>
            </div>
            <div class="card-progress-bg">
                <div class="card-progress-fill" style="width: ${pct}%;"></div>
            </div>
        `;
        provContainer.appendChild(row);
    });

    document.getElementById('modal-targeta').classList.remove('hidden');

    // Inicialització del mapa reduït amb Canvas renderer per a evitar errors de html2canvas
    setTimeout(() => {
        if (!miniMap) {
            miniMap = L.map('mini-map', {
                preferCanvas: true, // FORÇA EL USO DE CANVAS EN LLLOC D'SVG
                zoomControl: false,
                attributionControl: false,
                dragging: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                boxZoom: false,
                touchZoom: false
            });
        } else {
            miniMap.invalidateSize();
        }

        if (miniGeojsonLayer) miniMap.removeLayer(miniGeojsonLayer);

        if (totesLesFeatures) {
            miniGeojsonLayer = L.geoJSON(totesLesFeatures, {
                renderer: L.canvas(), // RENDERITZAT CANVAS INDIVIDUAL
                style: function(feature) {
                    const id = feature.properties.MUNIINE;
                    const visitats = dadesGlobals[usuariActual] || [];
                    const estaVisitat = visitats.includes(id);
                    return {
                        fillColor: estaVisitat ? '#74c69d' : '#2d6a4f',
                        weight: 0.5,
                        color: '#081c15',
                        fillOpacity: estaVisitat ? 0.95 : 0.35
                    };
                }
            }).addTo(miniMap);

            miniMap.fitBounds(miniGeojsonLayer.getBounds(), { padding: [5, 5] });
        }
        miniMap.invalidateSize();
    }, 200);
}

function tancarModalTargeta() {
    document.getElementById('modal-targeta').classList.add('hidden');
}

function descarregarImatgeTargeta() {
    const targetaEl = document.getElementById('card-template');

    if (miniMap && miniGeojsonLayer) {
        miniMap.invalidateSize();
        miniMap.fitBounds(miniGeojsonLayer.getBounds(), { padding: [5, 5] });
    }

    html2canvas(targetaEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Pobles_Valencians_${usuariActual}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error("Error en generar la imatge:", err);
        alert("No s'ha pogut generar la imatge.");
    });
}

function obrirEstadistiques() {
    alert("Funció d'Estadístiques");
}

function obrirComparativa() {
    alert("Funció de Comparativa");
}
