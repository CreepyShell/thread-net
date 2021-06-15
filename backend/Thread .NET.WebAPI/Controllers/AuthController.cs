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
        public async Task<ActionResult<string>> SendMailToResetPass([FromBody] UserLoginDTO userReset)
        {
            string hashPass = await _authService.SendMailToResetPass(userReset);

            if (hashPass == "NotFound")
                return NotFound("Not found user with this email");
            if (hashPass == "NotExitingMail" || string.IsNullOrEmpty(hashPass))
                return BadRequest("Email not rigth so can not reset pass");
            return Ok(hashPass);

           
        }
    }
}