import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, Clock, MapPin, Radio, Lock, Unlock } from 'lucide-react';

// Distance calculation (Haversine formula) in meters
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// FlyTo component to center map on user location
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center[0] === 'number' && !isNaN(center[0]) && typeof center[1] === 'number' && !isNaN(center[1])) {
      map.flyTo(center, 16, { duration: 2 });
    }
  }, [center, map]);
  return null;
};

// Custom HTML Markers
const userIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-4 h-4 relative flex items-center justify-center">
    <div class="absolute w-12 h-12 border border-tactical-cyan/40 rounded-full animate-ping"></div>
    <div class="w-4 h-4 bg-tactical-cyan rounded-full border-2 border-tactical-black shadow-[0_0_15px_rgba(0,229,255,0.8)] z-10 transition-transform duration-300 hover:scale-125"></div>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const createMessageIcon = (opacity: number, isLocked: boolean) => L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="flex items-center justify-center w-6 h-6 border ${isLocked ? 'border-tactical-amber' : 'border-tactical-cyan'} bg-tactical-black/80 backdrop-blur-sm transition-all duration-300 hover:scale-125 cursor-pointer ${isLocked ? 'hover:bg-tactical-amber/20 hover:border-tactical-light' : 'hover:bg-tactical-cyan/20 hover:border-tactical-light'}" style="opacity: ${opacity}; box-shadow: 0 0 10px ${isLocked ? `rgba(255,179,0, ${opacity * 0.5})` : `rgba(0,229,255, ${opacity * 0.5})`}">
    <div class="w-1.5 h-1.5 ${isLocked ? 'bg-tactical-amber' : 'bg-tactical-cyan'} animate-pulse"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Mock Data Generator (Adjusted coordinates to fit within/outside 50m radius)
// 0.0001 deg is ~11 meters.
const generateNearbyMessages = (lat: number, lng: number) => {
  const messages = [
    { id: 1, text: "Bazar makanan di dekat lobi.", initialTime: 7200, latOffset: 0.0002, lngOffset: 0.0003, opacity: 1 }, 
    { id: 2, text: "Awas ada genangan air dalam.", initialTime: 3600, latOffset: -0.0001, lngOffset: -0.0002, opacity: 0.8 }, 
    { id: 3, text: "WiFi kafe ini: admin123.", initialTime: 1200, latOffset: 0.002, lngOffset: -0.002, opacity: 0.4 }, 
    { id: 4, text: "Kunci motor ada di pos satpam.", initialTime: 300, latOffset: -0.001, lngOffset: -0.003, opacity: 0.15 }, 
    { id: 5, text: "Spot lihat senja terbaik disini.", initialTime: 10800, latOffset: 0.0001, lngOffset: -0.0003, opacity: 1 }, 
    { id: 6, text: "Hati-hati anjing galak di pojokan.", initialTime: 5400, latOffset: 0.0015, lngOffset: 0.001, opacity: 0.6 },
    { id: 7, text: "Ada razia lalu lintas di simpang 4 sana.", initialTime: 7200, latOffset: -0.0025, lngOffset: 0.001, opacity: 0.9 }, // ~300m (Locked)
    { id: 8, text: "Kucing oren suka nongkrong di tembok ini.", initialTime: 14400, latOffset: 0.0001, lngOffset: 0.0001, opacity: 1.0 }, // ~15m (Unlocked)
    { id: 9, text: "Tombol lift lantai 3 sering error.", initialTime: 800, latOffset: -0.0002, lngOffset: 0.0002, opacity: 0.3 }, // ~30m (Unlocked, Critical)
    { id: 10, text: "Wah, Siomay Mang Ujang udah habis bro.", initialTime: 200, latOffset: 0.0008, lngOffset: -0.0005, opacity: 0.1 }, // ~100m (Locked, Critical)
    { id: 11, text: "Lampu jalan mati, gelap banget di sini.", initialTime: 18000, latOffset: -0.004, lngOffset: 0.002, opacity: 0.9 }, // ~450m (Locked)
    { id: 12, text: "Ada dompet kulit jatuh sekitar halte.", initialTime: 1000, latOffset: 0.0003, lngOffset: -0.0001, opacity: 0.5 }, // ~35m (Unlocked)
    { id: 13, text: "Jalan tembus sini tutup ada hajatan.", initialTime: 5000, latOffset: -0.0004, lngOffset: -0.0005, opacity: 0.7 }, // ~65m (Locked)
    { id: 14, text: "Tembok bata ini estetis buat background.", initialTime: 86400, latOffset: -0.0001, lngOffset: 0.0004, opacity: 1.0 }, // ~45m (Unlocked)
    { id: 15, text: "Diskon 50% toko buku ujung sana tutup jam 8.", initialTime: 25000, latOffset: 0.003, lngOffset: 0.004, opacity: 1.0 } // ~500m (Locked)
  ];

  return messages.map(m => ({
    ...m,
    lat: lat + m.latOffset,
    lng: lng + m.lngOffset,
    timeLeft: m.initialTime
  }));
};

