// Projecció UTM 30N (EPSG:25830) per als GeoJSON valencians
proj4.defs("EPSG:25830", "+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs");

let map;
let geojsonLayer;
let miniMap;
let miniMapGeojsonLayer;

// Variables globals d'estat
let dadesPobles = null;
let usuariActual = "";
let usuarisGlobals = {};
let contrasenyesGlobals = {};

// Configuració de JSONBin.io
const BIN_ID = "66f7f502ad19ca34f8af4542"; 
const API_KEY = "$2a$10$wT5HlhA8Bw8L7Zc5VvY3leJ0M6N2W7P4q3r1E0/3M2kG2b4u1E1mG"; // Modifica si utilitzes la teua clau

// Capes de Fons
const baseLayers = {
    classic: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }),
    dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; CARTO'
    }),
    sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: '&copy; Esri'
    })
};

let capesActuals = baseLayers.classic;

// Inicialització en carregar la pàgina
document.addEventListener("DOMContentLoaded", () => {
    inicialitzarMapa();
    carregarDadesBin();
});

function inicialitzarMapa() {
    map = L.map('map', {
        center: [39.48, -0.4],
        zoom: 8,
        zoomControl: false,
        layers: [capesActuals]
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Afegir selector personalitzat de capes
    crearControlCapes();
}

function crearControlCapes() {
    const layerControl = L.control({ position: 'bottomleft' });

    layerControl.onAdd = function () {
        const container = L.DomUtil.create('div', 'gmaps-layer-control');
        container.innerHTML = `
            <div class="gmaps-layer-btn" id="gmaps-toggle" title="Canviar vista del mapa">
                <span class="material-symbols-outlined">layers</span>
            </div>
            <div class="gmaps-layer-panel">
                <div class="thumb-option selected" id="opt-classic" onclick="canviarModeMapa('classic')">
                    <div class="thumb-box thumb-classic">
                        <span class="material-symbols-outlined">map</span>
                    </div>
                    <span class="thumb-label">Clàssic</span>
                </div>
                <div class="thumb-option" id="opt-dark" onclick="canviarModeMapa('dark')">
                    <div class="thumb-box thumb-dark">
                        <span class="material-symbols-outlined">dark_mode</span>
                    </div>
                    <span class="thumb-label">Fosc</span>
                </div>
                <div class="thumb-option" id="opt-sat" onclick="canviarModeMapa('sat')">
                    <div class="thumb-box thumb-sat">
                        <span class="material-symbols-outlined">satellite_alt</span>
                    </div>
                    <span class="thumb-label">Satèl·lit</span>
                </div>
            </div>
        `;

        L.DomEvent.disableClickPropagation(container);
        return container;
    };

    layerControl.addTo(map);

    document.addEventListener('click', (e) => {
        const ctrl = document.querySelector('.gmaps-layer-control');
        const btn = document.getElementById('gmaps-toggle');
        if (btn && btn.contains(e.target)) {
            ctrl.classList.toggle('expanded');
        } else if (ctrl && !ctrl.contains(e.target)) {
            ctrl.classList.remove('expanded');
        }
    });
}

function canviarModeMapa(mode) {
    map.removeLayer(capesActuals);
    capesActuals = baseLayers[mode];
    map.addLayer(capesActuals);

    document.querySelectorAll('.thumb-option').forEach(el => el.classList.remove('selected'));
    document.getElementById('opt-' + mode).classList.add('selected');
}

// Carregar dades des de JSONBin
async function carregarDadesBin() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { "X-Master-Key": API_KEY }
        });
        const json = await res.json();
        
        usuarisGlobals = json.record.usuaris || {};
        contrasenyesGlobals = json.record.contrasenyes || {};

        carregarGeoJSON();
    } catch (err) {
        console.error("Error carregant les dades:", err);
    }
}

// Guardar dades a JSONBin
async function guardarDadesBin() {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify({
                usuaris: usuarisGlobals,
                contrasenyes: contrasenyesGlobals
            })
        });
    } catch (err) {
        console.error("Error guardant a JSONBin:", err);
    }
}

// Carregador del fitxer GeoJSON dels municipis
function carregarGeoJSON() {
    fetch('https://raw.githubusercontent.com/michalsn/es-valencia-geojson/master/valencia-municipios.json')
        .then(res => res.json())
        .then(data => {
            dadesPobles = data;
            
            // Re-projectar coordenades UTM a WGS84
            dadesPobles.features.forEach(f => {
                if (f.geometry.type === "Polygon") {
                    f.geometry.coordinates = f.geometry.coordinates.map(ring => 
                        ring.map(coord => proj4("EPSG:25830", "WGS84", coord))
                    );
                } else if (f.geometry.type === "MultiPolygon") {
                    f.geometry.coordinates = f.geometry.coordinates.map(poly => 
                        poly.map(ring => 
                            ring.map(coord => proj4("EPSG:25830", "WGS84", coord))
                        )
                    );
                }
            });

            poblarSelectUsuari();
            obrirModalInicial();
        });
}

