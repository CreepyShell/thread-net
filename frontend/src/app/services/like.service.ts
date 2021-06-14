import { Injectable } from "@angular/core";
import { AuthenticationService } from "./auth.service";
import { Post } from "../models/post/post";
import { NewReaction } from "../models/reactions/newReaction";
import { PostService } from "./post.service";
import { User } from "../models/user";
import { map, catchError } from "rxjs/operators";
import { of } from "rxjs";
import { Reaction } from "../models/reactions/reaction";

@Injectable({ providedIn: "root" })
export class LikeService {
    public constructor(
        private authService: AuthenticationService,
        private postService: PostService
    ) {}

    public likePost(post: Post, currentUser: User, isLike: boolean) {
        const innerPost = post;

        const reaction: NewReaction = {
            entityId: innerPost.id,
            isLike: isLike,
            userId: currentUser.id,
        };

        // update current array instantly
        let hasReaction: Reaction = innerPost.reactions.find(
            (x) => x.user.id === currentUser.id
        );
        let chengeOpinion: boolean =
            hasReaction !== undefined
                ? hasReaction.isLike !== reaction.isLike
                : false;

        innerPost.reactions =
            hasReaction !== undefined
                ? chengeOpinion
                    ? innerPost.reactions
                          .filter((x) => x.user.id !== currentUser.id)
                          .concat({ isLike: isLike, user: currentUser })
                    : innerPost.reactions.filter(
                          (x) => x.user.id !== currentUser.id
                      )
                : innerPost.reactions.concat({
                      isLike: isLike,
                      user: currentUser,
                  });

        hasReaction = innerPost.reactions.find(
            (x) => x.user.id === currentUser.id
        );

        return this.postService.likePost(reaction).pipe(
            map(() => innerPost),
            catchError(() => {
                // revert current array changes in case of any error
                innerPost.reactions =
                    hasReaction !== undefined
                        ? chengeOpinion
                            ? innerPost.reactions
                                  .filter((x) => x.user.id !== currentUser.id)
                                  .concat({ isLike: isLike, user: currentUser })
                            : innerPost.reactions.filter(
                                  (x) => x.user.id !== currentUser.id
                              )
                        : innerPost.reactions.concat({
                              isLike: isLike,
                              user: currentUser,
                          });

                return of(innerPost);
            })
        );
    }
}
