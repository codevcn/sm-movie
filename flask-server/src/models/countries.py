from sqlalchemy import Column, Integer, String
from configs.db_connect import db
from sqlalchemy.orm import relationship


class Countries(db.Model):
    __tablename__ = "Countries"

    Id = Column(
        Integer, primary_key=True, autoincrement=True
    )  # Tạo khóa chính tự động tăng
    Name = Column(String(255), nullable=False)  # Trường `Name`, không được để trống

    Movies = relationship("Movies", back_populates="Country")

    def __repr__(self):
        return f"<Countries(Name={self.Name})>"

    def to_dict(self):
        return {"Id": self.Id, "Name": self.Name}
