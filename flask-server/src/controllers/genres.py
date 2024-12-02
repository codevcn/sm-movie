from flask import request, jsonify
from configs.db_connect import db
from models.genres import Genres
from models.movies import Movies
from models.movie_genres import MovieGenres


# Lấy tất cả thể loại (hỗ trợ phân trang)
def get_all_genres():
    try:
        params = request.args
        if "limit" in params:
            limit = int(params.get("limit"))
            curr_page = int(params.get("page", 1))
            genres = Genres.query.offset(limit * (curr_page - 1)).limit(limit).all()
            count_documents = Genres.query.count()

            return (
                jsonify(
                    {
                        "success": True,
                        "data": [genre.to_dict() for genre in genres],
                        "pages": -(-count_documents // limit),  # Tính số trang
                    }
                ),
                200,
            )
        else:
            genres = Genres.query.all()
            return (
                jsonify(
                    {
                        "success": True,
                        "data": [genre.to_dict() for genre in genres],
                    }
                ),
                200,
            )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )


# Lấy danh sách thể loại liên quan đến một phim
def get_multi_genres(id):
    try:
        movie = Movies.query.filter_by(Id=id).first()
        if not movie:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Phim không tồn tại",
                    }
                ),
                404,
            )

        genres = Genres.query.filter(MovieGenres.Id.in_(movie.Genres)).all()
        return (
            jsonify(
                {
                    "success": True,
                    "data": [genre.to_dict() for genre in genres],
                }
            ),
            200,
        )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )


# Lấy chi tiết một thể loại
def get_genre_detail(genre_id):
    try:
        genre = Genres.query.get(genre_id)
        if genre:
            return (
                jsonify(
                    {
                        "success": True,
                        "data": genre.to_dict(),
                    }
                ),
                200,
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Không tìm thấy trang hoặc yêu cầu",
                    }
                ),
                404,
            )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )


# Tạo mới một thể loại
def create_genre():
    try:
        data = request.get_json()
        new_genre = Genres(**data)
        db.session.add(new_genre)
        db.session.commit()
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Thêm thể loại thành công",
                }
            ),
            200,
        )
    except Exception as e:
        print(">>> err:", e)
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )


# Cập nhật một thể loại
def update_genre(genre_id):
    try:
        data = request.get_json()
        genre = Genres.query.get(genre_id)
        if genre:
            for key, value in data.items():
                setattr(genre, key, value)
            db.session.commit()
            return (
                jsonify(
                    {
                        "success": True,
                        "message": "Sửa thể loại thành công",
                    }
                ),
                200,
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Không tìm thấy trang hoặc yêu cầu",
                    }
                ),
                404,
            )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )


# Xóa một thể loại
def delete_genre(genre_id):
    try:
        genre = Genres.query.get(genre_id)
        if genre:
            db.session.delete(genre)
            db.session.commit()
            return (
                jsonify(
                    {
                        "success": True,
                        "message": "Xoá thể loại thành công",
                    }
                ),
                200,
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Không tìm thấy trang hoặc yêu cầu",
                    }
                ),
                404,
            )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )
