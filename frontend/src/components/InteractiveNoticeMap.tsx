import React, { useState } from 'react';
import { MapPin, Navigation, Info, AlertTriangle, Droplets, Zap, ShieldAlert, BookOpen, Briefcase } from 'lucide-react';
import { NoticeItem } from '../types';

interface InteractiveNoticeMapProps {
  notices: NoticeItem[];
  onSelectNotice: (notice: NoticeItem) => void;
  selectedLocality: string;
  onSelectLocality: (locality: string) => void;
}

interface LocalityCoord {
  name: string;
  top: string;
  left: string;
  description: string;
}

const HYDERABAD_LOCALITIES: LocalityCoord[] = [
  { name: 'Kukatpally', top: '28%', left: '32%', description: 'Major residential & commercial corridor' },
  { name: 'Miyapur', top: '22%', left: '20%', description: 'Metro terminal & suburban residential hub' },
  { name: 'Gachibowli', top: '48%', left: '28%', description: 'Financial district & IT corridor' },
  { name: 'Madhapur', top: '42%', left: '38%', description: 'Hitec City core technology zone' },
  { name: 'Secunderabad', top: '35%', left: '68%', description: 'Twin city railway & defense zone' },
  { name: 'Ameerpet', top: '40%', left: '52%', description: 'Educational & transit interchange' },
  { name: 'LB Nagar', top: '68%', left: '72%', description: 'South-east junction & highway gateway' },
  { name: 'Mehdipatnam', top: '56%', left: '46%', description: 'Historic gateway & transport terminal' },
];

export const InteractiveNoticeMap: React.FC<InteractiveNoticeMapProps> = ({
  notices,
  onSelectNotice,
  selectedLocality,
  onSelectLocality,
}) => {
  const [hoveredLocality, setHoveredLocality] = useState<string | null>(null);

  // Get active alerts per locality
  const getNoticesForLocality = (locName: string) => {
    return notices.filter(n => n.locations && n.locations.some(l => l.toLowerCase().includes(locName.toLowerCase())));
  };

  const getLocalityUrgency = (locName: string) => {
    const locNotices = getNoticesForLocality(locName);
    if (locNotices.some(n => n.urgency === 'CRITICAL')) return 'CRITICAL';
    if (locNotices.some(n => n.urgency === 'HIGH')) return 'HIGH';
    if (locNotices.some(n => n.urgency === 'MEDIUM')) return 'MEDIUM';
    if (locNotices.length > 0) return 'LOW';
    return 'NONE';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Map Header Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center">
            <Navigation className="w-4 h-4 mr-1.5 text-blue-600" />
            Civic Notice Geographical Intelligence & Disruption Map
          </h3>
          <p className="text-xs text-slate-500">
            Interactive spatial mapping of public utilities, water interruptions, emergency warnings, and traffic diversions.
          </p>
        </div>

        {/* Quick locality pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => onSelectLocality('All')}
            className={`px-2.5 py-1 rounded-full font-semibold transition ${
              selectedLocality === 'All'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-200 border'
            }`}
          >
            All Hyderabad
          </button>
          {HYDERABAD_LOCALITIES.slice(0, 5).map((loc) => {
            const urgency = getLocalityUrgency(loc.name);
            const isSelected = selectedLocality === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => onSelectLocality(loc.name)}
                className={`px-2.5 py-1 rounded-full font-semibold transition flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border'
                }`}
              >
                <span>{loc.name}</span>
                {urgency === 'CRITICAL' && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                {urgency === 'HIGH' && <span className="w-2 h-2 rounded-full bg-orange-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Spatial Map Canvas */}
      <div className="relative w-full h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 overflow-hidden select-none">
        {/* Decorative Grid Lines to simulate high-tech GIS map */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        {/* Simulated River Musi across city */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
          <path
            d="M 0,220 Q 250,160 500,240 T 1000,200"
            fill="transparent"
            stroke="#38bdf8"
            strokeWidth="8"
          />
        </svg>

        {/* Locality Markers */}
        {HYDERABAD_LOCALITIES.map((loc) => {
          const locNotices = getNoticesForLocality(loc.name);
          const urgency = getLocalityUrgency(loc.name);
          const isSelected = selectedLocality === loc.name;
          const isHovered = hoveredLocality === loc.name;

          let badgeColor = 'bg-blue-500/80 text-blue-100 border-blue-400';
          if (urgency === 'CRITICAL') badgeColor = 'bg-red-600 text-white border-red-400 animate-pulse';
          else if (urgency === 'HIGH') badgeColor = 'bg-orange-500 text-white border-orange-300';
          else if (urgency === 'MEDIUM') badgeColor = 'bg-amber-500 text-white border-amber-300';

          return (
            <div
              key={loc.name}
              style={{ top: loc.top, left: loc.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all duration-200"
              onMouseEnter={() => setHoveredLocality(loc.name)}
              onMouseLeave={() => setHoveredLocality(null)}
              onClick={() => onSelectLocality(loc.name)}
            >
              {/* Outer pulse wave for active alerts */}
              {urgency !== 'NONE' && (
                <div className={`absolute -inset-2 rounded-full opacity-75 animate-ping ${
                  urgency === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-400'
                }`} />
              )}

              {/* Pin Pill */}
              <div className={`relative px-2.5 py-1 rounded-full text-xs font-bold border shadow-lg flex items-center space-x-1.5 transition-transform ${
                isSelected ? 'scale-110 ring-2 ring-cyan-400' : isHovered ? 'scale-105' : ''
              } ${badgeColor}`}>
                <MapPin className="w-3.5 h-3.5" />
                <span>{loc.name}</span>
                {locNotices.length > 0 && (
                  <span className="bg-black/40 px-1.5 py-0.2 rounded-full text-[10px]">
                    {locNotices.length}
                  </span>
                )}
              </div>

              {/* Hover Popover Tooltip */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl z-30 text-white text-xs pointer-events-none">
                  <div className="font-bold text-cyan-400 flex justify-between items-center mb-1">
                    <span>{loc.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {locNotices.length} Active Notice{locNotices.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{loc.description}</p>
                  
                  {locNotices.length > 0 ? (
                    <div className="space-y-1 border-t border-slate-800 pt-2">
                      {locNotices.slice(0, 2).map((n) => (
                        <div key={n.id} className="text-[11px] truncate text-slate-200 flex items-center">
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            n.urgency === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-400'
                          }`} />
                          {n.title}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-emerald-400 italic">No disruptions reported in this sector.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-sm border border-slate-700/80 px-3 py-2 rounded-xl text-[11px] text-slate-300 flex items-center space-x-3 shadow-lg">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Critical</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Low / Info</span>
          </div>
        </div>
      </div>

      {/* Bottom Notices Carousel for the Selected Locality */}
      {selectedLocality !== 'All' && (
        <div className="p-3 bg-blue-50/50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Showing notices targeting: <strong className="text-blue-700">{selectedLocality}</strong>
          </span>
          <button
            onClick={() => onSelectLocality('All')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Clear Filter (Show All)
          </button>
        </div>
      )}
    </div>
  );
};

