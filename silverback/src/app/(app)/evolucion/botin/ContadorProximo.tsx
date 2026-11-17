// CU-004-003 paso 7 + FA-2: tiempo hasta el próximo botín; al llegar a cero refresca y el cofre aparece LISTO
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function formato(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const seg = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${seg}`;
}

export function ContadorProximo({ hastaUtc }: { hastaUtc: string }) {
  const router = useRouter();
  const objetivo = new Date(hastaUtc).getTime();
  const [restante, setRestante] = useState(() => objetivo - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const r = objetivo - Date.now();
      setRestante(r);
      if (r <= 0) {
        clearInterval(id);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [objetivo, router]);

  return (
    <p data-testid="stat-proximo" className="font-heading font-bold text-2xl text-[#F97316]" suppressHydrationWarning>
      {formato(restante)}
    </p>
  );
}
