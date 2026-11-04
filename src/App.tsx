import React, { useState, useEffect, useRef } from "react";
import { Download, RefreshCw, Check, Copy, PanelLeftClose, PanelLeft, Sparkles, ExternalLink } from "lucide-react";

const PALETTES = [
  {
    name: "Slate & Ice",
    colors: ["#0f172a", "#1e293b", "#334155", "#38bdf8", "#7dd3fc", "#f8fafc"],
  },
  {
    name: "Emerald Forest",
    colors: ["#064e3b", "#047857", "#10b981", "#34d399", "#a7f3d0", "#ecfdf5"],
  },
  {
    name: "Cyberpunk Neon",
    colors: ["#2e1065", "#581c87", "#7e22ce", "#c084fc", "#f43f5e", "#fb7185"],
  },
  {
    name: "Sunset Amber",
    colors: ["#451a03", "#78350f", "#b45309", "#f59e0b", "#fbbf24", "#fef3c7"],
  },
];

const GEOMETRIES = [
  { id: "hexagons", name: "Classic Hexagons", type: "hex" },
  { id: "triangles", name: "Triangles", type: "triangle" },
  { id: "diamonds", name: "Diamonds", type: "diamond" },
  { id: "circles", name: "Circles & Dots", type: "circle" },
];

// Secret Seeds Dictionary
const SECRET_SEEDS: Record<string, { name: string; colors: string[] }> = {
  cymriccc: {
    name: "CYMRICCC SPECIAL",
    colors: ["#0f172a", "#1e293b", "#38bdf8", "#0284c7", "#7dd3fc", "#f8fafc"],
  },
  "nu-moa": {
    name: "NATIONAL U CREST",
    colors: ["#002147", "#003366", "#1a4d80", "#ffcc00", "#ffd700", "#ffffff"],
  },
  cyberpunk: {
    name: "NEON MATRIX",
    colors: ["#0d0221", "#020826", "#260033", "#00f5d4", "#7b2cbf", "#f72585"],
  },
};

