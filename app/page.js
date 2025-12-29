'use client';
import React, { useState, useEffect } from 'react';
import { UserPlus, RotateCcw, Check, X, HelpCircle, ShieldAlert, Map, Sword, Search, ChevronUp, ChevronDown } from 'lucide-react';

const INITIAL_PLAYERS = ['Ben', 'Oyuncu 2', 'Oyuncu 3'];

const GAME_DATA = {
  suspects: [
    { id: 'scarlett', name: 'Bayan Scarlett', color: 'bg-red-500' },
    { id: 'mustard', name: 'Albay Mustard', color: 'bg-yellow-500' },
    { id: 'white', name: 'Şef White', color: 'bg-slate-100' },
    { id: 'green', name: 'Başkan Green', color: 'bg-green-600' },
    { id: 'peacock', name: 'Avukat Peacock', color: 'bg-blue-500' },
    { id: 'plum', name: 'Profesör Plum', color: 'bg-purple-600' },
  ],
  weapons: [
    { id: 'candlestick', name: 'Şamdan' },
    { id: 'dagger', name: 'Hançer' },
    { id: 'lead_pipe', name: 'Kurşun Boru' },
    { id: 'revolver', name: 'Tabanca' },
    { id: 'rope', name: 'İp' },
    { id: 'wrench', name: 'İngiliz Anahtarı' },
  ],
  rooms: [
    { id: 'kitchen', name: 'Mutfak' },
    { id: 'ballroom', name: 'Balo Salonu' },
    { id: 'conservatory', name: 'Kış Bahçesi' },
    { id: 'billiard', name: 'Bilardo Odası' },
    { id: 'library', name: 'Kütüphane' },
    { id: 'study', name: 'Çalışma Odası' },
    { id: 'hall', name: 'Hol' },
    { id: 'lounge', name: 'Oturma Odası' },
    { id: 'dining', name: 'Yemek Odası' },
  ]
};

const STATUS_MODES = [
  { icon: null, boxClass: 'border-slate-800 bg-slate-800/30', label: 'empty' },
  { icon: <X size={20} className="text-red-400" />, boxClass: 'border-red-500/50 bg-red-900/30 ring-1 ring-red-500/20', label: 'no' },
  { icon: <HelpCircle size={20} className="text-yellow-400" />, boxClass: 'border-yellow-500/50 bg-yellow-900/30 ring-1 ring-yellow-500/20', label: 'maybe' },
  { icon: <Check size={20} className="text-green-400" />, boxClass: 'border-green-500/50 bg-green-900/30 ring-1 ring-green-500/20', label: 'yes' },
];

