import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // Clan de prueba
  const clan = await db.clan.create({
    data: {
      nombre: "Los Gorilas Alfa",
      liderClanId: "00000000-0000-0000-0000-000000000001",
      puntosClan: 100,
    },
  });

  // Usuario seed (lider)
  const hash = await bcrypt.hash("password123", 10);
  const lider = await db.miembro.create({
    data: {
      id: "00000000-0000-0000-0000-000000000001",
      nombre: "Nico Seed",
      email: "seed@silverback.com",
      passwordHash: hash,
      rol: "SILVERBACK",
      rango: "ORO",
      xp: 1000,
      coins: 500,
      clanId: clan.id,
    },
  });

  // Biometricos, racha y fatiga del lider
  await db.datosBiometricos.create({
    data: {
      miembroId: lider.id,
      edad: 25,
      pesoKg: 80,
      alturaCm: 178,
      nivelExperiencia: "INTERMEDIO",
    },
  });
  await db.racha.create({
    data: { miembroId: lider.id, diasConsecutivos: 7, estado: "ACTIVA" },
  });
  await db.datosFatiga.create({
    data: { miembroId: lider.id, cargaSemanal: 120, nivelFatiga: "MODERADA" },
  });

  // Actualizar lider_clan_id del clan ahora que tenemos el ID
  await db.clan.update({
    where: { id: clan.id },
    data: { liderClanId: lider.id, cantidadMiembros: 1 },
  });

  // Guerra global activa
  const fechaFin = new Date();
  fechaFin.setDate(fechaFin.getDate() + 7);
  await db.guerraGlobal.create({
    data: { semana: "2026-W35", estado: "ACTIVA", fechaFin },
  });

  // Aliado comercial de ejemplo
  await db.aliadoComercial.create({
    data: {
      nombre: "SupleMax",
      urlBase: "https://suplemax.com.ar",
      logoUrl: "https://suplemax.com.ar/logo.png",
    },
  });

  console.log("✅ Seed completo.");
  console.log(`   Email: seed@silverback.com | Password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
