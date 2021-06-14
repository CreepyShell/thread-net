using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.Common.DTO.Post;
using Thread_.NET.Extensions;

namespace Thread_.NET.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class PostsController : ControllerBase
    {
        private readonly PostService _postService;
        private readonly LikeService _likeService;

        public PostsController(PostService postService, LikeService likeService)
        {
            _postService = postService;
            _likeService = likeService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<ICollection<PostDTO>>> Get()
        {
            return Ok(await _postService.GetAllPosts());
        }
        [HttpPost]
        public async Task<ActionResult<PostDTO>> CreatePost([FromBody] PostCreateDTO dto)
        {
            dto.AuthorId = this.GetUserIdFromToken();
            return Ok(await _postService.CreatePost(dto));
        }

        [HttpPost("like")]
        public async Task<IActionResult> LikePost(NewReactionDTO reaction)
        {
            try
            {
                reaction.UserId = this.GetUserIdFromToken();

                await _likeService.LikePost(reaction);
            }
            catch (Microsoft.Data.SqlClient.SqlException) { return BadRequest("Sql exception"); }
            catch (BLL.Exceptions.InvalidTokenException) { return BadRequest("Token exception"); }
            catch (System.Exception ex) { return BadRequest(ex.Message); }

            return Ok();
        }
        [HttpPut]
        public async Task<IActionResult> UpdatePost([FromBody] PostUpdateDTO postUpdate)
        {

            await _postService.UpdatePost(postUpdate.Id, postUpdate.NewBody, postUpdate.UpdatedAt);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id)
        {
            await _postService.DeletePost(id);
            return NoContent();
        }
    }
}