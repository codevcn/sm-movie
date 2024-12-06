import os
import pickle
from flask import request, jsonify
from sqlalchemy.orm import joinedload
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder
from models.movies import Movies
from models.genres import Genres
from models.countries import Countries
from models.movie_genres import MovieGenres
from configs.db_connect import db
import numpy as np
# Đường dẫn lưu model
MODEL_DIR = "../storage/models/"
KNN_MODEL_PATH = os.path.join(MODEL_DIR, "knn_model.pkl")
def train_knn_model():
    movies_with_genres = (
        db.session.query(Movies)
        .options(joinedload(Movies.Genres))  # Tải trước các thể loại của phim
        .all()
    )

    # Tạo danh sách kết quả với các thông tin phim kèm danh sách ID thể loại
    result = []
    for movie in movies_with_genres:
        print(movie.Genres)
        genre_ids = [genre.GenreId for genre in movie.Genres]  # Lấy danh sách ID thể loại
        result.append({
            "Id": movie.Id,
            "Name": movie.Name,
            "Type": movie.Type,
            "ReleaseDate": movie.ReleaseDate,
            "CountryId": movie.CountryId,
            "Language": movie.Language,
            "GenreIds": genre_ids,  # Danh sách ID thể loại
        })
    all_genre_ids = db.session.query(Genres.Id).all()
    all_genre_ids = [genre.Id for genre in all_genre_ids]

    all_country_ids = db.session.query(Countries.Id).all()
    all_country_ids = [country.Id for country in all_country_ids]
    # Lấy danh sách tất cả ngôn ngữ (language) duy nhất
    all_languages = {movie.Language for movie in movies_with_genres if movie.Language}  # Ngôn ngữ duy nhất

    # Thêm "Unknown" để xử lý giá trị ngôn ngữ mới
    all_languages.add("Unknown")
    encoder = OneHotEncoder(sparse_output=False)
    language_encoded = encoder.fit_transform(np.array(list(all_languages)).reshape(-1, 1))
    # Xây dựng vector đặc trưng cho từng bộ phim
    movie_vectors = []
    movie_ids = []

    for movie in movies_with_genres:
        # Tạo một vector đặc trưng cho bộ phim với One-Hot Encoding cho thể loại
        movie_vector = [0] * len(all_genre_ids)

        # Gán giá trị 1 cho các thể loại mà bộ phim thuộc về
        for genre in movie.Genres:
            genre_index = all_genre_ids.index(genre.GenreId)
            movie_vector[genre_index] = 1

        # Thêm thông tin về CountryId vào vector (biến đổi thành giá trị số)
        country_index = all_country_ids.index(movie.CountryId) if movie.CountryId is not None else -1
        movie_vector.append(country_index)

        # Thêm thông tin về Language vào vector (dùng One-Hot Encoding)
        language_index = list(all_languages).index(movie.Language) if movie.Language in all_languages else list(all_languages).index("Unknown")
        movie_vector.extend(language_encoded[language_index])  # Gán vector One-Hot cho ngôn ngữ

        movie_vectors.append(movie_vector)
        movie_ids.append(movie.Id)
    # Chuyển đổi dữ liệu thành mảng numpy
    movie_vectors = np.array(movie_vectors)

    # # Sử dụng KNN để huấn luyện mô hình
    knn = NearestNeighbors(n_neighbors=10, metric='cosine')  # 10 bộ phim giống nhất
    knn.fit(movie_vectors)

    # Lưu mô hình KNN vào file
    with open('src/storage/models/knn_model.pkl', 'wb') as f:
        pickle.dump(knn, f)
    print(movie_vectors)

    return jsonify({"success": True, "data": []}), 200

def get_similar_movies(movie_id):
    print("KKK")
    # Đọc mô hình KNN đã lưu
    with open('src/storage/models/knn_model.pkl', 'rb') as f:
        knn = pickle.load(f)

    # Tìm bộ phim theo movie_id
    movie = db.session.query(Movies).filter(Movies.Id == movie_id).first()
    if not movie:
        return jsonify({"error": "Movie not found"}), 404

    # Tạo vector đặc trưng cho bộ phim cần tìm phim giống
    all_genre_ids = db.session.query(Genres.Id).all()
    all_genre_ids = [genre.Id for genre in all_genre_ids]
    all_country_ids = db.session.query(Countries.Id).all()
    all_country_ids = [country.Id for country in all_country_ids]
    all_languages = {movie.Language for movie in db.session.query(Movies).all()}
    all_languages.add("Unknown")
    
    encoder = OneHotEncoder(sparse_output=False)
    language_encoded = encoder.fit_transform(np.array(list(all_languages)).reshape(-1, 1))

    movie_vector = [0] * len(all_genre_ids)
    for genre in movie.Genres:
        genre_index = all_genre_ids.index(genre.GenreId)
        movie_vector[genre_index] = 1

    country_index = all_country_ids.index(movie.CountryId) if movie.CountryId is not None else -1
    movie_vector.append(country_index)

    language_index = list(all_languages).index(movie.Language) if movie.Language in all_languages else list(all_languages).index("Unknown")
    movie_vector.extend(language_encoded[language_index])

    # Lấy vector đặc trưng cho bộ phim cần tìm phim giống
    movie_vector = np.array(movie_vector).reshape(1, -1)

    # Chuyển đổi numpy.ndarray thành list để tránh lỗi
    movie_vector_list = movie_vector.tolist()

    # Sử dụng KNN để tìm 10 bộ phim giống nhất
    distances, indices = knn.kneighbors(movie_vector_list, n_neighbors=10)

    # Lấy các ID của những bộ phim giống nhất
    similar_movie_ids = [knn._fit_X[i] for i in indices.flatten()]
    # if isinstance(similar_movie_ids, np.ndarray):
    #     similar_movie_ids = similar_movie_ids.tolist()
    # # Trả về danh sách các bộ phim giống nhất
    # similar_movies = db.session.query(Movies).filter(Movies.Id.in_(similar_movie_ids)).all()
    # result = [{
    #     "Id": movie.Id,
    #     "Name": movie.Name,
    #     "Type": movie.Type,
    #     "ReleaseDate": movie.ReleaseDate,
    #     "CountryId": movie.CountryId,
    #     "Language": movie.Language,
    #     "Genres": [genre.Name for genre in movie.Genres]
    # } for movie in similar_movies]
    print(similar_movie_ids)
    return jsonify({"success": True, "data": similar_movie_ids}), 200