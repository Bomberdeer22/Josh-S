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
# Disable pyautogui fail-safe and pause for speed
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

@app.route('/move', methods=['POST'])
def move_mouse():
    data = request.json
    pyautogui.moveRel(data.get('dx', 0), data.get('dy', 0))
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
    # Changed to 5005 to avoid AirPlay conflict on Port 5000
    app.run(host='0.0.0.0', port=5005)

def start_gui():
    root = tk.Tk()
    root.title("Josh S Remote")
    root.geometry("400x320")
    root.configure(bg='#121212')

    ip_addr = get_ip()
    url = f"http://{ip_addr}:5005"

    tk.Label(root, text="Josh S", font=("Arial", 28, "bold"), fg="#ffffff", bg='#121212').pack(pady=20)
    tk.Label(root, text="Server Status: ONLINE", font=("Arial", 12, "bold"), fg="#4CAF50", bg='#121212').pack()
    
    tk.Label(root, text="Type this exact address into your\nSamsung Phone's Browser:", 
             font=("Arial", 11), fg="#aaaaaa", bg='#121212', justify="center").pack(pady=15)

    entry_url = tk.Entry(root, font=("Arial", 18), justify='center', width=18, bd=0, highlightthickness=0)
    entry_url.insert(0, url)
    entry_url.config(state='readonly', readonlybackground="#1e1e1e", fg="#ffffff")
    entry_url.pack(pady=5)

    def on_closing():
        os._exit(0)

    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == '__main__':
    threading.Thread(target=run_server, daemon=True).start()
    start_gui()
