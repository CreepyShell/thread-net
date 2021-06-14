using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Thread_.NET.Common.DTO.Post
{
    public sealed class PostUpdateDTO
    {
        public int Id { get; set; }
        public string NewBody { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
