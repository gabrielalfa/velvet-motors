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

app.Run();
