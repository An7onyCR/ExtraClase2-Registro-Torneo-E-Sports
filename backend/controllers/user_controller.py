from flask import request, jsonify
from services.user_service import add_team, get_teams

def add_team_controller():
    data = request.json
    team_name = data.get("name")
    players = data.get("players")

    if not team_name or not players:
        return jsonify({"message": "Datos incompletos"}), 400

    team = add_team(team_name, players)
    return jsonify({"message": f"Equipo {team_name} registrado.", "team": team}), 201

def get_teams_controller():
    return jsonify({"teams": get_teams()})
