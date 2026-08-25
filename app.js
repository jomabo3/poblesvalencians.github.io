const BIN_ID = '6a8c3388da38895dfe0a5a39';
const ACCESS_KEY = '$2a$10$jGdGOrUpfifAwZbmhlw1s.H4vmk5XN1Iz7d1DWMsCem.iDNynZmKq';

proj4.defs("EPSG:25830", "+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

const map = L.map('map', { zoomControl: false }).setView([39.48, -0.37], 8);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// Capes base millorades i estables
const layers = {
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

let modeActual = 'classic';
layers.classic.addTo(map);

// MAPEO DE MUNICIPIS (MUNIINE / CODIGO) A COMARCA
const mapaComarquesINE = {
    // CASTELLÓ
    '12001': 'El Els Ports', '12002': 'El Alt Maestrat', '12003': 'La Plana Alta', '12004': 'La Plana Alta', '12005': 'El Baix Maestrat',
    '12006': 'El Baix Maestrat', '12007': 'La Plana Baixa', '12008': 'La Plana Baixa', '12009': 'La Plana Baixa', '12010': 'L\'Alcalatén',
    '12011': 'La Plana Baixa', '12012': 'La Plana Baixa', '12013': 'L\'Alcalatén', '12014': 'El Baix Maestrat', '12015': 'L\'Alt Palància',
    '12016': 'El Baix Maestrat', '12017': 'El Baix Maestrat', '12018': 'El Alt Maestrat', '12019': 'L\'Alt Palància', '12020': 'La Plana Alta',
    '12021': 'La Plana Baixa', '12022': 'El Els Ports', '12023': 'La Plana Baixa', '12024': 'El Baix Maestrat', '12025': 'L\'Alt Palància',
    '12026': 'L\'Alt Palància', '12027': 'El Baix Maestrat', '12028': 'La Plana Alta', '12029': 'L\'Alt Palància', '12031': 'El Alt Maestrat',
    '12032': 'El Els Ports', '12033': 'L\'Alt Palància', '12034': 'El Els Ports', '12035': 'L\'Alt Palància', '12036': 'El Els Ports',
    '12037': 'El Alt Maestrat', '12038': 'L\'Alt Palància', '12039': 'L\'Alt Palància', '12040': 'La Plana Alta', '12041': 'L\'Alt Palància',
    '12042': 'La Plana Baixa', '12043': 'El Baix Maestrat', '12044': 'El Els Ports', '12045': 'L\'Alcalatén', '12046': 'L\'Alt Palància',
    '12047': 'L\'Alt Millars', '12048': 'L\'Alt Millars', '12049': 'L\'Alt Millars', '12050': 'L\'Alt Millars', '12051': 'L\'Alt Millars',
    '12052': 'L\'Alt Millars', '12053': 'L\'Alt Millars', '12055': 'L\'Alt Millars', '12056': 'L\'Alt Millars', '12057': 'L\'Alt Millars',
    '12058': 'L\'Alt Millars', '12059': 'L\'Alt Millars', '12060': 'L\'Alt Millars', '12061': 'L\'Alt Millars', '12062': 'L\'Alt Millars',
    '12063': 'L\'Alt Millars', '12064': 'L\'Alt Millars', '12065': 'L\'Alt Millars', '12067': 'L\'Alt Millars', '12068': 'L\'Alt Millars',
    '12069': 'L\'Alt Millars', '12070': 'L\'Alt Millars', '12071': 'L\'Alt Millars', '12072': 'El Els Ports', '12073': 'La Plana Baixa',
    '12074': 'La Plana Baixa', '12075': 'L\'Alt Palància', '12076': 'L\'Alt Palància', '12077': 'La Plana Baixa', '12078': 'L\'Alt Palància',
    '12079': 'El Els Ports', '12080': 'El Els Ports', '12081': 'El Baix Maestrat', '12082': 'L\'Alcalatén', '12083': 'El Baix Maestrat',
    '12084': 'La Plana Alta', '12085': 'La Plana Alta', '12086': 'L\'Alt Palància', '12087': 'L\'Alt Palància', '12088': 'El Baix Maestrat',
    '12089': 'El Baix Maestrat', '12090': 'L\'Alt Palància', '12091': 'La Plana Baixa', '12092': 'El Baix Maestrat', '12093': 'El Baix Maestrat',
    '12094': 'La Plana Alta', '12095': 'La Plana Baixa', '12096': 'El Baix Maestrat', '12097': 'La Plana Baixa', '12098': 'El Alt Maestrat',
    '12099': 'L\'Alcalatén', '12100': 'El Els Ports', '12101': 'La Plana Baixa', '12102': 'L\'Alt Palància', '12103': 'L\'Alt Palància',
    '12104': 'La Plana Baixa', '12105': 'La Plana Alta', '12106': 'La Plana Baixa', '12107': 'La Plana Alta', '12108': 'La Plana Baixa',
    '12109': 'El Alt Maestrat', '12110': 'L\'Alcalatén', '12111': 'El Els Ports', '12112': 'L\'Alt Palància', '12113': 'El Baix Maestrat',
    '12114': 'L\'Alcalatén', '12115': 'L\'Alt Palància', '12116': 'L\'Alcalatén', '12117': 'La Plana Alta', '12118': 'El Baix Maestrat',
    '12119': 'La Plana Baixa', '12120': 'El Els Ports', '12121': 'El Els Ports', '12122': 'L\'Alt Palància', '12123': 'La Plana Baixa',
    '12124': 'La Plana Alta', '12125': 'L\'Alcalatén', '12126': 'La Plana Baixa', '12127': 'El Baix Maestrat', '12128': 'La Plana Baixa',
    '12129': 'El Els Ports', '12130': 'L\'Alt Palància', '12131': 'El Baix Maestrat', '12132': 'L\'Alt Palància', '12133': 'El Els Ports',
    '12134': 'L\'Alt Palància', '12135': 'La Plana Baixa', '12136': 'El Els Ports', '12137': 'El Els Ports', '12138': 'El Els Ports',
    '12139': 'El Alt Maestrat', '12140': 'L\'Alt Palància', '12141': 'L\'Alt Palància', '12142': 'L\'Alcalatén',

    // VALÈNCIA
    '46001': 'El Camp de Túria', '46002': 'El Rincón de Ademuz', '46003': 'La Safor', '46004': 'El Camp de Morvedre', '46005': 'La Ribera Alta',
    '46006': 'La Vall d\'Albaida', '46007': 'La Safor', '46008': 'La Vall d\'Albaida', '46009': 'La Vall d\'Albaida', '46010': 'La Costera',
    '46011': 'La Serrania', '46012': 'La Safor', '46013': 'La Vall d\'Albaida', '46014': 'La Ribera Alta', '46015': 'La Ribera Alta',
    '46016': 'La Ribera Alta', '46017': 'La Ribera Alta', '46018': 'La Vall d\'Albaida', '46019': 'La Vall d\'Albaida', '46020': 'La Ribera Alta',
    '46021': 'El Rincón de Ademuz', '46022': 'La Serrania', '46023': 'La Safor', '46024': 'La Vall d\'Albaida', '46025': 'L\'Horta Nord',
    '46026': 'La Safor', '46027': 'La Ribera Alta', '46028': 'La Serrania', '46029': 'La Safor', '46030': 'La Ribera Alta',
    '46031': 'La Serrania', '46032': 'El Camp de Morvedre', '46033': 'La Serrania', '46034': 'La Vall d\'Albaida', '46035': 'La Ribera Alta',
    '46036': 'L\'Horta Sud', '46037': 'La Costera', '46038': 'L\'Horta Sud', '46039': 'L\'Horta Sud', '46040': 'La Serrania',
    '46041': 'L\'Horta Sud', '46042': 'La Serrania', '46043': 'La Vall d\'Albaida', '46044': 'La Safor', '46045': 'La Vall d\'Albaida',
    '46046': 'La Vall d\'Albaida', '46047': 'La Safor', '46048': 'La Costera', '46049': 'La Vall d\'Albaida', '46050': 'La Safor',
    '46051': 'La Ribera Alta', '46052': 'La Vall d\'Albaida', '46053': 'La Ribera Alta', '46054': 'L\'Horta Sud', '46055': 'La Vall d\'Albaida',
    '46056': 'La Serrania', '46057': 'La Vall d\'Albaida', '46058': 'La Costera', '46059': 'La Vall d\'Albaida', '46060': 'La Serrania',
    '46061': 'La Vall d\'Albaida', '46062': 'La Vall d\'Albaida', '46063': 'La Costera', '46064': 'L\'Horta Sud', '46065': 'L\'Horta Nord',
    '46066': 'La Vall d\'Albaida', '46067': 'La Ribera Baixa', '46068': 'La Safor', '46069': 'La Vall d\'Albaida', '46070': 'La Vall d\'Albaida',
    '46071': 'La Serrania', '46072': 'La Safor', '46073': 'La Safor', '46074': 'La Vall d\'Albaida', '46075': 'La Costera',
    '46076': 'La Ribera Alta', '46077': 'La Ribera Alta', '46078': 'La Vall d\'Albaida', '46079': 'La Vall d\'Albaida', '46080': 'La Vall d\'Albaida',
    '46081': 'La Ribera Alta', '46082': 'La Vall d\'Albaida', '46083': 'La Vall d\'Albaida', '46084': 'La Vall d\'Albaida', '46085': 'La Costera',
    '46086': 'La Vall d\'Albaida', '46087': 'El Rincón de Ademuz', '46088': 'La Serrania', '46089': 'La Ribera Alta', '46090': 'El Camp de Morvedre',
    '46091': 'L\'Horta Nord', '46092': 'La Canal de Navarrés', '46093': 'La Serrania', '46094': 'L\'Horta Sud', '46095': 'La Vall d\'Albaida',
    '46096': 'La Vall d\'Albaida', '46097': 'La Canal de Navarrés', '46098': 'La Canal de Navarrés', '46099': 'La Canal de Navarrés', '46100': 'La Vall d\'Albaida',
    '46101': 'La Costera', '46102': 'L\'Horta Nord', '46103': 'L\'Horta Nord', '46104': 'La Vall d\'Albaida', '46105': 'La Vall d\'Albaida',
    '46106': 'La Canal de Navarrés', '46107': 'La Ribera Baixa', '46108': 'La Vall d\'Albaida', '46109': 'La Vall d\'Albaida', '46110': 'La Vall d\'Albaida',
    '46111': 'La Vall d\'Albaida', '46112': 'La Vall d\'Albaida', '46113': 'La Vall d\'Albaida', '46114': 'La Vall d\'Albaida', '46115': 'La Vall d\'Albaida',
    '46116': 'La Vall d\'Albaida', '46117': 'La Vall d\'Albaida', '46118': 'La Vall d\'Albaida', '46119': 'La Vall d\'Albaida', '46120': 'La Vall d\'Albaida',
    '46121': 'La Vall d\'Albaida', '46122': 'La Vall d\'Albaida', '46123': 'La Vall d\'Albaida', '46124': 'La Vall d\'Albaida', '46125': 'La Safor',
    '46126': 'La Vall d\'Albaida', '46127': 'La Vall d\'Albaida', '46128': 'La Vall d\'Albaida', '46129': 'La Vall d\'Albaida', '46130': 'La Vall d\'Albaida',
    '46131': 'La Vall d\'Albaida', '46132': 'La Vall d\'Albaida', '46133': 'La Vall d\'Albaida', '46134': 'La Vall d\'Albaida', '46135': 'La Vall d\'Albaida',
    '46136': 'La Vall d\'Albaida', '46137': 'La Vall d\'Albaida', '46138': 'La Vall d\'Albaida', '46139': 'La Vall d\'Albaida', '46140': 'La Vall d\'Albaida',
    '46141': 'La Vall d\'Albaida', '46142': 'La Vall d\'Albaida', '46143': 'La Vall d\'Albaida', '46144': 'La Vall d\'Albaida', '46145': 'La Vall d\'Albaida',
    '46146': 'La Vall d\'Albaida', '46147': 'La Vall d\'Albaida', '46148': 'La Vall d\'Albaida', '46149': 'La Vall d\'Albaida', '46150': 'La Vall d\'Albaida',
    '46151': 'La Vall d\'Albaida', '46152': 'La Vall d\'Albaida', '46153': 'La Vall d\'Albaida', '46154': 'La Vall d\'Albaida', '46155': 'La Vall d\'Albaida',
    '46156': 'La Vall d\'Albaida', '46157': 'La Vall d\'Albaida', '46158': 'La Vall d\'Albaida', '46159': 'La Vall d\'Albaida', '46160': 'La Vall d\'Albaida',
    '46161': 'La Vall d\'Albaida', '46162': 'La Vall d\'Albaida', '46163': 'La Vall d\'Albaida', '46164': 'La Vall d\'Albaida', '46165': 'La Vall d\'Albaida',
    '46166': 'La Vall d\'Albaida', '46167': 'La Vall d\'Albaida', '46168': 'La Vall d\'Albaida', '46169': 'La Vall d\'Albaida', '46170': 'La Vall d\'Albaida',
    '46171': 'La Vall d\'Albaida', '46172': 'La Vall d\'Albaida', '46173': 'La Vall d\'Albaida', '46174': 'La Vall d\'Albaida', '46175': 'La Vall d\'Albaida',
    '46176': 'La Vall d\'Albaida', '46177': 'La Vall d\'Albaida', '46178': 'La Vall d\'Albaida', '46179': 'La Vall d\'Albaida', '46180': 'La Vall d\'Albaida',
    '46181': 'La Vall d\'Albaida', '46182': 'La Vall d\'Albaida', '46183': 'La Vall d\'Albaida', '46184': 'La Vall d\'Albaida', '46185': 'La Vall d\'Albaida',
    '46186': 'La Vall d\'Albaida', '46187': 'La Vall d\'Albaida', '46188': 'La Vall d\'Albaida', '46189': 'La Vall d\'Albaida', '46190': 'La Vall d\'Albaida',
    '46191': 'La Vall d\'Albaida', '46192': 'La Vall d\'Albaida', '46193': 'La Vall d\'Albaida', '46194': 'La Vall d\'Albaida', '46195': 'La Vall d\'Albaida',
    '46196': 'La Vall d\'Albaida', '46197': 'La Vall d\'Albaida', '46198': 'La Vall d\'Albaida', '46199': 'La Vall d\'Albaida', '46200': 'La Vall d\'Albaida',
    '46201': 'La Vall d\'Albaida', '46202': 'La Vall d\'Albaida', '46203': 'La Vall d\'Albaida', '46204': 'La Vall d\'Albaida', '46205': 'La Vall d\'Albaida',
    '46206': 'La Vall d\'Albaida', '46207': 'La Vall d\'Albaida', '46208': 'La Vall d\'Albaida', '46209': 'La Vall d\'Albaida', '46210': 'La Vall d\'Albaida',
    '46211': 'La Vall d\'Albaida', '46212': 'La Vall d\'Albaida', '46213': 'La Vall d\'Albaida', '46214': 'La Vall d\'Albaida', '46215': 'La Vall d\'Albaida',
    '46216': 'La Vall d\'Albaida', '46217': 'La Vall d\'Albaida', '46218': 'La Vall d\'Albaida', '46219': 'La Vall d\'Albaida', '46220': 'La Vall d\'Albaida',
    '46221': 'La Vall d\'Albaida', '46222': 'La Vall d\'Albaida', '46223': 'La Vall d\'Albaida', '46224': 'La Vall d\'Albaida', '46225': 'La Vall d\'Albaida',
    '46226': 'La Vall d\'Albaida', '46227': 'La Vall d\'Albaida', '46228': 'La Vall d\'Albaida', '46229': 'La Vall d\'Albaida', '46230': 'La Vall d\'Albaida',
    '46231': 'La Vall d\'Albaida', '46232': 'La Vall d\'Albaida', '46233': 'La Vall d\'Albaida', '46234': 'La Vall d\'Albaida', '46235': 'La Vall d\'Albaida',
    '46236': 'La Vall d\'Albaida', '46237': 'La Vall d\'Albaida', '46238': 'La Vall d\'Albaida', '46239': 'La Vall d\'Albaida', '46240': 'La Vall d\'Albaida',
    '46241': 'La Vall d\'Albaida', '46242': 'La Vall d\'Albaida', '46243': 'La Vall d\'Albaida', '46244': 'La Vall d\'Albaida', '46245': 'La Vall d\'Albaida',
    '46246': 'La Vall d\'Albaida', '46247': 'La Vall d\'Albaida', '46248': 'La Vall d\'Albaida', '46249': 'La Vall d\'Albaida', '46250': 'La Vall d\'Albaida',

    // ALACANT
    '03001': 'El Comtat', '03002': 'El Comtat', '03003': 'La Marina Baixa', '03004': 'La Vega Baja', '03005': 'La Vega Baja',
    '03006': 'L\'Alcoià', '03007': 'La Marina Alta', '03008': 'L\'Alacantí', '03009': 'L\'Alcoià', '03010': 'La Marina Baixa',
    '03011': 'La Marina Baixa', '03012': 'La Vega Baja', '03013': 'L\'Alt Vinalopó', '03014': 'L\'Alacantí', '03015': 'La Marina Baixa',
    '03016': 'L\'Alt Vinalopó', '03017': 'La Marina Baixa', '03018': 'La Marina Baixa', '03019': 'L\'Alt Vinalopó', '03020': 'La Marina Baixa',
    '03021': 'L\'Alt Vinalopó', '03022': 'El Comtat', '03023': 'La Vega Baja', '03024': 'La Vega Baja', '03025': 'La Vega Baja',
    '03026': 'La Marina Baixa', '03027': 'La Marina Baixa', '03028': 'La Marina Baixa', '03029': 'El Vinalopó Mitjà', '03030': 'La Vega Baja',
    '03031': 'La Marina Baixa', '03032': 'El Comtat', '03033': 'El Comtat', '03034': 'La Vega Baja', '03035': 'El Comtat',
    '03036': 'El Comtat', '03037': 'La Marina Alta', '03038': 'La Marina Baixa', '03039': 'La Vega Baja', '03040': 'La Marina Alta',
    '03041': 'La Marina Baixa', '03042': 'La Marina Alta', '03043': 'El Baix Vinalopó', '03044': 'La Vega Baja', '03045': 'La Marina Alta',
    '03046': 'L\'Alacantí', '03047': 'La Marina Baixa', '03048': 'La Vega Baja', '03049': 'La Vega Baja', '03050': 'L\'Alacantí',
    '03051': 'La Marina Alta', '03052': 'El Comtat', '03053': 'El Comtat', '03054': 'La Marina Alta', '03055': 'La Marina Baixa',
    '03056': 'El Comtat', '03057': 'La Marina Baixa', '03058': 'La Vega Baja', '03059': 'La Vega Baja', '03060': 'La Vega Baja',
    '03061': 'La Vega Baja', '03062': 'El Comtat', '03063': 'La Marina Baixa', '03064': 'La Vega Baja', '03065': 'El Comtat',
    '03066': 'El Vinalopó Mitjà', '03067': 'La Marina Baixa', '03068': 'La Marina Alta', '03069': 'La Marina Baixa', '03070': 'La Vega Baja',
    '03071': 'La Marina Baixa', '03072': 'El Comtat', '03073': 'El Comtat', '03074': 'La Marina Baixa', '03075': 'La Marina Baixa',
    '03076': 'La Marina Baixa', '03077': 'La Marina Baixa', '03078': 'La Marina Alta', '03079': 'L\'Alcoià', '03080': 'La Marina Baixa',
    '03081': 'La Marina Baixa', '03082': 'La Marina Baixa', '03083': 'La Marina Baixa', '03084': 'L\'Alacantí', '03085': 'La Marina Baixa',
    '03086': 'La Marina Baixa', '03087': 'La Marina Baixa', '03088': 'El Comtat', '03089': 'La Marina Baixa', '03090': 'L\'Alacantí',
    '03091': 'La Marina Baixa', '03092': 'El Comtat', '03093': 'El Comtat', '03094': 'La Marina Baixa', '03095': 'La Marina Baixa',
    '03096': 'La Marina Baixa', '03097': 'La Marina Baixa', '03098': 'La Marina Baixa', '03099': 'La Marina Baixa', '03100': 'La Marina Baixa',
    '03101': 'La Marina Baixa', '03102': 'La Marina Baixa', '03103': 'La Marina Baixa', '03104': 'La Marina Baixa', '03105': 'La Marina Baixa',
    '03106': 'El Comtat', '03107': 'La Marina Baixa', '03108': 'La Marina Baixa', '03109': 'La Marina Baixa', '03110': 'La Marina Baixa',
    '03111': 'La Marina Baixa', '03112': 'La Marina Baixa', '03113': 'La Marina Baixa', '03114': 'La Marina Baixa', '03115': 'La Marina Baixa',
    '03116': 'La Marina Baixa', '03117': 'La Marina Baixa', '03118': 'La Marina Baixa', '03119': 'La Marina Baixa', '03120': 'La Marina Baixa',
    '03121': 'La Marina Baixa', '03122': 'La Marina Baixa', '03123': 'La Marina Baixa', '03124': 'La Marina Baixa', '03125': 'La Marina Baixa',
    '03126': 'La Marina Baixa', '03127': 'La Marina Baixa', '03128': 'La Marina Baixa', '03129': 'La Marina Baixa', '03130': 'La Marina Baixa',
    '03131': 'La Marina Baixa', '03132': 'La Marina Baixa', '03133': 'La Marina Baixa', '03134': 'La Marina Baixa', '03135': 'La Marina Baixa',
    '03136': 'La Marina Baixa', '03137': 'La Marina Baixa', '03138': 'La Marina Baixa', '03139': 'La Marina Baixa', '03140': 'La Marina Baixa',
    '03141': 'La Marina Baixa'
};

// Control desplegable estil Google Maps a la cantonada inferior esquerra
const GMapsLayerControl = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd: function() {
        const container = L.DomUtil.create('div', 'gmaps-layer-control');
        container.innerHTML = `
            <div class="gmaps-layer-btn" id="gmaps-toggle" title="Canviar vista del mapa">🗺️</div>
            <div class="gmaps-layer-panel">
                <div class="thumb-option selected" id="opt-classic" onclick="canviarModeMapa('classic')">
                    <div class="thumb-box thumb-classic"></div>
                    <span class="thumb-label">Clàssic</span>
                </div>
                <div class="thumb-option" id="opt-dark" onclick="canviarModeMapa('dark')">
                    <div class="thumb-box thumb-dark"></div>
                    <span class="thumb-label">Fosc</span>
                </div>
                <div class="thumb-option" id="opt-sat" onclick="canviarModeMapa('sat')">
                    <div class="thumb-box thumb-sat"></div>
                    <span class="thumb-label">Satèl·lit</span>
                </div>
            </div>
        `;

        L.DomEvent.disableClickPropagation(container);

        const toggleBtn = container.querySelector('#gmaps-toggle');
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            container.classList.toggle('expanded');
        });

        document.addEventListener('click', () => {
            container.classList.remove('expanded');
        });

        return container;
    }
});
map.addControl(new GMapsLayerControl());

