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
            genres = (
                Genres.query.order_by(Genres.CreatedAt.desc())
                .offset(limit * (curr_page - 1))
                .limit(limit)
                .all()
            )
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
def get_multi_genres(movie_id):
    try:
        movie = Movies.query.filter_by(Id=movie_id).first()
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
        movie_genres = movie.Genres
        genres = Genres.query.filter(
            Genres.Id.in_([movie_genre.GenreId for movie_genre in movie_genres])
        ).all()
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
                        "message": "Không tìm thấy thể loại",
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
        genre = Genres.query.filter_by(Name=data["Name"]).first()
        if genre:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Thể loại đã tồn tại trong cơ sở dữ liệu",
                    }
                ),
                400,
            )
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
        query = Genres.query.filter_by(Id=genre_id)
        genre = query.first()
        if genre:
            query.filter_by(Id=genre_id).update(data)
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
                        "message": "Không tìm thấy thể loại",
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
            count_movies = len(genre.Movies)
            if count_movies > 0:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Không thể xóa thể loại đã có phim",
                        }
                    ),
                    400,
                )
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
                        "message": "Không tìm thấy thể loại",
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
