import { Injectable } from "@angular/core";
import { HttpInternalService } from "./http-internal.service";
import { NewComment } from "../models/comment/new-comment";
import { Comment } from "../models/comment/comment";
import { User } from "../models/user";
import { NewReaction } from "../models/reactions/newReaction";
import { Reaction } from "../models/reactions/reaction";
import { catchError, map } from "rxjs/operators";
import { of } from "rxjs";
import { UpdateComment } from "../models/comment/update-comment";

@Injectable({ providedIn: "root" })
export class CommentService {
    public routePrefix = "/api/comments";

    constructor(private httpService: HttpInternalService) {}

    public createComment(post: NewComment) {
        return this.httpService.postFullRequest<Comment>(
            `${this.routePrefix}`,
            post
        );
    }

    public likeComment(comment: Comment, user: User, isLike: boolean) {
        const currentComment = comment;
        const newReaction: NewReaction = {
            entityId: comment.id,
            isLike: isLike,
            userId: user.id,
        };

        let existingReaction: Reaction = currentComment.reactions.find(
            (reaction) => reaction.user.id == user.id
        );

        let changeOpinion: boolean =
            existingReaction !== undefined
                ? existingReaction.isLike !== newReaction.isLike
                : false;

        currentComment.reactions =
            existingReaction === undefined
                ? currentComment.reactions.concat({
                      isLike: newReaction.isLike,
                      user: user,
                  })
                : changeOpinion
                ? currentComment.reactions
                      .filter((reaction) => reaction.user.id !== user.id)
                      .concat({ isLike: newReaction.isLike, user: user })
                : currentComment.reactions.filter(
                      (reaction) => reaction.user.id !== user.id
                  );

        existingReaction = currentComment.reactions.find(
            (reaction) => reaction.user.id === user.id
        );

        return this.httpService
            .postFullRequest<Comment>(
                `${this.routePrefix}/reaction`,
                newReaction
            )
            .pipe(
                map(() => currentComment),
                catchError(() => {
                    currentComment.reactions =
                        existingReaction === undefined
                            ? currentComment.reactions.concat({
                                  isLike: newReaction.isLike,
                                  user: user,
                              })
                            : changeOpinion
                            ? currentComment.reactions
                                  .filter(
                                      (reaction) => reaction.user.id !== user.id
                                  )
                                  .concat({
                                      isLike: newReaction.isLike,
                                      user: user,
                                  })
                            : currentComment.reactions.filter(
                                  (reaction) => reaction.user.id !== user.id
                              );
                    return of(currentComment);
                })
            );
    }

    public deleteComment(comment: Comment) {
        return this.httpService.deleteFullRequest(
            `${this.routePrefix}/` + comment.id
        );
    }

    public updateComment(comment: UpdateComment) {
        return this.httpService.putFullRequest(`${this.routePrefix}/`, comment);
    }
}
