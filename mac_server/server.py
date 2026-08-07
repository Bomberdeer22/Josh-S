import flask
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pyautogui
import os
import socket

app = Flask(__name__, static_folder='static')
CORS(app)

# Disable pyautogui fail-safe (optional)
pyautogui.FAILSAFE = False

# Serve the frontend
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

# API Endpoints
@app.route('/move', methods=['POST'])
def move_mouse():
    data = request.json
    dx = data.get('dx', 0)
    dy = data.get('dy', 0)
    pyautogui.moveRel(dx, dy)
    return jsonify({"status": "success"})

@app.route('/click', methods=['POST'])
def click():
    data = request.json
    button = data.get('button', 'left')
    pyautogui.click(button=button)
    return jsonify({"status": "success"})

@app.route('/scroll', methods=['POST'])
def scroll():
    data = request.json
    amount = data.get('amount', 0)
    pyautogui.scroll(amount)
    return jsonify({"status": "success"})

@app.route('/type', methods=['POST'])
def type_text():
    data = request.json
    text = data.get('text', '')
    pyautogui.write(text)
    return jsonify({"status": "success"})

@app.route('/key', methods=['POST'])
def press_key():
    data = request.json
    key = data.get('key', '')
    if key:
        pyautogui.press(key)
    return jsonify({"status": "success"})

@app.route('/volume', methods=['POST'])
def volume():
    data = request.json
    action = data.get('action', 'up')
    if action == 'up':
        pyautogui.press('volumeup')
    elif action == 'down':
        pyautogui.press('volumedown')
    elif action == 'mute':
        pyautogui.press('volumemute')
    return jsonify({"status": "success"})

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == '__main__':
    ip = get_ip()
    print(f"Server starting on http://{ip}:5000")
    print("Open this URL on your Samsung phone (on the same WiFi)")
    app.run(host='0.0.0.0', port=5000)
