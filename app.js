const BIN_ID = '6a8c3388da38895dfe0a5a39';
const ACCESS_KEY = '$2a$10$jGdGOrUpfifAwZbmhlw1s.H4vmk5XN1Iz7d1DWMsCem.iDNynZmKq';

// Definició de la projecció UTM per al GeoJSON
proj4.defs("EPSG:25830", "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

// Inicialització del mapa principal
const map = L.map('map').setView([39.48, -0.37], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);

// Variables globals d'estat
let usuariActual = null;
let dadesGlobals = { "Josep": [], "Mariona": [], "Altres": [] };
let contrasenyesGlobals = { "Josep": "1", "Mariona": "2", "Altres": "3" };

let geojsonLayer = null;
let totesLesFeatures = [];
let totalMunicipis = 0;
let modeComparacio = false;
let dadesComparacio = null;
let autoritzatPerEditar = false;

let miniMap = null;
let miniGeojsonLayer = null;

// Elements DOM
const selectEl = document.getElementById('select-usuari');
const selectC1 = document.getElementById('comparar-1');
const selectC2 = document.getElementById('comparar-2');
const contenidorBotonsInicials = document.getElementById('llista-botons-usuaris');

function actualitzarDesplegablesIInterficie() {
    selectEl.innerHTML = '';
    selectC1.innerHTML = '';
    selectC2.innerHTML = '';
    contenidorBotonsInicials.innerHTML = '';

    const llistaNoms = Object.keys(contrasenyesGlobals);

    llistaNoms.forEach(nom => {
        selectEl.add(new Option(nom, nom));
        selectC1.add(new Option(nom, nom));
        selectC2.add(new Option(nom, nom));

        const btn = document.createElement('button');
        btn.className = 'btn btn-opcio-usuari';
        btn.innerText = nom;
        btn.onclick = () => triarUsuariInicial(nom);
        contenidorBotonsInicials.appendChild(btn);
    });

    if (llistaNoms.length > 1) selectC2.value = llistaNoms[1];
    if (usuariActual) selectEl.value = usuariActual;
}

function triarUsuariInicial(nom) {
    usuariActual = nom;
    selectEl.value = nom;
    autoritzatPerEditar = false;
    document.getElementById('modal-inicial').style.display = 'none';
    actualitzarMapa();
}

function obrirModalNouUsuari() {
    document.getElementById('input-nom-nou').value = '';
    document.getElementById('input-pass-nou').value = '';
    document.getElementById('modal-nou-usuari').style.display = 'flex';
}

function tancarModalNouUsuari() {
    document.getElementById('modal-nou-usuari').style.display = 'none';
}

function crearUsuari() {
    const nom = document.getElementById('input-nom-nou').value.trim();
    const pass = document.getElementById('input-pass-nou').value.trim();

    if (!nom || !pass) {
        alert("Has d'omplir el nom i la contrasenya.");
        return;
    }

    if (contrasenyesGlobals[nom]) {
        alert("Ja existeix un usuari amb aquest nom.");
        return;
    }

    contrasenyesGlobals[nom] = pass;
    dadesGlobals[nom] = [];
    autoritzatPerEditar = true;

    actualitzarDesplegablesIInterficie();
    tancarModalNouUsuari();
    
    usuariActual = nom;
    selectEl.value = nom;
    document.getElementById('modal-inicial').style.display = 'none';

    actualitzarMapa();
    guardarDadesNuvol();
}

function controlarVisibilitatNoms() {
    const mapContainer = document.getElementById('map');
    if (map.getZoom() >= 11) mapContainer.classList.add('mostrar-noms');
    else mapContainer.classList.remove('mostrar-noms');
}
map.on('zoomend', controlarVisibilitatNoms);

function carregarDadesNuvol() {
    document.getElementById('comptador').innerText = "Sincronitzant amb el núvol...";
    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Access-Key': ACCESS_KEY }
    })
    .then(res => res.json())
    .then(data => {
        const rec = data.record || {};
        
        if (rec.pobles) {
            dadesGlobals = rec.pobles;
            contrasenyesGlobals = rec.contrasenyes || contrasenyesGlobals;
        } else {
            dadesGlobals = rec;
        }

        actualitzarDesplegablesIInterficie();
        if (usuariActual) actualitzarMapa();
    })
    .catch(err => {
        console.error("Error carregant dades:", err);
        document.getElementById('comptador').innerText = "Error en connectar al núvol";
    });
}

