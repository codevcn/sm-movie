from flask import request, jsonify
from cloudinary.uploader import upload_large
from io import BytesIO
from models.episodes import Episodes
from models.movies import Movies
from models.watch_history import WatchHistory
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


def upload_video(file):
    file_stream = BytesIO(file.read())
    upload_folder = "web-xem-phim/videos"
    result = upload_large(
        file_stream, resource_type="video", chunk_size=6000000, folder=upload_folder
    )
    return result


def upload_episode():
    files = request.files
    if "file" not in files:
        return jsonify({"message": "Không tìm thấy file"}), 400

    file = files["file"]

    if file.filename == "":
        return jsonify({"message": "Không tìm thấy file"}), 400

    # Xác thực định dạng tệp
    if not is_valid_video(file):
        return (
            jsonify({"message": "File không hợp lệ, chỉ chấp nhận file MP4 hoặc WebM."}),
            400,
        )
    payload = request.form
    movie_id = payload["movie_id"]    
    movie = Movies.query.filter_by(Id=movie_id).first()
    if not movie:
        return (
            jsonify({"message": "Không tồn tại phim này"}),
            404,
        )
    
    episodes_len = Episodes.query.filter_by(MovieId=movie_id).count()
    if episodes_len == movie.TotalEpisodes :
        return (
                jsonify({"message": "Đã đủ số lượng tập."}),
                400,
            )
    try:
        result = upload_video(file)
        ep_url = result["secure_url"]
        
        
        episode = Episodes(
            MovieId=movie_id, Source=ep_url, EpisodeNumber=payload["ep_num"]
        )
        db.session.add(episode)
        db.session.commit()
        return jsonify({"url": ep_url, "episode": episode.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


def get_all_episodes(movie_id):
    try:
        episodes = Episodes.query.filter_by(MovieId=movie_id).all()
        if not episodes:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Tập phim không tồn tại",
                        "not_found_eps": True,
                    }
                ),
                404,
            )
        return (
            jsonify(
                {
                    "success": True,
                    "data": [ep.to_dict() for ep in episodes],
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_ep_data(movie_id, ep_num):
    try:
        episode = Episodes.query.filter_by(
            MovieId=movie_id, EpisodeNumber=ep_num
        ).first()
        if not episode:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Tập phim không tồn tại",
                    }
                ),
                404,
            )
        return (
            jsonify(
                {
                    "success": True,
                    "episode": episode.to_dict(),
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def edit_ep(ep_id):
    files = request.files
    if "file" not in files:
        return jsonify({"error": "Không tìm thấy file"}), 400

    file = files["file"]

    if file.filename == "":
        return jsonify({"error": "Không tìm thấy file"}), 400

    # Xác thực định dạng tệp
    if not is_valid_video(file):
        return (
            jsonify({"error": "File không hợp lệ, chỉ chấp nhận file MP4 hoặc WebM."}),
            400,
        )

    try:
        result = upload_video(file)
        ep_url = result["secure_url"]
        Episodes.query.filter_by(Id=ep_id).update({"Source": ep_url})
        db.session.commit()
        return jsonify(
            {
                "success": True,
                "message": "Đã sửa thông tin tập phim thành công",
                "new_ep_url": ep_url,
            }
        )
    except Exception as e:
        return jsonify({"error": str(e)})

def delete_ep(ep_id):
    try:
        ep=Episodes.query.filter_by(Id=ep_id).first()
        if not ep:
            return jsonify({
                "success":False,
                "message":"Tập phim không tồn tại"
            }),404
        WatchHistory.query.filter_by(EpisodeId=ep_id).delete()
        Episodes.query.filter_by(Id=ep_id).delete()
        db.session.commit()
        return jsonify({
            "success":True,
            "message":"Xóa thành công."
        })
    except Exception as e:
        print('>>> error delete_ep:',e)
        db.session.rollback()
        return jsonify({
            "success":False,
            "message":"Có lỗi xảy ra"
        })
    