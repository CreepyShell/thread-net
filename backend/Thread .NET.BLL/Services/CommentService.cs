using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Thread_.NET.BLL.Services.Abstract;
using Thread_.NET.Common.DTO.Comment;
using Thread_.NET.Common.DTO.Like;
using Thread_.NET.DAL.Context;
using Thread_.NET.DAL.Entities;

namespace Thread_.NET.BLL.Services
{
    public sealed class CommentService : BaseService
    {
        public CommentService(ThreadContext context, IMapper mapper) : base(context, mapper) { }

        public async Task<CommentDTO> CreateComment(NewCommentDTO newComment)
        {
            var commentEntity = _mapper.Map<Comment>(newComment);

            _context.Comments.Add(commentEntity);
            await _context.SaveChangesAsync();

            var createdComment = await _context.Comments
                .Include(comment => comment.Author)
                    .ThenInclude(user => user.Avatar)
                .FirstAsync(comment => comment.Id == commentEntity.Id);

            return _mapper.Map<CommentDTO>(createdComment);
        }
        public async Task CommentReaction(NewReactionDTO reactionDTO)
        {
            var commentReaction = _context.CommentReactions.Where(cR => cR.UserId == reactionDTO.UserId && cR.CommentId == reactionDTO.EntityId);
            if(commentReaction.Any())
            {
                _context.CommentReactions.RemoveRange(commentReaction);
                if (commentReaction.First().IsLike != reactionDTO.IsLike)
                {
                    _context.CommentReactions.Where(cR => cR.UserId == reactionDTO.UserId && cR.CommentId == reactionDTO.EntityId).First().IsLike = reactionDTO.IsLike;
                    _context.CommentReactions.Update(commentReaction.First());
                    await _context.SaveChangesAsync();
                    return;
                }

                await _context.SaveChangesAsync();
                return;
            }


            _context.CommentReactions.Add(new CommentReaction
            { 
                IsLike = reactionDTO.IsLike,
                UserId = reactionDTO.UserId,
                CommentId = reactionDTO.EntityId
            });

            await _context.SaveChangesAsync();
        }

        public async Task UpdateComment(CreateCommentDTO createComment)
        {
            var updatedComment = _context.Comments.First(comment => comment.Id == createComment.Id);

            updatedComment.Id = createComment.Id;
            updatedComment.Body = createComment.NewBody;
            updatedComment.UpdatedAt = createComment.UpdatedAt;

            _context.Comments.Update(updatedComment);

            await _context.SaveChangesAsync();
        }

        public async Task DeleteComment(int id)
        {
            var deletedReactions = _context.CommentReactions.Where(commentReaction => commentReaction.CommentId == id);
            _context.CommentReactions.RemoveRange(deletedReactions);

            var deletedComments = _context.Comments.Where(comment => comment.Id == id);
            _context.Comments.RemoveRange(deletedComments);

            await _context.SaveChangesAsync();
        }
    }
}