function guardarDadesNuvol() {
    document.getElementById('comptador').innerText = "Guardant canvis...";
    
    const payload = {
        pobles: dadesGlobals,
        contrasenyes: contrasenyesGlobals
    };

    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': ACCESS_KEY
        },
        body: JSON.stringify(payload)
    })
    .then(() => actualitzarComptador())
    .catch(err => console.error("Error guardant:", err));
}

function canviarUsuari() {
    modeComparacio = false;
    usuariActual = selectEl.value;
    autoritzatPerEditar = false;
    actualitzarMapa();
}

function getProvinciaNom(ine) {
    const code = String(ine).padStart(5, '0').substring(0, 2);
    if (code === '03') return 'Alacant';
    if (code === '12') return 'Castelló';
    if (code === '46') return 'València';
    return 'Altres';
}

function calcularEstadistiquesUsuari(nom) {
    const visitats = dadesGlobals[nom] || [];
    const grups = {};

    totesLesFeatures.forEach(f => {
        const id = f.properties.MUNIINE;
        const prov = getProvinciaNom(id);

        if (!grups[prov]) grups[prov] = { total: 0, visitats: 0 };
        grups[prov].total++;
        if (visitats.includes(id)) grups[prov].visitats++;
    });

    return { visitatsCount: visitats.length, grups };
}

