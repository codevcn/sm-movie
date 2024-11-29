from sqlalchemy import Column, Integer, DateTime, func, ForeignKey
from configs.db_connect import db
from sqlalchemy.orm import relationship


class FavoriteList(db.Model):
    __tablename__ = "FavoriteList"

    UserId = Column(
        Integer, ForeignKey("Users.Id"), nullable=False, primary_key=True
    )  # Trường `UserId`, không được để trống
    MovieId = Column(
        Integer, ForeignKey("Movies.Id"), nullable=False, primary_key=True
    )  # Trường `MovieId`, không được để trống
    CreatedAt = Column(
        DateTime, nullable=False, server_default=func.now()
    )  # Trường `CreatedAt`, mặc định là thời gian hiện tại

    User = relationship("Users", back_populates="Favorites", uselist=False)
    Movie = relationship("Movies", back_populates="FavoritesByUser", uselist=False)

    def __repr__(self):
        return f"<FavoriteList(UserId={self.UserId},MovieId={self.MovieId})>"

    def to_dict(self):
        return {
            "UserId": self.UserId,
            "MovieId": self.MovieId,
            "CreatedAt": (
                self.CreatedAt.isoformat() if self.CreatedAt else None
            ),  # Chuyển đổi datetime thành chuỗi ISO 8601
        }
