from sqlalchemy import Column, String, Integer, Date, DateTime, Float, Enum, ForeignKey
from configs.db_connect import db
from sqlalchemy.orm import relationship


class Movies(db.Model):
    __tablename__ = "Movies"

    Id = Column(Integer, primary_key=True, autoincrement=True)  # ID (bắt buộc)
    Name = Column(String(255), nullable=False)  # Tên (bắt buộc)
    PosterPath = Column(String(255), nullable=False)  # Đường dẫn poster (bắt buộc)
    Type = Column(Enum("MOVIE", "SERIES"), nullable=False)  # Enum (MOVIE, SERIES)
    TotalEpisodes = Column(
        Integer, nullable=False, default=0
    )  # Tổng số tập, mặc định 0
    ReleaseDate = Column(Date, nullable=True)  # Ngày phát hành (có thể rỗng)
    CountryId = Column(
        Integer, ForeignKey("Countries.Id"), nullable=True
    )  # ID quốc gia (có thể rỗng)
    Language = Column(String(255), nullable=True)  # Ngôn ngữ (có thể rỗng)
    Overview = Column(String(255), nullable=True)  # Tóm tắt (có thể rỗng)
    Viewed = Column(Integer, nullable=True)  # Số lượt xem (có thể rỗng)
    CreatedAt = Column(DateTime, nullable=True)  # Ngày tạo (có thể rỗng)

    Country = relationship("Countries", back_populates="Movies", lazy="select")
    Genres = relationship("MovieGenres", back_populates="Movie", lazy="select")
    Comments = relationship("Comments", back_populates="Movie", lazy="select")
    Episodes = relationship("Episodes", back_populates="Movie", lazy="select")
    FavoritesByUser = relationship(
        "FavoriteList", back_populates="Movie", lazy="select"
    )
    Ratings = relationship("Rating", back_populates="Movie", lazy="select")

    def __repr__(self):
        return (
            f"<Movies(id='{self.Id}', Name='{self.Name}', Type='{self.Type}', "
            f"ReleaseDate='{self.ReleaseDate}')>"
        )

    def to_dict(self):
        print(">>> genres:", self.Genres)
        return {
            "Id": self.Id,
            "Name": self.Name,
            "PosterPath": self.PosterPath,
            "Type": self.Type,
            "TotalEpisodes": self.TotalEpisodes,
            "ReleaseDate": self.ReleaseDate,
            "Country": self.Country.to_dict(),
            "Language": self.Language,
            "Overview": self.Overview,
            "Viewed": self.Viewed,
            "CreatedAt": self.CreatedAt,
            "Genres": [
                genre.to_dict() for genre in self.Genres
            ],  # Nếu có mối quan hệ với genres, gọi to_dict của các genres
        }
