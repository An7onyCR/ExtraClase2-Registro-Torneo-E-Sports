from flask import Blueprint
from controllers.user_controller import add_team_controller, get_teams_controller

user_blueprint = Blueprint('user_routes', __name__)

@user_blueprint.route("/add_team", methods=["POST"])
def add_team():
    return add_team_controller()

@user_blueprint.route("/get_teams", methods=["GET"])
def get_teams():
    return get_teams_controller()

