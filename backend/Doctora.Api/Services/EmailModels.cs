using System.Text.Json;

namespace Doctora.Api.Services;

public record EmailRequest(string To, EmailPayload Payload);

public record EmailPayload(string Type, JsonElement Data);
