using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services;
using Thread_.NET.Common.DTO.User;

namespace Thread_.NET.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthUserDTO>> Login(UserLoginDTO dto)
        {
            return Ok(await _authService.Authorize(dto));
        }

        

        [HttpPost("reset")]
        public async Task<IActionResult> SendMailToResetPass([FromBody] UserLoginDTO userReset)
        {
            string rezult = await _authService.SendMailToResetPass(userReset);

            if (rezult == "NotFound")
                return NotFound("Not found user with this email");
            if (rezult == "NotExitingMail" || string.IsNullOrEmpty(rezult))
                return BadRequest(rezult);
            return Ok("Sended");

           
        }
    }
}