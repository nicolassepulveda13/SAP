// S8-Perfil: CU-005-001 — Dashboard de Rendimiento Personal (P16), según la carpeta (RF-007):
// grilla 2×2 — ÍNDICE DE DOMINANCIA · PERFIL TÁCTICO (radar vs. promedio del clan) · VOLUMEN TOTAL (KG) · PUNTAJE C.E.R.
// FA-1: menos de 3 sesiones → "--" · FA-2: timestamp del último cálculo.
import Link from "next/link";
import { PageLabel } from "@/components/ui/PageLabel";
import { getDashboard, getInventario, type Dashboard } from "@/app/actions/perfil";
import { Inventario } from "./Inventario";

export default async function PerfilPage() {
  const [d, inventario] = await Promise.all([getDashboard(), getInventario()]);

  return (
    <div>
      <PageLabel page="P16" />
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-4xl text-white uppercase">DASHBOARD DE RENDIMIENTO</h1>
          <p className="text-sm text-[#9CA3AF]">Análisis comparativo contra el promedio del clan. Sector Delta.</p>
        </div>
        <p className="text-[10px] text-[#9CA3AF] uppercase" suppressHydrationWarning>
          Último cálculo: {new Date(d.calculadoEn).toLocaleString("es-AR")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Dominancia d={d} />
        <PerfilTactico d={d} />
        <Volumen d={d} />
        <PuntajeCer d={d} />
      </div>

      <Inventario items={inventario} />

      <div className="grid grid-cols-5 gap-3">
        <Tile href="/perfil/racha" label="Racha" />
        <Tile href="/perfil/fatiga" label="Fatiga" />
        <Tile href="/perfil/trofeos" label="Trofeos" />
        <Tile href="/perfil/beneficios" label="Beneficios" />
        <Tile href="/perfil/cuenta" label="Datos de Cuenta" />
      </div>
    </div>
  );
}

function Bloque({ titulo, testid, children }: { titulo: string; testid: string; children: React.ReactNode }) {
  return (
    <div data-testid={testid} className="bg-[#242424] border border-[#333] rounded-xl p-6 min-h-[260px]">
      <p className="font-heading font-bold text-xs text-[#9CA3AF] uppercase tracking-wider mb-4">{titulo}</p>
      {children}
    </div>
  );
}

function Dominancia({ d }: { d: Dashboard }) {
  const valor = d.indiceDominancia;
  const top = d.miembrosConDatos > 0 ? Math.max(1, Math.ceil((d.posicionEnClan * 100) / d.miembrosConDatos)) : null;
  return (
    <Bloque titulo="ÍNDICE DE DOMINANCIA" testid="bloque-dominancia">
      <p className="font-heading font-bold text-8xl text-[#F97316] leading-none mb-4">{valor == null ? "--" : `${valor}%`}</p>
      {valor == null ? (
        <p className="text-sm text-[#9CA3AF]">Registrá al menos 3 sesiones para calcular tu Índice de Dominancia.</p>
      ) : (
        <span className="inline-block bg-[#F97316] text-white font-heading font-bold uppercase text-xs px-3 py-1 rounded">
          #{d.posicionEnClan} DE {d.miembrosConDatos} · TOP {top}% DEL CLAN
        </span>
      )}
    </Bloque>
  );
}

// Radar SVG: eje superior FUERZA BRUTA, derecho RESISTENCIA, inferior AGILIDAD, izquierdo TÉCNICA (paso 8)
function PerfilTactico({ d }: { d: Dashboard }) {
  const c = 100;
  const r = 70;
  const angulos = [-90, 0, 90, 180];
  const punto = (valor: number, i: number) => {
    const a = (angulos[i] * Math.PI) / 180;
    const k = (r * Math.max(0, Math.min(100, valor))) / 100;
    return `${c + k * Math.cos(a)},${c + k * Math.sin(a)}`;
  };
  const usuario = d.radar.map((e, i) => punto(e.usuario, i)).join(" ");
  const clan = d.radar.map((e, i) => punto(e.promedioClan, i)).join(" ");
  const etiquetas = [
    { x: c, y: 18, anchor: "middle" },
    { x: 192, y: c + 4, anchor: "end" },
    { x: c, y: 192, anchor: "middle" },
    { x: 8, y: c + 4, anchor: "start" },
  ] as const;

  return (
    <Bloque titulo="PERFIL TÁCTICO" testid="bloque-radar">
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 200 200" className="w-56 h-56">
          {[0.33, 0.66, 1].map((f) => (
            <polygon key={f} points={angulos.map((_, i) => punto(f * 100, i)).join(" ")} fill="none" stroke="#333" />
          ))}
          <polygon points={clan} fill="none" stroke="#9CA3AF" strokeDasharray="4 4" strokeWidth={1.5} />
          <polygon points={usuario} fill="rgba(249,115,22,0.35)" stroke="#F97316" strokeWidth={2} />
          {d.radar.map((e, i) => (
            <text key={e.eje} x={etiquetas[i].x} y={etiquetas[i].y} textAnchor={etiquetas[i].anchor} fill="#9CA3AF" fontSize="9" fontWeight="bold">
              {e.eje}
            </text>
          ))}
        </svg>
        <div className="text-xs flex flex-col gap-2">
          <span className="flex items-center gap-2 text-white"><span className="w-3 h-3 bg-[#F97316] inline-block" /> TU PERFIL</span>
          <span className="flex items-center gap-2 text-[#9CA3AF]"><span className="w-3 h-0 border-t border-dashed border-[#9CA3AF] inline-block" /> PROMEDIO CLAN</span>
        </div>
      </div>
    </Bloque>
  );
}

function Volumen({ d }: { d: Dashboard }) {
  const max = Math.max(1, d.volumen.usuario, d.volumen.promedioClan);
  const dif = d.volumen.diferencial;
  return (
    <Bloque titulo="VOLUMEN TOTAL (KG)" testid="bloque-volumen">
      <Barra etiqueta="TU RENDIMIENTO" valor={d.volumen.usuario} max={max} color="bg-[#F97316]" />
      <Barra etiqueta="PROMEDIO CLAN" valor={d.volumen.promedioClan} max={max} color="bg-[#555]" />
      {dif != null && (
        <p className={`font-heading font-bold text-2xl mt-4 ${dif >= 0 ? "text-green-400" : "text-red-400"}`}>
          {dif >= 0 ? "+" : ""}{dif}% VS. PROMEDIO
        </p>
      )}
    </Bloque>
  );
}

function Barra({ etiqueta, valor, max, color }: { etiqueta: string; valor: number; max: number; color: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[#9CA3AF] uppercase font-bold">{etiqueta}</span>
        <span className="text-white font-bold">{Math.round(valor).toLocaleString("es-AR")} KG</span>
      </div>
      <div className="h-3 bg-[#1a1a1a] rounded">
        <div className={`h-full rounded ${color}`} style={{ width: `${(valor * 100) / max}%` }} />
      </div>
    </div>
  );
}

function PuntajeCer({ d }: { d: Dashboard }) {
  const sub = [
    { label: "CAPACIDAD", valor: d.cer.capacidad },
    { label: "EFICIENCIA", valor: d.cer.eficiencia },
    { label: "RECUPERACIÓN", valor: d.cer.recuperacion },
  ];
  return (
    <Bloque titulo="PUNTAJE C.E.R." testid="bloque-cer">
      <div className="flex items-start gap-6">
        <span className="bg-[#F97316] text-white font-heading font-bold text-3xl w-16 h-16 rounded-lg flex items-center justify-center shrink-0">
          {d.cer.rango}
        </span>
        <div className="flex gap-6 items-end h-36">
          {sub.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-white font-bold text-sm">{s.valor}/100</span>
              <div className="w-8 bg-[#1a1a1a] rounded h-24 flex items-end">
                <div className="w-full bg-[#F97316] rounded" style={{ height: `${s.valor}%` }} />
              </div>
              <span className="text-[10px] text-[#9CA3AF] font-bold">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Bloque>
  );
}

function Tile({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="bg-[#242424] border border-[#333] hover:border-[#F97316] rounded-xl p-4 transition-colors block">
      <p className="font-heading font-bold text-sm text-white uppercase">{label}</p>
    </Link>
  );
}
