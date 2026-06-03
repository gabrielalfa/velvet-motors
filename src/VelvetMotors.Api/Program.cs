using System.Globalization;
using System.Text;
using VelvetMotors.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("VelvetWeb", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("VelvetWeb");

var vehicles = new[]
{
    new VehicleDto(1, "BMW 320i M Sport", 2023, 18400, 189900, "/images/cars/car-1.jpg", "Blindagem opcional", "Automatico", "Flex"),
    new VehicleDto(2, "Audi Q3 Performance", 2022, 22100, 176900, "/images/cars/car-2.jpg", "Unico dono", "S tronic", "Gasolina"),
    new VehicleDto(3, "Mercedes C180 Avantgarde", 2021, 31200, 159900, "/images/cars/car-3.jpg", "Revisoes na marca", "9G-Tronic", "Flex"),
    new VehicleDto(4, "Volvo XC40 T5 Momentum", 2022, 26500, 194900, "/images/cars/car-4.jpg", "Pacote safety", "Automatico", "Hibrido"),
    new VehicleDto(5, "Jeep Compass Limited", 2024, 9200, 172900, "/images/cars/car-5.jpg", "Garantia ativa", "Automatico", "Diesel")
};

var brands = new List<BrandDto>
{
    new(1, "BMW", true, 1),
    new(2, "Audi", true, 2),
    new(3, "Mercedes", true, 3),
    new(4, "Porsche", true, 4),
    new(5, "Volvo", true, 5),
    new(6, "Jeep", true, 6),
    new(7, "Toyota", true, 7),
    new(8, "Land Rover", true, 8)
};

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "online",
    brand = "Velvet Motors",
    timestamp = DateTimeOffset.UtcNow
}))
.WithName("Health");

app.MapGet("/api/vehicles/featured", () => Results.Ok(vehicles))
    .WithName("GetFeaturedVehicles");

app.MapGet("/api/vehicles/{id:int}", (int id) =>
{
    var vehicle = vehicles.FirstOrDefault(item => item.Id == id);
    return vehicle is null ? Results.NotFound() : Results.Ok(vehicle);
})
.WithName("GetVehicleById");

app.MapGet("/Velvet/Brands", () => Results.Ok(brands.Where(item => item.Active)))
    .WithName("GetVelvetBrands");

app.MapPost("/Velvet/InsertBrand", (BrandRequest request) =>
{
    var name = NormalizeBrandName(request.Name ?? string.Empty);

    if (string.IsNullOrWhiteSpace(name))
    {
        return Results.BadRequest(new { Success = false, Message = "Informe o nome da marca." });
    }

    var existing = brands.FirstOrDefault(item => BrandKey(item.Name) == BrandKey(name));

    if (existing is not null)
    {
        return Results.Conflict(new { Success = false, Message = "Esta marca ja esta cadastrada.", existing.Id });
    }

    var id = brands.Count == 0 ? 1 : brands.Max(item => item.Id) + 1;
    var brand = new BrandDto(id, name, request.Active, brands.Count + 1);
    brands.Add(brand);

    return Results.Ok(new { Success = true, Message = "Marca cadastrada com sucesso.", brand.Id });
})
.WithName("InsertVelvetBrand");

app.Run();

static string NormalizeBrandName(string name)
{
    return string.Join(' ', name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
}

static string BrandKey(string name)
{
    var normalized = NormalizeBrandName(name).Normalize(NormalizationForm.FormD);
    var builder = new StringBuilder(capacity: normalized.Length);

    foreach (var character in normalized)
    {
        if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
        {
            builder.Append(char.ToLowerInvariant(character));
        }
    }

    return builder.ToString().Normalize(NormalizationForm.FormC);
}
