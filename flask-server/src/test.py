from dotenv import load_dotenv
from configs.db_connect import init_db_connection
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
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
import numpy as np
from sqlalchemy.orm import joinedload

# Tải các biến môi trường
load_dotenv()

# Khởi tạo kết nối tới CSDL
DATABASE_URI = f'mysql+mysqlconnector://{os.getenv("DB_USER")}:{os.getenv("DB_PASSWORD")}@{os.getenv("DB_HOST")}/{os.getenv("DB_NAME")}'
engine = create_engine(DATABASE_URI)
Session = sessionmaker(bind=engine)
session = Session()

# Lấy thông tin phim và thể loại
movies_with_genres = (
    session.query(Movies)
    .options(joinedload(Movies.Genres))  # Tải trước các thể loại của phim
    .all()
)

# Chuẩn bị dữ liệu cho DataFrame
result = []
for movie in movies_with_genres:
    genre_ids = [genre.GenreId for genre in movie.Genres]
    result.append({
        "Id": movie.Id,
        "Type": movie.Type,
        "CountryId": movie.CountryId,
        "GenreIds": genre_ids,
        "Language": movie.Language,
        "ReleaseDate": movie.ReleaseDate,
    })

df = pd.DataFrame(result)

# Lấy danh sách các GenreIds, CountryIds và Languages duy nhất
all_genre_ids = [genre.Id for genre in session.query(Genres.Id).all()]
all_country_ids = [country.Id for country in session.query(Countries.Id).all()]
all_languages = {movie.Language for movie in movies_with_genres if movie.Language}

# Mã hóa ngôn ngữ với One-Hot Encoding
language_encoder = OneHotEncoder(sparse_output=False)
language_encoded = language_encoder.fit_transform(np.array(list(all_languages)).reshape(-1, 1))

# Mã hóa Type với One-Hot Encoding
type_encoder = OneHotEncoder(sparse_output=False)
type_encoded = type_encoder.fit_transform(df[['Type']])

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
    country_index = all_country_ids.index(movie.CountryId) if movie.CountryId else -1
    movie_vector.append(country_index)
    
    # Thêm thông tin về Language vào vector (One-Hot Encoding)
    language_index = list(all_languages).index(movie.Language) if movie.Language in all_languages else list(all_languages).index("Unknown")
    movie_vector.extend(language_encoded[language_index])  # Gán vector One-Hot cho ngôn ngữ
    print(len(movie_vector))
    # Thêm thông tin về Type vào vector (One-Hot Encoding)
    movie_vector.extend(type_vector)
    print((type_vector))

    # Thêm thông tin về ReleaseYear vào vector
    movie_vector.append(movie.ReleaseDate.year)  # Hoặc df['ReleaseYear'] nếu bạn đã tính toán trước
    
    exit(0)
    # Lưu lại vector và ID phim
    movie_vectors.append(movie_vector)
    movie_ids.append(movie.Id)

from sklearn.neighbors import NearestNeighbors
knn = NearestNeighbors(n_neighbors=10, metric='cosine')  # 10 bộ phim giống nhất
knn.fit(movie_vectors)
import joblib
joblib.dump(knn, 'knn_model.pkl')
joblib.dump(movie_vectors, 'movie_vectors.pkl')


movie_id_to_predict = movie_ids[0]  # Chọn bộ phim có ID đầu tiên làm ví dụ
movie_vector_to_predict = movie_vectors[0] 
distances, indices = knn.kneighbors([movie_vector_to_predict])

# Hiển thị các bộ phim gần nhất (với ID và khoảng cách)
print(f"Bộ phim {movie_id_to_predict} tương tự nhất:")
for i, idx in enumerate(indices[0]):
    similar_movie_id = movie_ids[idx]
    distance = distances[0][i]
    print(f"ID phim: {similar_movie_id}, Khoảng cách: {distance}")