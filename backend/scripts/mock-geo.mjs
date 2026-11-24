// Mock dos serviços externos da Rota do dia (Nominatim, Photon e OSRM), para o CI e testes
// locais não dependerem da internet. Respostas determinísticas, no formato das APIs reais.
// Uso: node scripts/mock-geo.mjs   (porta: MOCK_GEO_PORT, padrão 3999)
// E na API: NOMINATIM_URL=http://localhost:3999 PHOTON_URL=http://localhost:3999 OSRM_URL=http://localhost:3999
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_GEO_PORT ?? 3999);
// Mesmo padrão do backend (rota.config.ts): os endereços caem em volta da madeireira.
const CENTRO = {
  lat: Number(process.env.DEPOSITO_LAT ?? -23.19116),
  lng: Number(process.env.DEPOSITO_LNG ?? -46.90702),
};
const VELOCIDADE_MS = 35 / 3.6; // ~35 km/h
const SINUOSIDADE = 1.35;

/** Hash estável do texto → ponto a até ~10 km do centro. O mesmo endereço sempre dá o mesmo ponto. */
function geocodificar(q) {
  let h = 2166136261;
  for (const ch of q.toLowerCase()) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  const a = ((h >>> 0) % 3600) / 10; // ângulo em graus
  const r = 0.02 + (((h >>> 12) % 1000) / 1000) * 0.07; // 0,02° a 0,09° (~2 a 10 km)
  const rad = (a * Math.PI) / 180;
  return { lat: CENTRO.lat + r * Math.sin(rad), lng: CENTRO.lng + r * Math.cos(rad) };
}

function metros(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s)) * SINUOSIDADE;
}

/** "lng,lat;lng,lat;..." → [{lat, lng}] */
function pontos(coords) {
  return decodeURIComponent(coords)
    .split(';')
    .map((p) => {
      const [lng, lat] = p.split(',').map(Number);
      return { lat, lng };
    });
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const q = url.searchParams.get('q') ?? '';

  // Nominatim: GET /search?q=...&format=jsonv2
  if (url.pathname === '/search') {
    if (!q.trim()) return json(res, 200, []);
    const { lat, lng } = geocodificar(q);
    return json(res, 200, [{ lat: String(lat), lon: String(lng), display_name: q }]);
  }

  // Photon: GET /api/?q=...
  if (url.pathname === '/api' || url.pathname === '/api/') {
    if (!q.trim()) return json(res, 200, { type: 'FeatureCollection', features: [] });
    const { lat, lng } = geocodificar(q);
    return json(res, 200, {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: { name: q } }],
    });
  }

  // OSRM table: GET /table/v1/driving/{coords}?annotations=distance
  let m = url.pathname.match(/^\/table\/v1\/driving\/(.+)$/);
  if (m) {
    const ps = pontos(m[1]);
    return json(res, 200, { code: 'Ok', distances: ps.map((a) => ps.map((b) => Math.round(metros(a, b)))) });
  }

  // OSRM route: GET /route/v1/driving/{coords}?overview=full&geometries=geojson
  m = url.pathname.match(/^\/route\/v1\/driving\/(.+)$/);
  if (m) {
    const ps = pontos(m[1]);
    const legs = ps.slice(1).map((b, i) => {
      const distance = Math.round(metros(ps[i], b));
      return { distance, duration: Math.round(distance / VELOCIDADE_MS) };
    });
    // Traçado "pelas ruas": 8 pontos intermediários por trecho.
    const coordinates = [];
    ps.slice(1).forEach((b, i) => {
      const a = ps[i];
      for (let k = 0; k < 8; k++) {
        const t = k / 8;
        coordinates.push([a.lng + (b.lng - a.lng) * t, a.lat + (b.lat - a.lat) * t]);
      }
    });
    const ultimo = ps.at(-1);
    coordinates.push([ultimo.lng, ultimo.lat]);
    const distance = legs.reduce((s, l) => s + l.distance, 0);
    const duration = legs.reduce((s, l) => s + l.duration, 0);
    return json(res, 200, {
      code: 'Ok',
      routes: [{ geometry: { type: 'LineString', coordinates }, legs, distance, duration }],
    });
  }

  json(res, 404, { code: 'NotFound', message: `mock-geo: rota não simulada ${url.pathname}` });
});

server.listen(PORT, () => console.log(`mock-geo ouvindo em http://localhost:${PORT}`));
