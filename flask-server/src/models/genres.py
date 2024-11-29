from sqlalchemy import Column, Integer, String
from configs.db_connect import db
from sqlalchemy.orm import relationship


class Genres(db.Model):
    __tablename__ = "Genres"

    Id = Column(
        Integer, primary_key=True, autoincrement=True
    )  # Tạo khóa chính tự động tăng
    Name = Column(String(255), nullable=False)  # Trường `Name`, không được để trống

    Movies = relationship("MovieGenres", back_populates="Genre", lazy="dynamic")

    def __repr__(self):
        return f"<Genres(Name={self.Name})>"

    def to_dict(self):
        return {
            "Id": self.Id,
            "Name": self.Name,
            "Movies": [
                movie.MovieId for movie in self.Movies
            ],  # Lấy danh sách các MovieId từ quan hệ MovieGenres
        }
