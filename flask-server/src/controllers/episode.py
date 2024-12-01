from flask import request, jsonify
from cloudinary.uploader import upload_large
from io import BytesIO
from models.episodes import Episodes
import mimetypes
from configs.db_connect import db


def is_valid_video(file):
    """
    Kiểm tra định dạng tệp video có hợp lệ hay không.
    Chỉ chấp nhận định dạng mp4 và WebM.
    """
    valid_mime_types = ["video/mp4", "video/webm"]
    mime_type = mimetypes.guess_type(file.filename)[0]
    return mime_type in valid_mime_types


def upload_episode():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Xác thực định dạng tệp
    if not is_valid_video(file):
        return (
            jsonify({"error": "Invalid file format. Only MP4 and WebM are allowed."}),
            400,
        )

    # Chuyển FileStorage thành BytesIO
    file_stream = BytesIO(file.read())
    upload_folder = "web-xem-phim/videos"
    payload = request.form

    try:
        result = upload_large(
            file_stream, resource_type="video", chunk_size=6000000, folder=upload_folder
        )
        ep_url = result["secure_url"]
        episode = Episodes(
            MovieId=payload["movie_id"], Source=ep_url, EpisodeNumber=payload["ep_num"]
        )
        db.session.add(episode)
        db.session.commit()
        return jsonify({"url": ep_url}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
