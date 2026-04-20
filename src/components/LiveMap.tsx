import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Clock, MapPin, Radio, Lock, Unlock, Activity } from 'lucide-react';

/* ── Hardcoded center: Monas, Jakarta ── */
const MAP_CENTER: [number, number] = [-6.1754, 106.8272];

/* ── Haversine distance (meters) ── */
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180, p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ── Icons ── */
const userIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div style="position:relative;width:16px;height:16px;display:flex;align-items:center;justify-content:center">
    <div style="position:absolute;width:48px;height:48px;border:1px solid rgba(0,229,255,0.4);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;top:-16px;left:-16px"></div>
    <div style="width:14px;height:14px;background:#00E5FF;border-radius:50%;border:2px solid #050505;box-shadow:0 0 15px rgba(0,229,255,0.8);z-index:10"></div>
  </div>`,
  iconSize: [16, 16], iconAnchor: [8, 8]
});

const mkIcon = (op: number, locked: boolean) => L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border:1px solid ${locked ? '#FFB300' : '#00E5FF'};background:rgba(5,5,5,0.8);opacity:${op};box-shadow:0 0 10px ${locked ? 'rgba(255,179,0,' + op * 0.5 + ')' : 'rgba(0,229,255,' + op * 0.5 + ')'};cursor:pointer;transition:transform .3s">
    <div style="width:6px;height:6px;background:${locked ? '#FFB300' : '#00E5FF'};animation:pulse 2s infinite"></div>
  </div>`,
  iconSize: [24, 24], iconAnchor: [12, 12]
});

/* ── Scrambled text for locked messages ── */
const ScrambledText = ({ text }: { text: string }) => {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!';
  return <span>{text.split('').map(ch => ch === ' ' ? ' ' : c[Math.floor(Math.random() * c.length)]).join('')}</span>;
};

