from flask import request, jsonify
from models.favorite_list import FavoriteList
from models.movies import Movies
from models.rating import Rating
from configs.db_connect import db
from sqlalchemy import desc


# Lấy danh sách ID phim yêu thích của người dùng
def get_list_favorites_movie(user_id):
    try:
        favorites = FavoriteList.query.filter_by(UserId=user_id).all()
        list_favorite_movie = [favorite.MovieId for favorite in favorites]
        return jsonify({"success": True, "data": list_favorite_movie}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Thêm hoặc xóa phim yêu thích
def add_favorites_movie():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        movie_id = data.get("movie_id")

        if not user_id or not movie_id:
            return (
                jsonify({"success": False, "message": "Missing user_id or movie_id"}),
                400,
            )

        favorite = FavoriteList.query.filter_by(
            UserId=user_id, MovieId=movie_id
        ).first()

        if favorite:
            # Xóa phim khỏi danh sách yêu thích
            db.session.delete(favorite)
            db.session.commit()
            return jsonify({"success": True, "message": "Đã bỏ yêu thích phim"}), 200
        else:
            # Thêm phim vào danh sách yêu thích
            new_favorite = FavoriteList(UserId=user_id, MovieId=movie_id)
            db.session.add(new_favorite)
            db.session.commit()
            return (
                jsonify(
                    {"success": True, "message": "Đã thêm phim yêu thích thành công"}
                ),
                200,
            )
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Lấy danh sách phim yêu thích của người dùng với thông tin chi tiết
def get_user_movie_favorites(user_id):
    try:
        favorites = (
            FavoriteList.query.filter_by(UserId=user_id)
            .order_by(desc(FavoriteList.CreatedAt))
            .all()
        )
        fav_movies = Movies.query.filter(
            Movies.Id.in_([fav.MovieId for fav in favorites])
        ).all()
        movies = []
        for fav in fav_movies:
            rating = Rating.query.filter_by(UserId=user_id, MovieId=fav.Id).first()
            real_rating = 0
            if rating:
                real_rating = rating.to_dict()["Rating"]
            movies.append({**fav.to_dict(), "Rating": real_rating})
        return jsonify({"success": True, "movies": movies}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