// Helper to draw a heart shape inside Canvas API
function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(0, topCurveHeight);
  ctx.bezierCurveTo(-size / 2, -size / 2, -size, topCurveHeight, 0, size);
  ctx.bezierCurveTo(size, topCurveHeight, size / 2, -size / 2, 0, topCurveHeight);
  ctx.closePath();
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function App() {
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [selectedGeometry, setSelectedGeometry] = useState(0);
  const [copiedType, setCopiedType] = useState<"css" | "hex" | null>(null);
  const [complexity, setComplexity] = useState(6);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [seed, setSeed] = useState(() => Math.random().toString(36).substring(7));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const lowerSeed = seed.trim().toLowerCase();
  const isHeartSeed = lowerSeed === "tine";
  const secretConfig = SECRET_SEEDS[lowerSeed];

  const activeColors = isHeartSeed
    ? ["#4c0519", "#881337", "#be123c", "#e11d48", "#fb7185", "#ffe4e6"]
    : secretConfig
    ? secretConfig.colors
    : PALETTES[selectedPalette].colors;

  const activeGeo = GEOMETRIES[selectedGeometry];

  const handleCopyCSS = async () => {
    const cssVars = activeColors
      .map((color, idx) => `  --color-${idx + 1}: ${color};`)
      .join("\n");
    await navigator.clipboard.writeText(
      `/* Math Mosaic Palette: ${secretConfig ? secretConfig.name : isHeartSeed ? "SPECIAL ROSES" : PALETTES[selectedPalette].name} */\n:root {\n${cssVars}\n}`
    );
    setCopiedType("css");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyHex = async () => {
    await navigator.clipboard.writeText(JSON.stringify(activeColors, null, 2));
    setCopiedType("hex");
    setTimeout(() => setCopiedType(null), 2000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const width = rect?.width || window.innerWidth || 800;
      const height = rect?.height || window.innerHeight || 600;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      const seedNum = stringToSeed(seed);
      const baseRadius = Math.max(14, 85 - complexity * 5.5);
      const radius = baseRadius * zoom;
      const rotRad = (rotation * Math.PI) / 180;

      if (activeGeo.type === "hex") {
        const hexWidth = Math.sqrt(3) * radius;
        const hexHeight = 2 * radius;
        const spacingY = hexHeight * 0.75;

        const cols = Math.ceil(width / hexWidth) + 6;
        const rows = Math.ceil(height / spacingY) + 6;

        for (let r = -4; r < rows; r++) {
          for (let c = -4; c < cols; c++) {
            const x = c * hexWidth + ((Math.abs(r) % 2) * hexWidth) / 2;
            const y = r * spacingY;

            const hash = Math.abs(Math.sin(c * 12.9898 + r * 78.233 + seedNum) * 43758.5453);
            const colorIdx = Math.floor((hash % 1) * activeColors.length);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotRad);

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i + Math.PI / 6;
              const hx = radius * Math.cos(angle);
              const hy = radius * Math.sin(angle);
              if (i === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.fillStyle = activeColors[colorIdx];
            ctx.fill();
            ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
            ctx.lineWidth = 1;
            ctx.stroke();

            if (isHeartSeed) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
              drawHeart(ctx, radius * 0.35);
              ctx.fill();
            }

            ctx.restore();
          }
        }
      } else if (activeGeo.type === "triangle") {
        const side = radius * 1.8;
        const triHeight = (Math.sqrt(3) / 2) * side;
        const cols = Math.ceil(width / (side / 2)) + 8;
        const rows = Math.ceil(height / triHeight) + 8;

        for (let r = -4; r < rows; r++) {
          for (let c = -4; c < cols; c++) {
            const x = c * (side / 2);
            const y = r * triHeight;
            const isPointingUp = (Math.abs(r) + Math.abs(c)) % 2 === 0;

            const hash = Math.abs(Math.sin(c * 12.9898 + r * 78.233 + seedNum) * 43758.5453);
            const colorIdx = Math.floor((hash % 1) * activeColors.length);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotRad);

            ctx.beginPath();
            if (isPointingUp) {
              ctx.moveTo(0, -triHeight / 2);
              ctx.lineTo(side / 2, triHeight / 2);
              ctx.lineTo(-side / 2, triHeight / 2);
            } else {
              ctx.moveTo(0, triHeight / 2);
              ctx.lineTo(side / 2, -triHeight / 2);
              ctx.lineTo(-side / 2, -triHeight / 2);
            }
            ctx.closePath();
            ctx.fillStyle = activeColors[colorIdx];
            ctx.fill();
            ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
            ctx.lineWidth = 1;
            ctx.stroke();

            if (isHeartSeed) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
              drawHeart(ctx, radius * 0.3);
              ctx.fill();
            }

            ctx.restore();
          }
        }
      } else if (activeGeo.type === "diamond") {
        const dSize = radius * 1.4;
        const cols = Math.ceil(width / (dSize / 2)) + 8;
        const rows = Math.ceil(height / (dSize / 2)) + 8;

        for (let r = -4; r < rows; r++) {
          for (let c = -4; c < cols; c++) {
            const x = c * (dSize / 2);
            const y = r * (dSize / 2);

            if ((Math.abs(r) + Math.abs(c)) % 2 !== 0) continue;

            const hash = Math.abs(Math.sin(c * 12.9898 + r * 78.233 + seedNum) * 43758.5453);
            const colorIdx = Math.floor((hash % 1) * activeColors.length);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotRad);

            ctx.beginPath();
            ctx.moveTo(0, -dSize / 2);
            ctx.lineTo(dSize / 2, 0);
            ctx.lineTo(0, dSize / 2);
            ctx.lineTo(-dSize / 2, 0);
            ctx.closePath();

            ctx.fillStyle = activeColors[colorIdx];
            ctx.fill();
            ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
            ctx.lineWidth = 1;
            ctx.stroke();

            if (isHeartSeed) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
              drawHeart(ctx, radius * 0.35);
              ctx.fill();
            }

            ctx.restore();
          }
        }
      } else if (activeGeo.type === "circle") {
        const spacing = radius * 1.6;
        const spacingY = spacing * 0.866;
        const cols = Math.ceil(width / spacing) + 8;
        const rows = Math.ceil(height / spacingY) + 8;

        for (let r = -4; r < rows; r++) {
          for (let c = -4; c < cols; c++) {
            const x = c * spacing + ((Math.abs(r) % 2) * spacing) / 2;
            const y = r * spacingY;

            const hash = Math.abs(Math.sin(c * 12.9898 + r * 78.233 + seedNum) * 43758.5453);
            const colorIdx = Math.floor((hash % 1) * activeColors.length);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotRad);

            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = activeColors[colorIdx];
            ctx.fill();
            ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
            ctx.lineWidth = 1;
            ctx.stroke();

            if (isHeartSeed) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
              drawHeart(ctx, radius * 0.35);
              ctx.fill();
            }

            ctx.restore();
          }
        }
      }
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [selectedPalette, selectedGeometry, complexity, zoom, rotation, seed, activeColors, activeGeo, isHeartSeed]);

  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `math-mosaic-${seed}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      <div className="absolute inset-0 w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`absolute top-6 left-6 p-3 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-700/50 text-slate-200 hover:text-sky-400 hover:border-sky-400/60 shadow-2xl transition-all duration-300 z-20 flex items-center gap-2 text-xs font-semibold ${
          isSidebarOpen ? "opacity-0 pointer-events-none -translate-x-4" : "opacity-100 scale-100 translate-x-0"
        }`}
      >
        <PanelLeft className="w-4 h-4" /> Controls
      </button>

      <div
        className={`absolute top-6 left-6 w-96 max-h-[calc(100vh-3rem)] bg-slate-950/65 backdrop-blur-xl border border-slate-700/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-2xl p-6 flex flex-col justify-between overflow-y-auto z-20 transition-all duration-300 ease-in-out origin-top-left ${
          isSidebarOpen
            ? "opacity-100 scale-100 translate-x-0"
            : "opacity-0 scale-95 -translate-x-8 pointer-events-none"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-lg font-extrabold tracking-wider text-slate-100 flex items-center gap-2">
                MOSAIC ARCHITECT <Sparkles className="w-4 h-4 text-sky-400" />
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5">
                NATIONAL UNIVERSITY | MATH FINALS
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
              title="Collapse Panel"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-6">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              PALETTES ({secretConfig ? secretConfig.name : isHeartSeed ? "SPECIAL ROSES" : PALETTES[selectedPalette].name})
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PALETTES.map((pal, idx) => (
                <button
                  key={pal.name}
                  onClick={() => setSelectedPalette(idx)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                    selectedPalette === idx && !secretConfig && !isHeartSeed
                      ? "border-sky-400/80 bg-sky-500/10 text-sky-200 shadow-sm shadow-sky-500/20"
                      : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-medium truncate">{pal.name}</span>
                  <div className="flex -space-x-1">
                    {pal.colors.slice(0, 3).map((c) => (
                      <div
                        key={c}
                        className="w-3 h-3 rounded-full border border-slate-950"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCopyCSS}
                className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50 transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                {copiedType === "css" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                {copiedType === "css" ? "Copied CSS" : "Copy CSS"}
              </button>
              <button
                onClick={handleCopyHex}
                className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50 transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                {copiedType === "hex" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                {copiedType === "hex" ? "Copied Hex" : "Copy Hex"}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              GEOMETRY TYPE
            </label>
            <select
              value={selectedGeometry}
              onChange={(e) => setSelectedGeometry(Number(e.target.value))}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 border border-slate-700/50 text-slate-200 text-xs font-medium focus:outline-none focus:border-sky-400/80 transition cursor-pointer"
            >
              {GEOMETRIES.map((geo, idx) => (
                <option key={geo.id} value={idx} className="bg-slate-900 text-slate-200">
                  {geo.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>COMPLEXITY</span>
                <span className="font-mono text-sky-400">{complexity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="w-full accent-sky-400 bg-slate-800/80 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>ZOOM</span>
                <span className="font-mono text-sky-400">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-sky-400 bg-slate-800/80 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>ROTATION</span>
                <span className="font-mono text-sky-400">{rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-sky-400 bg-slate-800/80 rounded-lg h-1.5 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => setSeed(Math.random().toString(36).substring(7))}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 font-semibold text-xs border border-slate-700/60 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> REGENERATE SEED
            </button>
            <button
              onClick={handleExportImage}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98"
            >
              <Download className="w-3.5 h-3.5" /> EXPORT HIGH-RES PNG
            </button>
          </div>
        </div>

        <div className="text-center pt-4 border-t border-slate-800/60 mt-4">
          <a
            href="https://github.com/cymriccc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-300 hover:text-sky-400 transition tracking-widest uppercase font-semibold group"
          >
            DEVELOPED BY CYMRICCC
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-400 transition" />
          </a>
        </div>
      </div>

      {/* Secret Toast Indicator */}
      {(isHeartSeed || secretConfig) && (
        <div className="absolute bottom-16 right-6 bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-rose-200 shadow-xl px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold animate-pulse flex items-center gap-2 z-20">
          <span>✨ {isHeartSeed ? "SPECIAL HEART SEED UNLOCKED ❤️" : secretConfig?.name}</span>
        </div>
      )}

      <div className="absolute bottom-6 right-6 bg-slate-950/70 backdrop-blur-md border border-slate-700/40 shadow-2xl px-3.5 py-1.5 rounded-xl font-mono text-xs text-slate-300 flex items-center gap-1.5 z-20">
        <span className="text-slate-500">seed:</span>
        <input
          type="text"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          style={{ width: `${Math.max(seed.length, 6)}ch` }}
          className="bg-transparent text-sky-400 font-mono focus:outline-none border-b border-transparent focus:border-sky-400 transition text-center"
          title="Click to edit seed"
        />
      </div>
    </div>
  );
}

export default App;