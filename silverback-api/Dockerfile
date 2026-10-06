# API SilverBack (.NET 9) — build multi-etapa
# Las migraciones y los datos de demo se aplican al arrancar (ver DbInicializador.cs y docker-compose.yml)

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restaurar primero solo con los .csproj para aprovechar la caché de capas
COPY SilverbackApi.Domain/SilverbackApi.Domain.csproj SilverbackApi.Domain/
COPY SilverbackApi.Data/SilverbackApi.Data.csproj SilverbackApi.Data/
COPY SilverbackApi.Services/SilverbackApi.Services.csproj SilverbackApi.Services/
COPY SilverbackApi.Api/SilverbackApi.Api.csproj SilverbackApi.Api/
RUN dotnet restore SilverbackApi.Api/SilverbackApi.Api.csproj

COPY . .
RUN dotnet publish SilverbackApi.Api/SilverbackApi.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "SilverbackApi.Api.dll"]
