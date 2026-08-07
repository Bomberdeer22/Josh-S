import flask
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pyautogui
import os
import socket
import threading
import tkinter as tk
from tkinter import messagebox

app = Flask(__name__, static_folder='static')
CORS(app)
pyautogui.FAILSAFE = False

# API Endpoints
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.route('/move', methods=['POST'])
def move_mouse():
    data = request.json
    dx, dy = data.get('dx', 0), data.get('dy', 0)
    pyautogui.moveRel(dx, dy)
    return jsonify({"status": "success"})

@app.route('/click', methods=['POST'])
def click():
    data = request.json
    pyautogui.click(button=data.get('button', 'left'))
    return jsonify({"status": "success"})

@app.route('/scroll', methods=['POST'])
def scroll():
    data = request.json
    pyautogui.scroll(data.get('amount', 0))
    return jsonify({"status": "success"})

@app.route('/type', methods=['POST'])
def type_text():
    data = request.json
    pyautogui.write(data.get('text', ''))
    return jsonify({"status": "success"})

@app.route('/key', methods=['POST'])
def press_key():
    data = request.json
    key = data.get('key', '')
    if key: pyautogui.press(key)
    return jsonify({"status": "success"})

@app.route('/volume', methods=['POST'])
def volume():
    data = request.json
    action = data.get('action', 'up')
    if action == 'up': pyautogui.press('volumeup')
    elif action == 'down': pyautogui.press('volumedown')
    elif action == 'mute': pyautogui.press('volumemute')
    return jsonify({"status": "success"})

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def run_server():
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)

# GUI Setup
def start_gui():
    root = tk.Tk()
    root.title("Josh S - Mac Remote")
    root.geometry("400x250")
    root.configure(bg='#1e1e1e')

    ip_addr = get_ip()
    url = f"http://{ip_addr}:5000"

    label_title = tk.Label(root, text="Josh S Remote Server", font=("Arial", 18, "bold"), fg="white", bg='#1e1e1e')
    label_title.pack(pady=20)

    label_status = tk.Label(root, text="Status: Running ✅", font=("Arial", 12), fg="#4CAF50", bg='#1e1e1e')
    label_status.pack()

    label_ip = tk.Label(root, text="Enter this on your phone:", font=("Arial", 10), fg="#aaa", bg='#1e1e1e')
    label_ip.pack(pady=(20, 0))

    entry_url = tk.Entry(root, font=("Arial", 14), justify='center', width=20)
    entry_url.insert(0, url)
    entry_url.config(state='readonly')
    entry_url.pack(pady=5)

    def on_closing():
        if messagebox.askokcancel("Quit", "Do you want to stop the Josh S Remote?"):
            os._exit(0)

    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == '__main__':
    # Start server in a background thread
    threading.Thread(target=run_server, daemon=True).start()
    # Start GUI in the main thread
    start_gui()
