from controllers.comment import (
    get_comment_by_id,
    get_count_comments,
    total_comment_by_month,
    comment_by_month,
    post_comment,
    update_comment,
    delete_comment,
)
from flask import Blueprint, Flask


def register_comment_routes(app: Flask):
    # Tạo một Blueprint cho API routes
    api_blueprint = Blueprint("comment", __name__, url_prefix="/api/comment")

    # Định nghĩa các tuyến API
    api_blueprint.add_url_rule(
        "/get-comment/<int:id>", view_func=get_comment_by_id, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-count-comment/<int:id>", view_func=get_count_comments, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-count-comment-month",
        view_func=total_comment_by_month,
        methods=["GET"],
    )
    api_blueprint.add_url_rule(
        "/get-comment-month", view_func=comment_by_month, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/post-comment", view_func=post_comment, methods=["POST"]
    )
    api_blueprint.add_url_rule(
        "/update-comment/<int:id>", view_func=update_comment, methods=["PUT"]
    )
    api_blueprint.add_url_rule(
        "/delete-comment/<int:id>", view_func=delete_comment, methods=["DELETE"]
    )

    # Đăng ký Blueprint
    app.register_blueprint(api_blueprint)
