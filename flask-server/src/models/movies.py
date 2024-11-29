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
    IbmPoints = Column(Float, nullable=False, default=2.9)
    CountryId = Column(
        Integer, ForeignKey("Countries.Id"), nullable=True
    )  # ID quốc gia (có thể rỗng)
    Language = Column(String(255), nullable=True)  # Ngôn ngữ (có thể rỗng)
    Overview = Column(String(255), nullable=True)  # Tóm tắt (có thể rỗng)
    Viewed = Column(Integer, nullable=True)  # Số lượt xem (có thể rỗng)
    CreatedAt = Column(DateTime, nullable=True)  # Ngày tạo (có thể rỗng)
    Slug = Column(String(255), nullable=False)  # Slug của phim

    Country = relationship("Countries", back_populates="Movies", uselist=False)
    Genres = relationship("MovieGenres", back_populates="Movie", lazy="dynamic")
    Comments = relationship("Comments", back_populates="Movie", lazy="dynamic")
    Episodes = relationship("Episodes", back_populates="Movie", lazy="dynamic")
    FavoritesByUser = relationship(
        "FavoriteList", back_populates="Movie", lazy="dynamic"
    ) 
    Ratings = relationship("Rating", back_populates="Movie", lazy="dynamic")

    def __repr__(self):
        return (
            f"<Movies(id='{self.Id}', Name='{self.Name}', Type='{self.Type}', "
            f"ReleaseDate='{self.ReleaseDate}')>"
        )

    def to_dict(self):
        return {
            "Id": self.Id,
            "Name": self.Name,
            "PosterPath": self.PosterPath,
            "Type": self.Type,
            "TotalEpisodes": self.TotalEpisodes,
            "ReleaseDate": self.ReleaseDate,
            "IbmPoints": self.IbmPoints,
            "Country": self.Country,
            "Language": self.Language,
            "Overview": self.Overview,
            "Viewed": self.Viewed,
            "CreatedAt": self.CreatedAt,
            "Slug": self.Slug,
            "Genres": [
                genre.to_dict() for genre in self.Genres
            ],  # Nếu có mối quan hệ với genres, gọi to_dict của các genres
        }