/* ── 40 Hardcoded dummy messages across Jakarta ── */
const DUMMY_MESSAGES = [
  { id: 1, lat: -6.1755, lng: 106.8275, text: "Monas indah banget malam ini!", time: 14400, op: 1.0 },
  { id: 2, lat: -6.1740, lng: 106.8260, text: "Pedagang kaki lima sate favorit.", time: 7200, op: 0.9 },
  { id: 3, lat: -6.1770, lng: 106.8290, text: "Parkir gratis di belakang sini.", time: 3600, op: 0.7 },
  { id: 4, lat: -6.1730, lng: 106.8300, text: "WiFi gratisan lumayan kencang.", time: 1200, op: 0.4 },
  { id: 5, lat: -6.1780, lng: 106.8240, text: "Hati-hati jalan licin habis hujan.", time: 900, op: 0.3 },
  { id: 6, lat: -6.1760, lng: 106.8310, text: "Es kelapa muda paling segar di Jakarta.", time: 18000, op: 1.0 },
  { id: 7, lat: -6.1720, lng: 106.8280, text: "Busker jalanan nyanyi lagu 90an.", time: 5400, op: 0.8 },
  { id: 8, lat: -6.1790, lng: 106.8250, text: "Kucing oren bobo di bangku taman.", time: 10800, op: 1.0 },
  { id: 9, lat: -6.1745, lng: 106.8320, text: "Ada dompet jatuh di dekat air mancur.", time: 600, op: 0.2 },
  { id: 10, lat: -6.1710, lng: 106.8270, text: "Spot selfie terbaik arah barat.", time: 21600, op: 1.0 },
  { id: 11, lat: -6.1800, lng: 106.8300, text: "Toilet umum bersih ada di pojok.", time: 4500, op: 0.6 },
  { id: 12, lat: -6.1765, lng: 106.8230, text: "Tukang balon buat anak-anak.", time: 8400, op: 0.85 },
  { id: 13, lat: -6.1735, lng: 106.8340, text: "Ada razia kendaraan di sini.", time: 2700, op: 0.5 },
  { id: 14, lat: -6.1695, lng: 106.8260, text: "Jajanan malem paling rame di sini!", time: 15000, op: 1.0 },
  { id: 15, lat: -6.1810, lng: 106.8270, text: "Tempat ngabuburit enak banget.", time: 7800, op: 0.9 },
  { id: 16, lat: -6.1750, lng: 106.8200, text: "Toko vintage hidden gem!", time: 25000, op: 1.0 },
  { id: 17, lat: -6.1720, lng: 106.8350, text: "Genangan air besar pas hujan.", time: 1800, op: 0.35 },
  { id: 18, lat: -6.1780, lng: 106.8360, text: "Mural keren baru selesai.", time: 43200, op: 1.0 },
  { id: 19, lat: -6.1700, lng: 106.8240, text: "Live music tiap Jumat malam.", time: 36000, op: 1.0 },
  { id: 20, lat: -6.1815, lng: 106.8230, text: "Angkringan murah meriah.", time: 9600, op: 0.95 },
  { id: 21, lat: -6.1685, lng: 106.8300, text: "Lampu jalan mati, gelap!", time: 500, op: 0.15 },
  { id: 22, lat: -6.1770, lng: 106.8190, text: "Kedai kopi specialty baru buka.", time: 28800, op: 1.0 },
  { id: 23, lat: -6.1825, lng: 106.8290, text: "Pohon tumbang nutup setengah jalan.", time: 3000, op: 0.45 },
  { id: 24, lat: -6.1740, lng: 106.8370, text: "Taman bermain anak baru direnovasi.", time: 50000, op: 1.0 },
  { id: 25, lat: -6.1690, lng: 106.8220, text: "Warung nasi uduk legendaris 24 jam.", time: 72000, op: 1.0 },
  { id: 26, lat: -6.1830, lng: 106.8250, text: "Ada event car free day besok.", time: 16200, op: 1.0 },
  { id: 27, lat: -6.1755, lng: 106.8380, text: "Signal provider X bagus di sini.", time: 6000, op: 0.7 },
  { id: 28, lat: -6.1705, lng: 106.8310, text: "Siomay Mang Ujang udah habis.", time: 300, op: 0.1 },
  { id: 29, lat: -6.1840, lng: 106.8310, text: "Martabak manis terenak sedunia.", time: 11000, op: 0.95 },
  { id: 30, lat: -6.1715, lng: 106.8190, text: "Jogging track baru, enak banget.", time: 40000, op: 1.0 },
  { id: 31, lat: -6.1795, lng: 106.8180, text: "Bazar UMKM setiap akhir pekan.", time: 32000, op: 1.0 },
  { id: 32, lat: -6.1680, lng: 106.8280, text: "Colokan listrik gratis di bangku.", time: 8000, op: 0.8 },
  { id: 33, lat: -6.1760, lng: 106.8400, text: "Becak wisata start dari sini.", time: 20000, op: 1.0 },
  { id: 34, lat: -6.1850, lng: 106.8260, text: "Trotoar baru, nyaman buat jalan.", time: 45000, op: 1.0 },
  { id: 35, lat: -6.1725, lng: 106.8170, text: "Museum tersembunyi, tiket 5rb.", time: 55000, op: 1.0 },
  { id: 36, lat: -6.1670, lng: 106.8250, text: "Abang tukang bakso langganan.", time: 4200, op: 0.6 },
  { id: 37, lat: -6.1785, lng: 106.8410, text: "Halte TransJakarta terdekat.", time: 86400, op: 1.0 },
  { id: 38, lat: -6.1860, lng: 106.8280, text: "Spot foto sunset terbaik!", time: 13000, op: 1.0 },
  { id: 39, lat: -6.1750, lng: 106.8150, text: "Ada street art baru di gang.", time: 30000, op: 1.0 },
  { id: 40, lat: -6.1665, lng: 106.8290, text: "Senam pagi gratis setiap Minggu.", time: 60000, op: 1.0 },
];

/* ── Auto-cycling fly-to animation ── */
const MapAnimator = () => {
  const map = useMap();
  const indexRef = useRef(0);
  const targets = useRef([
    { center: MAP_CENTER, zoom: 13 },
    { center: [-6.1755, 106.8275] as [number, number], zoom: 16 },
    { center: [-6.1700, 106.8240] as [number, number], zoom: 15 },
    { center: [-6.1800, 106.8300] as [number, number], zoom: 16 },
    { center: [-6.1750, 106.8350] as [number, number], zoom: 15 },
    { center: MAP_CENTER, zoom: 14 },
  ]);

  useEffect(() => {
    // Initial zoom in
    const initTimer = setTimeout(() => {
      map.flyTo(MAP_CENTER, 14, { duration: 1.2, easeLinearity: 0.25 });
    }, 100);

    // Cycle through waypoints
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % targets.current.length;
      const t = targets.current[indexRef.current];
      map.flyTo(t.center, t.zoom, { duration: 1.5, easeLinearity: 0.25 });
    }, 3500);

    return () => { clearTimeout(initTimer); clearInterval(interval); };
  }, [map]);

  return null;
};

