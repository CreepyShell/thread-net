import { Component, Input, OnDestroy } from "@angular/core";
import { Post } from "../../models/post/post";
import { AuthenticationService } from "../../services/auth.service";
import { AuthDialogService } from "../../services/auth-dialog.service";
import { empty, Observable, Subject } from "rxjs";
import { DialogType } from "../../models/common/auth-dialog-type";
import { LikeService } from "../../services/like.service";
import { NewComment } from "../../models/comment/new-comment";
import { CommentService } from "../../services/comment.service";
import { User } from "../../models/user";
import { Comment } from "../../models/comment/comment";
import { catchError, switchMap, takeUntil } from "rxjs/operators";
import { SnackBarService } from "../../services/snack-bar.service";
import { PostService } from "../../services/post.service";
import { GyazoService } from "../../services/gyazo.service";

@Component({
    selector: "app-post",
    templateUrl: "./post.component.html",
    styleUrls: ["./post.component.sass"],
})
export class PostComponent implements OnDestroy {
    @Input() public post: Post;
    @Input() public currentUser: User;

    public isEditable = false;
    public showComments = false;
    public newComment = {} as NewComment;

    private unsubscribe$ = new Subject<void>();

    public constructor(
        private authService: AuthenticationService,
        private authDialogService: AuthDialogService,
        private likeService: LikeService,
        private commentService: CommentService,
        private snackBarService: SnackBarService,
        private postService: PostService,
        private gyazoService: GyazoService
    ) {}

    public ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    public ready() {
        var editedPost = document.getElementById(
            this.post.id.toString()
        )?.innerText;
        let date: Date = new Date(Date.now());
        this.isEditable = false;
        this.postService
            .updatePost({
                id: this.post.id,
                updatedAt: date,
                newBody: editedPost,
            })
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => (this.post.body = editedPost));
    }

    public editPost() {
        if (!this.isEditable) {
            this.isEditable = true;
            return;
        }
        this.isEditable = false;
    }

    public deletePost() {
        let rezult: boolean = confirm("You really wanna delete your post?");
        if (!rezult) {
            return;
        }
        this.gyazoService
            .deleteImage(
                this.post.previewImage
                    .replace("https://i.gyazo.com/", "")
                    .replace(".png", "")
            )
            .pipe(takeUntil(this.unsubscribe$));

        this.postService
            .deletePost(this.post.id)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(() => (this.post.id = -1));
    }

    public toggleComments() {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((user) => {
                    if (user) {
                        this.currentUser = user;
                        this.showComments = !this.showComments;
                    }
                });
            return;
        }

        this.showComments = !this.showComments;
    }

    public getComments(): Comment[] {
        this.post.comments = this.post.comments.filter(
            (comment) => comment.id !== -1
        );
        return this.post.comments.filter((comment) => comment.id !== -1);
    }

    public IsCurrentUserPost(): boolean {
        if (!this.currentUser) {
            return false;
        }
        if (this.currentUser.id == this.post.author.id) {
            return true;
        }
        return false;
    }
    public postReaction(isLike: boolean) {
        if (!this.currentUser) {
            this.catchErrorWrapper(this.authService.getUser())
                .pipe(
                    switchMap((userResp) =>
                        this.likeService.likePost(this.post, userResp, isLike)
                    ),
                    takeUntil(this.unsubscribe$)
                )
                .subscribe((post) => (this.post = post));

            return;
        }

        this.likeService
            .likePost(this.post, this.currentUser, isLike)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((post) => (this.post = post));
    }

    public GetLikes(): number {
        return this.post.reactions.filter((reaction) => reaction.isLike).length;
    }

    public GetDislikes(): number {
        return this.post.reactions.length - this.GetLikes();
    }

    public sendComment() {
        this.newComment.authorId = this.currentUser.id;
        this.newComment.postId = this.post.id;

        this.commentService
            .createComment(this.newComment)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(
                (resp) => {
                    if (resp) {
                        this.post.comments = this.sortCommentArray(
                            this.post.comments.concat(resp.body)
                        );
                        this.newComment.body = undefined;
                    }
                },
                (error) => this.snackBarService.showErrorMessage(error)
            );
    }

    public openAuthDialog() {
        this.authDialogService.openAuthDialog(DialogType.SignIn);
    }

    private catchErrorWrapper(obs: Observable<User>) {
        return obs.pipe(
            catchError(() => {
                this.openAuthDialog();
                return empty();
            })
        );
    }

    private sortCommentArray(array: Comment[]): Comment[] {
        return array.sort(
            (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
    }
}