const ScrambledText = ({ text }: { text: string }) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!';
  return <span>{text.split('').map(c => c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]).join('')}</span>;
};

export default function LiveMap() {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    const setFallbackLocation = () => {
      const defaultLoc: [number, number] = [-6.2088, 106.8456]; 
      setLocation(defaultLoc);
      setMessages(generateNearbyMessages(defaultLoc[0], defaultLoc[1]));
      setLocating(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords?.latitude;
          const lng = position.coords?.longitude;
          
          if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
            setLocation([lat, lng]);
            setMessages(generateNearbyMessages(lat, lng));
            setLocating(false);
          } else {
            setFallbackLocation();
          }
        },
        (error) => {
          console.warn("Geolocation blocked or failed. Using default location.", error);
          setFallbackLocation();
        }
      );
    } else {
      setFallbackLocation();
    }
  }, []);

  // Countdown timer for messages
  useEffect(() => {
    const timer = setInterval(() => {
      setMessages(prev => prev.map(m => ({ ...m, timeLeft: Math.max(0, m.timeLeft - 1) })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} dtk`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h === 0) return `${m} mnt`;
    return `${h}j ${m}m`;
  };

  if (!location || isNaN(location[0]) || isNaN(location[1])) {
    return (
      <div className="w-full h-[500px] border border-tactical-cyan bg-tactical-black/40 flex flex-col items-center justify-center transition-all duration-500">
        <Radio className="text-tactical-cyan animate-pulse mb-4" size={32} />
        <span className="font-mono text-tactical-cyan tracking-widest uppercase text-sm">Mencari Sinyal GPS...</span>
      </div>
    );
  }

  const safeLocation: [number, number] = [Number(location[0]) || -6.2088, Number(location[1]) || 106.8456];
  const safeMessages = messages.filter(m => !isNaN(m.lat) && !isNaN(m.lng));

  return (
    <div className="relative w-full h-[500px] border-2 border-tactical-gray hover:border-tactical-cyan transition-colors duration-500 z-10 group overflow-hidden">
      
      {/* Overlay UI elements */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <div className="bg-tactical-black/80 border border-tactical-cyan px-3 py-1.5 backdrop-blur-sm shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <span className="text-tactical-cyan font-mono text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-tactical-cyan rounded-full animate-pulse shadow-[0_0_5px_#00E5FF]"></span>
            Radar Area (Live)
          </span>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 z-[400] pointer-events-none text-right">
        <div className="bg-tactical-black/80 border border-tactical-gray px-3 py-2 backdrop-blur-sm transition-all duration-300 group-hover:border-tactical-cyan/50">
          <div className="text-tactical-light/50 font-mono text-[10px] uppercase tracking-widest mb-1">Koordinat Saat Ini</div>
          <div className="text-tactical-cyan font-mono text-xs tracking-widest">
            {safeLocation[0].toFixed(5)}° N<br/>
            {safeLocation[1].toFixed(5)}° E
          </div>
        </div>
      </div>

      <MapContainer 
        center={safeLocation} 
        zoom={14} 
        scrollWheelZoom={false} 
        className="w-full h-full bg-tactical-black"
        zoomControl={false}
      >
        <MapController center={safeLocation} />
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Radar Zone 50m */}
        <Circle 
          center={safeLocation} 
          radius={50} 
          pathOptions={{ 
            color: '#00E5FF', 
            fillColor: '#00E5FF', 
            fillOpacity: 0.05, 
            weight: 1, 
            dashArray: "4 4" 
          }} 
        />
        
        {/* User Location Marker */}
        <Marker position={safeLocation} icon={userIcon}>
          <Popup className="tactical-popup">
            <div className="bg-tactical-black/90 border border-tactical-cyan p-3 min-w-[150px] backdrop-blur-md">
              <div className="flex items-center gap-2 text-tactical-cyan font-mono text-xs uppercase tracking-widest mb-2 border-b border-tactical-cyan/30 pb-2">
                <MapPin size={12} /> Lokasi Kamu
              </div>
              <div className="text-tactical-light/80 text-[10px] font-sans tracking-wide leading-relaxed">
                Pemancar Aktif.<br/>
                Jangkauan deteksi: <span className="text-tactical-cyan font-bold">100m</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Messages Markers */}
        {safeMessages.map((msg) => {
          const distance = Math.round(getDistance(safeLocation[0], safeLocation[1], msg.lat, msg.lng));
          const isLocked = distance > 50;

          return (
            <Marker key={msg.id} position={[msg.lat, msg.lng]} icon={createMessageIcon(msg.opacity, isLocked)}>
              <Popup className="tactical-popup border-none bg-transparent m-0 p-0 shadow-none">
                <div className={`bg-tactical-black/95 border ${isLocked ? 'border-tactical-amber' : 'border-tactical-cyan'} p-4 min-w-[240px] drop-shadow-[0_4px_20px_rgba(255,179,0,0.15)] overflow-hidden relative group-hover:border-tactical-light transition-all duration-300 animate-in fade-in zoom-in-95 duration-200`}>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50 z-0"></div>
                  
                  <div className={`flex items-center justify-between font-mono text-[10px] uppercase tracking-widest mb-3 border-b pb-2 relative z-10 ${isLocked ? 'text-tactical-amber border-tactical-amber/30' : 'text-tactical-cyan border-tactical-cyan/30'}`}>
                    <span className="flex items-center gap-1.5">
                      {isLocked ? <Lock size={12} className="animate-pulse" /> : <Unlock size={12} className="animate-pulse" />}
                      {isLocked ? 'TERKUNCI' : 'TERBUKA'}
                    </span>
                    <span className={`px-1.5 py-0.5 shadow-[0_0_5px_#FFB300] ${msg.timeLeft < 3600 ? "bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" : (isLocked ? "bg-tactical-amber/20" : "bg-tactical-cyan/20")}`}>
                      Kond: {msg.opacity * 100}%
                    </span>
                  </div>

                  <div className={`text-tactical-light font-sans text-[13px] leading-tight mb-5 relative z-10 ${msg.opacity < 0.3 ? 'animate-flicker' : ''}`}>
                    <span className={`${isLocked ? 'text-tactical-amber' : 'text-tactical-cyan'} font-mono mr-1.5 blur-[0.5px] select-none text-[10px] inline-block hover:animate-glitch opacity-80`}>#?!</span> 
                    {isLocked ? (
                      <span className="text-tactical-light/50 tracking-widest font-mono text-xs">
                        <ScrambledText text={msg.text.length > 15 ? msg.text.substring(0, 15) + '...' : msg.text} />
                        <div className="mt-2 text-[8px] text-tactical-amber animate-pulse">&gt;&gt; DEKATI AREA UNTUK MEMBACA</div>
                      </span>
                    ) : (
                      <span className="font-sans text-tactical-light drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                        {msg.text.length > 30 ? msg.text.substring(0, 30) + '...' : msg.text}
                      </span>
                    )}
                  </div>

                  <div className="flex items-end justify-between uppercase relative z-10">
                     <span className={`${isLocked ? 'text-tactical-amber/70' : 'text-tactical-cyan/70'} font-mono flex items-center gap-1 text-[10px] mb-1`}>
                        <MapPin size={10} /> {distance}m
                     </span>
                     <span className={`font-mono flex items-center gap-1.5 text-[10px] ${msg.timeLeft < 3600 ? "text-red-400 border border-red-500/60 bg-red-900/40 px-2 py-1 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-flicker tracking-widest font-bold" : "text-tactical-cyan border border-tactical-gray/30 bg-tactical-gray/10 px-2 py-1"}`}>
                      <Clock size={10} className={msg.timeLeft < 3600 ? "animate-pulse" : ""} />
                      {msg.timeLeft < 3600 ? "KRITIS:" : "SISA:"} {formatTime(msg.timeLeft)}
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
