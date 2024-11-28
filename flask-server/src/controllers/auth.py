from flask import request, jsonify
from models.users import Users  # Giả sử Users là mô hình SQLAlchemy
from configs.db_connect import db
import bcrypt


# Đăng ký người dùng
def register():
    try:
        data = request.get_json()  # Lấy dữ liệu JSON từ body của yêu cầu

        # Kiểm tra xem email đã tồn tại chưa
        if Users.query.filter_by(Email=data["email"]).first():
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Tài khoản này đã được đăng kí trên hệ thống",
                    }
                ),
                400,
            )

        # Mã hóa mật khẩu
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(data["password"].encode("utf-8"), salt)

        # Tạo người dùng mới
        new_user = Users(
            Email=data["email"],
            Password=hashed_password,
            Name=data["name"],
            Avatar=data.get("avatar"),  # Nếu không có avatar, sẽ để None
        )

        # Lưu vào cơ sở dữ liệu
        db.session.add(new_user)
        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Đăng ký tài khoản thành công",
                    "data": {
                        "id": new_user.Id,
                        "email": new_user.Email,
                        "name": new_user.Name,
                        "avatar": new_user.Avatar,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": str(e),
                    "message": "Có lỗi xảy ra trong quá trình đăng ký",
                }
            ),
            500,
        )


# Đăng nhập người dùng
def login():
    try:
        data = request.get_json()  # Lấy dữ liệu JSON từ body của yêu cầu
        email = data.get("email")
        password = data.get("password")

        # Tìm người dùng theo email
        user = Users.query.filter_by(Email=email).first()

        if user:
            # So sánh mật khẩu
            if bcrypt.checkpw(password.encode("utf-8"), user.Password.encode("utf-8")):
                return (
                    jsonify(
                        {
                            "success": True,
                            "message": "Đăng nhập thành công",
                            "data": {
                                "id": user.Id,
                                "email": user.Email,
                                "name": user.Name,
                                "avatar": user.Avatar,
                            },
                        }
                    ),
                    200,
                )
            else:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Tài khoản hoặc mật khẩu không hợp lệ",
                        }
                    ),
                    400,
                )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Email chưa được đăng kí trên hệ thống",
                    }
                ),
                400,
            )

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
