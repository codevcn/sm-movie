from models.movies import Movies
from models.genres import Genres
from models.movie_genres import MovieGenres
from models.countries import Countries
from models.watch_history import WatchHistory
from models.episodes import Episodes
from models.favorite_list import FavoriteList
from models.rating import Rating
import os
from configs.db_connect import db
import pandas as pd

from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import NearestNeighbors

from sqlalchemy.orm import aliased
import numpy as np
from sqlalchemy.orm import joinedload
import joblib
from flask import request, jsonify


def train_knn_model():
    try:
        # Lấy thông tin phim và thể loại
        movies_with_genres = (
            db.session.query(Movies)
            .options(joinedload(Movies.Genres))  # Tải trước các thể loại của phim
            .all()
        )
        # Chuẩn bị dữ liệu cho DataFrame
        result = []
        for movie in movies_with_genres:
            genre_ids = [genre.GenreId for genre in movie.Genres]
            result.append(
                {
                    "Id": movie.Id,
                    "Type": movie.Type,
                    "CountryId": movie.CountryId,
                    "GenreIds": genre_ids,
                    "Language": movie.Language,
                    "ReleaseDate": movie.ReleaseDate,
                }
            )
        df = pd.DataFrame(result)

        # Lấy danh sách các GenreIds, CountryIds và Languages duy nhất
        all_genre_ids = [genre.Id for genre in db.session.query(Genres.Id).all()]
        all_country_ids = [
            country.Id for country in db.session.query(Countries.Id).all()
        ]
        all_languages = {
            movie.Language for movie in movies_with_genres if movie.Language
        }

        # Mã hóa ngôn ngữ với One-Hot Encoding
        language_encoder = OneHotEncoder(sparse_output=False)
        language_encoded = language_encoder.fit_transform(
            np.array(list(all_languages)).reshape(-1, 1)
        )

        # Mã hóa Type với One-Hot Encoding
        type_encoder = OneHotEncoder(sparse_output=False)
        type_encoded = type_encoder.fit_transform(df[["Type"]])

        # Xây dựng vector đặc trưng cho mỗi bộ phim
        movie_vectors = []
        movie_ids = []
        for movie, type_vector in zip(movies_with_genres, type_encoded):
            movie_vector = [0] * len(all_genre_ids)  # Vector cho thể loại
            # Gán giá trị 1 cho các thể loại của bộ phim
            for genre in movie.Genres:
                genre_index = all_genre_ids.index(genre.GenreId)
                movie_vector[genre_index] = 1

            # Thêm thông tin về CountryId vào vector
            country_index = (
                all_country_ids.index(movie.CountryId) if movie.CountryId else -1
            )
            movie_vector.append(country_index)

            # Thêm thông tin về Language vào vector (One-Hot Encoding)
            language_index = (
                list(all_languages).index(movie.Language)
                if movie.Language in all_languages
                else list(all_languages).index("Unknown")
            )
            movie_vector.extend(
                language_encoded[language_index]
            )  # Gán vector One-Hot cho ngôn ngữ

            # Thêm thông tin về Type vào vector (One-Hot Encoding)
            movie_vector.extend(type_vector)

            # Thêm thông tin về ReleaseYear vào vector (Chỉ lấy năm)
            movie_vector.append(movie.ReleaseDate.year)

            # Lưu lại vector và ID phim
            movie_vectors.append(movie_vector)
            movie_ids.append(movie.Id)

        # Huấn luyện mô hình

        n_neighbors = 10
        knn = NearestNeighbors(n_neighbors=n_neighbors, metric="cosine")
        knn.fit(movie_vectors)

        # Lưu mô hình Knn và vector
        joblib.dump(knn, "src/storage/models/knn_model.pkl")
        joblib.dump(movie_vectors, "src/storage/models/movie_vectors.pkl")
        joblib.dump(movie_ids, "src/storage/models/movie_ids.pkl")
    except Exception as e:
        print(f"Error connecting to the database: {e}")


