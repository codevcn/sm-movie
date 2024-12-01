from sqlalchemy import Column, Integer, Time, DateTime, func, ForeignKey
from configs.db_connect import db
from sqlalchemy.orm import relationship


class WatchHistory(db.Model):
    __tablename__ = "WatchHistory"

    UserId = Column(
        Integer, ForeignKey("Users.Id"), nullable=False, primary_key=True
    )  # Trường `UserId`, không được để trống
    EpisodeId = Column(
        Integer, ForeignKey("Episodes.Id"), nullable=False, primary_key=True
    )  # Trường `EpisodeId`, không được để trống
    ProgressTime = Column(Time, nullable=False)  # Trường `ProgressTime`, kiểu thời gian
    CreatedAt = Column(
        DateTime, nullable=False, server_default=func.now()
    )  # Trường `CreatedAt`, mặc định là thời gian hiện tại
    UpdatedAt = Column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )  # Trường `UpdatedAt`, cập nhật tự động

    User = relationship("Users", back_populates="WatchHistories", lazy="select")
    Episode = relationship("Episodes", back_populates="WatchHistories", lazy="select")

    def __repr__(self):
        return f"<WatchHistory(UserId={self.UserId}, EpisodeId={self.EpisodeId}, ProgressTime={self.ProgressTime})>"

    def to_dict(self):
        return {
            "UserId": self.UserId,
            "EpisodeId": self.EpisodeId,
            "ProgressTime": str(self.ProgressTime),  # Chuyển thời gian thành chuỗi
            "CreatedAt": (
                self.CreatedAt.isoformat() if self.CreatedAt else None
            ),  # Định dạng ISO 8601
            "UpdatedAt": (
                self.UpdatedAt.isoformat() if self.UpdatedAt else None
            ),  # Định dạng ISO 8601
        }