/* ----- TARGETA PNG AMB MAPA INTEGRAT ----- */
function obrirModalTargeta() {
    if (!usuariActual) {
        alert("Selecciona primer un usuari.");
        return;
    }

    const stats = calcularEstadistiquesUsuari(usuariActual);
    const totalPct = Math.round((stats.visitatsCount / totalMunicipis) * 100) || 0;

    document.getElementById('card-name').innerText = usuariActual;
    document.getElementById('card-pct').innerText = `${totalPct}%`;
    document.getElementById('card-visited-count').innerText = stats.visitatsCount;
    document.getElementById('card-total-count').innerText = totalMunicipis;

    const provContainer = document.getElementById('card-prov-list');
    provContainer.innerHTML = '';

    const provs = Object.keys(stats.grups).sort();
    provs.forEach(p => {
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

    document.getElementById('modal-targeta').style.display = 'flex';

    setTimeout(() => {
        if (!miniMap) {
            miniMap = L.map('mini-map', {
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

        miniGeojsonLayer = L.geoJSON(totesLesFeatures, {
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
        miniMap.invalidateSize();
    }, 200);
}

function tancarModalTargeta() {
    document.getElementById('modal-targeta').style.display = 'none';
}

function descarregarImatgeTargeta() {
    const targetaEl = document.getElementById('card-template');

    html2canvas(targetaEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
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

/* ----- ESTADÍSTIQUES ----- */
function obrirModalEstadistiques() {
    if (!usuariActual) {
        alert("Selecciona primer un usuari.");
        return;
    }
    document.getElementById('titol-estadistiques').innerText = `Estadístiques de ${usuariActual}`;
    document.getElementById('modal-estadistiques').style.display = 'flex';
    renderitzarEstadistiques();
}

function tancarModalEstadistiques() {
    document.getElementById('modal-estadistiques').style.display = 'none';
}

function renderitzarEstadistiques() {
    const stats = calcularEstadistiquesUsuari(usuariActual);
    const contenidor = document.getElementById('contenidor-stats');
    contenidor.innerHTML = '';

    const clausOrdenades = Object.keys(stats.grups).sort();

    clausOrdenades.forEach(clau => {
        const item = stats.grups[clau];
        const pct = Math.round((item.visitats / item.total) * 100) || 0;

        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="stat-header">
                <span>Província de ${clau}</span>
                <span>${item.visitats} / ${item.total} (${pct}%)</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill" style="width: ${pct}%;"></div>
            </div>
        `;
        contenidor.appendChild(card);
    });
}

/* ----- COMPARATIVA ----- */
function obrirModalComparativa() {
    document.getElementById('modal-comparativa').style.display = 'flex';
    document.getElementById('resultats-comparativa').innerHTML = '';
}

function eixirComparativa() {
    document.getElementById('modal-comparativa').style.display = 'none';
    if (modeComparacio) {
        modeComparacio = false;
        actualitzarMapa();
    }
}

function aplicarComparativa() {
    const nom1 = selectC1.value;
    const nom2 = selectC2.value;

    if (nom1 === nom2) {
        alert("Has de seleccionar dos usuaris diferents.");
        return;
    }

    const arr1 = dadesGlobals[nom1] || [];
    const arr2 = dadesGlobals[nom2] || [];

    const comu = arr1.filter(id => arr2.includes(id));
    const sols1 = arr1.filter(id => !arr2.includes(id));
    const sols2 = arr2.filter(id => !arr1.includes(id));

    dadesComparacio = { nom1, nom2, comu, sols1, sols2 };
    modeComparacio = true;

    document.getElementById('resultats-comparativa').innerHTML = `
        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #ddd; line-height: 1.8;">
            <div><span class="color-box" style="background: #2d6a4f;"></span> <b>En comú:</b> ${comu.length} pobles</div>
            <div><span class="color-box" style="background: #3a86ff;"></span> <b>Només ${nom1}:</b> ${sols1.length} pobles</div>
            <div><span class="color-box" style="background: #fb8500;"></span> <b>Només ${nom2}:</b> ${sols2.length} pobles</div>
        </div>
    `;

    if (geojsonLayer) geojsonLayer.setStyle(obtenirEstil);
    document.getElementById('comptador').innerHTML = 
        `Comparant: <span style="color: #4cc9f0; font-weight: bold;">■ ${nom1}</span> vs <span style="color: #ffb703; font-weight: bold;">■ ${nom2}</span> | En comú: ${comu.length}`;
    
    document.getElementById('modal-comparativa').style.display = 'none';
}

function obtenirEstil(feature) {
    const id = feature.properties.MUNIINE;

    if (modeComparacio && dadesComparacio) {
        if (dadesComparacio.comu.includes(id)) return { fillColor: '#2d6a4f', weight: 1, color: '#fff', fillOpacity: 0.8 };
        if (dadesComparacio.sols1.includes(id)) return { fillColor: '#3a86ff', weight: 1, color: '#fff', fillOpacity: 0.75 };
        if (dadesComparacio.sols2.includes(id)) return { fillColor: '#fb8500', weight: 1, color: '#fff', fillOpacity: 0.75 };
        return { fillColor: '#adb5bd', weight: 1, color: '#fff', fillOpacity: 0.3 };
    } else {
        const visitats = usuariActual ? (dadesGlobals[usuariActual] || []) : [];
        const estaVisitat = visitats.includes(id);
        return {
            fillColor: estaVisitat ? '#2d6a4f' : '#adb5bd',
            weight: 1, opacity: 1, color: '#ffffff',
            fillOpacity: estaVisitat ? 0.75 : 0.4
        };
    }
}

function actualitzarComptador() {
    if (!modeComparacio && usuariActual) {
        const visitats = dadesGlobals[usuariActual] || [];
        document.getElementById('comptador').innerText = `${usuariActual} ha visitat ${visitats.length} de ${totalMunicipis} pobles`;
    }
}

function actualitzarMapa() {
    if (geojsonLayer) geojsonLayer.setStyle(obtenirEstil);
    actualitzarComptador();
}

function reprojectarCoordenades(coords) {
    if (typeof coords[0] === 'number') return proj4("EPSG:25830", "EPSG:4326", coords);
    return coords.map(reprojectarCoordenades);
}

// Carregar GeoJSON de la Comunitat Valenciana
fetch('ca_municipios_20260805.geojson')
    .then(res => res.json())
    .then(data => {
        data.features.forEach(f => f.geometry.coordinates = reprojectarCoordenades(f.geometry.coordinates));
        totesLesFeatures = data.features;
        totalMunicipis = data.features.length;

        geojsonLayer = L.geoJSON(data, {
            style: obtenirEstil,
            onEachFeature: function(feature, layer) {
                const id = feature.properties.MUNIINE;
                const nom = feature.properties.NOMBRE;

                layer.bindTooltip(nom, {
                    permanent: true,
                    direction: 'center',
                    className: 'etiqueta-municipi'
                });

                layer.on('click', () => {
                    if (modeComparacio || !usuariActual) return;

                    if (!autoritzatPerEditar) {
                        const passIngressada = prompt(`Introdueix el codi de seguretat de ${usuariActual} per a poder editar:`);
                        if (passIngressada === null) return;
                        
                        if (passIngressada === contrasenyesGlobals[usuariActual]) {
                            autoritzatPerEditar = true;
                        } else {
                            alert("Codi incorrecte. No pots modificar el mapa d'aquesta persona.");
                            return;
                        }
                    }
                    
                    if (!dadesGlobals[usuariActual]) dadesGlobals[usuariActual] = [];
                    let list = dadesGlobals[usuariActual];

                    if (list.includes(id)) {
                        dadesGlobals[usuariActual] = list.filter(item => item !== id);
                    } else {
                        dadesGlobals[usuariActual].push(id);
                    }

                    actualitzarMapa();
                    guardarDadesNuvol();
                });
            }
        }).addTo(map);

        map.fitBounds(geojsonLayer.getBounds());
        carregarDadesNuvol();
        controlarVisibilitatNoms();
    });