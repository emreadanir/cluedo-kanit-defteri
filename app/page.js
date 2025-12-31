'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, RotateCcw, X, Info } from 'lucide-react';

export default function Home() {
  const [suspects, setSuspects] = useState([
    { name: 'Green', status: 'unknown' },
    { name: 'Mustard', status: 'unknown' },
    { name: 'Orchid', status: 'unknown' },
    { name: 'Peacock', status: 'unknown' },
    { name: 'Plum', status: 'unknown' },
    { name: 'Scarlett', status: 'unknown' },
  ]);

  const [weapons, setWeapons] = useState([
    { name: 'Şamdan', status: 'unknown' },
    { name: 'Hançer', status: 'unknown' },
    { name: 'Tabanca', status: 'unknown' },
    { name: 'Kurşun Boru', status: 'unknown' },
    { name: 'İp', status: 'unknown' },
    { name: 'İngiliz Anahtarı', status: 'unknown' },
  ]);

  const [rooms, setRooms] = useState([
    { name: 'Balo Salonu', status: 'unknown' },
    { name: 'Bilardo Odası', status: 'unknown' },
    { name: 'Kış Bahçesi', status: 'unknown' },
    { name: 'Yemek Odası', status: 'unknown' },
    { name: 'Hol', status: 'unknown' },
    { name: 'Mutfak', status: 'unknown' },
    { name: 'Kütüphane', status: 'unknown' },
    { name: 'Salon', status: 'unknown' },
    { name: 'Çalışma Odası', status: 'unknown' },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null); // { type: 'suspect', index: 0 }
  const sheetRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [translateY, setTranslateY] = useState(0);

  // Oyun durumunu kaydetme
  useEffect(() => {
    const savedState = localStorage.getItem('cluedoState');
    if (savedState) {
      const { suspects: s, weapons: w, rooms: r } = JSON.parse(savedState);
      setSuspects(s);
      setWeapons(w);
      setRooms(r);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cluedoState', JSON.stringify({ suspects, weapons, rooms }));
  }, [suspects, weapons, rooms]);

  const handleStatusChange = (type, index, newStatus) => {
    let newItems;
    if (type === 'suspect') {
      newItems = [...suspects];
      newItems[index].status = newStatus;
      setSuspects(newItems);
    } else if (type === 'weapon') {
      newItems = [...weapons];
      newItems[index].status = newStatus;
      setWeapons(newItems);
    } else {
      newItems = [...rooms];
      newItems[index].status = newStatus;
      setRooms(newItems);
    }
    setIsOpen(false);
    setTranslateY(0);
  };

  const openSheet = (type, index) => {
    setActiveCard({ type, index });
    setIsOpen(true);
    setTranslateY(0);
  };

  const resetGame = () => {
    if (window.confirm('Oyunu sıfırlamak istediğinize emin misiniz? Tüm işaretlemeler silinecek.')) {
      const resetItems = (items) => items.map(item => ({ ...item, status: 'unknown' }));
      setSuspects(resetItems(suspects));
      setWeapons(resetItems(weapons));
      setRooms(resetItems(rooms));
    }
  };

  // Touch handlers - ARTIK SADECE TUTMA ÇUBUĞU İÇİN (HANDLE)
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
    const diff = touchStart - e.targetTouches[0].clientY;
    if (diff < 0) { // Sadece aşağı kaydırmaya izin ver
      setTranslateY(diff);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipeDown = distance < -100; // Eşik değeri

    if (isSwipeDown) {
      setIsOpen(false);
    }
    setTranslateY(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'yes': return 'bg-green-100 text-green-800 border-green-200';
      case 'no': return 'bg-red-100 text-red-800 border-red-200';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
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

  const Section = ({ title, items, type }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-slate-800 px-2 flex items-center gap-2">
        {type === 'suspect' && <span className="text-2xl">🕵️</span>}
        {type === 'weapon' && <span className="text-2xl">🔧</span>}
        {type === 'room' && <span className="text-2xl">🏰</span>}
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-2">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => openSheet(type, index)}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all active:scale-[0.98] ${getStatusColor(item.status)}`}
          >
            <span className="font-medium text-lg">{item.name}</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
              item.status === 'unknown' ? 'bg-white/50' : 'bg-white/80'
            }`}>
              {getStatusIcon(item.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 safe-top">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            CLUEDO
          </h1>
          <button 
            onClick={resetGame}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
            aria-label="Oyunu Sıfırla"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <Section title="Şüpheliler" items={suspects} type="suspect" />
        <Section title="Aletler" items={weapons} type="weapon" />
        <Section title="Odalar" items={rooms} type="room" />
      </main>

      {/* Action Sheet / Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sheet */}
          <div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] max-w-md mx-auto transition-transform duration-200 ease-out"
            style={{ 
              transform: `translateY(${translateY}px)`,
            }}
          >
            {/* Drag Handle Area 
                Dokunma olayları (onTouchStart, vs.) artık SADECE bu alanda tanımlı.
                Böylece kullanıcı aşağıdan seçim yaparken yanlışlıkla paneli kapatmaz.
            */}
            <div 
              className="w-full pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing touch-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="w-16 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Content */}
            <div className="p-6 pt-2 pb-10">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {activeCard && (
                    activeCard.type === 'suspect' ? suspects[activeCard.index].name :
                    activeCard.type === 'weapon' ? weapons[activeCard.index].name :
                    rooms[activeCard.index].name
                  )}
                </h3>
                <p className="text-slate-500 text-sm">Durumu Seçin</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleStatusChange(activeCard.type, activeCard.index, 'yes')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-50 text-green-700 border-2 border-transparent hover:border-green-200 active:bg-green-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl font-bold">
                    ✓
                  </div>
                  <span className="font-medium">Evet</span>
                </button>

                <button
                  onClick={() => handleStatusChange(activeCard.type, activeCard.index, 'no')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-50 text-red-700 border-2 border-transparent hover:border-red-200 active:bg-red-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-xl font-bold">
                    ✕
                  </div>
                  <span className="font-medium">Hayır</span>
                </button>

                <button
                  onClick={() => handleStatusChange(activeCard.type, activeCard.index, 'maybe')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-yellow-50 text-yellow-700 border-2 border-transparent hover:border-yellow-200 active:bg-yellow-100 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-xl font-bold">
                    ?
                  </div>
                  <span className="font-medium">Belki</span>
                </button>
              </div>

              <button
                onClick={() => handleStatusChange(activeCard.type, activeCard.index, 'unknown')}
                className="w-full mt-4 p-4 rounded-2xl text-slate-400 font-medium hover:bg-slate-50 transition-colors"
              >
                Temizle / Bilinmiyor
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}