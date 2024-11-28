import os
from flask_sqlalchemy import SQLAlchemy
from flask import Flask

db = SQLAlchemy()


class DBConnect:
    SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


def init_db_connection(app: Flask):
    app.config.from_object(DBConnect)
    db.init_app(app)

    # Tạo bảng csdl nếu chưa có
    with app.app_context():
        db.create_all()