def predict_knn(user_id, n_neighbors=10):
    session = db.session

    # Lấy danh sách id phim người dùng đã xem
    movie_alias = aliased(Movies)
    watched_movies = (
        session.query(Movies.Id)
        .join(Episodes, Movies.Id == Episodes.MovieId)
        .join(WatchHistory, Episodes.Id == WatchHistory.EpisodeId)
        .filter(WatchHistory.UserId == user_id)
        .distinct()  # Loại bỏ phim trùng
        .all()
    )
    watched_movies = list([movie.Id for movie in watched_movies])
    # Lấy danh sách id phim người dùng đã yêu thích
    favorite_movie_ids = (
        session.query(FavoriteList.MovieId).filter(FavoriteList.UserId == user_id).all()
    )
    favorite_movie_ids = list([movie_id[0] for movie_id in favorite_movie_ids])

    # Lọc các phần tử trùng lặp
    merged_unique = list(set(watched_movies + favorite_movie_ids))

    if len(merged_unique) == 0:
        return jsonify({"success": True, "data": []}), 200

    try:
        # Nạp mô hình KNN và các vectors đã lưu
        knn = joblib.load("src/storage/models/knn_model.pkl")
        movie_vectors = joblib.load("src/storage/models/movie_vectors.pkl")
        movie_ids = joblib.load("src/storage/models/movie_ids.pkl")

        result = []
        for movie_id in merged_unique:
            if movie_id in movie_ids:
                movie_id_to_predict = movie_ids.index(movie_id)
                movie_vector_to_predict = movie_vectors[movie_id_to_predict]
                distances, indices = knn.kneighbors([movie_vector_to_predict])
                for i, idx in enumerate(indices[0]):
                    similar_movie_id = movie_ids[idx]
                    distance = distances[0][i]
                    result.append((similar_movie_id, distance))

        sorted_data = sorted(result, key=lambda x: x[1])
        # Loại bỏ các tuple có giá trị phần tử đầu tiên bị trùng
        unique_data = []
        seen_indices = set()
        for item in sorted_data:
            if item[0] not in seen_indices:
                unique_data.append(item)
                seen_indices.add(item[0])
        filtered = [item[0] for item in unique_data if item[0] not in merged_unique]

        filtered = filtered[: len(filtered) // 2]

        return predict_rating(user_id, filtered)
    except Exception as e:
        print(f"Error in prediction: {e}")
        return []


from surprise import Dataset
from surprise import Reader
from surprise import SVD


def train_svd_model():
    ratings_query = db.session.query(Rating.UserId, Rating.MovieId, Rating.Rating).all()
    training_data = [
        (rating.UserId, rating.MovieId, rating.Rating) for rating in ratings_query
    ]
    df = pd.DataFrame(training_data, columns=["UserId", "MovieId", "Rating"])

    # Tạo một Reader để đọc dữ liệu từ DataFrame
    reader = Reader(
        rating_scale=(1, 5)
    )  # Điều chỉnh theo phạm vi rating của bạn (1 đến 5)
    # Chuyển DataFrame thành Dataset
    data = Dataset.load_from_df(df, reader)
    # Tạo bộ dữ liệu cho mô hình
    trainset = data.build_full_trainset()

    # Tạo mô hình SVD
    svd_model = SVD()
    svd_model.fit(trainset)
    joblib.dump(svd_model, "src/storage/models/svd_model.pkl")


from sqlalchemy import case
from sqlalchemy import func, desc


def predict_rating(user_id, list_movieId):
    # Dự đoán rating cho người dùng với bộ phim
    svd_model = joblib.load("src/storage/models/svd_model.pkl")
    result = []
    for movie_id in list_movieId:
        prediction = svd_model.predict(user_id, movie_id)
        result.append((movie_id, prediction.est))

    sorted_arr = sorted(result, key=lambda x: x[1], reverse=True)

    print(sorted_arr)
    res = []
    # Lấy tối đa 6 bộ phim đầu tiên, nếu ít hơn thì lấy số lượng có sẵn
    top_movies = sorted_arr[:6]

    for id, est in top_movies:
        movie = (
            db.session.query(
                Movies, func.round(func.avg(Rating.Rating), 1).label("AverageRating")
            )
            .join(Rating, Movies.Id == Rating.MovieId)
            .filter(Movies.Id == id)
            .group_by(Movies.Id)
            .first()
        )
        if movie:
            movie_data = movie[0].to_dict()  # movie[0] là đối tượng Movie
            movie_data["rating"] = movie[
                1
            ]  # movie[1] là giá trị trung bình của rating_value
            res.append(movie_data)
    return jsonify({"success": True, "data": res}), 200
