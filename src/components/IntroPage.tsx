import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Eye, Wifi, Shield, Crosshair, Activity } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Cinematic easeInOutCubic                                                   */
/* -------------------------------------------------------------------------- */
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/* -------------------------------------------------------------------------- */
/* Message Network Data — Simulated UUID travel paths                         */
/* -------------------------------------------------------------------------- */
interface MessagePoint {
  lat: number;
  lng: number;
  uuid: string;
  text: string;
  timestamp: number;
}

const NETWORK_DATA: MessagePoint[] = [
  // UUID-A: A traveler moving from South Jakarta northward
  { lat: -6.2615, lng: 106.8106, uuid: 'A', text: 'Mulai hari dari sini', timestamp: 1 },
  { lat: -6.2450, lng: 106.8200, uuid: 'A', text: 'Kopi pagi terbaik', timestamp: 2 },
  { lat: -6.2300, lng: 106.8350, uuid: 'A', text: 'Macet parah!', timestamp: 3 },
  { lat: -6.2150, lng: 106.8456, uuid: 'A', text: 'Sampai kantor', timestamp: 4 },
  { lat: -6.2000, lng: 106.8500, uuid: 'A', text: 'Makan siang di sini', timestamp: 5 },
  { lat: -6.1850, lng: 106.8350, uuid: 'A', text: 'Meeting selesai', timestamp: 6 },

  // UUID-B: A student's daily route
  { lat: -6.1950, lng: 106.7800, uuid: 'B', text: 'Berangkat kampus', timestamp: 1 },
  { lat: -6.2050, lng: 106.7950, uuid: 'B', text: 'Nunggu angkot', timestamp: 2 },
  { lat: -6.2100, lng: 106.8150, uuid: 'B', text: 'Perpustakaan buka', timestamp: 3 },
  { lat: -6.2200, lng: 106.8300, uuid: 'B', text: 'Belajar di taman', timestamp: 4 },
  { lat: -6.2350, lng: 106.8450, uuid: 'B', text: 'Tugas selesai', timestamp: 5 },

  // UUID-C: A delivery rider
  { lat: -6.1750, lng: 106.8650, uuid: 'C', text: 'Order pertama', timestamp: 1 },
  { lat: -6.1900, lng: 106.8500, uuid: 'C', text: 'Antar ke blok M', timestamp: 2 },
  { lat: -6.2100, lng: 106.8350, uuid: 'C', text: 'Istirahat sebentar', timestamp: 3 },
  { lat: -6.2300, lng: 106.8200, uuid: 'C', text: 'Order ketiga', timestamp: 4 },
  { lat: -6.2500, lng: 106.8100, uuid: 'C', text: 'Hujan deras', timestamp: 5 },
  { lat: -6.2650, lng: 106.8250, uuid: 'C', text: 'Pulang', timestamp: 6 },
  { lat: -6.2750, lng: 106.8450, uuid: 'C', text: 'Sampai rumah', timestamp: 7 },

  // UUID-D: An explorer weaving through the city
  { lat: -6.2400, lng: 106.8550, uuid: 'D', text: 'Jelajah pagi', timestamp: 1 },
  { lat: -6.2250, lng: 106.8700, uuid: 'D', text: 'Gang kecil menarik', timestamp: 2 },
  { lat: -6.2100, lng: 106.8600, uuid: 'D', text: 'Mural keren', timestamp: 3 },
  { lat: -6.1950, lng: 106.8450, uuid: 'D', text: 'Warung legendaris', timestamp: 4 },

  // UUID-E: Short local paths
  { lat: -6.2200, lng: 106.8050, uuid: 'E', text: 'Jogging pagi', timestamp: 1 },
  { lat: -6.2250, lng: 106.8150, uuid: 'E', text: 'Senam di taman', timestamp: 2 },
  { lat: -6.2300, lng: 106.8050, uuid: 'E', text: 'Sarapan bubur', timestamp: 3 },
];