/* ── Animated radar pulse rings ── */
const PulseRings = () => (
  <>
    <Circle center={MAP_CENTER} radius={200} pathOptions={{ color: '#00E5FF', fillColor: '#00E5FF', fillOpacity: 0.03, weight: 1, dashArray: '6 4' }} />
    <Circle center={MAP_CENTER} radius={500} pathOptions={{ color: '#00E5FF', fillColor: 'transparent', fillOpacity: 0, weight: 0.5, dashArray: '4 8', opacity: 0.3 }} />
    <Circle center={MAP_CENTER} radius={1000} pathOptions={{ color: '#00E5FF', fillColor: 'transparent', fillOpacity: 0, weight: 0.5, dashArray: '2 10', opacity: 0.15 }} />
  </>
);

/* ── Message counter HUD ── */
const StatsOverlay = ({ total, unlocked, critical }: { total: number; unlocked: number; critical: number }) => (
  <div className="absolute top-4 right-4 z-[400] pointer-events-none">
    <div className="bg-tactical-black/80 border border-tactical-gray px-3 py-2 backdrop-blur-sm space-y-1">
      <div className="text-tactical-cyan font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
        <Activity size={10} /> {total} PESAN AKTIF
      </div>
      <div className="text-tactical-light/40 font-mono text-[9px] tracking-widest">
        {unlocked} TERBUKA · {critical} KRITIS
      </div>
    </div>
  </div>
);

/* ── Connection polylines between nearby messages ── */
const NetworkLines = ({ messages }: { messages: typeof DUMMY_MESSAGES }) => {
  const pairs: [number, number][][] = [];
  for (let i = 0; i < messages.length; i++) {
    for (let j = i + 1; j < messages.length; j++) {
      const d = getDistance(messages[i].lat, messages[i].lng, messages[j].lat, messages[j].lng);
      if (d < 400 && d > 50) {
        pairs.push([[messages[i].lat, messages[i].lng], [messages[j].lat, messages[j].lng]]);
      }
    }
  }
  // Only show a subset to avoid clutter
  const shown = pairs.filter((_, i) => i % 3 === 0);
  return (
    <>
      {shown.map((p, i) => (
        <Polyline key={`net-${i}`} positions={p} pathOptions={{ color: '#00E5FF', weight: 0.5, opacity: 0.12, dashArray: '3 6' }} />
      ))}
    </>
  );
};

