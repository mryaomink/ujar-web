import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Crosshair, MapPin, Radio, Lock, Unlock, Clock, 
  ShieldAlert, Radar, Users, CornerDownRight, Variable, Check, Activity
} from 'lucide-react';
import LiveMap from './components/LiveMap';

/* -------------------------------------------------------------------------- */
/* Helper Components                                                          */
/* -------------------------------------------------------------------------- */

const ScrambledText = ({ text, isRevealed }: { text: string; isRevealed: boolean }) => {
  const [display, setDisplay] = useState(text);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!';

  useEffect(() => {
    if (isRevealed) {
      setDisplay(text);
      return;
    }
    const interval = setInterval(() => {
      setDisplay(text.split('').map(c => c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]).join(''));
    }, 60);
    return () => clearInterval(interval);
  }, [text, isRevealed]);

  return <span className={`transition-all duration-700 ${isRevealed ? 'text-tactical-light font-sans tracking-normal' : 'text-tactical-cyan/70 font-mono tracking-widest'}`}>{display}</span>;
};

const SectionHeading = ({ children, index }: { children: React.ReactNode, index: string }) => (
  <div className="flex items-center gap-4 mb-8">
    <span className="text-tactical-cyan font-mono text-sm border border-tactical-cyan/30 px-2 py-1">
      [{index}]
    </span>
    <h2 className="text-2xl uppercase tracking-widest font-mono text-tactical-light neon-text-cyan">
      {children}
    </h2>
    <div className="flex-grow h-[1px] bg-tactical-gray relative">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-1 bg-tactical-cyan"></div>
    </div>
  </div>
);

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "tween", ease: "circOut", duration: 0.6 } }
};

/* -------------------------------------------------------------------------- */
/* Feature Showcases                                                          */
/* -------------------------------------------------------------------------- */

const ProximityShowcase = () => {
  const [isClose, setIsClose] = useState(false);
  
  return (
    <div 
      className="relative p-6 sm:p-8 border border-tactical-gray bg-tactical-black/40 hover:border-tactical-cyan transition-colors group cursor-crosshair min-h-[300px] flex flex-col items-center justify-center overflow-hidden h-full rounded-sm"
      onMouseEnter={() => setIsClose(true)}
      onMouseLeave={() => setIsClose(false)}
      onTouchStart={() => setIsClose(!isClose)}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:20px_20px] transition-transform duration-700 group-hover:scale-105" />

      <div className="absolute top-4 left-4 text-[10px] tracking-widest text-tactical-gray group-hover:text-tactical-cyan flex items-center gap-2 z-10 transition-colors uppercase">
        {isClose ? <Unlock size={14} className="text-tactical-cyan" /> : <Lock size={14} />}
        {isClose ? "KUNCI TERBUKA" : "TERKUNCI. JARAK > 50M"}
      </div>
      
      <div className="text-lg md:text-xl text-center max-w-lg z-10 relative mt-8">
        <ScrambledText text="Rahasia sebenarnya dari kota ini ada di bawah jembatan tua itu." isRevealed={isClose} />
        <div className={`mt-4 text-[10px] uppercase tracking-widest font-mono transition-opacity duration-300 ${isClose ? 'opacity-0' : 'text-tactical-cyan/50 animate-pulse'}`}>
          Arahkan kursor / sentuh untuk mendekat
        </div>
      </div>
      
      {isClose && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none border-[3px] border-tactical-cyan neon-border-cyan z-0" 
        />
      )}
    </div>
  );
};

const EphemeralShowcase = () => {
  const [timeLeft, setTimeLeft] = useState(8340); // 2h 19m
  
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border border-tactical-gray p-6 relative overflow-hidden bg-tactical-black/40 min-h-[300px] flex flex-col justify-between h-full group hover:border-tactical-amber transition-colors rounded-sm">
      <div className="flex justify-between items-center border-b border-tactical-gray pb-4 mb-4 z-10">
        <div className="text-tactical-cyan group-hover:text-tactical-amber text-xs tracking-widest flex items-center gap-2 font-mono transition-colors">
          <Clock size={14} /> SISA WAKTU
        </div>
        <div className="font-mono text-tactical-amber text-lg neon-text-amber flex gap-1">
          <span>{Math.floor(timeLeft / 3600)}j</span>
          <span>{String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')}m</span>
          <span className="text-tactical-amber/50">{String(timeLeft % 60).padStart(2, '0')}d</span>
        </div>
      </div>
      
      <div className="space-y-6 z-10 font-sans flex-grow flex flex-col justify-center">
        <div className="flex gap-4 items-start">
          <div className="w-1 h-full bg-tactical-amber transition-colors" />
          <div className="opacity-100 text-tactical-light text-base">"Jaket siapa ini ketinggalan di bangku halte?"</div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-1 h-full bg-tactical-amber/60" />
          <div className="opacity-60 text-tactical-light text-base blur-[0.5px]">"Tadi ada yang dengar suara ledakan keras?"</div>
        </div>
        <div className="flex gap-4 items-start">
          <div className="w-1 h-full bg-tactical-gray" />
          <div className="opacity-20 text-tactical-light text-base blur-[2px] italic">"Jejak memudar... hampir terhapus."</div>
        </div>
      </div>
    </div>
  );
};

