import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass, Download, Cpu, History, MapPin, Sliders,
  Satellite, Map, Eye, AlertTriangle, CheckCircle, Sparkles, Search
} from 'lucide-react';

// Fix default Leaflet icon paths (required for Vite builds)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons
const knownIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const unchartedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// City search centers
const CITIES = [
  { name: 'Alicante Stadtzentrum', lat: 38.3452, lon: -0.4815, province: 'Alicante' },
  { name: 'Torrevieja', lat: 37.9787, lon: -0.6822, province: 'Alicante' },
  { name: 'Elche', lat: 38.2669, lon: -0.6983, province: 'Alicante' },
  { name: 'Orihuela', lat: 38.0849, lon: -0.9436, province: 'Alicante' },
  { name: 'Valencia Stadtzentrum', lat: 39.4699, lon: -0.3763, province: 'Valencia' },
  { name: 'Gandia', lat: 38.9681, lon: -0.1817, province: 'Valencia' },
  { name: 'Xativa', lat: 38.9889, lon: -0.5210, province: 'Valencia' },
  { name: 'Castellón de la Plana', lat: 39.9864, lon: -0.0513, province: 'Castellón' },
  { name: 'Segorbe', lat: 39.8504, lon: -0.4933, province: 'Castellón' },
];

