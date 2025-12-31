'use client';

import { useState, useEffect, useRef } from 'react';
import { RotateCcw, X, Users, FileText, Plus, Trash2 } from 'lucide-react';

// Başlangıç Verileri
const INITIAL_SUSPECTS = ['Başkan Green', 'Albay Mustard', 'Şef White', 'Avukat Peacock', 'Profesör Plum', 'Bayan Scarlett'];
const INITIAL_WEAPONS = ['Şamdan', 'Hançer', 'Tabanca', 'Kurşun Boru', 'İp', 'İngiliz Anahtarı'];
const INITIAL_ROOMS = ['Balo Salonu', 'Bilardo Odası', 'Kış Bahçesi', 'Yemek Odası', 'Hol', 'Mutfak', 'Kütüphane', 'Salon', 'Çalışma Odası'];

// Kart İkonları (Emojiler)
const CARD_ICONS = {
  // Aletler
  'Şamdan': '🕯️',
  'Hançer': '🗡️',
  'Tabanca': '🔫',
  'Kurşun Boru': '🔩',
  'İp': '🪢',
  'İngiliz Anahtarı': '🔧',
  // Odalar
  'Balo Salonu': '💃',
  'Bilardo Odası': '🎱',
  'Kış Bahçesi': '🌿',
  'Yemek Odası': '🍽️',
  'Hol': '🚪',
  'Mutfak': '🍳',
  'Kütüphane': '📚',
  'Salon': '🛋️',
  'Çalışma Odası': '💼',
};

