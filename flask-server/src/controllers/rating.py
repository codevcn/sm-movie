from models.rating import Rating
from flask import request, jsonify
from configs.db_connect import db
from services.train_model import (train_knn_model,predict_knn,train_svd_model)

def user_rate_movie():
    try:
        payload = request.get_json()
        movie_id = payload.get("movie_id", None)
        user_id = payload.get("user_id", None)
        rating = payload.get("rating", None)
        old_rating = Rating.query.filter_by(UserId=user_id, MovieId=movie_id).first()
        if old_rating:
            old_rating.Rating = rating
        else:
            new_rating = Rating(UserId=user_id, MovieId=movie_id, Rating=rating)
            db.session.add(new_rating)
        train_svd_model()
        print("reTrain success!!!")
        db.session.commit()
        
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Đánh giá phim thành công",
                }
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500


def get_rating():
    try:
        payload = request.get_json()
        movie_id = payload.get("movie_id", None)
        user_id = payload.get("user_id", None)
        rating = Rating.query.filter_by(UserId=user_id, MovieId=movie_id).first()
        return (
            jsonify(
                {
                    "success": True,
                    "rating": rating.to_dict() if rating else 0,
                    "message": "Đánh giá phim thành công",
                }
            ),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