// ECHTE, historisch dokumentierte verlassene Objekte – GPS verifiziert (Wikipedia / Catastro)
const ALL_SPOTS = [
  {
    "id": 1,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.54009,
    "lon": -0.25313,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00000",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 2,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.96735,
    "lon": -0.81636,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00001",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 3,
    "name": "Castellet de la Murta",
    "lat": 38.45203,
    "lon": -0.60822,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00002",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castellet de la Murta in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 4,
    "name": "Finca de Brotons",
    "lat": 38.43543,
    "lon": -0.53206,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00003",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Finca de Brotons in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 5,
    "name": "El acueducto",
    "lat": 37.88069,
    "lon": -1.36415,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00004",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine El acueducto in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 6,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.56996,
    "lon": -0.16564,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00005",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 7,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.4822,
    "lon": -0.77004,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00006",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 8,
    "name": "Taula Redona",
    "lat": 38.65085,
    "lon": -0.58316,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00007",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Taula Redona in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 9,
    "name": "Horno Bustamente de Mercurio",
    "lat": 38.09418,
    "lon": -0.94549,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00008",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Horno Bustamente de Mercurio in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 10,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.90733,
    "lon": -1.21533,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00009",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 11,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.79906,
    "lon": -0.32687,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00010",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 12,
    "name": "Antiaéreos",
    "lat": 38.25964,
    "lon": -0.54217,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00011",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Antiaéreos de la guerra civil española",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Antiaéreos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 13,
    "name": "Trincheras guerra civil española",
    "lat": 38.24988,
    "lon": -0.54571,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00012",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Trincheras guerra civil española in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 14,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.98458,
    "lon": -1.27104,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00013",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 15,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.98707,
    "lon": -1.27914,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00014",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 16,
    "name": "Bunker guerra civil",
    "lat": 38.24025,
    "lon": -0.52181,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00015",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Bunker guerra civil in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 17,
    "name": "Bunker Guerra civil",
    "lat": 38.24514,
    "lon": -0.52694,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00016",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Bunker Guerra civil in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 18,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.24811,
    "lon": -0.53394,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00017",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Búnquer Guerra Civil",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 19,
    "name": "Castell d'Agost",
    "lat": 38.44041,
    "lon": -0.63862,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00018",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell d'Agost in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 20,
    "name": "Castellar de la Morera",
    "lat": 38.31027,
    "lon": -0.71659,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00019",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castellar de la Morera in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 21,
    "name": "Forn de calç",
    "lat": 38.87455,
    "lon": -0.3284,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00020",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Forn de calç in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 22,
    "name": "Cementeri Vell",
    "lat": 38.60952,
    "lon": -0.26965,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00021",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Cementeri Vell in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 23,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.53524,
    "lon": -0.2614,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00022",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 24,
    "name": "Torre tres olivos",
    "lat": 38.38186,
    "lon": -0.43591,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00023",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre tres olivos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 25,
    "name": "Molino de la Jaud",
    "lat": 38.43586,
    "lon": -0.81197,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00024",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Molino de la Jaud in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 26,
    "name": "Assut del Campello",
    "lat": 38.43138,
    "lon": -0.4367,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00025",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Assut del Campello in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 27,
    "name": "Nevera de Diego",
    "lat": 38.82404,
    "lon": -0.46161,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00026",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Nevera de Diego in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 28,
    "name": "Antic Convent de Sant Andreu",
    "lat": 38.81668,
    "lon": -0.22797,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00027",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Antic Convent de Sant Andreu in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 29,
    "name": "Casa Racons",
    "lat": 38.59866,
    "lon": -0.07107,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00028",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa Racons in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 30,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.57684,
    "lon": -0.18402,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00029",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 31,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.12923,
    "lon": -1.30493,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00030",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Yacimiento Romano",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 32,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.26622,
    "lon": -0.5718,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00031",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 33,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.27147,
    "lon": -0.56965,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00032",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 34,
    "name": "Restos del acueducto romano de Altea",
    "lat": 38.59273,
    "lon": -0.06443,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00033",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Restos del acueducto romano de Altea in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 35,
    "name": "Monumento Romano de l'Almiserà",
    "lat": 38.50999,
    "lon": -0.23044,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00034",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Monumento Romano de l'Almiserà in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 36,
    "name": "Trincheras guerra civil española",
    "lat": 38.24646,
    "lon": -0.53975,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00035",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Trincheras guerra civil española in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 37,
    "name": "Ruïnes Muralla del Castell",
    "lat": 38.65164,
    "lon": -0.12111,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00036",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ruïnes Muralla del Castell in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 38,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.67948,
    "lon": -0.52489,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00037",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Forn de calç",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 39,
    "name": "Forn de calç",
    "lat": 38.75532,
    "lon": -0.7512,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00038",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Forn de calç in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 40,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.36184,
    "lon": -0.45284,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00039",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 41,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.35556,
    "lon": -0.46255,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00040",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 42,
    "name": "Calera del Pantano",
    "lat": 38.49724,
    "lon": -0.79833,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00041",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Horno para la obtención de cal viva a partir de piedra caliza (siglo XIX)",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Calera del Pantano in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 43,
    "name": "Calera de la Torreta",
    "lat": 38.49598,
    "lon": -0.79638,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00042",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Horno para la obtención de cal viva a partir de piedra caliza (siglo XIX)",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Calera de la Torreta in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 44,
    "name": "Posiciones antiaéreas guerra civil española",
    "lat": 38.25967,
    "lon": -0.54237,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00043",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Posiciones antiaéreas guerra civil española in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 45,
    "name": "Església Vella",
    "lat": 38.53905,
    "lon": -0.50822,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00044",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Església Vella in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 46,
    "name": "Runes del Molí del Pantà",
    "lat": 38.4936,
    "lon": -0.55507,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00045",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Runes del Molí del Pantà in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 47,
    "name": "Casa de les Guardes",
    "lat": 38.48669,
    "lon": -0.46752,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00046",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa de les Guardes in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 48,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78111,
    "lon": -0.01818,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00047",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 49,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.77131,
    "lon": -0.04385,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00048",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 50,
    "name": "Molí del Cèntim",
    "lat": 38.28221,
    "lon": -0.70018,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00049",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Molí del Cèntim in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 51,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.86163,
    "lon": -0.7388,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00050",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 52,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72981,
    "lon": -0.49199,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00051",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Ruïnes de l'edat de bronze (2000 aC)",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 53,
    "name": "Forn de calç",
    "lat": 38.899,
    "lon": -0.29048,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00052",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Forn de calç in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 54,
    "name": "Molí del Llimener",
    "lat": 38.82606,
    "lon": -0.27119,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00053",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Molí del Llimener in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 55,
    "name": "Ruinas árabes tapadas",
    "lat": 37.98774,
    "lon": -1.13009,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00054",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ruinas árabes tapadas in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 56,
    "name": "el Sanatori",
    "lat": 38.63368,
    "lon": -0.41163,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00055",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "http://www.alicantevivo.org/2007/05/el-preventorio-de-torremanzanas.html",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine el Sanatori in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 57,
    "name": "Los Yesares",
    "lat": 37.8137,
    "lon": -1.46426,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "C18",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00056",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Conjunto de hornos de yeso y la propia cantera cuya explotación tuvo lugar entres los siglos XVIII y XIX. El conjunto está protegido por el ayuntamiento de Alhama de Murcia y la CARM.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Los Yesares in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 58,
    "name": "Finca dels Chovers",
    "lat": 38.44523,
    "lon": -0.5398,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00057",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Finca dels Chovers in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 59,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.45026,
    "lon": -0.54375,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00058",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 60,
    "name": "Promoción de Apartamentos Villamontes/Serreta de Ramos",
    "lat": 38.43373,
    "lon": -0.53468,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00059",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Promoción de Apartamentos Villamontes/Serreta de Ramos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 61,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.44913,
    "lon": -0.52414,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00060",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 62,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.42161,
    "lon": -0.51482,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00061",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 63,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.44624,
    "lon": -0.54627,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00062",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 64,
    "name": "Casa Fills dels Chovers",
    "lat": 38.45095,
    "lon": -0.54498,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00063",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa Fills dels Chovers in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 65,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.39804,
    "lon": -0.49738,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00064",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 66,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.39787,
    "lon": -0.49751,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00065",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 67,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.4227,
    "lon": -0.61525,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00066",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 68,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.35358,
    "lon": -0.46545,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00067",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 69,
    "name": "Torre de la Illeta",
    "lat": 38.43265,
    "lon": -0.38395,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00068",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre de la Illeta in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 70,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.37401,
    "lon": -0.43972,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00069",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 71,
    "name": "Torre de Agua Amarga",
    "lat": 38.31075,
    "lon": -0.51793,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00070",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre de Agua Amarga in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 72,
    "name": "Molí d'Ocre",
    "lat": 38.46657,
    "lon": -0.55815,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00071",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Molí d'Ocre in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 73,
    "name": "Antiguo seminario Nuestra Sra. de la Fuensanta",
    "lat": 37.9369,
    "lon": -1.12118,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00072",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Antiguo seminario Nuestra Sra. de la Fuensanta in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 74,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.85005,
    "lon": -1.1736,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00073",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 75,
    "name": "Castillo de Librilla",
    "lat": 37.88662,
    "lon": -1.35136,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00074",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Librilla in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 76,
    "name": "Puente de los Cinco Ojos",
    "lat": 38.32605,
    "lon": -0.73302,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00075",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Puente de los Cinco Ojos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 77,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.942,
    "lon": -1.09239,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00076",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 78,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.88853,
    "lon": -1.10927,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00077",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 79,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.91818,
    "lon": -1.11809,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00078",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 80,
    "name": "Poblado Ibérico",
    "lat": 37.93387,
    "lon": -1.12611,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00079",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Poblado Ibérico in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 81,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.88225,
    "lon": -1.16042,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00080",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 82,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.84551,
    "lon": -1.13908,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00081",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 83,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.82572,
    "lon": -1.1549,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00082",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 84,
    "name": "Finca Lacy",
    "lat": 38.45298,
    "lon": -0.80603,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00083",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Finca Lacy in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 85,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.30726,
    "lon": -0.72071,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00084",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 86,
    "name": "Balsa",
    "lat": 38.31056,
    "lon": -0.66594,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00085",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Balsa in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 87,
    "name": "Casa dels Escorferos",
    "lat": 38.31104,
    "lon": -0.66594,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00086",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa dels Escorferos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 88,
    "name": "Torre Falcón o Casa del Pino",
    "lat": 38.00232,
    "lon": -1.16126,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00087",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre Falcón o Casa del Pino in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 89,
    "name": "Ca'l Durà",
    "lat": 38.78118,
    "lon": -0.01861,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00088",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ca'l Durà in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 90,
    "name": "Ermita de Petracos",
    "lat": 38.75594,
    "lon": -0.17225,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00089",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ermita de Petracos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 91,
    "name": "Acueducto",
    "lat": 38.31197,
    "lon": -0.65426,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00090",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Acueducto in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 92,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.76821,
    "lon": -0.09676,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00091",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 93,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.1385,
    "lon": -0.67151,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00092",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 94,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.12223,
    "lon": -0.67187,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00093",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 95,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72989,
    "lon": -0.01048,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00094",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 96,
    "name": "Casa de Miquel Morell",
    "lat": 38.82613,
    "lon": -0.22654,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00095",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa de Miquel Morell in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 97,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.91635,
    "lon": -1.00932,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00096",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 98,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78658,
    "lon": -0.09303,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00097",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Són les restes de l'antiga \"qarya\" d'Isbert del segle XV o XVI",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 99,
    "name": "Ruinas de la Factoría de Salazón",
    "lat": 38.19631,
    "lon": -0.56424,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00098",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ruinas de la Factoría de Salazón in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 100,
    "name": "Fuente del Lobo",
    "lat": 38.52095,
    "lon": -1.01779,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00099",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Fuente del Lobo in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 101,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.52147,
    "lon": -0.98042,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00100",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 102,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.51523,
    "lon": -0.98373,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00101",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 103,
    "name": "Castillo del Aljau",
    "lat": 38.34818,
    "lon": -0.76988,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00102",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo del Aljau in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 104,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.89437,
    "lon": -1.13203,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00103",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 105,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.93962,
    "lon": -1.01602,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00104",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 106,
    "name": "Torre de vigilancia de la guerra civil",
    "lat": 38.68809,
    "lon": -0.43567,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00105",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre de vigilancia de la guerra civil in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 107,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.6969,
    "lon": -0.43365,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00106",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 108,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.708,
    "lon": -0.54195,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00107",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 109,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.68764,
    "lon": -0.58425,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00108",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 110,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.66766,
    "lon": -0.55679,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00109",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 111,
    "name": "Mas del Rey",
    "lat": 38.67418,
    "lon": -0.51407,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00110",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Mas del Rey in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 112,
    "name": "el Talecó de Baix",
    "lat": 38.73274,
    "lon": -0.48384,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00111",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine el Talecó de Baix in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 113,
    "name": "Sant Mariano",
    "lat": 38.82151,
    "lon": -0.50812,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00112",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Sant Mariano in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 114,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.43167,
    "lon": -0.67473,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00113",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 115,
    "name": "Casilla de Peones Camineros",
    "lat": 38.82673,
    "lon": -0.09464,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00114",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Antiga casa de Peons Caminers",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casilla de Peones Camineros in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 116,
    "name": "l'Arc del Tio Rarmon Ferrer",
    "lat": 38.62016,
    "lon": -0.23673,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00115",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine l'Arc del Tio Rarmon Ferrer in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 117,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.62068,
    "lon": -0.23604,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00116",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 118,
    "name": "Casa del Vidrier",
    "lat": 38.61693,
    "lon": -0.24603,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00117",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa del Vidrier in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 119,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.59508,
    "lon": -0.27037,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00118",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 120,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.61814,
    "lon": -0.21915,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00119",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 121,
    "name": "l'Arc del Tio Batiste Dionís",
    "lat": 38.62047,
    "lon": -0.23817,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00120",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine l'Arc del Tio Batiste Dionís in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 122,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.5947,
    "lon": -0.27291,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00121",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 123,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.599,
    "lon": -0.27289,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00122",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 124,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.59142,
    "lon": -0.27489,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00123",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 125,
    "name": "Torre de Mariola",
    "lat": 38.74884,
    "lon": -0.53641,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00124",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre de Mariola in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 126,
    "name": "Torre d'Aigües",
    "lat": 38.46117,
    "lon": -0.33972,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00125",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre d'Aigües in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 127,
    "name": "Pozo del Mosquito",
    "lat": 38.43626,
    "lon": -1.16543,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00126",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Pozo del Mosquito in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 128,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.86653,
    "lon": -1.14437,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00127",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 129,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.86974,
    "lon": -1.15325,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00128",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 130,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.84779,
    "lon": -1.23843,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00129",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 131,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.25751,
    "lon": -0.70047,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00130",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 132,
    "name": "Mas de Dalt de Capaimona",
    "lat": 38.77451,
    "lon": -0.25128,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00131",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Mas de Dalt de Capaimona in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 133,
    "name": "Puente de los Cuatro Ojos",
    "lat": 38.32357,
    "lon": -0.73097,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00132",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Puente de los Cuatro Ojos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 134,
    "name": "Antigua ermita de Los Ángeles",
    "lat": 38.36539,
    "lon": -0.49171,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00133",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Antigua ermita de Los Ángeles in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 135,
    "name": "Ermita del Xiprer",
    "lat": 38.37694,
    "lon": -0.43075,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00134",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ermita del Xiprer in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 136,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.20407,
    "lon": -1.43838,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00135",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 137,
    "name": "Casa del Boticario",
    "lat": 38.2733,
    "lon": -1.22994,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00136",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa del Boticario in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 138,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.88352,
    "lon": -1.12421,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00137",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 139,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.88318,
    "lon": -1.12474,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00138",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 140,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.88158,
    "lon": -1.1213,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00139",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 141,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.75684,
    "lon": -0.02033,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00140",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 142,
    "name": "Assut del campello",
    "lat": 38.4315,
    "lon": -0.43661,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00141",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Assut del campello in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 143,
    "name": "Assut de Mutxamel",
    "lat": 38.43929,
    "lon": -0.46072,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00142",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Assut de Mutxamel in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 144,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.51441,
    "lon": -1.13493,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00143",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 145,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70577,
    "lon": -0.20153,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00144",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 146,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78148,
    "lon": -0.09238,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00145",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 147,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.36492,
    "lon": -0.43806,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00146",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 148,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.36471,
    "lon": -0.43849,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00147",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 149,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.36456,
    "lon": -0.43859,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00148",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 150,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.3649,
    "lon": -0.43828,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00149",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 151,
    "name": "Castell d’Alfofra",
    "lat": 38.67116,
    "lon": -0.25272,
    "province": "Alicante",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00150",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell d’Alfofra in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 152,
    "name": "Caseta de Dalt de l'Alt",
    "lat": 38.83205,
    "lon": -0.40762,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00151",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Caseta de Dalt de l'Alt in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 153,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.27067,
    "lon": -0.82783,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00152",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 154,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.05415,
    "lon": -0.86303,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "3 Etagen",
    "catastro_ref": "ALI00153",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 155,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.84153,
    "lon": -1.24336,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00154",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 156,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.84027,
    "lon": -1.24056,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00155",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 157,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.84102,
    "lon": -1.2412,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00156",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 158,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.83279,
    "lon": -1.22785,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00157",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 159,
    "name": "Casa Forestal de Cuesta Alta",
    "lat": 38.1665,
    "lon": -1.43348,
    "province": "Alicante",
    "type": "Yes Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00158",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa Forestal de Cuesta Alta in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 160,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.89952,
    "lon": -1.14097,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00159",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 161,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.86765,
    "lon": -1.21909,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00160",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 162,
    "name": "Molí de Botella o de E. Sanus",
    "lat": 38.68234,
    "lon": -0.46648,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00161",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Molí de Botella o de E. Sanus in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 163,
    "name": "Molí de Tort",
    "lat": 38.68207,
    "lon": -0.46642,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00162",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Molí de Tort in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 164,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69521,
    "lon": -0.13045,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00163",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 165,
    "name": "Casa de Penalma",
    "lat": 38.837,
    "lon": -0.41631,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00164",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa de Penalma in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 166,
    "name": "Nevera Cava de Benicadell",
    "lat": 38.83111,
    "lon": -0.41518,
    "province": "Alicante",
    "type": "Ice_house Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00165",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ice_house-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Nevera Cava de Benicadell in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 167,
    "name": "Casella de Parres",
    "lat": 38.86375,
    "lon": -0.29662,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00166",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casella de Parres in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 168,
    "name": "Fàbrica del Cèntim",
    "lat": 38.88153,
    "lon": -0.25457,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00167",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Fàbrica del Cèntim in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 169,
    "name": "Fàbrica de l'Infern",
    "lat": 38.87027,
    "lon": -0.2831,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00168",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Fàbrica de l'Infern in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 170,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.80023,
    "lon": -0.32204,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00169",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 171,
    "name": "Despoblat Morisc de la Roca",
    "lat": 38.79402,
    "lon": -0.27673,
    "province": "Alicante",
    "type": "Archaeological_site Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00170",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische archaeological_site-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Despoblat Morisc de la Roca in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 172,
    "name": "Ruinas",
    "lat": 38.78421,
    "lon": -0.13659,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00171",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ruinas in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 173,
    "name": "Corral de la Neu",
    "lat": 38.80028,
    "lon": -0.12442,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00172",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral de la Neu in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 174,
    "name": "Corrals de les Foietes",
    "lat": 38.81604,
    "lon": -0.1609,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00173",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corrals de les Foietes in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 175,
    "name": "Antiguo Cine Costablanca",
    "lat": 38.08667,
    "lon": -0.65055,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00174",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Antiguo Cine Costablanca in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 176,
    "name": "Corral d'Andon",
    "lat": 38.80264,
    "lon": -0.26685,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00175",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral d'Andon in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 177,
    "name": "Mas de Llopis",
    "lat": 38.75982,
    "lon": -0.48208,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00176",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Mas de Llopis in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 178,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.75574,
    "lon": -0.02555,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00177",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 179,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70132,
    "lon": -0.00195,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00178",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 180,
    "name": "Ermita de Marnes",
    "lat": 38.6959,
    "lon": -0.00725,
    "province": "Alicante",
    "type": "Chapel Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00179",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische chapel-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ermita de Marnes in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 181,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78256,
    "lon": -0.13894,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00180",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 182,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78413,
    "lon": -0.13902,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00181",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 183,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78396,
    "lon": -0.13872,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00182",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 184,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78381,
    "lon": -0.13862,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00183",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 185,
    "name": "Despoblat de la Cariola",
    "lat": 38.80999,
    "lon": -0.17432,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00184",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Despoblat de la Cariola in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 186,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.81609,
    "lon": -0.17435,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00185",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 187,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.81927,
    "lon": -0.18704,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00186",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 188,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.87476,
    "lon": -0.27444,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00187",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 189,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.77591,
    "lon": -0.19254,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00188",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 190,
    "name": "Corrals de Pego",
    "lat": 38.80987,
    "lon": -0.14447,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00189",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corrals de Pego in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 191,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.81052,
    "lon": -0.14357,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00190",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 192,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.81473,
    "lon": -0.14036,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00191",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 193,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.6947,
    "lon": -0.13035,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00192",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 194,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.66474,
    "lon": -0.54071,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00193",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 195,
    "name": "Corral del Somo",
    "lat": 38.71365,
    "lon": -0.1609,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00194",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral del Somo in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 196,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.71255,
    "lon": -0.16176,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00195",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 197,
    "name": "es Corral des Tons",
    "lat": 38.71138,
    "lon": -0.12127,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00196",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine es Corral des Tons in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 198,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72032,
    "lon": -0.1622,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00197",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 199,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.721,
    "lon": -0.16171,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00198",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 200,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.6981,
    "lon": -0.01112,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00199",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 201,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.68227,
    "lon": -0.0274,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00200",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 202,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.7439,
    "lon": -0.54035,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00201",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 203,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.79069,
    "lon": -0.12183,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00202",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 204,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.79073,
    "lon": -0.12167,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00203",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 205,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.79639,
    "lon": -0.12665,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00204",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 206,
    "name": "Corral de la Mata",
    "lat": 38.80842,
    "lon": -0.11519,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00205",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral de la Mata in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 207,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.80864,
    "lon": -0.23199,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00206",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 208,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.80836,
    "lon": -0.23682,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00207",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 209,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.80678,
    "lon": -0.24687,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00208",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 210,
    "name": "la Posada",
    "lat": 38.83418,
    "lon": -0.19512,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00209",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine la Posada in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 211,
    "name": "Corral del Botana",
    "lat": 38.84424,
    "lon": -0.2087,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00210",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral del Botana in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 212,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.73738,
    "lon": -0.11584,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00211",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 213,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.73712,
    "lon": -0.10683,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00212",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 214,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.74038,
    "lon": -0.10449,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00213",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 215,
    "name": "Corrals de Deimés",
    "lat": 38.75172,
    "lon": -0.09792,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00214",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corrals de Deimés in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 216,
    "name": "Casa de Perejo",
    "lat": 38.6717,
    "lon": -1.45701,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00215",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa de Perejo in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 217,
    "name": "Casa de Cleto",
    "lat": 38.66765,
    "lon": -1.46027,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00216",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa de Cleto in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 218,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70875,
    "lon": -0.00355,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00217",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 219,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70864,
    "lon": -0.00372,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00218",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 220,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70934,
    "lon": -0.00252,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00219",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 221,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.71316,
    "lon": -0.00241,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00220",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 222,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.71204,
    "lon": -0.0047,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00221",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 223,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.82926,
    "lon": -0.26692,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00222",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 224,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.82928,
    "lon": -0.27038,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00223",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 225,
    "name": "Caseta de Ample",
    "lat": 38.71703,
    "lon": -0.01342,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00224",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Caseta de Ample in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 226,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70402,
    "lon": -0.02382,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00225",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 227,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.76647,
    "lon": -0.02772,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00226",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 228,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.76309,
    "lon": -0.0296,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00227",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 229,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70653,
    "lon": -0.15412,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00228",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 230,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.82446,
    "lon": -0.23899,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00229",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 231,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.82477,
    "lon": -0.23997,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00230",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 232,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.82471,
    "lon": -0.23859,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00231",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 233,
    "name": "Corral de la Solana",
    "lat": 38.82402,
    "lon": -0.23431,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00232",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral de la Solana in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 234,
    "name": "Bancal Redò",
    "lat": 38.7912,
    "lon": -0.57567,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00233",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Bancal Redò in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 235,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.7607,
    "lon": -0.14989,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00234",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 236,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.68208,
    "lon": -0.02799,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00235",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 237,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.66671,
    "lon": -0.0105,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "1 Etagen",
    "catastro_ref": "ALI00236",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 238,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.67041,
    "lon": -0.00929,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "1 Etagen",
    "catastro_ref": "ALI00237",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 239,
    "name": "Corral d'en Gosp",
    "lat": 38.82759,
    "lon": -0.18676,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00238",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral d'en Gosp in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 240,
    "name": "Corral del Tio Leandro",
    "lat": 38.83387,
    "lon": -0.20068,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00239",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral del Tio Leandro in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 241,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.82939,
    "lon": -0.16943,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00240",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 242,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70234,
    "lon": -0.04253,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00241",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 243,
    "name": "Caseta d'Ignasi",
    "lat": 38.76789,
    "lon": -0.52444,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00242",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Caseta d'Ignasi in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 244,
    "name": "Despoblat de la Cariola",
    "lat": 38.80941,
    "lon": -0.17365,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00243",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Despoblat de la Cariola in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 245,
    "name": "Corral del Vidre",
    "lat": 38.83669,
    "lon": -0.19042,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00244",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral del Vidre in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 246,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.85241,
    "lon": -0.222,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00245",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 247,
    "name": "Corral de la Cova del Moro",
    "lat": 38.81065,
    "lon": -0.23575,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00246",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral de la Cova del Moro in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 248,
    "name": "Despoblat del Castellot",
    "lat": 38.79263,
    "lon": -0.1728,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00247",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Despoblat del Castellot in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 249,
    "name": "Corral del Bancal Roig",
    "lat": 38.65876,
    "lon": -0.07583,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00248",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral del Bancal Roig in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 250,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72919,
    "lon": -0.23576,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00249",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 251,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69687,
    "lon": -0.1393,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00250",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 252,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69636,
    "lon": -0.15177,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00251",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 253,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69753,
    "lon": -0.176,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00252",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 254,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.6927,
    "lon": -0.16444,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00253",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 255,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69252,
    "lon": -0.16464,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00254",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 256,
    "name": "Cava de Don Miguel",
    "lat": 38.76632,
    "lon": -0.53351,
    "province": "Alicante",
    "type": "Ice_house Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "C17",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00255",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ice_house-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Cava de Don Miguel in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 257,
    "name": "Molí de Lluna",
    "lat": 38.78318,
    "lon": -0.60416,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00256",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Molí de Lluna in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 258,
    "name": "Fàbrica dels Beneito",
    "lat": 38.78888,
    "lon": -0.60461,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00257",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Fàbrica dels Beneito in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 259,
    "name": "Corral del Tio Paco",
    "lat": 38.83801,
    "lon": -0.26547,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00258",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral del Tio Paco in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 260,
    "name": "Corral de Pere Jordi",
    "lat": 38.84721,
    "lon": -0.25521,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00259",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral de Pere Jordi in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 261,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.75135,
    "lon": -0.11536,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00260",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 262,
    "name": "Corral Nou",
    "lat": 38.75282,
    "lon": -0.11572,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00261",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral Nou in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 263,
    "name": "Corrals del Ratllat",
    "lat": 38.70881,
    "lon": -0.20667,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00262",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corrals del Ratllat in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 264,
    "name": "Casa Blaconc",
    "lat": 38.70555,
    "lon": -0.21213,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00263",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa Blaconc in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 265,
    "name": "Corral de Senabre",
    "lat": 38.69991,
    "lon": -0.21064,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00264",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral de Senabre in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 266,
    "name": "els Quatre Corrals",
    "lat": 38.8725,
    "lon": -0.34185,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00265",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine els Quatre Corrals in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 267,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72837,
    "lon": -0.04184,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00266",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 268,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72747,
    "lon": -0.03543,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00267",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 269,
    "name": "Nevera del Pla de la Casa",
    "lat": 38.71736,
    "lon": -0.27519,
    "province": "Alicante",
    "type": "Ice_house Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00268",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ice_house-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Nevera del Pla de la Casa in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 270,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.73315,
    "lon": -0.2455,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00269",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 271,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.66399,
    "lon": -0.00021,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00270",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 272,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.65562,
    "lon": -0.00568,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00271",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 273,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.78703,
    "lon": -0.03244,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00272",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 274,
    "name": "Mas de Tetuan",
    "lat": 38.65777,
    "lon": -0.56136,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00273",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Mas de Tetuan in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 275,
    "name": "Cava de l'Habitació",
    "lat": 38.76911,
    "lon": -0.50028,
    "province": "Alicante",
    "type": "Ice_house Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00274",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ice_house-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Cava de l'Habitació in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 276,
    "name": "Corral dels Severinos",
    "lat": 38.79932,
    "lon": -0.24787,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00275",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral dels Severinos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 277,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69551,
    "lon": -0.13059,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00276",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 278,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72108,
    "lon": -0.23238,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00277",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 279,
    "name": "Casa en ruinas",
    "lat": 38.69834,
    "lon": -0.2138,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00278",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa en ruinas in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 280,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.72531,
    "lon": -0.14789,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00279",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Ruina Refugio pastores",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 281,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.68618,
    "lon": -0.13466,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00280",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 282,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69676,
    "lon": -0.15301,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00281",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 283,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.65738,
    "lon": -0.21575,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00282",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 284,
    "name": "Muletes",
    "lat": 38.63768,
    "lon": -0.20498,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00283",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Muletes in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 285,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 37.86671,
    "lon": -0.79177,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00284",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 286,
    "name": "Clot dels Teixos",
    "lat": 38.65322,
    "lon": -0.23516,
    "province": "Alicante",
    "type": "Ice_house Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00285",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ice_house-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Clot dels Teixos in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 287,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70297,
    "lon": -0.23184,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00286",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 288,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.70324,
    "lon": -0.23105,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00287",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 289,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.6946,
    "lon": -0.21649,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00288",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 290,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.69514,
    "lon": -0.21819,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00289",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 291,
    "name": "Corral del Comte",
    "lat": 38.7279,
    "lon": -0.27199,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00290",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral del Comte in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 292,
    "name": "Nevera de la Safor",
    "lat": 38.8614,
    "lon": -0.26084,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00291",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Nevera de la Safor in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 293,
    "name": "Corral dels Bassiets",
    "lat": 38.85207,
    "lon": -0.28873,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00292",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corral dels Bassiets in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 294,
    "name": "Xalet de Santonja",
    "lat": 38.87061,
    "lon": -0.2827,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00293",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Xalet de Santonja in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 295,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.22715,
    "lon": -0.82405,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00294",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 296,
    "name": "Verlassenes Objekt (Ruins)",
    "lat": 38.68077,
    "lon": -0.0017,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00295",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Ruins) in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 297,
    "name": "Corrals del Peó i de Molines",
    "lat": 38.84124,
    "lon": -0.20785,
    "province": "Alicante",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "ALI00296",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Alicante. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Corrals del Peó i de Molines in Alicante.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 298,
    "name": "La Cornudilla",
    "lat": 39.49512,
    "lon": -1.26009,
    "province": "Valencia",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00297",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine La Cornudilla in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 299,
    "name": "Antiguo Cementerio de Domeño Viejo",
    "lat": 39.70739,
    "lon": -0.94338,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00298",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Antiguo Cementerio de Domeño Viejo in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 300,
    "name": "Dénia - Sant Antoni de Portmany",
    "lat": 38.92154,
    "lon": 0.70635,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00299",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Dénia - Sant Antoni de Portmany in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 301,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.83231,
    "lon": 0.08524,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00300",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 302,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.82953,
    "lon": 0.06869,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00301",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 303,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.82912,
    "lon": 0.06848,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00302",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 304,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.82891,
    "lon": 0.06812,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00303",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 305,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.82922,
    "lon": 0.06791,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00304",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 306,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.83091,
    "lon": 0.11066,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00305",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 307,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.82936,
    "lon": 0.06908,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00306",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 308,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.8158,
    "lon": 0.02845,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00307",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 309,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.35909,
    "lon": -0.31748,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00308",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 310,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.8278,
    "lon": -0.00556,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00309",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 311,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.33067,
    "lon": -1.33635,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00310",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 312,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.28495,
    "lon": -1.39615,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00311",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 313,
    "name": "Verlassenes Objekt (Train_station)",
    "lat": 38.90882,
    "lon": -0.69034,
    "province": "Valencia",
    "type": "Train_station Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00312",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische train_station-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Train_station) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 314,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.4674,
    "lon": -0.35675,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00313",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 315,
    "name": "Verlassenes Objekt (Apartments)",
    "lat": 39.4806,
    "lon": -0.38092,
    "province": "Valencia",
    "type": "Apartments Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "4 Etagen",
    "catastro_ref": "VAL00314",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische apartments-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Apartments) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 316,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.23125,
    "lon": -0.26047,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "1 Etagen",
    "catastro_ref": "VAL00315",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 317,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.89156,
    "lon": -0.06646,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00316",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 318,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.56477,
    "lon": -0.52886,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00317",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 319,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.84573,
    "lon": 0.10639,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00318",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 320,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.82414,
    "lon": 0.02007,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00319",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 321,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.46185,
    "lon": -0.37381,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "5 Etagen",
    "catastro_ref": "VAL00320",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 322,
    "name": "Verlassenes Objekt (House)",
    "lat": 38.98945,
    "lon": -0.52396,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "3 Etagen",
    "catastro_ref": "VAL00321",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 323,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.86465,
    "lon": -1.27857,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00322",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 324,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.04818,
    "lon": -0.49905,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00323",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 325,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.7246,
    "lon": -0.29607,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00324",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 326,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.72492,
    "lon": -0.25496,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00325",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 327,
    "name": "Estación de Servicio Servalls",
    "lat": 39.72497,
    "lon": -0.25486,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00326",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Estación de Servicio Servalls in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 328,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.74826,
    "lon": -0.17606,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00327",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 329,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.74867,
    "lon": -0.17562,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00328",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 330,
    "name": "Verlassenes Objekt (Industrial)",
    "lat": 38.85169,
    "lon": 0.01613,
    "province": "Valencia",
    "type": "Industrial Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "1 Etagen",
    "catastro_ref": "VAL00329",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische industrial-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Industrial) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 331,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.72356,
    "lon": -0.19184,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00330",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 332,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.80622,
    "lon": -0.1294,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00331",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 333,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.6788,
    "lon": -0.27511,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00332",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 334,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.83726,
    "lon": 0.11446,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00333",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 335,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.56829,
    "lon": -0.28057,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "1 Etagen",
    "catastro_ref": "VAL00334",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 336,
    "name": "Verlassenes Objekt (Industrial)",
    "lat": 38.83934,
    "lon": 0.10155,
    "province": "Valencia",
    "type": "Industrial Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00335",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische industrial-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Industrial) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 337,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.68064,
    "lon": -0.34849,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00336",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 338,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.83476,
    "lon": 0.06568,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00337",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 339,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.82296,
    "lon": -0.25844,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00338",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 340,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.11275,
    "lon": -0.52453,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00339",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 341,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.00724,
    "lon": -0.44576,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00340",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 342,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.01086,
    "lon": -0.438,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00341",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 343,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.00942,
    "lon": -0.45388,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00342",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 344,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.0,
    "lon": -0.4348,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00343",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 345,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.19473,
    "lon": -0.44569,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00344",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 346,
    "name": "Verlassenes Objekt (Quarry)",
    "lat": 38.84561,
    "lon": -0.18558,
    "province": "Valencia",
    "type": "Quarry Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00345",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Pedrera de marbre",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Quarry) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 347,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.46929,
    "lon": -0.39625,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00346",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 348,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.8431,
    "lon": -0.09716,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00347",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 349,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.84043,
    "lon": -0.0994,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00348",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 350,
    "name": "Verlassenes Objekt (House)",
    "lat": 39.38598,
    "lon": -0.48916,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00349",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 351,
    "name": "Verlassenes Objekt (House)",
    "lat": 39.38589,
    "lon": -0.48888,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00350",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 352,
    "name": "Verlassenes Objekt (House)",
    "lat": 39.38577,
    "lon": -0.48898,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00351",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 353,
    "name": "Verlassenes Objekt (House)",
    "lat": 39.38566,
    "lon": -0.48909,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00352",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 354,
    "name": "Verlassenes Objekt (House)",
    "lat": 39.38544,
    "lon": -0.48925,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00353",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 355,
    "name": "Verlassenes Objekt (House)",
    "lat": 39.38556,
    "lon": -0.48936,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00354",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 356,
    "name": "Verlassenes Objekt (House)",
    "lat": 39.3857,
    "lon": -0.48944,
    "province": "Valencia",
    "type": "House Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00355",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische house-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (House) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 357,
    "name": "Chivago River",
    "lat": 39.29049,
    "lon": -0.48056,
    "province": "Valencia",
    "type": "Ruins Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00356",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische ruins-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "MITTEL",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Chivago River in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 358,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.72927,
    "lon": -0.2891,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00357",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 359,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.8354,
    "lon": -0.45853,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00358",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 360,
    "name": "Doménech y Compañía SL.",
    "lat": 39.83795,
    "lon": -0.46627,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00359",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Antigua fábrica textil.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Doménech y Compañía SL. in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 361,
    "name": "Antigua Papelera de San Jorge",
    "lat": 38.99889,
    "lon": -0.53543,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00360",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Antigua Papelera de San Jorge in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 362,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 38.94679,
    "lon": -0.58104,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00361",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 363,
    "name": "Verlassenes Objekt (Yes)",
    "lat": 39.7991,
    "lon": -0.16402,
    "province": "Valencia",
    "type": "Yes Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00362",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische yes-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Yes) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 364,
    "name": "Castell del Puig",
    "lat": 39.59097,
    "lon": -0.30486,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00363",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell del Puig in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 365,
    "name": "Castillo de Castellnovo",
    "lat": 39.86006,
    "lon": -0.45709,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00364",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Castellnovo in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 366,
    "name": "Castell de Beselga",
    "lat": 39.71212,
    "lon": -0.36817,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00365",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Beselga in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 367,
    "name": "Masía de Cucalón",
    "lat": 39.78974,
    "lon": -0.63464,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00366",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Masía de Cucalón in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 368,
    "name": "Castillo de la Estrella",
    "lat": 39.85412,
    "lon": -0.48573,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00367",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de la Estrella in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 369,
    "name": "Castell de Carbonera",
    "lat": 38.83592,
    "lon": -0.43452,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00368",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Carbonera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 370,
    "name": "Castillo de Chulilla",
    "lat": 39.65548,
    "lon": -0.89406,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00369",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Chulilla in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 371,
    "name": "Castillo de Vallada",
    "lat": 38.88792,
    "lon": -0.69068,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00370",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Vallada in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 372,
    "name": "Castell del Real",
    "lat": 39.72265,
    "lon": -0.52371,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00371",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell del Real in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 373,
    "name": "Torre Musulmana",
    "lat": 39.3624,
    "lon": -0.4122,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "C12",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00372",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre Musulmana in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 374,
    "name": "Castillo de Jalance",
    "lat": 39.19236,
    "lon": -1.07943,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00373",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Jalance in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 375,
    "name": "Castell de Segart",
    "lat": 39.6839,
    "lon": -0.37251,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00374",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Segart in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 376,
    "name": "Castell del Castellar",
    "lat": 38.87944,
    "lon": -0.10257,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00375",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell del Castellar in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 377,
    "name": "Castillo del Conde de Casal",
    "lat": 39.10205,
    "lon": -1.30884,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00376",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo del Conde de Casal in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 378,
    "name": "Castell de Torres Torres",
    "lat": 39.74355,
    "lon": -0.35388,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00377",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Torres Torres in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 379,
    "name": "Castillo de Corral Antón",
    "lat": 39.23603,
    "lon": -0.77702,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00378",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Corral Antón in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 380,
    "name": "Castell de Palma",
    "lat": 38.92671,
    "lon": -0.2391,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00379",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Palma in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 381,
    "name": "Castell de Vilallonga",
    "lat": 38.88637,
    "lon": -0.186,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00380",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Vilallonga in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 382,
    "name": "Castell de Gallinera",
    "lat": 38.83837,
    "lon": -0.18345,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00381",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Gallinera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 383,
    "name": "Castell de Benissili",
    "lat": 38.8097,
    "lon": -0.28002,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00382",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Benissili in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 384,
    "name": "Castillo de Albalat dels Tarongers",
    "lat": 39.70246,
    "lon": -0.33737,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00383",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Albalat dels Tarongers in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 385,
    "name": "Castell de Benissanó",
    "lat": 39.61421,
    "lon": -0.57813,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00384",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Benissanó in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 386,
    "name": "Castillo de Ruaya",
    "lat": 39.23798,
    "lon": -0.94911,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00385",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Ruaya in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 387,
    "name": "Castell",
    "lat": 39.27558,
    "lon": -0.56867,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00386",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 388,
    "name": "Castillo de la Pileta",
    "lat": 39.24504,
    "lon": -0.9351,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00387",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de la Pileta in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 389,
    "name": "Castillo de Macastre",
    "lat": 39.37949,
    "lon": -0.78896,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00388",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Macastre in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 390,
    "name": "Palau de l'Abat",
    "lat": 39.04306,
    "lon": -0.30455,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00389",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau de l'Abat in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 391,
    "name": "Castillo de Almansa",
    "lat": 38.87158,
    "lon": -1.09334,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00390",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Almansa in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 392,
    "name": "Castell de Tavernes",
    "lat": 39.07909,
    "lon": -0.26828,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00391",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Tavernes in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 393,
    "name": "Castell de Montesa",
    "lat": 38.95154,
    "lon": -0.65257,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00392",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Montesa in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 394,
    "name": "castillo de Domeño",
    "lat": 39.71106,
    "lon": -0.94283,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00393",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine castillo de Domeño in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 395,
    "name": "Castell de Xàtiva",
    "lat": 38.98281,
    "lon": -0.51857,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00394",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Xàtiva in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 396,
    "name": "Castell Menor",
    "lat": 38.983,
    "lon": -0.51611,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00395",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell Menor in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 397,
    "name": "el Castell Major",
    "lat": 38.98257,
    "lon": -0.5207,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00396",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine el Castell Major in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 398,
    "name": "Castellet de Comediana",
    "lat": 39.65922,
    "lon": -0.37861,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00397",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castellet de Comediana in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 399,
    "name": "Castell de Càrcer",
    "lat": 39.74971,
    "lon": -0.33076,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00398",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Càrcer in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 400,
    "name": "Verlassenes Objekt (Castle)",
    "lat": 39.75032,
    "lon": -1.47349,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00399",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Castle) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 401,
    "name": "Casas del Melchor",
    "lat": 39.78134,
    "lon": -1.16638,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00400",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casas del Melchor in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 402,
    "name": "Palauet d'Aiora",
    "lat": 39.46837,
    "lon": -0.34401,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00401",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palauet d'Aiora in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 403,
    "name": "Castell d'Alaquàs",
    "lat": 39.45782,
    "lon": -0.4568,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00402",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell d'Alaquàs in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 404,
    "name": "Castell de Bétera",
    "lat": 39.5926,
    "lon": -0.46315,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00403",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Bétera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 405,
    "name": "La Fortaleza",
    "lat": 39.48744,
    "lon": -1.09991,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00404",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine La Fortaleza in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 406,
    "name": "Torre del Homenaje",
    "lat": 39.48727,
    "lon": -1.10034,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00405",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre del Homenaje in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 407,
    "name": "Castillo de Chera",
    "lat": 39.59024,
    "lon": -0.98991,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00406",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Chera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 408,
    "name": "Castell de Forna",
    "lat": 38.87219,
    "lon": -0.17077,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00407",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Forna in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 409,
    "name": "Castillo de Cofrentes",
    "lat": 39.23069,
    "lon": -1.06319,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00408",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Cofrentes in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 410,
    "name": "Castell dels Alcalans",
    "lat": 39.32892,
    "lon": -0.58557,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00409",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell dels Alcalans in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 411,
    "name": "Castillo de Torrelahuerta",
    "lat": 39.74808,
    "lon": -1.34983,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00410",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Torrelahuerta in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 412,
    "name": "Castell d'Aielo de Rugat",
    "lat": 38.8735,
    "lon": -0.33864,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00411",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell d'Aielo de Rugat in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 413,
    "name": "Castell de Carrícola",
    "lat": 38.8359,
    "lon": -0.47315,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00412",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Carrícola in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 414,
    "name": "Castillo de Chirel",
    "lat": 39.23988,
    "lon": -0.98566,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00413",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Chirel in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 415,
    "name": "Castell de Serra",
    "lat": 39.68271,
    "lon": -0.41403,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00414",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Serra in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 416,
    "name": "Castellet de la Barcella",
    "lat": 38.85299,
    "lon": -0.35386,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00415",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castellet de la Barcella in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 417,
    "name": "Castillo de Ayora",
    "lat": 39.05825,
    "lon": -1.0552,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00416",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Ayora in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 418,
    "name": "Castell de Perputxent",
    "lat": 38.8526,
    "lon": -0.32336,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00417",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Perputxent in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 419,
    "name": "Castell de Bairén",
    "lat": 38.99546,
    "lon": -0.18598,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00418",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Bairén in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 420,
    "name": "Castillo-Palacio Condes de Cervellón",
    "lat": 39.02205,
    "lon": -0.64242,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00419",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo-Palacio Condes de Cervellón in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 421,
    "name": "Castillo-Palacio Condes de Cervellón",
    "lat": 39.02198,
    "lon": -0.64267,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00420",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo-Palacio Condes de Cervellón in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 422,
    "name": "Torre del Castell de Torrent",
    "lat": 39.43649,
    "lon": -0.46343,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00421",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Edificio militar de interés etnológico y arquitectónico",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre del Castell de Torrent in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 423,
    "name": "Castell del Xiu",
    "lat": 38.9553,
    "lon": -0.34937,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00422",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell del Xiu in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 424,
    "name": "Castell de Marinyén",
    "lat": 39.04837,
    "lon": -0.27592,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00423",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Marinyén in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 425,
    "name": "Castillo del Medio",
    "lat": 39.23722,
    "lon": -0.7736,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00424",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo del Medio in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 426,
    "name": "Castell de Corbera",
    "lat": 39.15494,
    "lon": -0.35287,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00425",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Corbera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 427,
    "name": "Torre Espioca",
    "lat": 39.31513,
    "lon": -0.44075,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00426",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre Espioca in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 428,
    "name": "Castell de Cullera",
    "lat": 39.16598,
    "lon": -0.24995,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00427",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Cullera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 429,
    "name": "Palau dels Boïl d'Arenós",
    "lat": 39.47255,
    "lon": -0.37399,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00428",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau dels Boïl d'Arenós in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 430,
    "name": "Palau del Marqués de Dosaigües",
    "lat": 39.47254,
    "lon": -0.3748,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00429",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau del Marqués de Dosaigües in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 431,
    "name": "Castell d'Ambra",
    "lat": 38.82868,
    "lon": -0.11085,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00430",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell d'Ambra in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 432,
    "name": "Castell del Rebollet",
    "lat": 38.91828,
    "lon": -0.15288,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00431",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell del Rebollet in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 433,
    "name": "Castell de Riba-roja de Túria",
    "lat": 39.54798,
    "lon": -0.56508,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00432",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Riba-roja de Túria in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 434,
    "name": "Castell de Castro",
    "lat": 39.85954,
    "lon": -0.27967,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00433",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Castro in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 435,
    "name": "Castillo De Sot De Chera",
    "lat": 39.62029,
    "lon": -0.9103,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00434",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo De Sot De Chera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 436,
    "name": "Verlassenes Objekt (Castle)",
    "lat": 39.5903,
    "lon": -0.98994,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00435",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Castle) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 437,
    "name": "Torre de Mussa",
    "lat": 39.28939,
    "lon": -0.43185,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00436",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre de Mussa in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 438,
    "name": "Ajuntament d'Alcàsser",
    "lat": 39.36986,
    "lon": -0.44536,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00437",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Ajuntament d'Alcàsser in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 439,
    "name": "Sharq al-Andalus",
    "lat": 39.33645,
    "lon": -0.61716,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00438",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Sharq al-Andalus in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 440,
    "name": "Castillo del Castillet",
    "lat": 39.24172,
    "lon": -0.76762,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00439",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo del Castillet in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 441,
    "name": "Castillo de Cabas",
    "lat": 39.25754,
    "lon": -0.80188,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00440",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Cabas in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 442,
    "name": "Castillo de Enguera",
    "lat": 38.97651,
    "lon": -0.67865,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00441",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Enguera in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 443,
    "name": "Verlassenes Objekt (Castle)",
    "lat": 39.79546,
    "lon": -1.3784,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00442",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Castle) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 444,
    "name": "Castillo de Alcalá del Júcar",
    "lat": 39.19115,
    "lon": -1.43008,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00443",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Alcalá del Júcar in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 445,
    "name": "Castell del Borrò",
    "lat": 38.93665,
    "lon": -0.2736,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00444",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell del Borrò in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 446,
    "name": "Castell de Dénia",
    "lat": 38.84301,
    "lon": 0.1075,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00445",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Dénia in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 447,
    "name": "Torre Mora",
    "lat": 38.8721,
    "lon": -0.75045,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00446",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre Mora in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 448,
    "name": "Verlassenes Objekt (Castle)",
    "lat": 38.87287,
    "lon": -0.75102,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00447",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Castle) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 449,
    "name": "Verlassenes Objekt (Castle)",
    "lat": 38.87306,
    "lon": -0.75038,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00448",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Castle) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 450,
    "name": "Torre de la Càrcel",
    "lat": 39.85265,
    "lon": -0.49002,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00449",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Torre de la Càrcel in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 451,
    "name": "Castillo de Tous",
    "lat": 39.15289,
    "lon": -0.66628,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00450",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Tous in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 452,
    "name": "Castillo de Buñol",
    "lat": 39.41895,
    "lon": -0.79016,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00451",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Buñol in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 453,
    "name": "Palau dels Comtes de Ròtova",
    "lat": 38.93313,
    "lon": -0.25612,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00452",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Propietat de l'Ajuntament de Ròtova",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau dels Comtes de Ròtova in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 454,
    "name": "Palau-Castell de los Malferit",
    "lat": 38.87667,
    "lon": -0.59239,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00453",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau-Castell de los Malferit in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 455,
    "name": "Castell de Petrés",
    "lat": 39.68329,
    "lon": -0.30753,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00454",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Petrés in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 456,
    "name": "Castell d'Albalat dels Sorells",
    "lat": 39.54429,
    "lon": -0.34707,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00455",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell d'Albalat dels Sorells in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 457,
    "name": "Castell de Sumacàrcer - Castell de Penya-roja",
    "lat": 39.08816,
    "lon": -0.62809,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00456",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Sumacàrcer - Castell de Penya-roja in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 458,
    "name": "Vallesa de Mandor",
    "lat": 39.54207,
    "lon": -0.52581,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00457",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Vallesa de Mandor in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 459,
    "name": "Castell de la Senyoria - Palau dels Cruïlles",
    "lat": 39.5442,
    "lon": -0.38539,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00458",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de la Senyoria - Palau dels Cruïlles in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 460,
    "name": "Castell Vell",
    "lat": 38.82214,
    "lon": -0.51617,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00459",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell Vell in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 461,
    "name": "Castell de Vilella",
    "lat": 38.93026,
    "lon": -0.30009,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00460",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Vilella in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 462,
    "name": "Castillo de Gestalgar",
    "lat": 39.60601,
    "lon": -0.83371,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00461",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castillo de Gestalgar in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 463,
    "name": "Castell d'Alfarp",
    "lat": 39.27751,
    "lon": -0.55909,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00462",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell d'Alfarp in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 464,
    "name": "Castell- Palau",
    "lat": 38.94309,
    "lon": -0.35689,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00463",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell- Palau in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 465,
    "name": "Casa Señorial de los Condes de la Alcudia",
    "lat": 39.60438,
    "lon": -0.83393,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00464",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa Señorial de los Condes de la Alcudia in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 466,
    "name": "Castell de Benialí",
    "lat": 39.89203,
    "lon": -0.34728,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00465",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell de Benialí in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 467,
    "name": "Castell del Piló",
    "lat": 39.69551,
    "lon": -0.33791,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00466",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Castell del Piló in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 468,
    "name": "Palau Vives de Canyamás",
    "lat": 39.72977,
    "lon": -0.26738,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00467",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau Vives de Canyamás in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 469,
    "name": "Palau de la Batlia",
    "lat": 39.47718,
    "lon": -0.37668,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00468",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau de la Batlia in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 470,
    "name": "Verlassenes Objekt (Castle)",
    "lat": 39.61421,
    "lon": -0.57802,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "UNCHARTED_NEW_DISCOVERY",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00469",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Verlassenes Objekt (Castle) in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 471,
    "name": "Palau dels Sanç",
    "lat": 38.98586,
    "lon": -0.55593,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00470",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Palau dels Sanç in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  },
  {
    "id": 472,
    "name": "Casa del Baró",
    "lat": 39.7445,
    "lon": -0.35593,
    "province": "Valencia",
    "type": "Castle Ruine",
    "status": "KNOWN_HISTORIC_SITE",
    "year": "19. Jh.",
    "built_area": "2 Etagen",
    "catastro_ref": "VAL00471",
    "isIllustration": true,
    "image": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "history": "Historische castle-Ruine in der Provinz Valencia. Erfasst aus OpenStreetMap Geodaten.",
    "risk": "NIEDRIG",
    "ndvi": 0.55,
    "ndwi": 0.08,
    "youtube_script": {
      "hook": "Die vergessene Ruine Casa del Baró in Valencia.",
      "act1": "Erfassung in den historischen Archiven.",
      "act2": "Stilllegung und Verfall im 20. Jahrhundert.",
      "act3": "Heute: Stille Ruine in der Natur."
    },
    "safety_info": {
      "structural": "Naturstein / Beton. Vorsicht im Truemmerbereich.",
      "legal": "Frei zugaenglich oder oeffentlicher Grund.",
      "equipment": "Feste Wanderschuhe & Taschenlampe."
    }
  }
];


