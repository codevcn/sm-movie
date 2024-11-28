from flask import request, jsonify
from cloudinary.uploader import upload_large
from io import BytesIO
from configs.db_connect import db
from models.users import Users


def upload_video():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Chuyển FileStorage thành BytesIO
    file_stream = BytesIO(file.read())

    upload_folder = "web-xem-phim/videos"

    try:
        result = upload_large(
            file_stream, resource_type="video", chunk_size=6000000, folder=upload_folder
        )
        video_url = result.get("secure_url")
        return jsonify({"url": video_url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def test_handler():
    print(">>> run this")
    try:
        data = {
            "id": 1,
            "Name": "Code VCN",
            "Email": "codevcn@example.com",
            "Password": "hashedpassword123",
            "Avatar": "/images/john_avatar.jpg",
            "IsAdmin": True,
            "IsActive": True,
        }
        new_movie = Users(
            Name=data["Name"],
            Email=data["Email"],
            Password=data["Password"],  # Đảm bảo password được mã hóa trước khi lưu
            Avatar=data.get("Avatar"),
            IsAdmin=data.get("IsAdmin", False),
            IsActive=data.get("IsActive", False),
        )
        db.session.add(new_movie)
        db.session.commit()
        return jsonify({"message": "Movie created successfully!"}), 201
    except Exception as e:
        print(">>> error:", e)
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.session.close()
