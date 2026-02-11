import { useState, useEffect, useRef, useCallback } from 'react';
import { Dices, Info, Download, Palette, ChevronDown } from 'lucide-react';

export default function App() {
  const [shapeType, setShapeType] = useState("hexagon");
  const [complexity, setComplexity] = useState(5);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0.0);
  const [seed, setSeed] = useState("ox8sbg");
  const [showMath, setShowMath] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const palettes = {
    slate: ["#0f172a", "#1e293b", "#3b82f6", "#60a5fa", "#94a3b8", "#cbd5e1", "#ffffff"],
    ice: ["#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0369a1"],
    midnight: ["#020617", "#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#94a3b8"],
    emerald: ["#064e3b", "#065f46", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"]
  };
  const [activePalette, setActivePalette] = useState("slate");

  // Memoized drawing function to prevent lag when switching palettes
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    const s = (45 - complexity * 2) * zoom; 
    const currentColors = palettes[activePalette as keyof typeof palettes];

    const getSeedColor = (i: number, j: number) => {
      // Combined seed + coordinates for unique color mapping
      const val = Math.abs(Math.sin(seed.charCodeAt(0) + i + j * 13 + seed.length));
      return currentColors[Math.floor(val * currentColors.length)];
    };

    const h_dist = shapeType === "square" ? s * 2 : s * 1.5;
    const v_dist = shapeType === "square" ? s * 2 : s * Math.sqrt(3);

    const drawPoly = (x: number, y: number, radius: number, sides: number, angle: number) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const theta = angle + (i * Math.PI * 2) / sides;
        ctx.lineTo(x + radius * Math.cos(theta), y + radius * Math.sin(theta));
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    for (let i = -2; i < Math.ceil(window.innerWidth / h_dist) + 4; i++) {
      for (let j = -2; j < Math.ceil(window.innerHeight / v_dist) + 4; j++) {
        ctx.save();
        let x = i * h_dist;
        let y = j * v_dist;
        if (shapeType !== "square" && i % 2 !== 0) y += v_dist / 2;

        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
        ctx.fillStyle = getSeedColor(i, j);
        
        if (shapeType === "hexagon") {
          drawPoly(0, 0, s * 1.02, 6, 0); 
        } else if (shapeType === "triangle") {
          drawPoly(0, 0, s * 1.15, 3, (i + j) % 2 === 0 ? 0 : Math.PI);
        } else if (shapeType === "square") {
          drawPoly(0, 0, s * 1.42, 4, Math.PI / 4);
        }
        ctx.restore();
      }
    }
  }, [shapeType, complexity, zoom, rotation, seed, activePalette]);

  useEffect(() => {
    render();
    window.addEventListener('resize', render);
    return () => window.removeEventListener('resize', render);
  }, [render]);

  return (
    <div className="relative h-screen w-full bg-[#f8fafc] overflow-hidden select-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap');`}</style>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      
      <div className="absolute top-8 left-8 bottom-8 w-[22rem] bg-white/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/40 shadow-2xl z-50 flex flex-col text-[#1e293b]">
        <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-2xl tracking-tight uppercase">Mosaic Architect</h2>
            <button onClick={() => setShowMath(!showMath)} className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                <Info size={22} className={showMath ? "text-blue-500" : "text-slate-400 group-hover:text-slate-600"} />
            </button>
        </div>
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.2em] mb-10 text-center border-b pb-4 border-slate-100">National University | Math Finals</p>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          {showMath && (
            <div className="p-6 bg-[#0f172a] rounded-3xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl mb-4">
               <h3 className="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-widest text-center italic">Mathematical Logic</h3>
               <div className="text-[12px] text-white/70 font-mono space-y-2 leading-relaxed">
                 <p>// Trigonometric vertex mapping.</p>
                 <p className="text-blue-400">x = r * cos(θ) | y = r * sin(θ)</p>
                 <p>// Parity-based flipping ensures perfect mesh.</p>
               </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Palette size={14}/> Palette Selection</label>
            <div className="flex gap-3">
              {Object.keys(palettes).map((p) => (
                <button key={p} onClick={() => setActivePalette(p)} className={`w-8 h-8 rounded-full border-2 ${activePalette === p ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent opacity-60'} transition-all`} style={{ backgroundColor: palettes[p as keyof typeof palettes][2] }} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Geometry</label>
            <div className="relative">
              <select value={shapeType} onChange={(e) => setShapeType(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl appearance-none text-sm font-semibold outline-none cursor-pointer">
                  <option value="hexagon">Classic Hexagons</option>
                  <option value="triangle">Triangular Mesh</option>
                  <option value="square">Stable Squares</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase"><span>Complexity</span><span>{complexity}</span></div>
              <input type="range" min="1" max="10" value={complexity} onChange={(e) => setComplexity(parseInt(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase"><span>Zoom</span><span>{zoom.toFixed(1)}x</span></div>
              <input type="range" min="0.5" max="2.5" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase"><span>Rotation</span><span>{rotation.toFixed(2)} rad</span></div>
              <input type="range" min="0" max="6.28" step="0.01" value={rotation} onChange={(e) => setRotation(parseFloat(e.target.value))} className="w-full accent-blue-600" />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 text-center space-y-4 border-t border-slate-100">
            <button onClick={() => setSeed(Math.random().toString(36).substring(7))} className="w-full bg-white border-2 border-slate-900 text-[#0f172a] py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"><Dices size={18} /> Regenerate Seed</button>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-80 italic">Developed by cymriccc</p>
              <p className="text-[8px] text-slate-300 font-medium uppercase tracking-[0.1em]">National University MOA</p>
            </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-xl flex items-center gap-3 z-50">
        <span className="text-slate-400 font-mono text-[13px]">Seed:</span>
        <span className="text-slate-700 font-mono text-[13px] font-bold tracking-wider">{seed}</span>
      </div>
    </div>
  );
}