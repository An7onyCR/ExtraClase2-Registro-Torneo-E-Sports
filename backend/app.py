from flask import Flask
from flask_cors import CORS
from views.user_view import user_blueprint

app = Flask(__name__)
CORS(app)

# Registrar las rutas de la vista
app.register_blueprint(user_blueprint)

if __name__ == "__main__":
    app.run(debug=True)
