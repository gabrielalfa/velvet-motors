# Velvet Motors

Projeto premium para loja de veiculos de alto padrao, com frontend Angular e backend ASP.NET Core .NET 9.

## Estrutura

- `VelvetMotors.sln`: solucao compativel com Visual Studio 2022.
- `src/VelvetMotors.Api`: API ASP.NET Core .NET 9 com endpoints mockados para frota.
- `src/VelvetMotors.Web`: aplicacao Angular com Home premium, design system, temas e componentes reutilizaveis.

## Rodando o projeto

Backend:

```powershell
dotnet run --project src/VelvetMotors.Api
```

Frontend:

```powershell
cd src/VelvetMotors.Web
npm start
```

## Endpoints iniciais

- `GET /api/health`
- `GET /api/vehicles/featured`
- `GET /api/vehicles/{id}`

## Evolucao prevista

A estrutura ja separa `components`, `layouts`, `shared`, `services` e `models`, deixando o projeto pronto para estoque real, pagina de detalhes, financiamento, landing pages e painel administrativo.
