from controllers.video import upload_video

from flask import Blueprint, Flask


def register_video_routes(app: Flask):
    # Create a Blueprint for API routes
    api_blueprint = Blueprint("video", __name__, url_prefix="/api/video")

    # Define API routes
    api_blueprint.add_url_rule("/upload", view_func=upload_video, methods=["POST"])

    # Register Blueprint
    app.register_blueprint(api_blueprint)