function poblarSelectUsuari() {
    const sel = document.getElementById('select-usuari');
    sel.innerHTML = "";
    Object.keys(usuarisGlobals).forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        sel.appendChild(opt);
    });
}

function obrirModalInicial() {
    const cont = document.getElementById('llista-botons-usuaris');
    cont.innerHTML = "";
    
    Object.keys(usuarisGlobals).forEach(u => {
        const btn = document.createElement('button');
        btn.className = 'btn-opcio-usuari';
        btn.textContent = u;
        btn.onclick = () => seleccionarUsuariInicial(u);
        cont.appendChild(btn);
    });

    document.getElementById('modal-inicial').style.display = 'flex';
}

function seleccionarUsuariInicial(u) {
    usuariActual = u;
    document.getElementById('select-usuari').value = u;
    document.getElementById('modal-inicial').style.display = 'none';
    dibuixarMapa();
}

function canviarUsuari() {
    usuariActual = document.getElementById('select-usuari').value;
    dibuixarMapa();
}

function dibuixarMapa() {
    if (geojsonLayer) map.removeLayer(geojsonLayer);

    const llistaVisitats = usuarisGlobals[usuariActual] || [];

    geojsonLayer = L.geoJSON(dadesPobles, {
        style: feature => {
            const nom = feature.properties.name || feature.properties.LAU2_NAME;
            const visitat = llistaVisitats.includes(nom);
            return {
                fillColor: visitat ? '#2d6a4f' : '#ffffff',
                weight: 1,
                opacity: 1,
                color: '#1b4332',
                fillOpacity: visitat ? 0.75 : 0.2
            };
        },
        onEachFeature: (feature, layer) => {
            const nom = feature.properties.name || feature.properties.LAU2_NAME;
            layer.bindTooltip(nom, { className: 'etiqueta-municipi', permanent: false, direction: 'center' });

            layer.on('click', () => toggleMunicipi(nom));
        }
    }).addTo(map);

    actualitzarComptador();
}

function toggleMunicipi(nom) {
    if (!usuarisGlobals[usuariActual]) usuarisGlobals[usuariActual] = [];
    
    const idx = usuarisGlobals[usuariActual].indexOf(nom);
    if (idx >= 0) {
        usuarisGlobals[usuariActual].splice(idx, 1);
    } else {
        usuarisGlobals[usuariActual].push(nom);
    }

    dibuixarMapa();
    guardarDadesBin();
}

function actualitzarComptador() {
    const total = dadesPobles.features.length;
    const visitats = (usuarisGlobals[usuariActual] || []).length;
    document.getElementById('comptador').textContent = `${visitats}/${total} pobles`;
}

// Modals Nou Usuari
function obrirModalNouUsuari() {
    document.getElementById('modal-nou-usuari').style.display = 'flex';
}
function tancarModalNouUsuari() {
    document.getElementById('modal-nou-usuari').style.display = 'none';
}
function crearUsuari() {
    const nom = document.getElementById('input-nom-nou').value.trim();
    const pass = document.getElementById('input-pass-nou').value.trim();

    if (!nom) return alert("Introdueix un nom!");

    if (!usuarisGlobals[nom]) {
        usuarisGlobals[nom] = [];
        contrasenyesGlobals[nom] = pass || "1234";
        guardarDadesBin();
    }

    poblarSelectUsuari();
    seleccionarUsuariInicial(nom);
    tancarModalNouUsuari();
}

// Modal Estadístiques
function obrirModalEstadistiques() {
    const cont = document.getElementById('contenidor-stats');
    cont.innerHTML = "";

    const provs = {
        "Província d'Alacant": { visitats: 0, total: 0 },
        "Província de Castelló": { visitats: 0, total: 0 },
        "Província de València": { visitats: 0, total: 0 }
    };

    const visitats = usuarisGlobals[usuariActual] || [];

    dadesPobles.features.forEach(f => {
        const nomProv = f.properties.provincia || f.properties.PROV_NAME || "Província de València";
        let clau = "Província de València";
        if (nomProv.includes("Alacant") || nomProv.includes("Alicante")) clau = "Província d'Alacant";
        if (nomProv.includes("Castelló") || nomProv.includes("Castellón")) clau = "Província de Castelló";

        provs[clau].total++;
        const nomPoble = f.properties.name || f.properties.LAU2_NAME;
        if (visitats.includes(nomPoble)) provs[clau].visitats++;
    });

    Object.keys(provs).forEach(p => {
        const pct = Math.round((provs[p].visitats / (provs[p].total || 1)) * 100);
        cont.innerHTML += `
            <div class="stat-card">
                <div class="stat-header">
                    <span>${p}</span>
                    <span>${provs[p].visitats}/${provs[p].total} (${pct}%)</span>
                </div>
                <div class="progress-bg">
                    <div class="progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>
        `;
    });

    document.getElementById('modal-estadistiques').style.display = 'flex';
}
function tancarModalEstadistiques() {
    document.getElementById('modal-estadistiques').style.display = 'none';
}

