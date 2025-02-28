import random

def generate_bracket(team_names):
    random.shuffle(team_names)
    if len(team_names) % 2 != 0:
        team_names.append("BYE")

    bracket = []
    for i in range(0, len(team_names), 2):
        bracket.append((team_names[i], team_names[i + 1]))
    return bracket
