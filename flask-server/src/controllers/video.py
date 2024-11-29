from flask import request, jsonify
from cloudinary.uploader import upload_large
from io import BytesIO
import mimetypes


def is_valid_video(file):
    """
    Kiểm tra định dạng tệp video có hợp lệ hay không.
    Chỉ chấp nhận định dạng mp4 và WebM.
    """
    valid_mime_types = ["video/mp4", "video/webm"]
    mime_type = mimetypes.guess_type(file.filename)[0]
    return mime_type in valid_mime_types


def upload_video():
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

    try:
        result = upload_large(
            file_stream, resource_type="video", chunk_size=6000000, folder=upload_folder
        )
        return jsonify({"url": result.get("secure_url")}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