function canviarModeMapa(key) {
    if (modeActual === key) return;

    if (map.hasLayer(layers[modeActual])) {
        map.removeLayer(layers[modeActual]);
    }
    
    modeActual = key;
    layers[modeActual].addTo(map);

    document.querySelectorAll('.thumb-option').forEach(el => el.classList.remove('selected'));
    if (key === 'classic') document.getElementById('opt-classic').classList.add('selected');
    if (key === 'dark') document.getElementById('opt-dark').classList.add('selected');
    if (key === 'sat') document.getElementById('opt-sat').classList.add('selected');

    if (geojsonLayer) geojsonLayer.setStyle(obtenirEstil);
}

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
    document.getElementById('comptador').innerText = "Sincronitzant...";
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
        document.getElementById('comptador').innerText = "Error de connexió";
    });
}

function guardarDadesNuvol() {
    document.getElementById('comptador').innerText = "Guardant...";
    
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
    if (code === '03') return "d'Alacant";
    if (code === '12') return 'de Castelló';
    if (code === '46') return 'de València';
    return 'Altres';
}

function getComarcaNom(ine) {
    const code = String(ine).padStart(5, '0');
    return mapaComarquesINE[code] || 'Altres / Sense definir';
}

function calcularEstadistiquesUsuari(nom) {
    const visitats = dadesGlobals[nom] || [];
    const provincies = {};
    const comarques = {};

    totesLesFeatures.forEach(f => {
        const id = f.properties.MUNIINE;
        const prov = getProvinciaNom(id);
        const comarca = getComarcaNom(id);

        // Comptatge per Província
        if (!provincies[prov]) provincies[prov] = { total: 0, visitats: 0 };
        provincies[prov].total++;
        if (visitats.includes(id)) provincies[prov].visitats++;

        // Comptatge per Comarca
        if (!comarques[comarca]) comarques[comarca] = { total: 0, visitats: 0, prov: prov };
        comarques[comarca].total++;
        if (visitats.includes(id)) comarques[comarca].visitats++;
    });

    return { visitatsCount: visitats.length, provincies, comarques };
}

