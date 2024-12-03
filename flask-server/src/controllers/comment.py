from flask import request, jsonify
from datetime import datetime, timedelta
from models.comments import Comments
from models.users import Users
from configs.db_connect import db
from pprint import pprint


# Lấy danh sách bình luận theo movieId
def get_comment_by_id(movie_id):
    try:
        comments = (
            Comments.query.filter_by(MovieId=movie_id)
            .order_by(Comments.CreatedAt.desc())
            .all()
        )
        data = []
        for cmt in comments:
            data.append({**cmt.to_dict(), "User": cmt.User.to_dict()})
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Đếm số lượng bình luận theo movieId
def get_count_comments(movie_id):
    try:
        count = Comments.query.filter_by(MovieId=movie_id).count()
        return jsonify({"success": True, "counts": count}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Thêm bình luận
def post_comment():
    try:
        data = request.get_json()
        new_comment = Comments(**data)
        db.session.add(new_comment)
        db.session.commit()
        return jsonify({"success": True, "message": "Bình luận thành công"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Cập nhật bình luận
def update_comment(comment_id):
    try:
        data = request.get_json()
        comment = Comments.query.filter_by(Id=comment_id).first()
        if not comment:
            return (
                jsonify({"success": False, "message": "Bình luận không tồn tại"}),
                404,
            )
        comment.Content = data["Content"]
        db.session.commit()
        return jsonify({"success": True, "message": "Cập nhật thành công"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Xóa bình luận
def delete_comment(comment_id):
    try:
        comment = Comments.query.filter_by(Id=comment_id).first()
        if not comment:
            return (
                jsonify({"success": False, "message": "Bình luận không tồn tại"}),
                404,
            )
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"success": True, "message": "Đã xoá thành công"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Tổng số bình luận trong tháng hiện tại
def total_comment_by_month():
    try:
        date = datetime.now()
        first_date_of_current_month = datetime(date.year, date.month, 1)
        last_date_of_current_month = datetime(date.year, date.month + 1, 1) - timedelta(
            days=1
        )

        count = Comments.query.filter(
            Comments.CreatedAt >= first_date_of_current_month,
            Comments.CreatedAt <= last_date_of_current_month,
        ).count()

        return jsonify({"success": True, "data": count}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Danh sách bình luận trong tháng hiện tại
def comment_by_month():
    try:
        date = datetime.now()
        first_date_of_current_month = datetime(date.year, date.month, 1)
        last_date_of_current_month = datetime(date.year, date.month + 1, 1) - timedelta(
            days=1
        )

        comments = (
            Comments.query.filter(
                Comments.CreatedAt >= first_date_of_current_month,
                Comments.CreatedAt <= last_date_of_current_month,
            )
            .join(Users, Users.Id == Comments.UserId)
            .add_columns(
                Users.Name,
                Users.Email,
                Users.Avatar,
                Comments.Content,
                Comments.CreatedAt,
            )
            .order_by(Comments.CreatedAt.desc())
            .all()
        )
        result = [
            {
                "user": {
                    "name": user_name,
                    "email": user_email,
                    "avatar": user_avatar,
                },
                "content": content,
                "created_at": created_at,
            }
            for _, user_name, user_email, user_avatar, content, created_at in comments
        ]
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