const App = () => {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [grid, setGrid] = useState({});
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  useEffect(() => {
    document.title = "Cluedo Kanıt Defteri";
  }, []);

  const toggleCell = (itemId, playerIdx) => {
    const key = `${itemId}-${playerIdx}`;
    setGrid(prev => {
      const currentStatus = prev[key] || 0;
      const nextStatus = (currentStatus + 1) % STATUS_MODES.length;
      return { ...prev, [key]: nextStatus };
    });
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
      setPlayers([...players, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (index) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const resetGame = () => {
    if (window.confirm('Tüm veriler silinecek. Emin misiniz?')) {
      setGrid({});
    }
  };

  const getSummaryData = () => {
    const allItems = [...GAME_DATA.suspects, ...GAME_DATA.weapons, ...GAME_DATA.rooms];
    const confirmed = new Set();
    const maybe = new Set();
    const excluded = new Set();

    allItems.forEach(item => {
      players.forEach((_, pIdx) => {
        const status = grid[`${item.id}-${pIdx}`];
        if (status === 3) confirmed.add(item.name);
        else if (status === 2) maybe.add(item.name);
        else if (status === 1) excluded.add(item.name);
      });
    });

    confirmed.forEach(name => { maybe.delete(name); excluded.delete(name); });
    maybe.forEach(name => excluded.delete(name));

    return { 
      confirmed: Array.from(confirmed), 
      maybe: Array.from(maybe), 
      excluded: Array.from(excluded) 
    };
  };

  const summary = getSummaryData();

  const SectionHeader = ({ icon: Icon, title, colorClass }) => (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${colorClass} text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg w-fit min-w-[150px]`}>
      <Icon size={14} />
      <span>{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* 1. SEVİYE STICKY: HEADER */}
      <header className="max-w-5xl mx-auto p-4 flex justify-between items-center border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-[60]">
        <div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter">CLUEDO</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Dijital Kanıt Defteri</p>
        </div>
        <button 
          onClick={resetGame}
          className="p-2 bg-slate-900 hover:bg-red-900/40 text-slate-300 rounded-lg transition-colors border border-slate-800 active:scale-95"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      {/* 2. SEVİYE STICKY: OYUNCU YÖNETİMİ */}
      <div className="max-w-5xl mx-auto sticky top-[73px] z-[55] bg-slate-950/95 backdrop-blur-md border-b border-slate-800/50 p-4 shadow-xl">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex flex-wrap gap-2 mb-3">
            {players.map((player, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm transition-all animate-in zoom-in-95 duration-200">
                <span className="text-[10px] font-black uppercase tracking-tight">{player}</span>
                <button onClick={() => removePlayer(idx)} className="text-slate-500 hover:text-red-400 p-0.5">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Yeni Oyuncu Ekle..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-600"
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button 
              onClick={addPlayer}
              className="bg-indigo-600 text-white p-2 rounded-lg active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* ANA TABLO */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden mt-2">
          <div className="overflow-auto max-h-[calc(100vh-280px)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 z-40">
                  <th className="sticky top-0 left-0 z-50 bg-slate-900 p-4 text-left border-b border-r border-slate-800 w-[140px] min-w-[140px] shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                    <span className="text-[9px] uppercase text-slate-500 font-black tracking-widest">KARTLAR</span>
                  </th>
                  {players.map((player, idx) => (
                    <th key={idx} className="sticky top-0 z-30 bg-slate-900 p-4 border-b border-r border-slate-800 text-center min-w-[100px] last:border-r-0">
                      <div className="text-[11px] font-black text-indigo-400 uppercase tracking-tighter whitespace-nowrap px-2">
                        {player}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* ŞÜPHELİLER */}
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900/95 backdrop-blur-sm p-2 border-r border-slate-800 shadow-xl">
                    <SectionHeader icon={ShieldAlert} title="Şüpheliler" colorClass="bg-red-900/60" />
                  </td>
                  {players.map((_, i) => (
                    <td key={i} className="bg-slate-900/40 border-b border-r border-slate-800 last:border-r-0"></td>
                  ))}
                </tr>
                {GAME_DATA.suspects.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="sticky left-0 z-20 bg-slate-900 p-3 border-r border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-4 rounded-full ${item.color}`}></div>
                        <span className="text-[11px] font-bold whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                      </div>
                    </td>
                    {players.map((_, pIdx) => {
                      const status = grid[`${item.id}-${pIdx}`] || 0;
                      return (
                        <td key={pIdx} onClick={() => toggleCell(item.id, pIdx)} className="p-1 cursor-pointer border-r border-slate-800/20 last:border-r-0">
                          <div className={`h-11 w-full min-w-[60px] flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${STATUS_MODES[status].boxClass}`}>
                            {STATUS_MODES[status].icon}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* SİLAHLAR */}
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900/95 backdrop-blur-sm p-2 border-r border-slate-800 shadow-xl">
                    <SectionHeader icon={Sword} title="Silahlar" colorClass="bg-slate-700" />
                  </td>
                  {players.map((_, i) => (
                    <td key={i} className="bg-slate-900/40 border-b border-r border-slate-800 last:border-r-0"></td>
                  ))}
                </tr>
                {GAME_DATA.weapons.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="sticky left-0 z-20 bg-slate-900 p-3 border-r border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                      <span className="text-[11px] font-bold pl-3 whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                    </td>
                    {players.map((_, pIdx) => {
                      const status = grid[`${item.id}-${pIdx}`] || 0;
                      return (
                        <td key={pIdx} onClick={() => toggleCell(item.id, pIdx)} className="p-1 cursor-pointer border-r border-slate-800/20 last:border-r-0">
                          <div className={`h-11 w-full min-w-[60px] flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${STATUS_MODES[status].boxClass}`}>
                            {STATUS_MODES[status].icon}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* ODALAR */}
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900/95 backdrop-blur-sm p-2 border-r border-slate-800 shadow-xl">
                    <SectionHeader icon={Map} title="Odalar" colorClass="bg-indigo-900/60" />
                  </td>
                  {players.map((_, i) => (
                    <td key={i} className="bg-slate-900/40 border-b border-r border-slate-800 last:border-r-0"></td>
                  ))}
                </tr>
                {GAME_DATA.rooms.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="sticky left-0 z-20 bg-slate-900 p-3 border-r border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">
                      <span className="text-[11px] font-bold pl-3 whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                    </td>
                    {players.map((_, pIdx) => {
                      const status = grid[`${item.id}-${pIdx}`] || 0;
                      return (
                        <td key={pIdx} onClick={() => toggleCell(item.id, pIdx)} className="p-1 cursor-pointer border-r border-slate-800/20 last:border-r-0">
                          <div className={`h-11 w-full min-w-[60px] flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${STATUS_MODES[status].boxClass}`}>
                            {STATUS_MODES[status].icon}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lejant */}
        <div className="mt-4 grid grid-cols-3 gap-3 p-4 bg-slate-900/30 rounded-lg border border-slate-800/50 mb-20">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-red-900/30 border-2 border-red-500/50 flex items-center justify-center text-red-400"><X size={16} /></div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">YOK</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-yellow-900/30 border-2 border-yellow-500/50 flex items-center justify-center text-yellow-400"><HelpCircle size={16} /></div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">BELKİ</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-green-900/30 border-2 border-green-500/50 flex items-center justify-center text-green-400"><Check size={16} /></div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">VAR</span>
          </div>
        </div>
      </main>

      {/* YÜZEN DEDEKTİF PANELİ BUTONU */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button 
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all active:scale-90"
        >
          <Search size={20} className={isSummaryOpen ? "rotate-90 transition-transform" : ""} />
          <div className="flex items-center gap-2 border-l border-indigo-400/50 pl-2">
            <span className="text-[10px] font-black flex items-center gap-0.5"><Check size={10} />{summary.confirmed.length}</span>
            <span className="text-[10px] font-black flex items-center gap-0.5"><HelpCircle size={10} />{summary.maybe.length}</span>
            <span className="text-[10px] font-black flex items-center gap-0.5"><X size={10} />{summary.excluded.length}</span>
          </div>
          {isSummaryOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* AÇILIR PANEL (DRAWER) OVERLAY */}
      {isSummaryOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] animate-in fade-in duration-300" 
            onClick={() => setIsSummaryOpen(false)} 
          />
          <div className="fixed bottom-0 left-0 right-0 z-[90] max-h-[70vh] bg-slate-900 border-t border-slate-800 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-4" />
            <div className="px-6 pb-12 overflow-y-auto max-h-[60vh] space-y-6">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Search size={18} /> Detaylı Kanıt Listesi
              </h2>
              
              <div className="space-y-6">
                {summary.confirmed.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2 block">Bulunan İpuçları (✓)</span>
                    <div className="flex flex-wrap gap-2">
                      {summary.confirmed.map((name, i) => (
                        <span key={i} className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-tight">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {summary.maybe.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 block">Takip Edilen Şüpheler (?)</span>
                    <div className="flex flex-wrap gap-2">
                      {summary.maybe.map((name, i) => (
                        <span key={i} className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] px-3 py-1.5 rounded-xl font-bold uppercase tracking-tight">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {summary.excluded.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 block">Elenen Kartlar (X)</span>
                    <div className="flex flex-wrap gap-2">
                      {summary.excluded.map((name, i) => (
                        <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400/60 text-[10px] px-3 py-1.5 rounded-xl font-medium uppercase tracking-tight">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {summary.confirmed.length === 0 && summary.maybe.length === 0 && summary.excluded.length === 0 && (
                  <p className="text-slate-500 text-center py-10 italic text-sm">Henüz hiçbir kanıt işaretlenmedi...</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <footer className="mt-8 mb-12 text-center px-4">
        <p className="text-slate-600 text-[9px] uppercase tracking-[0.4em]">Developed by Emre Adanır.</p>
      </footer>
    </div>
  );
};

export default App;