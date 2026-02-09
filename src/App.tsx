import { useState, useEffect, useRef } from 'react';
import { Dices, Ruler, ChevronDown, Info, Download } from 'lucide-react';

export default function App() {
  const [shapeType, setShapeType] = useState("hexagon");
  const [complexity, setComplexity] = useState(5);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0.0);
  const [seed, setSeed] = useState("l2if0a");
  const [showMath, setShowMath] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = ["#0f172a", "#1e293b", "#3b82f6", "#60a5fa", "#94a3b8", "#cbd5e1", "#ffffff"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      render();
    };

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

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const s = (45 - complexity * 2) * zoom; 
      const getSeedColor = (i: number, j: number, offset = 0) => {
        const val = Math.abs(Math.sin(seed.length + i + j * 13 + offset));
        return colors[Math.floor(val * colors.length)];
      };

      // STABLE GRID MATH
      const h_dist = shapeType === "square" ? s * 2 : s * 1.5;
      const v_dist = shapeType === "square" ? s * 2 : s * Math.sqrt(3);

      for (let i = -2; i < Math.ceil(window.innerWidth / h_dist) + 4; i++) {
        for (let j = -2; j < Math.ceil(window.innerHeight / v_dist) + 4; j++) {
          ctx.save();
          let x = i * h_dist;
          let y = j * v_dist;
          
          // Staggering logic for Hex/Tri
          if (shapeType !== "square" && i % 2 !== 0) {
            y += v_dist / 2;
          }

          ctx.translate(x, y);
          ctx.rotate(rotation);
          ctx.strokeStyle = "rgba(15, 23, 42, 0.15)";
          ctx.lineWidth = 1;
          ctx.fillStyle = getSeedColor(i, j);
          
          if (shapeType === "hexagon") {
            drawPoly(0, 0, s * 1.02, 6, 0); 
          } else if (shapeType === "triangle") {
            // THE FIX: Every other triangle is flipped to create the solid mesh
            const flip = (i + j) % 2 === 0 ? 0 : Math.PI;
            drawPoly(0, 0, s * 1.15, 3, flip);
          } else if (shapeType === "square") {
            drawPoly(0, 0, s * 1.42, 4, Math.PI / 4);
          }
          ctx.restore();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, [shapeType, complexity, zoom, rotation, seed]);

  return (
    <div className="relative h-screen w-full bg-[#f8fafc] overflow-hidden select-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&display=swap');`}</style>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
      
      <div className="absolute top-8 left-8 bottom-8 w-[22rem] bg-white/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/40 shadow-2xl z-50 flex flex-col text-[#1e293b]">
        <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-2xl tracking-tight uppercase">Mosaic Architect</h2>
            <button onClick={() => setShowMath(!showMath)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Info size={22} className={showMath ? "text-blue-500" : "text-slate-400"} />
            </button>
        </div>
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.2em] mb-10 text-center border-b pb-4 border-slate-100">National University | Math Finals</p>

        {showMath && (
          <div className="mb-8 p-6 bg-[#0f172a] rounded-3xl border border-white/10 animate-in fade-in zoom-in duration-300 shadow-xl">
             <h3 className="text-[10px] font-bold text-blue-400 uppercase mb-4 tracking-widest text-center italic">Mathematical Foundation</h3>
             <div className="text-[12px] text-white/70 leading-relaxed font-mono space-y-3">
               <p>// Regular tessellation achieved through periodic grid offsets.</p>
               <p>// Vertex calculation via trigonometry:</p>
               <p className="text-blue-400">x = r * cos(θ)</p>
               <p className="text-blue-400">y = r * sin(θ)</p>
               <p>// Interlocking maintained by parity-based rotation.</p>
             </div>
          </div>
        )}

        <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Geometry Library</label>
            <div className="relative">
                <select 
                    value={shapeType} 
                    onChange={(e) => setShapeType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl appearance-none text-sm font-semibold outline-none cursor-pointer"
                >
                    <option value="hexagon">Classic Hexagons</option>
                    <option value="triangle">Triangular Mesh</option>
                    <option value="square">Stable Squares (4.4.4.4)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">Complexity <span>{complexity}</span></div>
                <input type="range" min="1" max="10" value={complexity} onChange={(e) => setComplexity(parseInt(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">Zoom <span>{zoom.toFixed(1)}x</span></div>
                <input type="range" min="0.5" max="2.5" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full accent-blue-600" />
            </div>
            <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">Rotation <span>{rotation.toFixed(2)} rad</span></div>
                <input type="range" min="0" max="6.28" step="0.01" value={rotation} onChange={(e) => setRotation(parseFloat(e.target.value))} className="w-full accent-blue-600" />
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-4 border-t border-slate-100">
            <button onClick={() => setSeed(Math.random().toString(36).substring(7))} 
                className="w-full bg-white border-2 border-slate-900 text-[#0f172a] py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Dices size={18} /> Regenerate Seed
            </button>
            <button className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                <Download size={14} className="inline mr-2" /> Export Final PNG
            </button>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-xl flex items-center gap-3 z-50">
        <span className="text-slate-400 font-mono text-[13px]">Seed:</span>
        <span className="text-slate-700 font-mono text-[13px] font-bold tracking-wider">{seed}</span>
      </div>
    </div>
  );
}