const RadarShowcase = () => {
  return (
    <div className="border border-tactical-gray min-h-[300px] flex items-center justify-center relative overflow-hidden group bg-tactical-black/40 hover:border-tactical-cyan transition-colors h-full rounded-sm">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 5], opacity: [0.6, 0] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          className="w-12 h-12 rounded-full border border-tactical-cyan"
        />
        <motion.div 
          animate={{ scale: [1, 5], opacity: [0.6, 0] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1.5 }}
          className="w-12 h-12 rounded-full border border-tactical-cyan absolute"
        />
        <div className="w-2 h-2 bg-tactical-cyan rounded-full absolute shadow-[0_0_10px_#00E5FF]" />
      </div>
      
      <motion.div 
        className="z-10 bg-tactical-black/80 px-6 py-4 border border-tactical-gray text-center backdrop-blur-md"
        whileHover={{ scale: 1.05, borderColor: '#00E5FF' }}
      >
        <Users className="mx-auto mb-2 text-tactical-cyan shadow-tactical-cyan" size={24} />
        <div className="text-sm tracking-widest text-tactical-cyan mb-1 font-mono">Dukungan Area</div>
        <div className="text-xs text-tactical-light/60 font-sans">+5 Kekuatan / orang (Radius 100m)</div>
      </motion.div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] sm:text-[10px] text-tactical-gray uppercase tracking-widest font-mono">
        <span className="group-hover:text-tactical-light transition-colors">Sensor Pemindai</span>
        <span className="group-hover:text-tactical-cyan transition-colors group-hover:animate-pulse">AKTIF</span>
      </div>
    </div>
  );
};