/* ----- TARGETA PNG I TEMES ----- */
function canviarTemaTargeta(tema) {
    const card = document.getElementById('card-template');
    if (card) {
        card.className = 'theme-' + tema;
    }
}

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

    const provs = Object.keys(stats.provincies).sort();
    provs.forEach(p => {
        const item = stats.provincies[p];
        const pct = Math.round((item.visitats / item.total) * 100) || 0;

        const row = document.createElement('div');
        row.className = 'card-prov-row';
        row.innerHTML = `
            <div class="card-prov-info">
                <span>Província ${p}</span>
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
        }

        miniMap.invalidateSize();

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

        if (miniGeojsonLayer.getBounds().isValid()) {
            miniMap.fitBounds(miniGeojsonLayer.getBounds(), { padding: [10, 10] });
        }
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

/* ----- ESTADÍSTIQUES (PROVÍNCIES I COMARQUES) ----- */
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

    // 1. SECCIÓ PROVÍNCIES
    const titolProv = document.createElement('h3');
    titolProv.style.margin = '10px 0 5px 0';
    titolProv.innerText = 'Per Províncies';
    contenidor.appendChild(titolProv);

    const clausProv = Object.keys(stats.provincies).sort();
    clausProv.forEach(clau => {
        const item = stats.provincies[clau];
        const pct = Math.round((item.visitats / item.total) * 100) || 0;

        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="stat-header">
                <span>Província ${clau}</span>
                <span>${item.visitats} / ${item.total} (${pct}%)</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill" style="width: ${pct}%;"></div>
            </div>
        `;
        contenidor.appendChild(card);
    });

    // 2. SECCIÓ COMARQUES
    const titolCom = document.createElement('h3');
    titolCom.style.margin = '20px 0 5px 0';
    titolCom.innerText = 'Per Comarques';
    contenidor.appendChild(titolCom);

    const clausCom = Object.keys(stats.comarques).sort();
    clausCom.forEach(clau => {
        const item = stats.comarques[clau];
        const pct = Math.round((item.visitats / item.total) * 100) || 0;

        const card = document.createElement('div');
        card.className = 'stat-card';
        card.innerHTML = `
            <div class="stat-header">
                <span><b>${clau}</b> <small style="opacity:0.7;">(${item.prov})</small></span>
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
        <div style="background: #f8f9fa; padding: 8px; border-radius: 5px; border: 1px solid #ddd; line-height: 1.6;">
            <div><span class="color-box" style="background: #2d6a4f;"></span> <b>En comú:</b> ${comu.length} pobles</div>
            <div><span class="color-box" style="background: #3a86ff;"></span> <b>Només ${nom1}:</b> ${sols1.length} pobles</div>
            <div><span class="color-box" style="background: #fb8500;"></span> <b>Només ${nom2}:</b> ${sols2.length} pobles</div>
        </div>
    `;

    if (geojsonLayer) geojsonLayer.setStyle(obtenirEstil);
    document.getElementById('comptador').innerHTML = 
        `<span style="color: #4cc9f0; font-weight: bold;">■ ${nom1}</span> vs <span style="color: #ffb703; font-weight: bold;">■ ${nom2}</span> | Comú: ${comu.length}`;
    
    document.getElementById('modal-comparativa').style.display = 'none';
}

function obtenirEstil(feature) {
    const id = feature.properties.MUNIINE;

    if (modeComparacio && dadesComparacio) {
        if (dadesComparacio.comu.includes(id)) return { fillColor: '#2d6a4f', weight: 1, color: '#fff', fillOpacity: 0.8 };
        if (dadesComparacio.sols1.includes(id)) return { fillColor: '#3a86ff', weight: 1, color: '#fff', fillOpacity: 0.75 };
        if (dadesComparacio.sols2.includes(id)) return { fillColor: '#fb8500', weight: 1, color: '#fff', fillOpacity: 0.75 };
        return { fillColor: '#adb5bd', weight: 1, color: '#fff', fillOpacity: 0.3 };
    } 

    const visitats = usuariActual ? (dadesGlobals[usuariActual] || []) : [];
    const estaVisitat = visitats.includes(id);

    if (modeActual === 'classic') {
        return {
            fillColor: estaVisitat ? '#2d6a4f' : '#adb5bd',
            weight: 1,
            color: '#ffffff',
            fillOpacity: estaVisitat ? 0.75 : 0.4
        };
    } else if (modeActual === 'dark') {
        return {
            fillColor: estaVisitat ? '#00e676' : '#212529',
            weight: estaVisitat ? 1.2 : 0.6,
            color: estaVisitat ? '#00e676' : '#495057',
            fillOpacity: estaVisitat ? 0.8 : 0.4
        };
    } else if (modeActual === 'sat') {
        return {
            fillColor: estaVisitat ? '#00f5d4' : 'transparent',
            weight: estaVisitat ? 1.5 : 0.8,
            color: estaVisitat ? '#00f5d4' : '#ffffff',
            fillOpacity: estaVisitat ? 0.5 : 0.1
        };
    }
}

function actualitzarComptador() {
    if (!modeComparacio && usuariActual) {
        const visitats = dadesGlobals[usuariActual] || [];
        document.getElementById('comptador').innerText = `${visitats.length}/${totalMunicipis} pobles`;
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
                            alert("Codi incorrecte.");
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
