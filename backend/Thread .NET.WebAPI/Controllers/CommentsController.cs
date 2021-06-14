using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services;
using Thread_.NET.Common.DTO.Comment;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.Extensions;

namespace Thread_.NET.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly CommentService _commentService;

        public CommentsController(CommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpPost]
        public async Task<ActionResult<CommentDTO>> CreatePost([FromBody] NewCommentDTO comment)
        {
            comment.AuthorId = this.GetUserIdFromToken();
            return Ok(await _commentService.CreateComment(comment));
        }

        [HttpPost("reaction")]
        public async Task<IActionResult> CommentReaction(NewReactionDTO reactionDTO)
        {
            reactionDTO.UserId = this.GetUserIdFromToken();

            await _commentService.CommentReaction(reactionDTO);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> UpdateCommnet([FromBody] CreateCommentDTO createComment)
        {
            await _commentService.UpdateComment(createComment);

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            await _commentService.DeleteComment(id);

            return NoContent();
        }
    }
}