const UUID_COLORS: Record<string, string> = {
  A: '#00E5FF',
  B: '#FF6B6B',
  C: '#FFB300',
  D: '#7C4DFF',
  E: '#69F0AE',
};

// Pre-compute grouped data
const GROUPED_DATA: Record<string, MessagePoint[]> = {};
NETWORK_DATA.forEach(pt => {
  if (!GROUPED_DATA[pt.uuid]) GROUPED_DATA[pt.uuid] = [];
  GROUPED_DATA[pt.uuid].push(pt);
});
Object.keys(GROUPED_DATA).forEach(uuid => {
  GROUPED_DATA[uuid].sort((a, b) => a.timestamp - b.timestamp);
});

/* -------------------------------------------------------------------------- */
/* Cinematic Fly-To Controller                                                */
/* -------------------------------------------------------------------------- */
interface Waypoint {
  center: [number, number];
  zoom: number;
  duration: number;
}

const CINEMATIC_WAYPOINTS: Waypoint[] = [
  { center: [-6.2088, 106.8456], zoom: 4, duration: 0 },
  { center: [-6.2088, 106.8456], zoom: 6, duration: 1200 },
  { center: [-6.2088, 106.8456], zoom: 10, duration: 1200 },
  { center: [-6.2200, 106.8300], zoom: 12, duration: 1000 },
  { center: [-6.2150, 106.8350], zoom: 13, duration: 800 },
  { center: [-6.2100, 106.8300], zoom: 14, duration: 1000 },
];

