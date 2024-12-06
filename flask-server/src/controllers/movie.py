from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func, desc
from configs.db_connect import db
from models.movies import Movies
from models.comments import Comments
from models.favorite_list import FavoriteList
from models.watch_history import WatchHistory
from models.episodes import Episodes
from models.rating import Rating
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
from models.movie_genres import MovieGenres


def create():
    try:
        data = request.get_json()
        movie_info = data.get("movie_info", None)
        genre_ids = data.get("genre_ids", None)

        if not movie_info or not genre_ids:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Thông tin phim và danh sách thể loại không được phép trống!",
                    }
                ),
                400,
            )

        # add movie
        movie = Movies(**movie_info)
        db.session.add(movie)

        # add genres
        movie_id = movie.Id
        movie_genre_records = [
            MovieGenres(MovieId=movie_id, GenreId=genre_id) for genre_id in genre_ids
        ]
        db.session.add_all(movie_genre_records)

        db.session.commit()
        return (
            jsonify(
                {
                    "success": True,
                    "movie": movie.to_dict(),
                    "message": "Thêm phim thành công",
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


def update(movie_id):
    data = request.get_json()
    genre_ids = data.get("genre_ids", None)
    movie_info = data.get("movie_info", None)

    if not movie_id or not genre_ids or not movie_info:
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Thông tin phim và danh sách thể loại không được phép trống!",
                }
            ),
            400,
        )

    try:
        movie_query = Movies.query.filter_by(Id=movie_id)
        movie = movie_query.first()

        # delete before adding genres
        MovieGenres.query.filter_by(MovieId=movie_id).delete(synchronize_session=False)
        # add genres
        movie_genre_records = [
            MovieGenres(MovieId=movie_id, GenreId=genre_id) for genre_id in genre_ids
        ]
        db.session.add_all(movie_genre_records)

        if movie:
            movie_query.update(movie_info)
            db.session.commit()
            return (
                jsonify({"success": True, "message": "Cập nhật phim thành công"}),
                200,
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Không tìm thấy phim!",
                    }
                ),
                404,
            )
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


def update_viewed(movie_id):
    try:
        movie = Movies.query.filter_by(Id=movie_id).first()
        if movie:
            movie.Viewed += 1
            db.session.commit()
            return jsonify({"success": True, "message": "Đã xem"}), 200
        else:
            return (
                jsonify({"success": False, "message": "Không tìm thấy phim!"}),
                404,
            )
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


def get_total_viewed():
    try:
        total_view = db.session.query(db.func.sum(Movies.Viewed)).scalar() or 0
        return jsonify({"success": True, "count": total_view}), 200
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def delete(movie_id):
    try:
        movie = Movies.query.get(movie_id)
        if movie:
            episodes = Episodes.query.filter_by(MovieId=movie_id).all()
            count_eps = len(episodes)
            if count_eps > 0:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Không thể xóa phim đã có tập phim!",
                        }
                    ),
                    400,
                )

            # Xóa liên quan
            MovieGenres.query.filter_by(MovieId=movie_id).delete()
            Comments.query.filter_by(MovieId=movie_id).delete()
            FavoriteList.query.filter_by(MovieId=movie_id).delete()
            WatchHistory.query.filter(
                WatchHistory.EpisodeId.in_([ep.to_dict().Id for ep in episodes])
            ).delete()

            # Sau khi xóa liên quan sẽ xóa phim
            db.session.delete(movie)

            db.session.commit()

            return jsonify({"success": True, "message": "Xoá phim thành công"}), 200
        else:
            return (
                jsonify({"success": False, "message": "Không tìm thấy phim!"}),
                404,
            )
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


