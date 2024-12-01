from sqlalchemy import Column, Integer, ForeignKey
from configs.db_connect import db
from sqlalchemy.orm import relationship


class MovieGenres(db.Model):
    __tablename__ = "MovieGenres"

    GenreId = Column(
        Integer,
        ForeignKey("Genres.Id"),
        nullable=False,
        primary_key=True,
    )  # Trường `UserId`, không được để trống
    MovieId = Column(
        Integer, ForeignKey("Movies.Id"), nullable=False, primary_key=True
    )  # Trường `MovieId`, không được để trống

    Movie = relationship("Movies", back_populates="Genres", lazy="select")
    Genre = relationship("Genres", back_populates="Movies", lazy="select")

    def __repr__(self):
        return f"<MovieGenres(GenreId={self.GenreId},MovieId={self.MovieId})>"

    def to_dict(self):
        return {
            "GenreId": self.GenreId,
            "MovieId": self.MovieId,
            "Movie": (
                self.Movie.to_dict() if self.Movie else None
            ),  # Nếu có Movie, gọi phương thức to_dict của nó
            "Genre": (
                self.Genre.to_dict() if self.Genre else None
            ),  # Nếu có Genre, gọi phương thức to_dict của nó
        }
