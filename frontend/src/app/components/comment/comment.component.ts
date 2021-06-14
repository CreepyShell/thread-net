import { Component, Input, OnDestroy } from "@angular/core";
import { User } from "../../models/user";
import { Comment } from "../../models/comment/comment";
import { Subject } from "rxjs";
import { CommentService } from "src/app/services/comment.service";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-comment",
    templateUrl: "./comment.component.html",
    styleUrls: ["./comment.component.sass"],
})
export class CommentComponent implements OnDestroy {
    @Input() public comment: Comment;
    @Input() public currentUser: User;
    private unsubscribe$ = new Subject<void>();

    public isEditable = false;

    constructor(private commentService: CommentService) {}

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public ready() {
        var editedPost = document.getElementById(
            this.comment.id.toString()
        )?.innerText;
        let date: Date = new Date(Date.now());
        this.isEditable = false;
        this.commentService
            .updateComment({
                id: this.comment.id,
                updatedAt: date,
                newBody: editedPost,
            })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => (this.comment.body = editedPost));
    }

    public editComment() {
        if (!this.isEditable) {
            this.isEditable = true;
            return;
        }
        this.isEditable = false;
    }

    public commentReaction(isLike: boolean) {
        this.commentService
            .likeComment(this.comment, this.currentUser, isLike)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((comment) => {
                this.comment = comment;
            });
    }
    public IsCurrentUserComment(): boolean {
        if (!this.currentUser) {
            return false;
        }
        if (this.currentUser.id == this.comment.author.id) {
            return true;
        }
        return false;
    }
    public deleteComment() {
        this.commentService
            .deleteComment(this.comment)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => (this.comment.id = -1));
    }

    public GetLikes(): number {
        return this.comment.reactions.filter((reaction) => reaction.isLike)
            .length;
    }

    public GetDislikes(): number {
        return this.comment.reactions.length - this.GetLikes();
    }
}
