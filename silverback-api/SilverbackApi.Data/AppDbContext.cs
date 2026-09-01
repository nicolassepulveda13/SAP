using Microsoft.EntityFrameworkCore;
using SilverbackApi.Domain;
using SilverbackApi.Domain.Models;

namespace SilverbackApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Miembro> Miembros => Set<Miembro>();
    public DbSet<Clan> Clanes => Set<Clan>();
    public DbSet<DatosBiometricos> DatosBiometricos => Set<DatosBiometricos>();
    public DbSet<Entrenamiento> Entrenamientos => Set<Entrenamiento>();
    public DbSet<Racha> Rachas => Set<Racha>();
    public DbSet<DatosFatiga> DatosFatiga => Set<DatosFatiga>();
    public DbSet<GuerraGlobal> GuerrasGlobales => Set<GuerraGlobal>();
    public DbSet<ParticipacionGuerra> ParticipacionesGuerra => Set<ParticipacionGuerra>();
    public DbSet<DesafioClan> DesafiosClan => Set<DesafioClan>();
    public DbSet<Trofeo> Trofeos => Set<Trofeo>();
    public DbSet<Nodo> Nodos => Set<Nodo>();
    public DbSet<NodoDependencia> NodoDependencias => Set<NodoDependencia>();
    public DbSet<InversionNodo> InversionesNodo => Set<InversionNodo>();
    public DbSet<Cofre> Cofres => Set<Cofre>();
    public DbSet<AliadoComercial> AliadosComerciales => Set<AliadoComercial>();
    public DbSet<BeneficioAliado> BeneficiosAliado => Set<BeneficioAliado>();
    public DbSet<ReclamoBeneficio> ReclamosBeneficio => Set<ReclamoBeneficio>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<InventarioItem> InventarioItems => Set<InventarioItem>();
    public DbSet<MensajeClan> MensajesClan => Set<MensajeClan>();
    public DbSet<AdminHistorial> AdminHistorial => Set<AdminHistorial>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Miembro>().Property(m => m.Rol).HasConversion<string>();
        mb.Entity<Miembro>().Property(m => m.Rango).HasConversion<string>();
        mb.Entity<Miembro>().Property(m => m.Arquetipo).HasConversion<string>();
        mb.Entity<DatosBiometricos>().Property(d => d.NivelExperiencia).HasConversion<string>();
        mb.Entity<Racha>().Property(r => r.Estado).HasConversion<string>();
        mb.Entity<DatosFatiga>().Property(d => d.NivelFatiga).HasConversion<string>();
        mb.Entity<GuerraGlobal>().Property(g => g.Estado).HasConversion<string>();
        mb.Entity<DesafioClan>().Property(d => d.Tier).HasConversion<string>();
        mb.Entity<DesafioClan>().Property(d => d.Estado).HasConversion<string>();
        mb.Entity<Trofeo>().Property(t => t.Tipo).HasConversion<string>();
        mb.Entity<Nodo>().Property(n => n.Estado).HasConversion<string>();
        mb.Entity<Cofre>().Property(c => c.Rareza).HasConversion<string>();
        mb.Entity<Cofre>().Property(c => c.Estado).HasConversion<string>();
        mb.Entity<BeneficioAliado>().Property(b => b.Tipo).HasConversion<string>();
        mb.Entity<BeneficioAliado>().Property(b => b.RangoMinimo).HasConversion<string>();
        mb.Entity<BeneficioAliado>().Property(b => b.Estado).HasConversion<string>();
        mb.Entity<Item>().Property(i => i.Categoria).HasConversion<string>();
        mb.Entity<MensajeClan>().Property(m => m.Tipo).HasConversion<string>();

        mb.Entity<ParticipacionGuerra>().HasKey(p => new { p.GuerraId, p.ClanId });
        mb.Entity<NodoDependencia>().HasKey(n => new { n.NodoId, n.PrerequisiteId });
        mb.Entity<InversionNodo>().HasKey(i => new { i.MiembroId, i.NodoId });
        mb.Entity<InventarioItem>().HasKey(i => new { i.MiembroId, i.ItemId });
        mb.Entity<ReclamoBeneficio>().HasKey(r => new { r.BeneficioId, r.MiembroId });

        mb.Entity<Clan>()
            .HasMany(c => c.Miembros)
            .WithOne(m => m.Clan)
            .HasForeignKey(m => m.ClanId)
            .OnDelete(DeleteBehavior.SetNull);

        mb.Entity<NodoDependencia>()
            .HasOne(n => n.Nodo)
            .WithMany(n => n.Requiere)
            .HasForeignKey(n => n.NodoId)
            .OnDelete(DeleteBehavior.Restrict);

        mb.Entity<NodoDependencia>()
            .HasOne(n => n.Prerequisito)
            .WithMany(n => n.RequeridoPor)
            .HasForeignKey(n => n.PrerequisiteId)
            .OnDelete(DeleteBehavior.Restrict);

        // Precisión explícita para decimales
        mb.Entity<DatosBiometricos>().Property(d => d.PesoKg).HasPrecision(6, 2);
        mb.Entity<DatosBiometricos>().Property(d => d.AlturaCm).HasPrecision(5, 2);
        mb.Entity<DatosFatiga>().Property(d => d.CargaSemanal).HasPrecision(10, 2);
        mb.Entity<Entrenamiento>().Property(e => e.PesoKg).HasPrecision(6, 2);
        mb.Entity<Entrenamiento>().Property(e => e.PuntajeCer).HasPrecision(10, 2);
        mb.Entity<ParticipacionGuerra>().Property(p => p.CerAcumulado).HasPrecision(12, 2);

        mb.Entity<Miembro>().HasIndex(m => m.Email).IsUnique();
        mb.Entity<Clan>().HasIndex(c => c.Nombre).IsUnique();
        mb.Entity<GuerraGlobal>().HasIndex(g => g.Semana).IsUnique();
    }
}
