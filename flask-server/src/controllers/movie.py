from flask import request, jsonify
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_
from configs.db_connect import db
from models.movies import Movies
from models.comments import Comments
from models.favorite_list import FavoriteList
from models.watch_history import WatchHistory
from datetime import datetime, timedelta


def create():
    try:
        data = request.get_json()
        data["genres"] = [str(genre) for genre in data.get("genres", [])]
        movie = Movies(**data)
        db.session.add(movie)
        db.session.commit()
        return jsonify({"success": True, "message": "Thêm phim thành công"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


def update(movie_id):
    try:
        movie = Movies.query.get(movie_id)
        if movie:
            data = request.get_json()
            for key, value in data.items():
                setattr(movie, key, value)
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
                        "message": "Không tìm thấy trang hoặc yêu cầu!",
                    }
                ),
                404,
            )
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


def update_viewed(slug):
    try:
        movie = Movies.query.filter_by(Slug=slug).first()
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
            db.session.delete(movie)
            db.session.commit()

            # Xóa liên quan
            Comments.query.filter_by(MovieId=movie_id).delete()
            FavoriteList.query.filter_by(MovieId=movie_id).delete()
            WatchHistory.query.filter_by(MovieId=movie_id).delete()
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

        count_documents = query.count()
        movies = (
            query.order_by(Movies.ReleaseDate.desc())
            .offset((curr_page - 1) * limit)
            .limit(limit)
            .all()
        )

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


def get_movie_detail(slug):
    try:
        movie = Movies.query.filter_by(Slug=slug).first()
        if movie:
            return jsonify({"success": True, "data": movie.to_dict()}), 200
        else:
            return (
                jsonify(
                    {"success": False, "message": "Không tìm thấy trang hoặc yêu cầu"}
                ),
                404,
            )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_movies_by_category(category, type):
    try:
        limit = 20
        curr_page = int(request.args.get("page", 1))
        query = Movies.query.filter(Movies.Type == category)

        if type == "top_rated":
            query = query.filter(Movies.IbmPoints >= 6.5).order_by(
                Movies.IbmPoints.desc()
            )
        elif type == "popular":
            query = query.filter(Movies.Viewed >= 10).order_by(Movies.Viewed.desc())
        elif type == "upcoming":
            date = datetime.now() - timedelta(days=60)
            query = query.filter(Movies.ReleaseDate >= date).order_by(
                Movies.ReleaseDate.desc()
            )

        count_documents = query.count()
        movies = query.offset((curr_page - 1) * limit).limit(limit).all()

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


def get_genres_by_id(genre_id):
    try:
        movies = (
            Movies.query.filter(
                or_(Movies.Genres.any(genre_id), Movies.Genres.any(str(genre_id)))
            )
            .order_by(Movies.IbmPoints.desc())
            .all()
        )
        return (
            jsonify({"success": True, "data": [movie.to_dict() for movie in movies]}),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_similar_movies(slug):
    try:
        movie = Movies.query.filter_by(Slug=slug).first()
        if not movie:
            return jsonify({"success": False, "message": "Không tìm thấy phim"}), 404

        similar_movies = Movies.query.filter(
            Movies.Type == movie.Type,
            Movies.Genres.overlap(movie.Genres),
            Movies.Slug != slug,
        ).all()

        return (
            jsonify(
                {
                    "success": True,
                    "data": [similar.to_dict() for similar in similar_movies],
                }
            ),
            200,
        )
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500


def get_movies_by_month():
    try:
        now = datetime.now()
        first_date_of_month = datetime(now.year, now.month, 1)
        last_date_of_month = datetime(now.year, now.month + 1, 1) - timedelta(days=1)

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
        first_date_of_month = datetime(now.year, now.month, 1)
        last_date_of_month = datetime(now.year, now.month + 1, 1) - timedelta(days=1)

        count = Movies.query.filter(
            Movies.CreatedAt.between(first_date_of_month, last_date_of_month)
        ).count()

        return jsonify({"success": True, "data": count}), 200
    except SQLAlchemyError as e:
        return jsonify({"success": False, "message": str(e)}), 500