const CinematicFlyController = ({
  onPhaseChange,
  isActive
}: {
  onPhaseChange: (phase: number) => void;
  isActive: boolean;
}) => {
  const map = useMap();
  const isRunning = useRef(false);

  useEffect(() => {
    if (!isActive || isRunning.current) return;
    isRunning.current = true;

    let cancelled = false;
    let animFrameId: number | null = null;

    const flyBetween = (
      fromCenter: [number, number],
      fromZoom: number,
      toCenter: [number, number],
      toZoom: number,
      duration: number
    ): Promise<void> => {
      return new Promise((resolve) => {
        if (cancelled) { resolve(); return; }
        if (duration === 0) {
          try { map.setView(toCenter, toZoom, { animate: false }); } catch (e) { }
          resolve();
          return;
        }

        const startTime = performance.now();

        const step = (now: number) => {
          if (cancelled) { resolve(); return; }
          const elapsed = now - startTime;
          const t = Math.min(elapsed / duration, 1);
          const eased = easeInOutCubic(t);

          const lat = fromCenter[0] + (toCenter[0] - fromCenter[0]) * eased;
          const lng = fromCenter[1] + (toCenter[1] - fromCenter[1]) * eased;
          const z = fromZoom + (toZoom - fromZoom) * eased;

          try {
            map.setView([lat, lng], z, { animate: false });
          } catch (e) {
            // Map might be unmounted
            resolve();
            return;
          }

          if (t < 1) {
            animFrameId = requestAnimationFrame(step);
          } else {
            resolve();
          }
        };

        animFrameId = requestAnimationFrame(step);
      });
    };

    const runSequence = async () => {
      for (let i = 0; i < CINEMATIC_WAYPOINTS.length; i++) {
        if (cancelled) break;

        const wp = CINEMATIC_WAYPOINTS[i];
        const prev = i > 0 ? CINEMATIC_WAYPOINTS[i - 1] : wp;

        onPhaseChange(i);

        await flyBetween(
          prev.center, prev.zoom,
          wp.center, wp.zoom,
          wp.duration
        );

        if (!cancelled && i < CINEMATIC_WAYPOINTS.length - 1) {
          await new Promise(r => setTimeout(r, 50));
        }
      }

      if (!cancelled) {
        onPhaseChange(99);
      }
    };

    const timer = setTimeout(() => {
      runSequence();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [isActive, map, onPhaseChange]);

  return null;
};

/* -------------------------------------------------------------------------- */
/* VR HUD Overlay                                                             */
/* -------------------------------------------------------------------------- */
const VRHudOverlay = React.memo(({ phase, networkActive }: { phase: number; networkActive: boolean }) => {
  const [sysTime, setSysTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setSysTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="intro-vr-hud">
      <div className="intro-vr-lens" />

      <div className="intro-hud-tl">
        <div className="intro-hud-label">
          <Eye size={12} /> UJAR // Bagikan Ceritamu
        </div>
        <div className="intro-hud-sublabel">
          <span className="intro-hud-dot" /> SYS.TIME: {sysTime}
        </div>
      </div>

      <div className="intro-hud-tr">
        <div className="intro-hud-label">
          <Wifi size={12} /> SIGNAL: {phase >= 3 ? 'LOCKED' : 'SCANNING'}
        </div>
        <div className="intro-hud-sublabel">
          LAT: -6.2088° | LNG: 106.8456°
        </div>
      </div>

      <div className="intro-hud-bl">
        <div className={`intro-hud-label ${networkActive ? 'intro-hud-active' : ''}`}>
          <Activity size={12} /> JARINGAN PESAN: {networkActive ? 'AKTIF' : 'STANDBY'}
        </div>
        {networkActive && (
          <div className="intro-hud-sublabel intro-hud-active">
            5 UUID TERDETEKSI // POLYLINE GRAPH: ON
          </div>
        )}
      </div>

      <div className="intro-hud-br">
        <div className="intro-hud-label">
          <Shield size={12} /> FASE: {phase < 99 ? `0${Math.min(phase + 1, 6)}/06` : 'COMPLETE'}
        </div>
        <div className="intro-hud-sublabel">
          Make Your Story Alive
        </div>
      </div>

      <div className="intro-crosshair">
        <Crosshair size={48} strokeWidth={0.8} />
      </div>

      {phase < 4 && <div className="intro-scan-line" />}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/* Polyline Network Layer                                                      */
/* -------------------------------------------------------------------------- */
const NetworkLayer = React.memo(({ visible, progress }: { visible: boolean; progress: number }) => {
  if (!visible) return null;

  return (
    <>
      {Object.entries(GROUPED_DATA).map(([uuid, points]) => {
        const color = UUID_COLORS[uuid] || '#00E5FF';
        const visibleCount = Math.max(1, Math.ceil(points.length * progress));
        const visiblePoints = points.slice(0, visibleCount);
        const positions = visiblePoints.map(p => [p.lat, p.lng] as [number, number]);

        return (
          <React.Fragment key={uuid}>
            {positions.length >= 2 && (
              <>
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: color,
                    weight: 6,
                    opacity: 0.15,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: color,
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '8 4',
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              </>
            )}

            {visiblePoints.map((pt, i) => (
              <CircleMarker
                key={`${uuid}-${i}`}
                center={[pt.lat, pt.lng]}
                radius={i === visiblePoints.length - 1 ? 5 : 3}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: i === visiblePoints.length - 1 ? 0.9 : 0.5,
                  weight: i === visiblePoints.length - 1 ? 2 : 1,
                }}
              />
            ))}
          </React.Fragment>
        );
      })}
    </>
  );
});

/* -------------------------------------------------------------------------- */
/* Main IntroPage Component                                                   */
/* -------------------------------------------------------------------------- */
export default function IntroPage({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const [networkActive, setNetworkActive] = useState(false);
  const [networkProgress, setNetworkProgress] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [flyActive, setFlyActive] = useState(false);
  const [glitchTitle, setGlitchTitle] = useState(false);
  const networkActivatedRef = useRef(false);

  const BOOT_SEQUENCE = [
    '> UJAR NETWORK v2.1.0',
    '> Initializing spatial engine...',
    '> Loading cartographic renderer...',
    '> Mounting VR overlay framework...',
    '> Calibrating easeInOutCubic curves...',
    '> Establishing coordinate lock...',
    '> SYSTEM READY.',
    '> MEMULAI PENERBANGAN KAMERA...',
  ];

  // Boot sequence animation
  useEffect(() => {
    let index = 0;
    const lines = [...BOOT_SEQUENCE];
    const bootTimer = setInterval(() => {
      if (index < lines.length) {
        const line = lines[index];
        setBootLines(prev => [...prev, line]);
        index++;
      } else {
        clearInterval(bootTimer);
        setTimeout(() => setFlyActive(true), 200);
      }
    }, 100);

    return () => clearInterval(bootTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle phase changes
  const handlePhaseChange = useCallback((p: number) => {
    setPhase(p);

    if (p >= 3 && !networkActivatedRef.current) {
      networkActivatedRef.current = true;
      setNetworkActive(true);
      let prog = 0;
      const progTimer = setInterval(() => {
        prog += 0.02;
        if (prog >= 1) {
          setNetworkProgress(1);
          clearInterval(progTimer);
        } else {
          setNetworkProgress(prog);
        }
      }, 50);
    }

    if (p === 99) {
      setTimeout(() => {
        setGlitchTitle(true);
        setShowTitle(true);
      }, 300);
      setTimeout(() => {
        setGlitchTitle(false);
        setShowSubtext(true);
      }, 800);
      setTimeout(() => setShowEnter(true), 1200);
    }
  }, []);

  return (
    <div className="intro-container">
      {/* Map background */}
      <div className="intro-map-wrapper">
        <MapContainer
          center={[-6.2088, 106.8456]}
          zoom={4}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          touchZoom={false}
          keyboard={false}
          attributionControl={false}
          className="intro-map"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <CinematicFlyController
            onPhaseChange={handlePhaseChange}
            isActive={flyActive}
          />
          <NetworkLayer visible={networkActive} progress={networkProgress} />
        </MapContainer>
      </div>

      {/* VR HUD Overlay */}
      <VRHudOverlay phase={phase} networkActive={networkActive} />

      {/* Boot sequence terminal */}
      <AnimatePresence>
        {!showTitle && (
          <motion.div
            key="boot-terminal"
            className="intro-boot-terminal"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {bootLines.map((line, i) => (
              <motion.div
                key={`boot-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`intro-boot-line ${line.includes('READY') ? 'intro-boot-success' :
                  line.includes('PENERBANGAN') ? 'intro-boot-highlight' : ''
                  }`}
              >
                {line}
              </motion.div>
            ))}
            <span className="intro-boot-cursor">█</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title reveal */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            key="title-reveal"
            className="intro-title-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={`intro-title ${glitchTitle ? 'intro-glitch-active' : ''}`}
            >
              <span className="intro-title-accent">U</span>JAR
            </motion.div>

            {showSubtext && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="intro-subtitle"
              >
                <div className="intro-subtitle-line" />
                <span>Tinggalkan Jejak, Bukan Identitas</span>
                <div className="intro-subtitle-line" />
              </motion.div>
            )}

            {showSubtext && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="intro-description"
              >
                Jejaring sosial geografis pertama. Ceritakan momen persis di mana ia terjadi.
              </motion.p>
            )}

            {showEnter && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,229,255,0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="intro-enter-btn"
              >
                <Radio size={18} className="intro-enter-icon" />
                MASUK KE JARINGAN
              </motion.button>
            )}

            {showEnter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="intro-network-badge"
              >
                <span className="intro-network-dot" />
                JARINGAN PESAN: AKTIF — 5 POLA PERJALANAN TERDETEKSI
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette overlay */}
      <div className="intro-vignette" />

      {/* CRT scanlines (subtle) */}
      <div className="intro-scanlines" />
    </div>
  );
}
