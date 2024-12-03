from flask import request, jsonify
from models.users import Users
from models.comments import Comments
from models.favorite_list import FavoriteList
from models.watch_history import WatchHistory
from configs.db_connect import db
import bcrypt
from datetime import datetime, timedelta
import cloudinary.uploader


def validate_user(user_id, email, old_password):
    user = None
    if email:
        user = Users.query.filter_by(Email=email).first()
    else:
        user = Users.query.filter_by(Id=user_id).first()
    if user and bcrypt.checkpw(
        old_password.encode("utf-8"), user.Password.encode("utf-8")
    ):
        return user
    return None


# Lấy tất cả người dùng
def get_all():
    try:
        users = Users.query.with_entities(
            Users.Id, Users.Email, Users.Name, Users.Avatar
        ).all()
        return (
            jsonify({"success": True, "data": [user.to_dict() for user in users]}),
            200,
        )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Lấy thông tin chi tiết người dùng
def get_detail(email):
    try:
        user = Users.query.filter_by(Email=email).first()
        if user:
            return jsonify({"success": True, "data": user.to_dict()}), 200
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Không tìm thấy trang hoặc yêu cầu!",
                    }
                ),
                404,
            )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Cập nhật thông tin người dùng
def update_user(email):
    try:
        data = request.get_json()
        user_query = Users.query.filter_by(Email=email)
        user = user_query.first()
        if not user:
            return jsonify({"message": "User not found", "success": False}), 404
        user_query.update(data)
        db.session.commit()
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Thay đổi tên thành công",
                    "data": user.to_dict(),
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Sửa thông tin người dùng
def edit_user(user_email):
    try:
        data = request.get_json()
        user = Users.query.filter_by(Email=user_email).first()
        if user:
            user.Name = data["name"]
            user.Avatar = data["avatar"]
            user.IsAdmin = data["isAdmin"]
            db.session.commit()
            return (
                jsonify({"success": True, "message": "Sửa người dùng thành công"}),
                200,
            )
        else:
            return (
                jsonify({"success": False, "message": "Người dùng không tồn tại"}),
                404,
            )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Xoá người dùng và các dữ liệu liên quan
def delete_user(user_id):
    try:
        if user_id:
            data = request.get_json()
            old_password = data.get("oldPassword")
            user = validate_user(user_id, None, old_password)
            if user:
                db.session.delete(user)
                Comments.query.filter_by(UserId=user_id).delete()
                FavoriteList.query.filter_by(UserId=user_id).delete()
                WatchHistory.query.filter_by(UserId=user_id).delete()
                db.session.commit()

                return (
                    jsonify({"success": True, "message": "Xoá người dùng thành công"}),
                    200,
                )
            else:
                return (
                    jsonify({"success": False, "message": "Người dùng không hợp lệ"}),
                    404,
                )
        else:
            return (
                jsonify({"success": False, "message": "Thiếu thông tin người dùng"}),
                400,
            )
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


# Thay đổi mật khẩu người dùng
def change_password():
    try:
        data = request.get_json()
        email = data.get("email")
        old_password = data.get("oldPassword")
        new_password = data.get("newPassword")

        user = validate_user(None, email, old_password)
        if user:
            salt = bcrypt.gensalt()
            hashed_new_password = bcrypt.hashpw(new_password.encode("utf-8"), salt)
            user.Password = hashed_new_password
            db.session.commit()

            return (
                jsonify({"success": True, "message": "Thay đổi mật khẩu thành công"}),
                200,
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Mật khẩu cũ không chính xác hoặc người dùng không tồn tại",
                    }
                ),
                400,
            )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Đếm số lượng người dùng mỗi tháng
def count_each_month():
    try:
        date = datetime.now()
        users_count = []
        for i in range(1, 13):
            first_date_of_month = datetime(date.year, i, 1)
            last_date_of_month = datetime(date.year, i + 1, 1) - timedelta(days=1)
            user_count = Users.query.filter(
                Users.CreatedAt >= first_date_of_month,
                Users.CreatedAt <= last_date_of_month,
            ).count()
            users_count.append({"Tháng": f"Tháng {i}", "Số_Lượng": user_count})
        return jsonify({"success": True, "total": users_count}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def upload_user_avatar(user_id):
    files = request.files
    if "file" not in files:
        return (
            jsonify({"success": False, "message": "Không tìm thấy thông tin file ảnh"}),
            400,
        )

    file = files["file"]

    if file.filename == "":
        return (
            jsonify({"success": False, "message": "Không tìm thấy thông tin file ảnh"}),
            400,
        )

    try:
        upload_result = upload_image_util(file)
        avt_url = upload_result["secure_url"]

        user = Users.query.filter_by(Id=user_id).first()
        user.Avatar = avt_url
        db.session.commit()

        return jsonify(
            {
                "success": True,
                "message": "Tải ảnh đại diện người dùng lên thành công",
                "url": upload_result["secure_url"],
            }
        )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def upload_image():
    files = request.files
    if "file" not in files:
        return (
            jsonify({"success": False, "message": "Không tìm thấy thông tin file ảnh"}),
            400,
        )

    file = files["file"]

    if file.filename == "":
        return (
            jsonify({"success": False, "message": "Không tìm thấy thông tin file ảnh"}),
            400,
        )

    try:
        upload_result = upload_image_util(file)

        return jsonify(
            {
                "success": True,
                "message": "Tải ảnh đại diện người dùng lên thành công",
                "url": upload_result["secure_url"],
            }
        )
    except Exception as e:
        return jsonify({"success": False, "message": str(e), "url": None}), 500


# Upload file lên Cloudinary
def upload_image_util(file):
    try:
        # Upload file lên Cloudinary
        upload_folder = "web-xem-phim/images"
        upload_result = cloudinary.uploader.upload(file, folder=upload_folder)

        return upload_result
    except Exception as e:
        return None
