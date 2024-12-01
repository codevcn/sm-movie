from controllers.episode import upload_episode

from flask import Blueprint, Flask


def register_video_routes(app: Flask):
    # Create a Blueprint for API routes
    api_blueprint = Blueprint("episode", __name__, url_prefix="/api/episode")

    # Define API routes
    api_blueprint.add_url_rule("/upload", view_func=upload_episode, methods=["POST"])

    # Register Blueprint
    app.register_blueprint(api_blueprint)