/* ── Format seconds to readable ── */
const formatTime = (s: number) => {
  if (s < 60) return `${s} dtk`;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h === 0 ? `${m} mnt` : `${h}j ${m}m`;
};

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function LiveMap() {
  const [messages, setMessages] = useState(
    DUMMY_MESSAGES.map(m => ({ ...m, timeLeft: m.time }))
  );

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMessages(prev => prev.map(m => ({ ...m, timeLeft: Math.max(0, m.timeLeft - 1) })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const unlocked = messages.filter(m => getDistance(MAP_CENTER[0], MAP_CENTER[1], m.lat, m.lng) <= 200).length;
  const critical = messages.filter(m => m.timeLeft < 3600).length;

  return (
    <div className="relative w-full h-[500px] border-2 border-tactical-gray hover:border-tactical-cyan transition-colors duration-500 z-10 group overflow-hidden">

      {/* Top-left badge */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="bg-tactical-black/80 border border-tactical-cyan px-3 py-1.5 backdrop-blur-sm shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <span className="text-tactical-cyan font-mono text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-tactical-cyan rounded-full animate-pulse shadow-[0_0_5px_#00E5FF]" />
            Radar Jakarta (Live Demo)
          </span>
        </div>
      </div>

      <StatsOverlay total={messages.length} unlocked={unlocked} critical={critical} />

      {/* Bottom-right coords */}
      <div className="absolute bottom-4 right-4 z-[400] pointer-events-none text-right">
        <div className="bg-tactical-black/80 border border-tactical-gray px-3 py-2 backdrop-blur-sm group-hover:border-tactical-cyan/50 transition-all">
          <div className="text-tactical-light/50 font-mono text-[10px] uppercase tracking-widest mb-1">Pusat Koordinat</div>
          <div className="text-tactical-cyan font-mono text-xs tracking-widest">
            {MAP_CENTER[0].toFixed(5)}° S<br />{MAP_CENTER[1].toFixed(5)}° E
          </div>
        </div>
      </div>

      <MapContainer center={MAP_CENTER} zoom={11} scrollWheelZoom={false} className="w-full h-full bg-tactical-black" zoomControl={false}>
        <MapAnimator />
        <TileLayer attribution='&copy; OpenStreetMap &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <PulseRings />
        <NetworkLines messages={DUMMY_MESSAGES} />

        {/* User / demo center marker */}
        <Marker position={MAP_CENTER} icon={userIcon}>
          <Popup className="tactical-popup">
            <div className="bg-tactical-black/90 border border-tactical-cyan p-3 min-w-[150px] backdrop-blur-md">
              <div className="flex items-center gap-2 text-tactical-cyan font-mono text-xs uppercase tracking-widest mb-2 border-b border-tactical-cyan/30 pb-2">
                <MapPin size={12} /> Pusat Radar
              </div>
              <div className="text-tactical-light/80 text-[10px] font-sans tracking-wide leading-relaxed">
                Pemancar Demo Aktif.<br />Jangkauan deteksi: <span className="text-tactical-cyan font-bold">200m</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* All message markers */}
        {messages.map(msg => {
          const dist = Math.round(getDistance(MAP_CENTER[0], MAP_CENTER[1], msg.lat, msg.lng));
          const locked = dist > 200;
          return (
            <Marker key={msg.id} position={[msg.lat, msg.lng]} icon={mkIcon(msg.op, locked)}>
              <Popup className="tactical-popup border-none bg-transparent m-0 p-0 shadow-none">
                <div className={`bg-tactical-black/95 border ${locked ? 'border-tactical-amber' : 'border-tactical-cyan'} p-4 min-w-[240px] relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-0" />
                  <div className={`flex items-center justify-between font-mono text-[10px] uppercase tracking-widest mb-3 border-b pb-2 relative z-10 ${locked ? 'text-tactical-amber border-tactical-amber/30' : 'text-tactical-cyan border-tactical-cyan/30'}`}>
                    <span className="flex items-center gap-1.5">
                      {locked ? <Lock size={12} className="animate-pulse" /> : <Unlock size={12} />}
                      {locked ? 'TERKUNCI' : 'TERBUKA'}
                    </span>
                    <span className={`px-1.5 py-0.5 ${msg.timeLeft < 3600 ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : locked ? 'bg-tactical-amber/20' : 'bg-tactical-cyan/20'}`}>
                      {Math.round(msg.op * 100)}%
                    </span>
                  </div>
                  <div className={`text-tactical-light font-sans text-[13px] leading-tight mb-5 relative z-10 ${msg.op < 0.3 ? 'animate-flicker' : ''}`}>
                    <span className={`${locked ? 'text-tactical-amber' : 'text-tactical-cyan'} font-mono mr-1.5 text-[10px] opacity-80`}>#?!</span>
                    {locked ? (
                      <span className="text-tactical-light/50 tracking-widest font-mono text-xs">
                        <ScrambledText text={msg.text.substring(0, 15) + '...'} />
                        <div className="mt-2 text-[8px] text-tactical-amber animate-pulse">&gt;&gt; DEKATI AREA UNTUK MEMBACA</div>
                      </span>
                    ) : (
                      <span className="font-sans text-tactical-light drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                        {msg.text.length > 30 ? msg.text.substring(0, 30) + '...' : msg.text}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end justify-between uppercase relative z-10">
                    <span className={`${locked ? 'text-tactical-amber/70' : 'text-tactical-cyan/70'} font-mono flex items-center gap-1 text-[10px]`}>
                      <MapPin size={10} /> {dist}m
                    </span>
                    <span className={`font-mono flex items-center gap-1.5 text-[10px] ${msg.timeLeft < 3600 ? 'text-red-400 border border-red-500/60 bg-red-900/40 px-2 py-1 animate-pulse font-bold' : 'text-tactical-cyan border border-tactical-gray/30 bg-tactical-gray/10 px-2 py-1'}`}>
                      <Clock size={10} />
                      {msg.timeLeft < 3600 ? 'KRITIS:' : 'SISA:'} {formatTime(msg.timeLeft)}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