export default function Home() {
  // --- STATES ---
  const [players, setPlayers] = useState([
    { id: 1, name: 'Siz' },
    { id: 2, name: 'Oyuncu 2' },
    { id: 3, name: 'Oyuncu 3' }
  ]);
  
  const [gameData, setGameData] = useState({});
  const [activeCell, setActiveCell] = useState(null); 
  
  // Sheet State: null | 'selector' | 'report'
  const [activeSheet, setActiveSheet] = useState(null);
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  // Bottom Sheet Logic
  const [translateY, setTranslateY] = useState(0);
  const sheetRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // --- EFFECT: LOAD & SAVE ---
  useEffect(() => {
    const savedState = localStorage.getItem('cluedoDarkState_v6');
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
      localStorage.setItem('cluedoDarkState_v6', JSON.stringify({ players, gameData }));
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
    setActiveSheet(null);
    setTranslateY(0);
  };

  const openSelector = (cardName, playerId, category) => {
    setActiveCell({ cardName, playerId, category });
    setActiveSheet('selector');
    setTranslateY(0);
  };

  const openReport = () => {
    setActiveSheet('report');
    setTranslateY(0);
  };

  const closeSheet = () => {
    setActiveSheet(null);
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

  // --- TOUCH HANDLERS ---
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);
    const diff = currentY - touchStart;
    if (diff > 0) {
      setTranslateY(diff);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    if (distance > 100) {
      closeSheet();
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
      default: return '';
    }
  };

  const getCharacterColor = (name) => {
    if (name.includes('Green')) return 'bg-green-500';
    if (name.includes('Mustard')) return 'bg-yellow-500';
    if (name.includes('White')) return 'bg-slate-100';
    if (name.includes('Peacock')) return 'bg-blue-400';
    if (name.includes('Plum')) return 'bg-purple-500';
    if (name.includes('Scarlett')) return 'bg-red-500';
    return null;
  };

  // --- HELPERS FOR REPORT ---
  const getReportData = () => {
    const data = {
      yes: [],
      maybe: [],
      no: []
    };

    [...INITIAL_SUSPECTS, ...INITIAL_WEAPONS, ...INITIAL_ROOMS].forEach(card => {
      const cardStatuses = gameData[card];
      if (!cardStatuses) return;

      Object.entries(cardStatuses).forEach(([playerId, status]) => {
        if (status === 'unknown') return;
        
        const player = players.find(p => p.id === parseInt(playerId));
        if (player && data[status]) {
          data[status].push({
            card: card,
            player: player.name
          });
        }
      });
    });

    return data;
  };

  // --- COMPONENTS ---
  const TableRow = ({ cardName, category }) => {
    const charColor = category === 'suspect' ? getCharacterColor(cardName) : null;
    const cardIcon = CARD_ICONS[cardName];

    return (
      <div className="flex border-b border-slate-800 last:border-0 h-12 group min-w-max">
        <div className="sticky left-0 z-10 bg-slate-900 w-32 min-w-[8rem] flex items-center px-2 border-r border-slate-800 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 w-full overflow-hidden">
            {/* Şüpheliler için Renk, Diğerleri için Emoji */}
            {category === 'suspect' && charColor ? (
              <div className={`w-2 h-2 rounded-full shrink-0 ${charColor} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
            ) : cardIcon ? (
              <span className="text-base shrink-0 leading-none filter drop-shadow-md">{cardIcon}</span>
            ) : null}
            
            <span className="text-[11px] sm:text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors leading-tight" title={cardName}>
              {cardName}
            </span>
          </div>
        </div>
        <div className="flex">
          {players.map(player => {
            const status = gameData[cardName]?.[player.id] || 'unknown';
            return (
              <div 
                key={player.id} 
                onClick={() => openSelector(cardName, player.id, category)}
                className={`w-16 min-w-[4rem] border-r border-slate-800 flex items-center justify-center cursor-pointer transition-all ${getStatusStyle(status)}`}
              >
                <span className="text-lg">{getStatusIcon(status)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Section = ({ title, items, icon, category }) => (
    <div className="mb-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800 overflow-hidden">
      <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <span className="text-xl opacity-80">{icon}</span>
        <h2 className="font-bold text-slate-100">{title}</h2>
      </div>
      <div className="relative overflow-x-auto">
        <div className="flex h-10 bg-slate-900 border-b border-slate-800 min-w-max">
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
              onClick={openReport}
              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 transition-all border border-blue-500/20 flex items-center gap-2"
            >
              <FileText size={18} />
              <span className="text-sm font-bold">Kanıt Özeti</span>
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

      {/* BOTTOM SHEET CONTAINER (Used for both Selector and Report) */}
      {activeSheet && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-[4px] transition-opacity animate-in fade-in"
            onClick={closeSheet}
          />
          <div
            ref={sheetRef}
            className={`fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 rounded-t-[2rem] shadow-2xl max-w-md mx-auto transition-transform duration-200 ease-out flex flex-col ${activeSheet === 'report' ? 'max-h-[85vh]' : ''}`}
            style={{ transform: `translateY(${translateY}px)` }}
          >
            {/* DRAG HANDLE */}
            <div 
              className="w-full pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none shrink-0"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="w-16 h-1.5 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors" />
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 pb-10">
                
                {/* --- SELECTOR CONTENT --- */}
                {activeSheet === 'selector' && (
                    <>
                        <div className="text-center mb-8">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            {players.find(p => p.id === activeCell?.playerId)?.name}
                            </p>
                            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                                {/* Başlıkta da ilgili emojiyi göster */}
                                {CARD_ICONS[activeCell?.cardName]}
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
                    </>
                )}

                {/* --- REPORT CONTENT (NEW DESIGN) --- */}
                {activeSheet === 'report' && (
                    <div className="pb-8">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
                                <FileText className="text-blue-400" />
                                Detaylı Rapor
                            </h3>
                        </div>

                        {(() => {
                          const reportData = getReportData();
                          const isEmpty = reportData.yes.length === 0 && reportData.maybe.length === 0 && reportData.no.length === 0;

                          if (isEmpty) {
                            return (
                                <div className="text-center py-10 flex flex-col items-center gap-4 text-slate-600">
                                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                                      <FileText size={32} className="opacity-20" />
                                    </div>
                                    <p className="italic">Henüz hiçbir işaretleme yapılmamış.</p>
                                </div>
                            );
                          }

                          return (
                            <div className="space-y-6">
                              {/* 1. KESİNLEŞENLER (Grid View) */}
                              {reportData.yes.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Kesinleşenler ({reportData.yes.length})
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {reportData.yes.map((item, idx) => (
                                            <div key={idx} className="bg-green-900/10 border border-green-900/40 rounded-xl p-3 flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-2 mb-1 w-full">
                                                    {CARD_ICONS[item.card] && (
                                                        <span className="text-sm shrink-0">{CARD_ICONS[item.card]}</span>
                                                    )}
                                                    <span className="font-bold text-slate-200 text-sm line-clamp-1">{item.card}</span>
                                                </div>
                                                <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded-md">
                                                    {item.player}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                              )}

                              {/* 2. ŞÜPHELER (Chip View) */}
                              {reportData.maybe.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                        Şüpheler ({reportData.maybe.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {reportData.maybe.map((item, idx) => (
                                            <div key={idx} className="bg-yellow-900/10 border border-yellow-900/30 rounded-full pl-3 pr-1 py-1 flex items-center gap-2">
                                                {CARD_ICONS[item.card] && (
                                                        <span className="text-xs shrink-0">{CARD_ICONS[item.card]}</span>
                                                )}
                                                <span className="text-slate-300 text-xs font-medium">{item.card}</span>
                                                <span className="text-[10px] font-bold text-yellow-500 bg-yellow-900/20 px-2 py-0.5 rounded-full">
                                                    {item.player}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                              )}

                              {/* 3. OLMAYANLAR (Dense Chip View) */}
                              {reportData.no.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Olmayanlar ({reportData.no.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {reportData.no.map((item, idx) => (
                                            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-md px-2 py-1.5 flex items-center gap-2">
                                                {CARD_ICONS[item.card] && (
                                                        <span className="text-[10px] shrink-0 opacity-70">{CARD_ICONS[item.card]}</span>
                                                )}
                                                <span className="text-slate-400 text-xs">{item.card}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                <span className="text-[10px] text-red-400/80 uppercase font-bold">
                                                    {item.player}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                )}
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

    </div>
  );
}