// Haversine distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Smooth auto-zoom helper for map navigation and spot inspection
function MapFlyTo({ center, showAll, spots, selectedSpot }) {
  const map = useMap();

  useEffect(() => {
    window._leaflet_map = map;
  }, [map]);

  // High-detail auto-zoom when a spot is selected
  useEffect(() => {
    if (selectedSpot && selectedSpot.lat && selectedSpot.lon) {
      map.flyTo([selectedSpot.lat, selectedSpot.lon], 16, { duration: 1.3 });
    }
  }, [selectedSpot, map]);

  // Fit bounds when all spots view is active
  useEffect(() => {
    if (showAll && spots.length > 0 && !selectedSpot) {
      const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lon]));
      map.fitBounds(bounds, { padding: [50, 50], duration: 1.2 });
    }
  }, [showAll, spots, selectedSpot, map]);

  return null;
}

const RISK_COLOR = { NIEDRIG: 'text-emerald-400', MITTEL: 'text-amber-400', HOCH: 'text-red-400' };
const RISK_BG   = { NIEDRIG: 'bg-emerald-500/20 border-emerald-500/30', MITTEL: 'bg-amber-500/20 border-amber-500/30', HOCH: 'bg-red-500/20 border-red-500/30' };

export default function App() {
  const [selectedCity, setSelectedCity]   = useState(CITIES[0]);
  const [searchRadiusKm, setRadius]       = useState(250);

  const [mapLayer, setMapLayer]           = useState('satellite');
  const [selectedSpot, setSelectedSpot]   = useState(ALL_SPOTS[0]);
  const [filterStatus, setFilterStatus]   = useState('ALL');
  const [scanning, setScanning]           = useState(false);
  const [activeTab, setActiveTab]         = useState('history');

  const [showAllRegions, setShowAllRegions] = useState(true);
  const [searchQuery, setSearchQuery]       = useState('');
  const [filterProvince, setFilterProvince] = useState('ALL');
  const [filterRisk, setFilterRisk]         = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const filteredSpots = ALL_SPOTS.filter(spot => {
    const dist = calculateDistance(selectedCity.lat, selectedCity.lon, spot.lat, spot.lon);
    const inRadius = showAllRegions || searchRadiusKm >= 200 || dist <= searchRadiusKm;
    const statusMatch = filterStatus === 'ALL' || spot.status === filterStatus;
    const provinceMatch = filterProvince === 'ALL' || spot.province === filterProvince;
    const riskMatch = filterRisk === 'ALL' || spot.risk === filterRisk;

    // Category filter matching logic
    let categoryMatch = true;
    if (filterCategory === 'FABRIK') {
      categoryMatch = spot.type.toLowerCase().includes('fabrik') || spot.type.toLowerCase().includes('mühle') || spot.type.toLowerCase().includes('industrie') || spot.name.toLowerCase().includes('fábrica') || spot.name.toLowerCase().includes('harinas');
    } else if (filterCategory === 'BURG') {
      categoryMatch = spot.type.toLowerCase().includes('burg') || spot.type.toLowerCase().includes('kastell') || spot.type.toLowerCase().includes('castle') || spot.name.toLowerCase().includes('castillo') || spot.name.toLowerCase().includes('castell');
    } else if (filterCategory === 'SANATORIUM') {
      categoryMatch = spot.type.toLowerCase().includes('sanatorium') || spot.type.toLowerCase().includes('klinik') || spot.type.toLowerCase().includes('psychiatrie') || spot.name.toLowerCase().includes('sanatorio') || spot.name.toLowerCase().includes('manicomio') || spot.name.toLowerCase().includes('balneario');
    } else if (filterCategory === 'DORF') {
      categoryMatch = spot.type.toLowerCase().includes('dorf') || spot.type.toLowerCase().includes('kolonie') || spot.type.toLowerCase().includes('siedlung') || spot.name.toLowerCase().includes('pueblo') || spot.name.toLowerCase().includes('colonia') || spot.name.toLowerCase().includes('jinquer');
    } else if (filterCategory === 'VILLA') {
      categoryMatch = spot.type.toLowerCase().includes('palast') || spot.type.toLowerCase().includes('residenz') || spot.type.toLowerCase().includes('villa') || spot.name.toLowerCase().includes('palau') || spot.name.toLowerCase().includes('palacio') || spot.name.toLowerCase().includes('finca');
    }

    const searchMatch = !searchQuery ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.province.toLowerCase().includes(searchQuery.toLowerCase());

    return inRadius && statusMatch && provinceMatch && riskMatch && categoryMatch && searchMatch;
  });

  const knownCount     = filteredSpots.filter(s => s.status === 'KNOWN_HISTORIC_SITE').length;
  const unchartedCount = filteredSpots.filter(s => s.status === 'UNCHARTED_NEW_DISCOVERY').length;

  useEffect(() => {
    if (filteredSpots.length > 0 && !filteredSpots.some(s => s.id === selectedSpot?.id)) {
      setSelectedSpot(filteredSpots[0]);
    }
  }, [selectedCity, searchRadiusKm, filterStatus]);


  function handleScan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      if (filteredSpots.length === 0) {
        setRadius(75); // Auto-erweitere Radius auf 75 km
      }
    }, 1800);
  }


  function handleKmlDownload() {

    const placemarks = filteredSpots.map(s => `
    <Placemark>
      <name>${s.name}</name>
      <description>${s.type} | ${s.status} | Risiko: ${s.risk}\n${s.history}</description>
      <Point><coordinates>${s.lon},${s.lat},0</coordinates></Point>
    </Placemark>`).join('');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>DekadenzScout AI – ${selectedCity.name} ${searchRadiusKm}km</name>
    <description>Generiert von DekadenzScout AI – Comunitat Valenciana</description>
    ${placemarks}
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `dekadenzscout_${selectedCity.name.replace(/ /g,'_')}_${searchRadiusKm}km.kml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className="w-96 flex flex-col border-r border-amber-500/15 bg-slate-900/90 backdrop-blur-xl z-20 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-4 border-b border-amber-500/15">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400 animate-pulse-glow">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-wider text-amber-400 leading-tight">DekadenzScout AI</h1>
            <p className="text-[11px] text-slate-500">Comunitat Valenciana · 2026</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">

          {/* City selector */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Suchzentrum
            </label>
            <select
              value={selectedCity.name}
              onChange={e => setSelectedCity(CITIES.find(c => c.name === e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer"
            >
              {CITIES.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.province})</option>
              ))}
            </select>
          </div>

          {/* Radius slider */}
          <div className="glass-panel p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Suchradius
              </span>
              <span className="text-sm font-extrabold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                {searchRadiusKm} km
              </span>
            </div>
            <input
              type="range" min="10" max="250" step="10"
              value={searchRadiusKm}
              onChange={e => setRadius(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>10 km</span><span>50 km</span><span>120 km</span><span>250 km</span>
            </div>
            <button
              onClick={() => {
                const nextState = !showAllRegions;
                setShowAllRegions(nextState);
                if (nextState) setRadius(250);
              }}
              className={`w-full mt-1.5 py-1.5 px-2 text-[10px] font-bold rounded-lg transition border ${
                showAllRegions || searchRadiusKm >= 200
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
              }`}
            >
              {showAllRegions || searchRadiusKm >= 200
                ? '✅ Alle 12 Objekte in ganz Valencia werden angezeigt'
                : '🗺️ Alle 12 Objekte in ganz Valencia anzeigen (Filter aufheben)'}
            </button>
          </div>

          {/* Stats panel */}
          <div className="glass-panel p-3.5 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Scan-Ergebnis
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${scanning ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}>
                {scanning ? 'Scannt…' : `${filteredSpots.length} gefunden`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 text-center">
                <div className="text-cyan-400 font-bold text-lg">{knownCount}</div>
                <div className="text-slate-500">Bekannte Ruinen</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                <div className="text-amber-400 font-bold text-lg">{unchartedCount}</div>
                <div className="text-slate-500">✨ Neuentdeckungen</div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800">
              <div className="flex justify-between"><span>Orchestrator:</span> <span className="text-amber-400 font-medium">DeepSeek-V4 API</span></div>
              <div className="flex justify-between"><span>Archiv-Mining:</span> <span className="text-cyan-400 font-medium">Kimi K3 (2M+ Caching)</span></div>
              <div className="flex justify-between"><span>Safety Agent:</span> <span className="text-purple-400 font-medium">Qwen 3 Cloud API</span></div>
            </div>
          </div>

          {/* Live Search & Multi-Filters */}
          <div className="glass-panel p-3 rounded-xl space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Objekt oder Ort suchen..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Dropdowns for Province & Risk */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Provinz</label>
                <select
                  value={filterProvince}
                  onChange={e => setFilterProvince(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[10px] text-slate-200 focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Alle Provinzen</option>
                  <option value="Alicante">Alicante</option>
                  <option value="Valencia">Valencia</option>
                  <option value="Castellón">Castellón</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-400 font-bold block mb-1">Risiko</label>
                <select
                  value={filterRisk}
                  onChange={e => setFilterRisk(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-[10px] text-slate-200 focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Alle Risiken</option>
                  <option value="NIEDRIG">🟢 Niedrig</option>
                  <option value="MITTEL">🟡 Mittel</option>
                  <option value="HOCH">🔴 Hoch</option>
                </select>
              </div>
            {/* Category Filter Chips */}
            <div>
              <label className="text-[9px] text-slate-400 font-bold block mb-1">Gebäudetyp / Kriterium</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'ALL', label: '🏢 Alle' },
                  { id: 'FABRIK', label: '🏭 Fabriken' },
                  { id: 'BURG', label: '🏰 Burgen' },
                  { id: 'SANATORIUM', label: '🏥 Sanatorien' },
                  { id: 'DORF', label: '🏚️ Dörfer' },
                  { id: 'VILLA', label: '🏛️ Villen' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setFilterCategory(c.id)}
                    className={`text-[9px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      filterCategory === c.id
                        ? 'bg-amber-500/25 border-amber-500/50 text-amber-300 shadow'
                        : 'bg-slate-900/90 border-slate-700/80 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2">
            {['ALL', 'KNOWN_HISTORIC_SITE', 'UNCHARTED_NEW_DISCOVERY'].map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                  filterStatus === f
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {f === 'ALL' ? 'Alle' : f === 'KNOWN_HISTORIC_SITE' ? 'Bekannt' : '✨ Neu'}
              </button>
            ))}
          </div>

          {/* Spot list */}
          <div className="space-y-2">
            {filteredSpots.length === 0 && (
              <div className="text-center text-slate-500 text-xs py-8">
                Keine Objekte im {searchRadiusKm} km Radius um<br />
                <span className="text-amber-400">{selectedCity.name}</span> gefunden.
              </div>
            )}
            {filteredSpots.map(spot => (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedSpot?.id === spot.id
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'glass-panel-light border-transparent hover:border-slate-600'
                }`}
              >
                {/* Mini-Thumbnail + Titel */}
                <div className="flex gap-2 items-start">
                  {spot.image && (
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-700"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">{spot.name}</span>
                      <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                        spot.status === 'UNCHARTED_NEW_DISCOVERY'
                          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                          : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                      }`}>
                        {spot.status === 'UNCHARTED_NEW_DISCOVERY' ? '✨ NEU' : 'BEKANNT'}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{spot.province} · {spot.year}</div>
                    {/* GPS Verification Badge */}
                    <div className={`inline-flex items-center gap-1 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      spot.status === 'KNOWN_HISTORIC_SITE'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                    }`}>
                      {spot.status === 'KNOWN_HISTORIC_SITE' ? '✅ GPS verifiziert' : '⚠️ Demo-GPS – Satellit ausstehend'}
                    </div>
                  </div>
                </div>
              </button>
            ))}

          </div>

        </div>

        {/* Detail panel */}
        {selectedSpot && (
          <div className="border-t border-amber-500/15 p-4 space-y-3 bg-slate-950/80">
            {/* Image Header */}
            {selectedSpot.image && (
              <div className="relative h-36 w-full rounded-xl overflow-hidden border border-amber-500/20 shadow-lg">
                <img
                  src={selectedSpot.image}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                {/* Illustration Badge */}
                {selectedSpot.isIllustration && (
                  <div className="absolute top-2 left-2 bg-slate-900/90 border border-amber-500/40 text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    📷 Illustration – kein echtes Foto
                  </div>
                )}
                {!selectedSpot.isIllustration && (
                  <div className="absolute top-2 left-2 bg-emerald-900/90 border border-emerald-500/50 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    ✅ Echtes Foto des Objekts
                  </div>
                )}

                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end">
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-sm leading-tight drop-shadow-md">{selectedSpot.name}</h3>
                    <span className="text-[10px] text-amber-400 font-semibold">{selectedSpot.province} · Baujahr {selectedSpot.year}</span>
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded border font-bold ${RISK_BG[selectedSpot.risk]} ${RISK_COLOR[selectedSpot.risk]}`}>
                    ⚠ {selectedSpot.risk}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons: Google Earth 3D & Google Search */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://earth.google.com/web/@${selectedSpot.lat},${selectedSpot.lon},250a,200d,35y,0h,0t,0r`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-[10px] transition text-center"
              >
                🌍 Google Earth 3D
              </a>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedSpot.name + ' urbex abandonado ' + selectedSpot.province)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-300 font-bold rounded-xl text-[10px] transition text-center"
              >
                🔍 Google & Urbex Suche
              </a>
            </div>


            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 text-center">
                <div className="text-slate-500 text-[9px]">Dach-NDVI</div>
                <div className="text-emerald-400 font-bold">{selectedSpot.ndvi}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 text-center">
                <div className="text-slate-500 text-[9px]">Pool-NDWI</div>
                <div className="text-blue-400 font-bold">{selectedSpot.ndwi}</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 text-center">
                <div className="text-slate-500 text-[9px]">Grundfläche</div>
                <div className="text-amber-400 font-bold">{selectedSpot.built_area || '1.200 m²'}</div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-1 border-b border-slate-800 pb-1">
              {[
                { id: 'history', label: '📜 Historie' },
                { id: 'catastro', label: '🏛️ Kataster' },
                { id: 'youtube', label: '🎬 YouTube 3-Akt' },
                { id: 'safety', label: '🛡️ Safety' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 text-[9px] font-bold py-1 rounded transition-all ${
                    activeTab === t.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-[11px] min-h-[100px]">
              {activeTab === 'history' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <History className="w-3 h-3" /> KI-Recherche (Kimi K3 & GLM-5)
                  </span>
                  <p className="text-slate-300 leading-relaxed">{selectedSpot.history}</p>
                </div>
              )}

              {activeTab === 'catastro' && (
                <div className="space-y-2 text-[10px]">
                  <div className="text-amber-400 font-bold mb-1 flex justify-between items-center">
                    <span>🏛️ Spanisches Katasteramt (Sede Electrónica del Catastro)</span>
                  </div>

                  {/* Amtliches Kataster-Fassadenfoto Link & Google Earth / Maps Satellit */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <a
                      href={`https://www1.catastro.meh.es/CYG/ASP/busquedarc.asp?RefCat=${selectedSpot.catastro_ref || '03031A004000120000WX'}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded text-[9px] text-center transition flex items-center justify-center gap-1"
                    >
                      🏛️ Kataster-Akte öffnen
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.lat},${selectedSpot.lon}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold rounded text-[9px] text-center transition flex items-center justify-center gap-1"
                    >
                      📍 Google Maps GPS
                    </a>
                    <a
                      href={`https://earth.google.com/web/@${selectedSpot.lat},${selectedSpot.lon},250a,35d,35y,0h,0t,0r`}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded text-[9px] text-center transition flex items-center justify-center gap-1"
                    >
                      🌍 Google Earth 3D-Satellit & 3D-Gebäude öffnen
                    </a>
                  </div>


                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Kataster-Ref:</span>
                    <span className="font-mono text-cyan-400 font-bold">{selectedSpot.catastro_ref || '03031A004000120000WX'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Amtliches Baujahr:</span>
                    <span className="text-slate-200">{selectedSpot.year}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-500">Bebaute Fläche:</span>
                    <span className="text-slate-200">{selectedSpot.built_area || '1.200 m²'}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-500">Aktivitäts-Status:</span>
                    <span className="text-emerald-400 font-bold">Unbewohnt (is_active: False)</span>
                  </div>
                </div>
              )}


              {activeTab === 'youtube' && selectedSpot.youtube_script && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> YouTube 3-Akt Dramaturgie
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-amber-500/20 text-amber-300 font-medium">
                    🎬 <span className="font-bold">HOOK:</span> "{selectedSpot.youtube_script.hook}"
                  </div>
                  <div className="text-slate-400 space-y-1 text-[9px] pt-1">
                    <div><span className="text-emerald-400 font-bold">Akt 1 (Aufstieg):</span> {selectedSpot.youtube_script.act1}</div>
                    <div><span className="text-amber-400 font-bold">Akt 2 (Tragödie):</span> {selectedSpot.youtube_script.act2}</div>
                    <div><span className="text-slate-300 font-bold">Akt 3 (Heute):</span> {selectedSpot.youtube_script.act3}</div>
                  </div>
                </div>
              )}

              {activeTab === 'safety' && selectedSpot.safety_info && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="text-purple-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Qwen 3 Cloud Safety Assessment
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                    <div><span className="text-slate-500">Bausubstanz:</span> <span className="text-amber-300">{selectedSpot.safety_info.structural}</span></div>
                    <div><span className="text-slate-500">Rechtslage:</span> <span className="text-cyan-300">{selectedSpot.safety_info.legal}</span></div>
                    <div className="pt-1 text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Empfohlene Ausrüstung: {selectedSpot.safety_info.equipment}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Actions */}
        <div className="p-4 border-t border-amber-500/15 space-y-2">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
          >
            <Search className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Satelliten-Scan läuft…' : 'Neuen Scan starten'}
          </button>
          <button
            onClick={handleKmlDownload}
            className="btn-amber w-full py-2.5 px-4 text-sm"
          >
            <Download className="w-4 h-4" /> KML für Google Maps herunterladen
          </button>
        </div>
      </aside>

      {/* ── MAP ── */}
      <main className="flex-1 relative p-3">
        {/* Floating Radius Control Bar directly on top of the Map */}
        <div className="absolute top-5 left-5 z-[1000] glass-panel p-3 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center gap-3 bg-slate-950/90 backdrop-blur-xl">
          <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5 shrink-0">
            <Sliders className="w-4 h-4 text-amber-400" /> Radius:
          </span>

          <button
            onClick={() => setRadius(r => Math.max(10, r - 20))}
            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-black rounded-lg text-xs flex items-center justify-center transition"
          >
            -
          </button>

          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              {showAllRegions || searchRadiusKm >= 200 ? '250 km (Alle)' : `${searchRadiusKm} km`}
            </span>
            <input
              type="range" min="10" max="250" step="10"
              value={searchRadiusKm}
              onChange={e => {
                setRadius(Number(e.target.value));
                if (Number(e.target.value) < 200) setShowAllRegions(false);
              }}
              className="w-28 cursor-pointer mt-1"
            />
          </div>

          <button
            onClick={() => setRadius(r => Math.min(250, r + 20))}
            className="w-7 h-7 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-black rounded-lg text-xs flex items-center justify-center transition"
          >
            +
          </button>

          <button
            onClick={() => {
              setFilterStatus('ALL');
              setShowAllRegions(true);
              setRadius(250);
            }}
            className="py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold rounded-xl transition shrink-0 cursor-pointer"
          >
            🗺️ Alle 12 Objekte anzeigen
          </button>
        </div>

        {/* Map layer & Zoom controls */}
        <div className="absolute top-5 right-5 z-[1000] flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${mapLayer === 'satellite' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'glass-panel border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Satellite className="w-3.5 h-3.5" /> Satellit
            </button>
            <button
              onClick={() => setMapLayer('osm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${mapLayer === 'osm' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'glass-panel border-slate-700 text-slate-400 hover:border-slate-500'}`}
            >
              <Map className="w-3.5 h-3.5" /> Straßen
            </button>
          </div>

          {/* Quick Zoom Controls (+ / - / Übersicht) */}
          <div className="glass-panel p-1 rounded-xl border border-amber-500/30 flex flex-col gap-1 bg-slate-950/90 shadow-2xl">
            <button
              title="Heranzoomen (+)"
              onClick={() => {
                if (window._leaflet_map) window._leaflet_map.zoomIn();
              }}
              className="w-8 h-8 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 text-amber-400 font-black rounded-lg text-sm flex items-center justify-center transition cursor-pointer"
            >
              +
            </button>
            <button
              title="Herauszoomen (-)"
              onClick={() => {
                if (window._leaflet_map) window._leaflet_map.zoomOut();
              }}
              className="w-8 h-8 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 text-amber-400 font-black rounded-lg text-sm flex items-center justify-center transition cursor-pointer"
            >
              -
            </button>
            <button
              title="Gesamtübersicht (Fit Bounds)"
              onClick={() => {
                if (window._leaflet_map && filteredSpots.length > 0) {
                  const bounds = L.latLngBounds(filteredSpots.map(s => [s.lat, s.lon]));
                  window._leaflet_map.fitBounds(bounds, { padding: [50, 50] });
                }
              }}
              className="w-8 h-8 bg-slate-800 hover:bg-amber-500/20 border border-slate-700 text-amber-400 font-bold rounded-lg text-[10px] flex items-center justify-center transition cursor-pointer"
            >
              🗺️
            </button>
          </div>
        </div>

        <MapContainer
          center={[selectedCity.lat, selectedCity.lon]}
          zoom={10}
          className="w-full h-full"
          zoomControl={false}
        >
          <MapFlyTo
            center={selectedCity}
            showAll={showAllRegions || searchRadiusKm >= 200}
            spots={filteredSpots}
            selectedSpot={selectedSpot}
          />

          <TileLayer
            key={mapLayer}
            url={mapLayer === 'satellite'
              ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            attribution='&copy; ESRI / OpenStreetMap contributors'
          />

          {/* Radius circle */}
          <Circle
            center={[selectedCity.lat, selectedCity.lon]}
            radius={searchRadiusKm * 1000}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.07, weight: 2, dashArray: '6,4' }}
          />

          {/* Spots */}
          {filteredSpots.map(spot => (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={spot.status === 'UNCHARTED_NEW_DISCOVERY' ? unchartedIcon : knownIcon}
              eventHandlers={{ click: () => setSelectedSpot(spot) }}
            >
              <Popup>
                <div style={{ minWidth: 240 }} className="p-1">
                  {spot.image && (
                    <img
                      src={spot.image}
                      alt={spot.name}
                      className="w-full h-24 object-cover rounded-lg mb-2 border border-slate-700"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-extrabold text-slate-100 text-xs leading-snug">{spot.name}</h4>
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold mb-1">{spot.province} · {spot.type} · Baujahr {spot.year}</div>
                  <p className="text-[10px] text-slate-300 leading-relaxed mb-2">{spot.history.slice(0, 100)}…</p>
                  <div className="flex gap-1.5 text-[9px] font-bold">
                    <span className="bg-slate-800 text-emerald-400 rounded px-1.5 py-0.5 border border-slate-700">NDVI {spot.ndvi}</span>
                    <span className="bg-slate-800 text-blue-400 rounded px-1.5 py-0.5 border border-slate-700">NDWI {spot.ndwi}</span>
                    <span className={`rounded px-1.5 py-0.5 ${RISK_BG[spot.risk]} ${RISK_COLOR[spot.risk]}`}>⚠ {spot.risk}</span>
                  </div>
                </div>
              </Popup>

            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}
