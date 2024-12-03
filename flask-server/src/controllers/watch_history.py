from flask import request, jsonify
from datetime import datetime, timezone
from models.watch_history import WatchHistory
from configs.db_connect import db


def add_histories_movie():
    try:
        user_id = request.json.get("userId")
        episode_id = request.json.get("episodeId")

        if not user_id or not episode_id:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Thiếu thông tin về người dùng hoặc tập phim",
                    }
                ),
                400,
            )

        # Kiểm tra xem bản ghi đã tồn tại chưa
        history = WatchHistory.query.filter_by(
            UserId=user_id, EpisodeId=episode_id
        ).first()

        if history:
            # Cập nhật `created_at` để đưa bản ghi lên đầu
            history.CreatedAt = datetime.now(timezone.utc)
            db.session.commit()
            return jsonify({"success": True, "message": "Đã xem phim lại gần đây"}), 200
        else:
            # Thêm bản ghi mới
            new_history = WatchHistory(UserId=user_id, EpisodeId=episode_id)
            db.session.add(new_history)
            db.session.commit()
            return (
                jsonify({"success": True, "message": "Đã xem phim gần đây thành công"}),
                200,
            )

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_user_movie_histories(user_id):
    try:
        # Lấy danh sách lịch sử theo user_id, sắp xếp theo updated_at giảm dần
        histories = (
            WatchHistory.query.filter_by(UserId=user_id)
            .order_by(WatchHistory.UpdatedAt.desc())
            .all()
        )

        # Trích xuất movie_id từ danh sách lịch sử
        movies = [{"movieId": history.MovieId} for history in histories]

        return jsonify({"success": True, "data": movies}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
