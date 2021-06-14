using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Thread_.NET.Common.DTO.Comment
{
    public sealed class CreateCommentDTO
    {
        public int Id { get; set; }
        public string NewBody { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
