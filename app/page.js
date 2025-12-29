'use client';
import React, { useState, useEffect } from 'react';
import { UserPlus, RotateCcw, Check, X, HelpCircle, ShieldAlert, Map, Sword } from 'lucide-react';

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
  { 
    icon: null, 
    boxClass: 'border-slate-800 bg-slate-800/30', 
    label: 'empty' 
  },
  { 
    icon: <X size={20} className="text-red-400" />, 
    boxClass: 'border-red-500/50 bg-red-900/30 ring-1 ring-red-500/20', 
    label: 'no' 
  },
  { 
    icon: <HelpCircle size={20} className="text-yellow-400" />, 
    boxClass: 'border-yellow-500/50 bg-yellow-900/30 ring-1 ring-yellow-500/20', 
    label: 'maybe' 
  },
  { 
    icon: <Check size={20} className="text-green-400" />, 
    boxClass: 'border-green-500/50 bg-green-900/30 ring-1 ring-green-500/20', 
    label: 'yes' 
  },
];

const App = () => {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [grid, setGrid] = useState({});
  const [newPlayerName, setNewPlayerName] = useState('');

  // Sayfa başlığını tarayıcıda güncelleme
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

  const SectionHeader = ({ icon: Icon, title, colorClass }) => (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${colorClass} text-white font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg w-fit min-w-[150px]`}>
      <Icon size={14} />
      <span>{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="max-w-5xl mx-auto p-4 flex justify-between items-center border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter">CLUEDO</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Dijital Kanıt Defteri</p>
        </div>
        <button 
          onClick={resetGame}
          className="p-2 bg-slate-900 hover:bg-red-900/40 text-slate-300 rounded-lg transition-colors border border-slate-800"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {/* Oyuncu Ekleme */}
        <div className="bg-slate-900/50 p-3 rounded-xl mb-6 border border-slate-800 shadow-xl">
          <div className="flex flex-wrap gap-2 mb-3">
            {players.map((player, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                <span className="text-[10px] font-bold uppercase">{player}</span>
                <button onClick={() => removePlayer(idx)} className="text-slate-500 hover:text-red-400">
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
              placeholder="Yeni Oyuncu..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white"
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button 
              onClick={addPlayer}
              className="bg-indigo-600 text-white p-2 rounded-lg active:scale-95"
            >
              <UserPlus size={20} />
            </button>
          </div>
        </div>

        {/* Ana Tablo */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
          <div className="overflow-auto max-h-[65vh]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 z-40">
                  <th className="sticky top-0 left-0 z-50 bg-slate-900 p-4 text-left border-b border-r border-slate-800 w-[140px] min-w-[140px]">
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
                {/* ŞÜPHELİLER BAŞLIK */}
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900/90 backdrop-blur-sm p-2 border-r border-slate-800 shadow-xl">
                    <SectionHeader icon={ShieldAlert} title="Şüpheliler" colorClass="bg-red-900/60" />
                  </td>
                  {players.map((_, i) => (
                    <td key={i} className="bg-slate-900/40 border-b border-r border-slate-800 last:border-r-0"></td>
                  ))}
                </tr>
                {GAME_DATA.suspects.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50">
                    <td className="sticky left-0 z-20 bg-slate-900 p-3 border-r border-slate-800 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-4 rounded-full ${item.color}`}></div>
                        <span className="text-[11px] font-bold whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                      </div>
                    </td>
                    {players.map((_, pIdx) => {
                      const status = grid[`${item.id}-${pIdx}`] || 0;
                      return (
                        <td 
                          key={pIdx} 
                          onClick={() => toggleCell(item.id, pIdx)}
                          className="p-1 cursor-pointer border-r border-slate-800/20 last:border-r-0"
                        >
                          <div className={`h-11 w-full min-w-[60px] flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${STATUS_MODES[status].boxClass}`}>
                            {STATUS_MODES[status].icon}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* SİLAHLAR BAŞLIK */}
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900/90 backdrop-blur-sm p-2 border-r border-slate-800 shadow-xl">
                    <SectionHeader icon={Sword} title="Silahlar" colorClass="bg-slate-700" />
                  </td>
                  {players.map((_, i) => (
                    <td key={i} className="bg-slate-900/40 border-b border-r border-slate-800 last:border-r-0"></td>
                  ))}
                </tr>
                {GAME_DATA.weapons.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50">
                    <td className="sticky left-0 z-20 bg-slate-900 p-3 border-r border-slate-800 shadow-lg">
                      <span className="text-[11px] font-bold pl-3 whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                    </td>
                    {players.map((_, pIdx) => {
                      const status = grid[`${item.id}-${pIdx}`] || 0;
                      return (
                        <td 
                          key={pIdx} 
                          onClick={() => toggleCell(item.id, pIdx)}
                          className="p-1 cursor-pointer border-r border-slate-800/20 last:border-r-0"
                        >
                          <div className={`h-11 w-full min-w-[60px] flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${STATUS_MODES[status].boxClass}`}>
                            {STATUS_MODES[status].icon}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* ODALAR BAŞLIK */}
                <tr>
                  <td className="sticky left-0 z-20 bg-slate-900/90 backdrop-blur-sm p-2 border-r border-slate-800 shadow-xl">
                    <SectionHeader icon={Map} title="Odalar" colorClass="bg-indigo-900/60" />
                  </td>
                  {players.map((_, i) => (
                    <td key={i} className="bg-slate-900/40 border-b border-r border-slate-800 last:border-r-0"></td>
                  ))}
                </tr>
                {GAME_DATA.rooms.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50">
                    <td className="sticky left-0 z-20 bg-slate-900 p-3 border-r border-slate-800 shadow-lg">
                      <span className="text-[11px] font-bold pl-3 whitespace-nowrap uppercase tracking-tight">{item.name}</span>
                    </td>
                    {players.map((_, pIdx) => {
                      const status = grid[`${item.id}-${pIdx}`] || 0;
                      return (
                        <td 
                          key={pIdx} 
                          onClick={() => toggleCell(item.id, pIdx)}
                          className="p-1 cursor-pointer border-r border-slate-800/20 last:border-r-0"
                        >
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
        <div className="mt-6 grid grid-cols-3 gap-3 p-4 bg-slate-900/30 rounded-lg border border-slate-800/50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 border-2 border-red-500/50 flex items-center justify-center text-red-400">
              <X size={18} />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">YOK</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-900/30 border-2 border-yellow-500/50 flex items-center justify-center text-yellow-400">
              <HelpCircle size={18} />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">BELKİ</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 border-2 border-green-500/50 flex items-center justify-center text-green-400">
              <Check size={18} />
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">VAR</span>
          </div>
        </div>
      </main>

      <footer className="mt-8 mb-12 text-center">
        <p className="text-slate-600 text-[9px] uppercase tracking-[0.4em]">Developed by Emre Adanır.</p>
      </footer>
    </div>
  );
};

export default App;