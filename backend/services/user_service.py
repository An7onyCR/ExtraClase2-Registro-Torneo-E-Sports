from models.user import teams

def add_team(name, players):
    team = {"name": name, "players": players}
    teams.append(team)
    return team

def get_teams():
    return teams

