using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SilverbackApi.Data;
using SilverbackApi.Data.Repositories;
using SilverbackApi.Services;
using SilverbackApi.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositorios
builder.Services.AddScoped<MiembroRepository>();
builder.Services.AddScoped<ClanRepository>();
builder.Services.AddScoped<EntrenamientoRepository>();
builder.Services.AddScoped<RachaRepository>();
builder.Services.AddScoped<FatigaRepository>();
builder.Services.AddScoped<BiometricosRepository>();
builder.Services.AddScoped<GuerraRepository>();
builder.Services.AddScoped<TrofeoRepository>();
builder.Services.AddScoped<CofreRepository>();
builder.Services.AddScoped<NodoRepository>();
builder.Services.AddScoped<MarketplaceRepository>();
builder.Services.AddScoped<BeneficioRepository>();
builder.Services.AddScoped<SantuarioRepository>();
builder.Services.AddScoped<AdminHistorialRepository>();

// Servicios
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IIncorporacionService, IncorporacionService>();
builder.Services.AddScoped<IArenaService, ArenaService>();
builder.Services.AddScoped<IPerfilService, PerfilService>();
builder.Services.AddScoped<IEvolucionService, EvolucionService>();
builder.Services.AddScoped<ISantuarioService, SantuarioService>();
builder.Services.AddScoped<ICerService, CerService>();

// JWT
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
        opt.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddOpenApi();

builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(p => p
        .WithOrigins("http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", (AppDbContext db) =>
{
    db.Database.ExecuteSqlRaw("SELECT 1");
    return Results.Ok(new { status = "ok", db = "connected" });
});

app.Run();
