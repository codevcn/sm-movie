from sqlalchemy import Column, Integer, DateTime, func, ForeignKey
from configs.db_connect import db
from sqlalchemy.orm import relationship


class Rating(db.Model):
    __tablename__ = "Rating"

    UserId = Column(
        Integer, ForeignKey("Users.Id"), nullable=False, primary_key=True
    )  # Trường `UserId`, không được để trống
    MovieId = Column(
        Integer, ForeignKey("Movies.Id"), nullable=False, primary_key=True
    )  # Trường `MovieId`, không được để trống
    Rating = Column(Integer, nullable=False)  # Trường `MovieId`, không được để trống
    CreatedAt = Column(
        DateTime, nullable=False, server_default=func.now()
    )  # Trường `CreatedAt`, mặc định là thời gian hiện tại

    User = relationship("Users", back_populates="Ratings")
    Movie = relationship("Movies", back_populates="Ratings")

    def __repr__(self):
        return f"<Rating(Rating={self.Rating},UserId={self.UserId},MovieId={self.MovieId})>"

    def to_dict(self):
        return {
            "UserId": self.UserId,
            "MovieId": self.MovieId,
            "Rating": self.Rating,
            "CreatedAt": self.CreatedAt,
        }
