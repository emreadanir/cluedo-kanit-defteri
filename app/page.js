'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCcw, X, Users, FileText, Plus, Trash2 } from 'lucide-react';

// Başlangıç Verileri
const INITIAL_SUSPECTS = ['Green', 'Mustard', 'Orchid', 'Peacock', 'Plum', 'Scarlett'];
const INITIAL_WEAPONS = ['Şamdan', 'Hançer', 'Tabanca', 'Kurşun Boru', 'İp', 'İngiliz Anahtarı'];
const INITIAL_ROOMS = ['Balo Salonu', 'Bilardo Odası', 'Kış Bahçesi', 'Yemek Odası', 'Hol', 'Mutfak', 'Kütüphane', 'Salon', 'Çalışma Odası'];

export default function Home() {
  // --- STATES ---
  const [players, setPlayers] = useState([
    { id: 1, name: 'Siz' },
    { id: 2, name: 'Oyuncu 2' },
    { id: 3, name: 'Oyuncu 3' }
  ]);
  
  const [gameData, setGameData] = useState({});
  const [activeCell, setActiveCell] = useState(null); 
  const [isOpen, setIsOpen] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Bottom Sheet Logic
  const [translateY, setTranslateY] = useState(0);
  const sheetRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- EFFECT: LOAD & SAVE ---
  useEffect(() => {
    const savedState = localStorage.getItem('cluedoDarkState_v1');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setPlayers(parsed.players || []);
      setGameData(parsed.gameData || {});
    } else {
      const initialData = {};
      [...INITIAL_SUSPECTS, ...INITIAL_WEAPONS, ...INITIAL_ROOMS].forEach(card => {
        initialData[card] = {};
      });
      setGameData(initialData);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(gameData).length > 0) {
      localStorage.setItem('cluedoDarkState_v1', JSON.stringify({ players, gameData }));
    }
  }, [players, gameData]);

  // --- HANDLERS ---
  const handleStatusChange = (status) => {
    if (!activeCell) return;
    setGameData(prev => ({
      ...prev,
      [activeCell.cardName]: {
        ...prev[activeCell.cardName],
        [activeCell.playerId]: status
      }
    }));
    setIsOpen(false);
    setTranslateY(0);
  };

  const openSheet = (cardName, playerId, category) => {
    setActiveCell({ cardName, playerId, category });
    setIsOpen(true);
    setTranslateY(0);
  };

  const resetGame = () => {
    if (window.confirm('Yeni oyun başlatmak istediğinize emin misiniz?')) {
      const resetData = {};
      [...INITIAL_SUSPECTS, ...INITIAL_WEAPONS, ...INITIAL_ROOMS].forEach(card => {
        resetData[card] = {};
      });
      setGameData(resetData);
    }
  };

  const addPlayer = () => {
    const newId = Math.max(...players.map(p => p.id), 0) + 1;
    setPlayers([...players, { id: newId, name: `Oyuncu ${players.length + 1}` }]);
  };

  const removePlayer = (id) => {
    if (players.length <= 1) return alert("En az 1 oyuncu kalmalı.");
    if (window.confirm("Bu oyuncuyu silmek istediğinize emin misiniz?")) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const updatePlayerName = (id, newName) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  // --- TOUCH HANDLERS (DÜZELTİLDİ) ---
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
    
    // Aşağı çekildikçe pozitif değer üretmeli (Current - Start)
    const diff = currentY - touchStart;
    
    // Sadece aşağı harekete (pozitif) izin ver
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart; // Aşağı hareket miktarı
    const isSwipeDown = distance > 100; // 100px'den fazla aşağı çekildiyse kapat

    if (isSwipeDown) {
      setIsOpen(false);
    }
    
    setTranslateY(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // --- STYLES ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'yes': return 'bg-green-900/40 text-green-400 border-green-800/50 font-bold shadow-[0_0_10px_rgba(74,222,128,0.1)]';
      case 'no': return 'bg-red-900/30 text-red-400 border-red-900/50';
      case 'maybe': return 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50 font-bold';
      default: return 'bg-slate-900/50 text-transparent hover:bg-slate-800 border-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'yes': return '✓';
      case 'no': return '✕';
      case 'maybe': return '?';
      default: return '.';
    }
  };

  // --- COMPONENTS ---
  const TableRow = ({ cardName, category }) => (
    <div className="flex border-b border-slate-800 last:border-0 h-12 group">
      {/* Sticky Left Column */}
      <div className="sticky left-0 z-10 bg-slate-900 w-32 min-w-[8rem] flex items-center px-3 border-r border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
        <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">{cardName}</span>
      </div>
      
      {/* Scrollable Player Columns */}
      <div className="flex">
        {players.map(player => {
          const status = gameData[cardName]?.[player.id] || 'unknown';
          return (
            <div 
              key={player.id} 
              onClick={() => openSheet(cardName, player.id, category)}
              className={`w-16 min-w-[4rem] border-r border-slate-800 flex items-center justify-center cursor-pointer transition-all ${getStatusStyle(status)}`}
            >
              <span className="text-lg">{getStatusIcon(status)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const Section = ({ title, items, icon, category }) => (
    <div className="mb-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
      <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <span className="text-xl opacity-80">{icon}</span>
        <h2 className="font-bold text-slate-100">{title}</h2>
      </div>
      <div className="relative overflow-x-auto">
        {/* Header Row */}
        <div className="flex h-10 bg-slate-900 border-b border-slate-800">
          <div className="sticky left-0 z-10 bg-slate-900 w-32 min-w-[8rem] border-r border-slate-800" />
          <div className="flex">
            {players.map(player => (
              <div key={player.id} className="w-16 min-w-[4rem] flex items-center justify-center border-r border-slate-800 px-1">
                <span className="text-xs font-bold text-slate-400 truncate text-center w-full" title={player.name}>
                  {player.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Data Rows */}
        {items.map(item => (
          <TableRow key={item} cardName={item} category={category} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 safe-top shadow-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSummaryModal(true)}
              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 transition-all border border-blue-500/20 flex items-center gap-2"
            >
              <FileText size={18} />
              <span className="text-sm font-bold hidden sm:inline">Özet</span>
            </button>
          </div>

          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">🔍</span>
            <span className="hidden sm:inline">CLUEDO</span>
          </h1>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowPlayersModal(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Users size={20} />
            </button>
            <button 
              onClick={resetGame}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto px-2 py-6">
        <Section title="Şüpheliler" items={INITIAL_SUSPECTS} icon="🕵️" category="suspect" />
        <Section title="Aletler" items={INITIAL_WEAPONS} icon="🔧" category="weapon" />
        <Section title="Odalar" items={INITIAL_ROOMS} icon="🏰" category="room" />
      </main>

      {/* BOTTOM SHEET (STATUS SELECTOR) */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[4px] transition-opacity animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 rounded-t-[2rem] shadow-2xl max-w-md mx-auto transition-transform duration-200 ease-out"
            style={{ transform: `translateY(${translateY}px)` }}
          >
            {/* DRAG HANDLE */}
            <div 
              className="w-full pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="w-16 h-1.5 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors" />
            </div>

            <div className="p-6 pt-2 pb-10">
              <div className="text-center mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {players.find(p => p.id === activeCell?.playerId)?.name}
                </p>
                <h3 className="text-2xl font-black text-white">
                  {activeCell?.cardName}
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleStatusChange('yes')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-900/20 text-green-400 border border-green-900/50 hover:bg-green-900/40 hover:border-green-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">✓</div>
                  <span className="font-bold text-sm">Var</span>
                </button>

                <button
                  onClick={() => handleStatusChange('no')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40 hover:border-red-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">✕</div>
                  <span className="font-bold text-sm">Yok</span>
                </button>

                <button
                  onClick={() => handleStatusChange('maybe')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-yellow-900/20 text-yellow-400 border border-yellow-900/50 hover:bg-yellow-900/40 hover:border-yellow-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">?</div>
                  <span className="font-bold text-sm">Belki</span>
                </button>
              </div>

              <button
                onClick={() => handleStatusChange('unknown')}
                className="w-full mt-4 p-4 rounded-2xl text-slate-500 font-medium hover:bg-slate-800 hover:text-slate-300 transition-colors"
              >
                Temizle
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: OYUNCULAR */}
      {showPlayersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPlayersModal(false)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Oyuncular</h3>
              <button onClick={() => setShowPlayersModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => updatePlayerName(player.id, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button 
                      onClick={() => removePlayer(player.id)}
                      className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addPlayer}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/10 transition-all font-medium"
              >
                <Plus size={18} /> Oyuncu Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ÖZET / RAPOR */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSummaryModal(false)} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <FileText size={20} className="text-blue-400" />
                Durum Raporu
              </h3>
              <button onClick={() => setShowSummaryModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Bölüm 1: Kesinleşenler */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Kimde Ne Var?</h4>
                <div className="space-y-2">
                  {Object.entries(gameData).map(([cardName, states]) => {
                    const ownerId = Object.keys(states).find(pid => states[pid] === 'yes');
                    if (ownerId) {
                      const owner = players.find(p => p.id === parseInt(ownerId));
                      return (
                        <div key={cardName} className="flex justify-between items-center p-3 bg-green-900/20 border border-green-900/40 rounded-lg">
                          <span className="font-medium text-slate-200">{cardName}</span>
                          <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                            {owner ? owner.name : 'Bilinmiyor'}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {!Object.values(gameData).some(states => Object.values(states).includes('yes')) && (
                    <p className="text-sm text-slate-600 italic text-center py-2">Henüz kesinleşen bir kanıt yok.</p>
                  )}
                </div>
              </div>

              {/* Bölüm 2: Potansiyel Suçlular */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Potansiyel Suç Unsurları</h4>
                <div className="text-xs text-slate-500 mb-2">Herkesin "YOK" (✕) dediği kartlar:</div>
                <div className="space-y-2">
                  {[...INITIAL_SUSPECTS, ...INITIAL_WEAPONS, ...INITIAL_ROOMS].map(cardName => {
                    const states = gameData[cardName] || {};
                    const allNo = players.length > 0 && players.every(p => states[p.id] === 'no');
                    
                    if (allNo) {
                      return (
                        <div key={cardName} className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-900/40 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 font-bold">!</div>
                          <span className="font-bold text-slate-200">{cardName}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}