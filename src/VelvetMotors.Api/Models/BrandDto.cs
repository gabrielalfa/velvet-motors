namespace VelvetMotors.Api.Models;

public sealed record BrandDto(
    int Id,
    string Name,
    bool Active = true,
    int SortOrder = 99);

public sealed record BrandRequest(
    string Token,
    string Name,
    bool Active = true);
