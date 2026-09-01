using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace SilverbackApi.Api.Controllers;

public abstract class SilverbackControllerBase : ControllerBase
{
    protected Guid? ObtenerMiembroId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