def get_all_movies():
    try:
        limit = 10
        curr_page = int(request.args.get("page", 1))
        category = request.args.get("category")
        keyword = request.args.get("keyword")
        query = Movies.query

        if keyword:
            query = query.filter(Movies.Name.ilike(f"%{keyword}%"))
        elif category and category != "all":
            query = query.filter(Movies.Type == category)

        movies = (
            query.order_by(Movies.ReleaseDate.desc())
            .offset((curr_page - 1) * limit)
            .limit(limit)
            .all()
        )
        count_documents = query.count()

        return (
            jsonify(
                {
                    "success": True,
                    "data": [movie.to_dict() for movie in movies],
                    "pages": (count_documents + limit - 1) // limit,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_movie_detail(id):
    try:
        movie = Movies.query.filter_by(Id=id).first()
        if movie:
            return jsonify({"success": True, "data": movie.to_dict()}), 200
        else:
            return (
                jsonify({"success": False, "message": "Không tìm thấy phim"}),
                404,
            )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_movies_by_category(category, type):
    try:
        limit = 20
        curr_page = int(request.args.get("page", 1))
        query = db.session.query(Movies).filter(Movies.Type == category)

        if type == "top_rated":
            # Tính giá trị trung bình `Rating` và liên kết bảng
            query = (
                db.session.query(
                    Movies.Id,
                    Movies.Name,
                    Movies.PosterPath,
                    Movies.ReleaseDate,
                    Movies.Viewed,
                    Movies.Type,
                    func.avg(Rating.Rating).label(
                        "AverageRating"
                    ),  # Giá trị trung bình Rating
                )
                .join(
                    Rating, Movies.Id == Rating.MovieId
                )  # Liên kết bảng `Movies` và `Rating`
                .group_by(
                    Movies.Id, Movies.Name, Movies.PosterPath
                )  # Nhóm theo `Movies`
                .order_by(
                    desc("AverageRating")
                )  # Sắp xếp giảm dần theo giá trị trung bình Rating
            )
        elif type == "popular":
            query = (
                db.session.query(Movies)
                .filter(Movies.Viewed >= 10)
                .order_by(Movies.Viewed.desc())
            )
        elif type == "upcoming":
            date = datetime.now() + timedelta(days=1)
            query = (
                db.session.query(Movies)
                .filter(Movies.ReleaseDate >= date)
                .order_by(Movies.ReleaseDate.desc())
            )

        count_documents = query.count()
        movies_data = query.offset((curr_page - 1) * limit).limit(limit).all()

        movies = []
        for movie in movies_data:
            movies.append(
                {
                    "Id": movie.Id,
                    "Name": movie.Name,
                    "PosterPath": movie.PosterPath,
                    "ReleaseDate": movie.ReleaseDate,
                    "Viewed": movie.Viewed,
                    "Type": movie.Type,
                    "AverageRating": (
                        movie.AverageRating if type == "top_rated" else None
                    ),
                }
            )

        return (
            jsonify(
                {
                    "success": True,
                    "data": movies,
                    "pages": (count_documents + limit - 1) // limit,
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_genres_by_id(genre_id):
    try:
        movieGenres = MovieGenres.query.filter_by(GenreId=genre_id).all()
        movies = (
            Movies.query.filter(
                Movies.Id.in_(
                    [movieGenre.to_dict()["MovieId"] for movieGenre in movieGenres]
                )
            )
            .order_by(Movies.CreatedAt.desc())
            .all()
        )
        return (
            jsonify({"success": True, "data": [movie.to_dict() for movie in movies]}),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


# def get_similar_movies(slug):
#     try:
#         movie = Movies.query.filter_by(Slug=slug).first()
#         if not movie:
#             return jsonify({"success": False, "message": "Không tìm thấy phim"}), 404

#         similar_movies = Movies.query.filter(
#             Movies.Type == movie.Type,
#             Movies.Genres.overlap(movie.Genres),
#             Movies.Slug != slug,
#         ).all()

#         return (
#             jsonify(
#                 {
#                     "success": True,
#                     "data": [similar.to_dict() for similar in similar_movies],
#                 }
#             ),
#             200,
#         )
#     except SQLAlchemyError as e:
#         return jsonify({"success": False, "message": str(e)}), 500


def get_movies_by_month():
    try:
        now = datetime.now()
        curr_month = now.month
        first_date_of_month = datetime(now.year, curr_month, 1)
        last_date_of_month = None
        if curr_month == 12:
            last_date_of_month = datetime(
                now.year, 12, 31
            )  # Ngày cuối cùng của tháng 12
        else:
            last_date_of_month = datetime(now.year, curr_month + 1, 1) - timedelta(
                days=1
            )

        movies = Movies.query.filter(
            Movies.CreatedAt.between(first_date_of_month, last_date_of_month)
        ).all()

        return (
            jsonify({"success": True, "data": [movie.to_dict() for movie in movies]}),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def count_movies_by_month():
    try:
        now = datetime.now()
        curr_month = now.month
        first_date_of_month = datetime(now.year, curr_month, 1)
        last_date_of_month = None
        if curr_month == 12:
            last_date_of_month = datetime(
                now.year, 12, 31
            )  # Ngày cuối cùng của tháng 12
        else:
            last_date_of_month = datetime(now.year, curr_month + 1, 1) - timedelta(
                days=1
            )

        count = Movies.query.filter(
            Movies.CreatedAt.between(first_date_of_month, last_date_of_month)
        ).count()

        return jsonify({"success": True, "data": count}), 200
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_newest_movies(count):
    if not count:
        return (
            jsonify(
                {"success": False, "message": "Thiếu thông tin cần thiết để truy vấn"}
            ),
            400,
        )
    try:
        movies = (
            db.session.query(Movies)
            .order_by(Movies.CreatedAt.desc())
            .limit(count)
            .all()
        )
        return (
            jsonify({"success": True, "movies": [movie.to_dict() for movie in movies]}),
            200,
        )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