const TimeSliderShowcase = () => {
  const [value, setValue] = useState(100);
  
  return (
    <div className="border border-tactical-gray p-6 sm:p-8 relative flex flex-col justify-between min-h-[300px] h-full bg-tactical-black/40 group hover:border-tactical-cyan transition-colors rounded-sm">
      <div className="flex justify-between items-center border-b border-tactical-gray group-hover:border-tactical-cyan/40 pb-4 mb-4 transition-colors">
        <div className="text-tactical-cyan text-xs tracking-widest flex items-center gap-2 font-mono">
          <Radar size={14} /> MESIN WAKTU LOKASI
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center font-mono text-xs text-tactical-cyan mb-8 tracking-widest flex flex-col gap-2">
          <span className="text-tactical-light border border-tactical-light/30 bg-tactical-light/5 px-4 py-2 font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            HARI INI {value === 100 ? '' : ` - ${Math.round((100 - value) * 0.72)} JAM LALU`}
          </span>
        </div>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full appearance-none bg-tactical-gray h-1 outline-none cursor-ew-resize
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-tactical-cyan [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:hover:bg-tactical-light transition-all"
        />
        
        <div className="w-full flex items-center justify-between mt-5 text-[10px] text-tactical-gray font-mono tracking-widest">
          <span>-72 JAM</span>
          <span>SEKARANG</span>
        </div>
        
        <div className="mt-8 text-center text-sm font-sans text-tactical-light/80 h-10 transition-all duration-300 flex items-center justify-center">
          {value > 85 ? (
            "Menampilkan interaksi terbaru di sekitarmu."
          ) : value > 30 ? (
            "Menyingkap sisa-sisa pesan dari kemarin."
          ) : (
            <span className="text-tactical-amber">Menggali masa lalu. Melihat jejak cerita dari 3 hari yang lalu.</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Layout App                                                            */
/* -------------------------------------------------------------------------- */

export default function App() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-tactical-black text-tactical-light relative font-sans selection:bg-tactical-cyan/30 selection:text-tactical-cyan overflow-x-hidden">
      <div className="scanlines"></div>

      {/* FIXED NAVIGATION */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-tactical-black/80 backdrop-blur-md border-b border-tactical-gray">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center group cursor-pointer relative z-50"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="/logo.png" 
              alt="UJAR Logo" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 group-hover:drop-shadow-[0_0_25px_rgba(255,179,0,0.6)] group-hover:scale-110 md:translate-y-2 origin-top"
              onError={(e) => {
                // Fallback jika gambar belum diupload
                (e.target as HTMLImageElement).classList.add('hidden');
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center gap-3 text-tactical-light font-mono font-bold tracking-widest text-xl">
              <Radio size={20} className="text-tactical-cyan animate-pulse" /> 
              <span className="neon-text-cyan">UJAR</span>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6 text-[10px] sm:text-xs tracking-widest font-mono text-tactical-gray uppercase items-center">
            <button 
              onClick={() => scrollToSection('tentang')}
              className="hover:text-tactical-light cursor-pointer transition-colors"
            >
              Tentang
            </button>
            <button 
              onClick={() => scrollToSection('panduan')}
              className="hover:text-tactical-light cursor-pointer transition-colors"
            >
              Panduan
            </button>
            <button 
              onClick={() => scrollToSection('mulai')}
              className="border border-tactical-cyan text-tactical-cyan px-3 sm:px-5 py-1.5 sm:py-2 hover:bg-tactical-cyan hover:text-tactical-black transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.6)]"
            >
              MULAI<span className="hidden sm:inline"> SEKARANG</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 relative z-10 w-full">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 min-h-[75vh] flex flex-col justify-center border-x border-tactical-gray relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-tactical-cyan"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-tactical-cyan"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-tactical-cyan"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-tactical-cyan"></div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 mt-12"
          >
            <div className="font-mono text-tactical-cyan tracking-widest text-xs md:text-sm mb-4 flex items-center gap-2 uppercase">
              <Activity size={16} className="animate-pulse" /> Jejaring Sosial Geografis
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-mono font-bold uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px #F0F0F0', color: 'transparent'}}>
              <span className="text-tactical-cyan font-sans" style={{ WebkitTextStroke: '0px', textShadow: '0 0 20px rgba(0,229,255,0.3)' }}>Tinggalkan</span><br/> Jejak Cerita
            </h1>
            <p className="mt-8 text-lg sm:text-xl md:text-2xl font-sans max-w-2xl text-tactical-light/80 leading-relaxed border-l-2 border-tactical-cyan pl-4">
              Ceritakan sebuah momen persis di mana ia terjadi. Tanpa algoritma pengikut, penemuan murni berdasarkan pergerakan lokasimu di dunia nyata.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 font-mono text-sm tracking-widest mb-16 uppercase"
          >
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 bg-tactical-gray/30 px-5 py-3 border border-tactical-gray cursor-default transition-colors hover:border-tactical-light">
              <span className="text-tactical-cyan font-bold">1</span>
              <span>Buka Peta</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 bg-tactical-gray/30 px-5 py-3 border border-tactical-gray relative cursor-default transition-colors hover:border-tactical-light">
              <div className="hidden sm:block absolute -left-6 top-1/2 w-6 h-px bg-tactical-cyan/40"></div>
              <span className="text-tactical-amber font-bold">2</span>
              <span>Cari Koordinat</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3 bg-tactical-cyan/10 px-5 py-3 border border-tactical-cyan relative shadow-[0_0_15px_rgba(0,229,255,0.15)] cursor-default">
              <div className="hidden sm:block absolute -left-6 top-1/2 w-6 h-px bg-tactical-cyan/40"></div>
              <span className="text-tactical-cyan font-bold">3</span>
              <span className="text-tactical-cyan neon-text-cyan">Datangi Lokasi</span>
            </motion.div>
          </motion.div>
        </section>

        {/* LIVE RECONNAISSANCE LAYER (MAP VIEW) */}
        <section className="max-w-7xl mx-auto px-6 mt-20 mb-24">
          <SectionHeading index="SYS.LIVE">Radar Area Sekitar</SectionHeading>
          <div className="font-sans text-tactical-light/70 max-w-3xl text-base mb-8 leading-relaxed">
            Mencari pesan yang tertinggal di sekitar Anda secara langsung. Datangi titik koordinat dalam jarak 50 meter untuk dapat membaca cerita secara keseluruhan.
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="shadow-[0_0_30px_rgba(0,229,255,0.1)] border border-tactical-cyan/50 relative overflow-hidden group"
          >
             <div className="absolute inset-0 border-2 border-transparent transition-colors duration-500 pointer-events-none z-50 group-hover:border-tactical-cyan"></div>
             <LiveMap />
          </motion.div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="tentang" className="max-w-7xl mx-auto px-6 mt-32 scroll-mt-24">
          <SectionHeading index="01">Fitur Utama UJAR</SectionHeading>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <motion.div variants={itemVariants} className="flex flex-col">
              <h3 className="font-mono text-xl mb-3 text-tactical-light flex items-center gap-3 uppercase tracking-wide">
                <Lock className="text-tactical-cyan" size={20} /> Kunci Jarak Dekat
              </h3>
              <p className="text-tactical-light/70 text-sm font-sans mb-6 flex-grow leading-relaxed">
                Isi pesan akan disembunyikan dalam bentuk teks acak jika kamu berada jauh dari lokasi aslinya. Datangi titik koordinat secara langsung agar pesan terbuka dan bisa dibaca normal.
              </p>
              <ProximityShowcase />
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col">
              <h3 className="font-mono text-xl mb-3 text-tactical-light flex items-center gap-3 uppercase tracking-wide">
                <Clock className="text-tactical-amber" size={20} /> Pesan Sementara
              </h3>
              <p className="text-tactical-light/70 text-sm font-sans mb-6 flex-grow leading-relaxed">
                Tidak ada jejak yang bertahan selamanya. Pesan yang ditinggalkan akan memudar teksnya seiring waktu bagaikan tinta yang luntur, hingga akhirnya hilang dari peta dunia.
              </p>
              <EphemeralShowcase />
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col">
              <h3 className="font-mono text-xl mb-3 text-tactical-light flex items-center gap-3 uppercase tracking-wide">
                <Users className="text-tactical-cyan" size={20} /> Dukungan Area Berjalan
              </h3>
              <p className="text-tactical-light/70 text-sm font-sans mb-6 flex-grow leading-relaxed">
                Cerita menarik berhak hidup lebih lama. Secara otomatis, orang-orang asing yang menyalakan GPS dan berada di radius 100m dari pesanmu, akan memperpanjang umur pesan tersebut.
              </p>
              <RadarShowcase />
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col">
              <h3 className="font-mono text-xl mb-3 text-tactical-light flex items-center gap-3 uppercase tracking-wide">
                <Radar className="text-tactical-cyan" size={20} /> Kapsul Waktu
              </h3>
              <p className="text-tactical-light/70 text-sm font-sans mb-6 flex-grow leading-relaxed">
                Putar mundur waktu di tempat dudukmu. Geser pengatur mesin waktu untuk melihat jejak tulisan dan pesan apa saja yang pernah menempati koordinat kamu saat ini.
              </p>
              <TimeSliderShowcase />
            </motion.div>
          </motion.div>
        </section>

        {/* AUTHORITY SYSTEM SECTION */}
        <section id="panduan" className="max-w-7xl mx-auto px-6 mt-40 scroll-mt-24">
          <SectionHeading index="02">Sistem Reputasi Penjelajah</SectionHeading>
          
          <div className="mb-12 font-sans text-tactical-light/70 max-w-3xl text-lg leading-relaxed">
            Di jaringan UJAR, status dan levelmu bukan dinilai dari jumlah <i>followers</i>, melainkan diukur dari seberapa banyak pergerakan fisik dan kontribusimu meninggalkan jejak nyata di seluruh kota.
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="border border-tactical-cyan/40 p-8 bg-tactical-cyan/5 transition-all group relative overflow-hidden cursor-default shadow-lg hover:shadow-[0_10px_30px_rgba(0,229,255,0.15)] hover:border-tactical-cyan"
            >
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all group-hover:rotate-12 group-hover:scale-110">
                <Crosshair size={140} />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-tactical-cyan/10 rounded-sm">
                  <Crosshair className="text-tactical-cyan" size={24} />
                </div>
                <span className="font-mono text-xl text-tactical-light font-bold bg-tactical-black border border-tactical-cyan px-2 py-1">+10 EXP</span>
              </div>
              <h3 className="text-tactical-cyan font-mono tracking-widest mb-3 uppercase text-lg font-bold">Pembuat Jejak</h3>
              <p className="text-tactical-light/80 font-sans leading-relaxed text-sm">
                Pionir pemetaan koordinat. Status ini diberikan saat kamu sukses menjadi orang pertama yang meninggalkan sebuah cerita di lokasi baru.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="border border-tactical-amber/40 p-8 bg-tactical-amber/5 transition-all group relative overflow-hidden cursor-default shadow-lg hover:shadow-[0_10px_30px_rgba(255,179,0,0.15)] hover:border-tactical-amber"
            >
               <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all group-hover:-rotate-12 group-hover:scale-110">
                <MapPin size={140} />
              </div>
              <div className="flex justify-between items-start mb-6">
                 <div className="p-3 bg-tactical-amber/10 rounded-sm">
                   <MapPin className="text-tactical-amber" size={24} />
                 </div>
                <span className="font-mono text-xl text-tactical-light font-bold bg-tactical-black border border-tactical-amber px-2 py-1">+5 EXP</span>
              </div>
              <h3 className="text-tactical-amber font-mono tracking-widest mb-3 uppercase text-lg font-bold">Penjelajah</h3>
              <p className="text-tactical-light/80 font-sans leading-relaxed text-sm">
                Petualang area kota. Diberikan saat kamu senantiasa memburu dan mengunjungi langsung pesan-pesan misterius (<i>Scout</i>) milik pengguna lain.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="border border-tactical-light/30 p-8 bg-tactical-gray/20 transition-all group relative overflow-hidden cursor-default shadow-lg hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:border-tactical-light"
            >
              <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110">
                <Variable size={140} />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-tactical-light/10 rounded-sm">
                  <Variable className="text-tactical-light" size={24} />
                </div>
                <span className="font-mono text-xl text-tactical-light font-bold bg-tactical-black border border-tactical-light px-2 py-1">+25 EXP</span>
              </div>
              <h3 className="text-tactical-light font-mono tracking-widest mb-3 uppercase text-lg font-bold">Resonansi</h3>
              <p className="text-tactical-light/80 font-sans leading-relaxed text-sm">
                Penulis paling berpengaruh. Bonus masif yang akan kamu terima setiap kali cerita yang kamu buat ramai dikunjungi warga di sekitarnya.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* CALL TO ACTION */}
        <section id="mulai" className="max-w-4xl mx-auto px-6 mt-40 relative scroll-mt-24">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-tactical-cyan/15 blur-[90px] rounded-full z-0 pointer-events-none"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-2 border-tactical-cyan bg-tactical-black/80 backdrop-blur-md p-10 md:p-16 text-center relative z-10 flex flex-col items-center shadow-[0_0_40px_rgba(0,229,255,0.1)] hover:shadow-[0_0_60px_rgba(0,229,255,0.2)] transition-shadow duration-500"
          >
            <Radio size={56} className="text-tactical-cyan mb-8 animate-pulse shadow-tactical-cyan drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]" />
            <h2 className="text-3xl md:text-5xl font-mono font-bold uppercase tracking-widest mb-6 leading-tight">Siap Meninggalkan Jejak?</h2>
            <p className="text-tactical-light/80 font-sans max-w-xl mx-auto mb-10 text-lg md:text-xl leading-relaxed">
              Pemancar UJAR sudah menyala. Cerita tersembunyi berlimpah di sekitar kotamu. Nyalakan GPS, aktifkan akunmu, dan mulai menjelajah dunia nyata sekarang.
            </p>
            
            <button className="group relative px-10 py-5 bg-transparent border-2 border-tactical-cyan text-tactical-cyan font-mono tracking-widest uppercase text-base font-bold overflow-hidden flex items-center gap-3 hover:text-tactical-black transition-colors transform hover:scale-105 active:scale-95">
              <span className="absolute inset-x-0 bottom-0 h-0 bg-tactical-cyan transition-all duration-300 ease-out group-hover:h-full z-0" />
              <span className="relative z-10 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] group-hover:drop-shadow-none">
                <Check size={20} /> MULAI MAIN SEKARANG
              </span>
            </button>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-tactical-gray tracking-widest uppercase">
              <span className="flex items-center gap-2">Status Server: <span className="text-tactical-cyan flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-tactical-cyan animate-pulse"></span> ONLINE</span></span>
              <span className="hidden sm:inline text-tactical-gray/30">//</span>
              <span className="flex items-center gap-2">Syarat: <span className="text-tactical-amber border border-tactical-amber/30 px-1.5 bg-tactical-amber/10">Buka Akses GPS</span></span>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-tactical-cyan/20 py-10 mt-32 bg-tactical-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="font-mono text-tactical-light/40 text-xs tracking-widest uppercase flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span>© 2026 UJAR Network.</span>
            <span className="hidden sm:inline text-tactical-cyan/50">|</span>
            <span>Tinggalkan cerita, bukan identitas. Privasi Anda 100% aman.</span>
          </div>
          <div className="flex gap-4">
            <span className="w-2 h-2 rounded-full bg-tactical-cyan animate-pulse shadow-[0_0_5px_#00E5FF]"></span>
            <span className="w-2 h-2 rounded-full bg-tactical-amber"></span>
            <span className="w-2 h-2 rounded-full bg-tactical-light/20"></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

