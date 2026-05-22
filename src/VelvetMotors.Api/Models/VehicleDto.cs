namespace VelvetMotors.Api.Models;

public sealed record VehicleDto(
    int Id,
    string Name,
    int Year,
    int Km,
    decimal Price,
    string Image,
    string Badge,
    string Transmission,
    string Fuel);