// Modal Comparativa
function obrirModalComparativa() {
    const s1 = document.getElementById('comparar-1');
    const s2 = document.getElementById('comparar-2');
    s1.innerHTML = ""; s2.innerHTML = "";

    Object.keys(usuarisGlobals).forEach(u => {
        s1.innerHTML += `<option value="${u}">${u}</option>`;
        s2.innerHTML += `<option value="${u}">${u}</option>`;
    });

    document.getElementById('modal-comparativa').style.display = 'flex';
}
function eixirComparativa() {
    document.getElementById('modal-comparativa').style.display = 'none';
    dibuixarMapa();
}
function aplicarComparativa() {
    const u1 = document.getElementById('comparar-1').value;
    const u2 = document.getElementById('comparar-2').value;

    const list1 = usuarisGlobals[u1] || [];
    const list2 = usuarisGlobals[u2] || [];

    if (geojsonLayer) map.removeLayer(geojsonLayer);

    geojsonLayer = L.geoJSON(dadesPobles, {
        style: feature => {
            const nom = feature.properties.name || feature.properties.LAU2_NAME;
            const in1 = list1.includes(nom);
            const in2 = list2.includes(nom);

            let color = '#ffffff';
            let fillOp = 0.2;

            if (in1 && in2) { color = '#9b59b6'; fillOp = 0.8; } // Ambdues (Lila)
            else if (in1) { color = '#3498db'; fillOp = 0.75; }   // Solment U1 (Blau)
            else if (in2) { color = '#e67e22'; fillOp = 0.75; }   // Solment U2 (Taronja)

            return { fillColor: color, weight: 1, opacity: 1, color: '#1b4332', fillOpacity: fillOp };
        }
    }).addTo(map);

    document.getElementById('modal-comparativa').style.display = 'none';
}

// Targeta PNG i Canvi de Tema
function canviarTemaTargeta(tema) {
    const card = document.getElementById('card-template');
    card.className = 'theme-' + tema;
}

function obrirModalTargeta() {
    document.getElementById('modal-targeta').style.display = 'flex';
    document.getElementById('card-name').textContent = usuariActual;

    const visitats = usuarisGlobals[usuariActual] || [];
    const total = dadesPobles.features.length;
    const pctGlobal = Math.round((visitats.length / total) * 100);

    document.getElementById('card-pct').textContent = pctGlobal + "%";
    document.getElementById('card-visited-count').textContent = visitats.length;
    document.getElementById('card-total-count').textContent = total;

    // Poblar llista províncies amb la correcció "Província d'Alacant"
    const provs = {
        "Província d'Alacant": { visitats: 0, total: 0 },
        "Província de Castelló": { visitats: 0, total: 0 },
        "Província de València": { visitats: 0, total: 0 }
    };

    dadesPobles.features.forEach(f => {
        const nomProv = f.properties.provincia || f.properties.PROV_NAME || "Província de València";
        let clau = "Província de València";
        if (nomProv.includes("Alacant") || nomProv.includes("Alicante")) clau = "Província d'Alacant";
        if (nomProv.includes("Castelló") || nomProv.includes("Castellón")) clau = "Província de Castelló";

        provs[clau].total++;
        const nomPoble = f.properties.name || f.properties.LAU2_NAME;
        if (visitats.includes(nomPoble)) provs[clau].visitats++;
    });

    const cont = document.getElementById('card-prov-list');
    cont.innerHTML = "";
    Object.keys(provs).forEach(p => {
        const pct = Math.round((provs[p].visitats / (provs[p].total || 1)) * 100);
        cont.innerHTML += `
            <div class="card-prov-row">
                <div class="card-prov-info">
                    <span>${p}</span>
                    <span>${provs[p].visitats}/${provs[p].total} (${pct}%)</span>
                </div>
                <div class="card-progress-bg">
                    <div class="card-progress-fill" style="width: ${pct}%;"></div>
                </div>
            </div>
        `;
    });

    setTimeout(generarMiniMapaTargeta, 150);
}

function generarMiniMapaTargeta() {
    if (miniMap) miniMap.remove();

    miniMap = L.map('mini-map', {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        attributionControl: false
    });

    const llistaVisitats = usuarisGlobals[usuariActual] || [];

    miniMapGeojsonLayer = L.geoJSON(dadesPobles, {
        style: feature => {
            const nom = feature.properties.name || feature.properties.LAU2_NAME;
            const visitat = llistaVisitats.includes(nom);
            return {
                fillColor: visitat ? '#74c69d' : 'transparent',
                weight: 0.5,
                color: 'rgba(255,255,255,0.4)',
                fillOpacity: visitat ? 0.85 : 0
            };
        }
    }).addTo(miniMap);

    miniMap.fitBounds(miniMapGeojsonLayer.getBounds(), { padding: [2, 2] });
}

function tancarModalTargeta() {
    document.getElementById('modal-targeta').style.display = 'none';
}

function descarregarImatgeTargeta() {
    const card = document.getElementById('card-template');
    html2canvas(card, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `pobles-${usuariActual}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
