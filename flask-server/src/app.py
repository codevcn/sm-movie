from dotenv import load_dotenv

# Tải các biến môi trường
load_dotenv()

from flask import Flask
from flask_cors import CORS
from configs.db_connect import init_db_connection
from configs.init_cloudinary import connect_cloudinary

# Khởi tạo bảng trong csdl
from models.users import Users
from models.movies import Movies
from models.episodes import Episodes
from models.genres import Genres
from models.movie_genres import MovieGenres
from models.countries import Countries
from models.comments import Comments
from models.favorite_list import FavoriteList
from models.rating import Rating
from models.watch_history import WatchHistory

from routes.episode import register_video_routes
from routes.user import register_user_routes
from routes.auth import register_auth_routes
from routes.comment import register_comment_routes
from routes.genres import register_genre_routes
from routes.movie import register_movie_routes
from routes.country import register_country_routes

from services.train_model import (train_knn_model,predict_knn,train_svd_model)

def create_app():
    app = Flask(__name__)

    # Khởi tạo thư viện kết nối tới csdl
    init_db_connection(app)

    # Khởi tạo kết nối tới cloudinary
    connect_cloudinary()

    # Thiết lập CORS
    CORS(
        app,
        origins="http://localhost:3000",
    )

    # Thiết lập routes
    register_video_routes(app)
    register_user_routes(app)
    register_auth_routes(app)
    register_comment_routes(app)
    register_genre_routes(app)
    register_movie_routes(app)
    register_country_routes(app)
    with app.app_context():
        train_knn_model()
        train_svd_model()
        
    return app


if __name__ == "__main__":
    app = create_app()
    
    app.run(debug=True, port=8888)
    
