from controllers.episode import upload_episode, get_all_episodes, get_ep_data

from flask import Blueprint, Flask


def register_video_routes(app: Flask):
    # Create a Blueprint for API routes
    api_blueprint = Blueprint("episode", __name__, url_prefix="/api/episode")

    # Define API routes
    api_blueprint.add_url_rule("/upload", view_func=upload_episode, methods=["POST"])
    api_blueprint.add_url_rule(
        "/get-all/<string:movie_id>", view_func=get_all_episodes, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-ep-data/<string:movie_id>/<string:ep_num>",
        view_func=get_ep_data,
        methods=["GET"],
    )

    # Register Blueprint
    app.register_blueprint(api_blueprint)
