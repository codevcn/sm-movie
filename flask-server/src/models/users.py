from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from configs.db_connect import db
from sqlalchemy.orm import relationship


class Users(db.Model):
    __tablename__ = "Users"

    Id = Column(Integer, primary_key=True, autoincrement=True)  # ID tự tăng
    Name = Column(String(255), nullable=False)  # Bắt buộc, giới hạn 255 ký tự
    Email = Column(
        String(255), nullable=False, unique=True
    )  # Bắt buộc, duy nhất, giới hạn 255 ký tự
    Password = Column(String(255), nullable=False)  # Bắt buộc
    Avatar = Column(String(255), nullable=True)  # Không bắt buộc
    IsAdmin = Column(Boolean, default=False)  # Mặc định là False
    IsActive = Column(Boolean, default=False)  # Mặc định là False
    CreatedAt = Column(
        DateTime, nullable=True, server_default=func.now()
    )  # Ngày tạo (có thể rỗng)

    Comments = relationship("Comments", back_populates="User", lazy="select")
    Favorites = relationship("FavoriteList", back_populates="User", lazy="select")
    Ratings = relationship("Rating", back_populates="User", lazy="select")
    WatchHistories = relationship("WatchHistory", back_populates="User", lazy="select")

    def __repr__(self):
        return f"<Users(Id={self.Id}, Name='{self.Name}', Email='{self.Email}')>"

    def to_dict(self):
        return {
            "Id": self.Id,
            "Name": self.Name,
            "Email": self.Email,
            "Avatar": self.Avatar,
            "IsAdmin": self.IsAdmin,
            "IsActive": self.IsActive,
            "CreatedAt": self.CreatedAt,
        }
