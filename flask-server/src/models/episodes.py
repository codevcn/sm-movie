from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from configs.db_connect import db
from sqlalchemy.orm import relationship


class Episodes(db.Model):
    __tablename__ = "Episodes"

    Id = Column(
        Integer, primary_key=True, autoincrement=True
    )  # Tạo khóa chính tự động tăng
    MovieId = Column(
        Integer, ForeignKey("Movies.Id"), nullable=False
    )  # Trường `MovieId`, không được để trống
    EpisodeNumber = Column(
        Integer, nullable=False
    )  # Trường `Name`, không được để trống
    Source = Column(String(255), nullable=False)  # Trường `Name`, không được để trống
    Duration = Column(DateTime, nullable=True)  # Không bắt buộc

    Movie = relationship("Movies", back_populates="Episodes", uselist=False)
    WatchHistories = relationship(
        "WatchHistory", back_populates="Episode", lazy="dynamic"
    )

    def __repr__(self):
        return f"<Episodes(MovieId={self.MovieId},EpisodeNumber={self.EpisodeNumber}),Source={self.Source},Duration={self.Duration}>"

    def to_dict(self):
        return {
            "Id": self.Id,
            "MovieId": self.MovieId,
            "EpisodeNumber": self.EpisodeNumber,
            "Source": self.Source,
            "Duration": (
                self.Duration.isoformat() if self.Duration else None
            ),  # Chuyển đổi datetime thành chuỗi ISO 8601
        }
