-- Deja una cuenta lista para la demo de los 3 CU (ver silverback/docs/Demo-3-CU.md).
-- Correr ANTES de cada demo (se puede repetir):
--   sqlcmd -S "localhost\SQLEXPRESS" -d silverback -E -i silverback\demo\preparar-demo.sql
-- En Docker no hace falta: la API hace lo mismo en cada arranque (Database:PrepararDemo, DbInicializador.PrepararDemo).
-- La cuenta demo@silverback.demo / Test1234! la crea la API al arrancar con Database__PrepararDemo=true;
-- también se puede usar cualquier cuenta con clan cambiando @email.
--
-- Qué deja:
--   · Racha de 6 días con el último entrenamiento AYER (hora Argentina) → EN_RIESGO (banner en el Santuario)
--   · 60 Puntos de Clan: alcanza para salvar la racha (50) y NO para FUERZA (100) → FA-2 del árbol
--   · Árbol del clan sin invertir (todo en nivel 0, sin "ÚLTIMAS INVERSIONES")
--   · Sin entrenamientos de hoy (si no, la racha figuraría ACTIVA)

SET NOCOUNT ON;
DECLARE @email NVARCHAR(200) = N'demo@silverback.demo';

DECLARE @miembro UNIQUEIDENTIFIER, @clan UNIQUEIDENTIFIER;
SELECT @miembro = Id, @clan = ClanId FROM Miembros WHERE Email = @email;
IF @miembro IS NULL OR @clan IS NULL
BEGIN
    RAISERROR('La cuenta no existe o no tiene clan.', 16, 1);
    RETURN;
END

-- "Ayer a las 20 h" en Argentina (UTC-3) = ayer 23 h UTC
DECLARE @hoyAr DATE = CAST(SYSUTCDATETIME() AT TIME ZONE 'UTC' AT TIME ZONE 'Argentina Standard Time' AS DATE);
DECLARE @ayer20Utc DATETIME2 = DATEADD(HOUR, 23, CAST(DATEADD(DAY, -1, @hoyAr) AS DATETIME2));
DECLARE @inicioHoyUtc DATETIME2 = DATEADD(HOUR, 3, CAST(@hoyAr AS DATETIME2));

DELETE FROM Entrenamientos WHERE MiembroId = @miembro AND FechaHora >= @inicioHoyUtc;

IF EXISTS (SELECT 1 FROM Rachas WHERE MiembroId = @miembro)
    UPDATE Rachas SET DiasConsecutivos = 6, Estado = 'EN_RIESGO', UltimoEntrenamiento = @ayer20Utc WHERE MiembroId = @miembro;
ELSE
    INSERT INTO Rachas (Id, MiembroId, DiasConsecutivos, Estado, UltimoEntrenamiento)
    VALUES (NEWID(), @miembro, 6, 'EN_RIESGO', @ayer20Utc);

UPDATE Clanes SET PuntosClan = 60 WHERE Id = @clan;
DELETE FROM InversionesNodo WHERE ClanId = @clan;
DELETE FROM NodosClan WHERE ClanId = @clan;

SELECT m.Email, c.Nombre AS Clan, c.PuntosClan, r.DiasConsecutivos, r.Estado, r.UltimoEntrenamiento
FROM Miembros m JOIN Clanes c ON c.Id = m.ClanId JOIN Rachas r ON r.MiembroId = m.Id
WHERE m.Id = @miembro;
