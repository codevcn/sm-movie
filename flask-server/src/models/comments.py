from sqlalchemy import Column, Integer, DateTime, func, String, ForeignKey
from configs.db_connect import db
from sqlalchemy.orm import relationship


class Comments(db.Model):
    __tablename__ = "Comments"

    Id = Column(
        Integer, primary_key=True, autoincrement=True
    )  # Tạo khóa chính tự động tăng
    UserId = Column(
        Integer, ForeignKey("Users.Id"), nullable=False
    )  # Trường `UserId`, không được để trống
    MovieId = Column(
        Integer, ForeignKey("Movies.Id"), nullable=False, primary_key=True
    )  # Trường `MovieId`, không được để trống
    Content = Column(
        String(255), nullable=False
    )  # Trường `Content`, không được để trống
    CreatedAt = Column(
        DateTime, nullable=False, server_default=func.now()
    )  # Trường `CreatedAt`, mặc định là thời gian hiện tại

    User = relationship("Users", back_populates="Comments")
    Movie = relationship("Movies", back_populates="Comments")

    def __repr__(self):
        return f"<Comments(UserId={self.UserId},MovieId={self.MovieId}),Content={self.Content}>"

    def to_dict(self):
        return {
            "Id": self.Id,
            "UserId": self.UserId,
            "MovieId": self.MovieId,
            "Content": self.Content,
            "CreatedAt": (
                self.CreatedAt.isoformat() if self.CreatedAt else None
            ),  # Chuyển đổi datetime thành chuỗi ISO 8601
        }
