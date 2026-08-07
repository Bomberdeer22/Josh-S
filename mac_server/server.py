import flask
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pyautogui
import os
import socket
import threading
import tkinter as tk
from tkinter import messagebox
import subprocess
import requests
import zipfile
import shutil
import io

app = Flask(__name__, static_folder='static')
CORS(app)

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

VERSION = "1.6.0"
REPO_URL = "https://github.com/Bomberdeer22/Josh-S/archive/refs/heads/arena/019fd9f2-josh-s.zip"

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

@app.route('/shortcut', methods=['POST'])
def shortcut():
    data = request.json
    keys = data.get('keys', [])
    if keys: pyautogui.hotkey(*keys)
    return jsonify({"status": "success"})

@app.route('/volume', methods=['POST'])
def volume():
    data = request.json
    action = data.get('action', 'up')
    if action == 'up':
        os.system("osascript -e 'set volume output volume (output volume of (get volume settings) + 7)'")
    elif action == 'down':
        os.system("osascript -e 'set volume output volume (output volume of (get volume settings) - 7)'")
    elif action == 'mute':
        os.system("osascript -e 'set volume output muted not (output muted of (get volume settings))'")
    return jsonify({"status": "success"})

@app.route('/brightness', methods=['POST'])
def brightness():
    data = request.json
    level = data.get('level') # 0.0 to 1.0
    
    if level is not None:
        os.system(f"osascript -e 'tell application \"System Events\" to set brightness of display 1 to {level}'")
    else:
        action = data.get('action', 'up')
        # Get current brightness and increment
        try:
            curr = subprocess.check_output(["osascript", "-e", "tell application \"System Events\" to get brightness of display 1"]).decode().strip()
            new_val = float(curr) + 0.1 if action == 'up' else float(curr) - 0.1
            new_val = max(0, min(1.0, new_val))
            os.system(f"osascript -e 'tell application \"System Events\" to set brightness of display 1 to {new_val}'")
        except:
            # Fallback to keys if the property method fails
            pyautogui.press('brightnessup' if action == 'up' else 'brightnessdown')
            
    return jsonify({"status": "success"})

@app.route('/media', methods=['POST'])
def media():
    data = request.json
    action = data.get('action', 'play')
    target = data.get('target', 'auto')
    
    if target == "chrome":
        # Targeted AppleScript for Chrome using JS for zero-swipe control
        if action == 'play':
            os.system("osascript -e 'tell application \"Google Chrome\" to tell active tab of window 1 to execute javascript \"document.querySelector(\\\"video, audio\\\").paused ? document.querySelector(\\\"video, audio\\\").play() : document.querySelector(\\\"video, audio\\\").pause()\"' 2>/dev/null")
        elif action == 'next':
            os.system("osascript -e 'tell application \"Google Chrome\" to tell active tab of window 1 to execute javascript \"document.querySelector(\\\".ytp-next-button\\\")?.click()\"' 2>/dev/null")
        elif action == 'prev':
            os.system("osascript -e 'tell application \"Google Chrome\" to tell active tab of window 1 to execute javascript \"window.history.back()\"' 2>/dev/null")
            
    elif target == "spotify":
        os.system(f"osascript -e 'tell application \"Spotify\" to {action if action != 'play' else 'playpause'} track' 2>/dev/null")
    elif target == "music":
        os.system(f"osascript -e 'tell application \"Music\" to {action if action != 'play' else 'playpause'}' 2>/dev/null")
    else:
        cmd_key = {'play': 'playpause', 'next': 'nexttrack', 'prev': 'prevtrack'}[action]
        pyautogui.press(cmd_key)
        
    return jsonify({"status": "success"})

@app.route('/launch', methods=['POST'])
def launch():
    data = request.json
    app_name = data.get('app', '')
    if app_name == 'browser': 
        os.system("open -a 'Google Chrome' || open -a 'Safari'")
    elif app_name == 'finder': 
        os.system("open ~")
    elif app_name == 'spotify':
        os.system("open -a 'Spotify'")
    return jsonify({"status": "success"})

@app.route('/lock', methods=['POST'])
def lock_mac():
    os.system("pmset displaysleepnow")
    os.system("osascript -e 'tell application \"System Events\" to lock screen' &")
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
    app.run(host='0.0.0.0', port=5005)

def update_app():
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        r = requests.get(REPO_URL, headers=headers, timeout=15)
        if r.status_code == 404:
            messagebox.showerror("Update Failed", "Repo is PRIVATE. Make it PUBLIC for updates to work.")
            return
        z = zipfile.ZipFile(io.BytesIO(r.content))
        base_path = os.path.dirname(os.path.abspath(__file__))
        temp_dir = os.path.join(base_path, "temp_update")
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
        os.makedirs(temp_dir)
        z.extractall(temp_dir)
        root_folder = os.listdir(temp_dir)[0]
        new_server_dir = os.path.join(temp_dir, root_folder, "mac_server")
        shutil.copy2(os.path.join(new_server_dir, "server.py"), os.path.join(base_path, "server.py"))
        static_dest = os.path.join(base_path, "static")
        if os.path.exists(static_dest): shutil.rmtree(static_dest)
        shutil.copytree(os.path.join(new_server_dir, "static"), static_dest)
        shutil.rmtree(temp_dir)
        messagebox.showinfo("Update Complete", "Josh S has been updated! The app will now restart.")
        try: subprocess.Popen(["open", "-n", "/Applications/Josh S.app"])
        except: pass
        os._exit(0)
    except Exception as e:
        messagebox.showerror("Update Failed", str(e))

def start_gui():
    root = tk.Tk()
    root.title(f"Josh S v{VERSION}")
    root.geometry("400x400")
    root.configure(bg='#121212')

    ip_addr = get_ip()
    url = f"http://{ip_addr}:5005"

    tk.Label(root, text="Josh S", font=("Arial", 28, "bold"), fg="#ffffff", bg='#121212').pack(pady=15)
    tk.Label(root, text="Server Status: ONLINE", font=("Arial", 12, "bold"), fg="#4CAF50", bg='#121212').pack()
    tk.Label(root, text=f"Local URL: {url}", font=("Arial", 10), fg="#888", bg='#121212').pack(pady=5)
    tk.Label(root, text="Open address on your phone:", font=("Arial", 11), fg="#aaaaaa", bg='#121212').pack(pady=10)

    entry_url = tk.Entry(root, font=("Arial", 18), justify='center', width=18, bd=0)
    entry_url.insert(0, url)
    entry_url.config(state='readonly', readonlybackground="#1e1e1e", fg="#ffffff")
    entry_url.pack(pady=5)

    btn_update = tk.Button(root, text="Check for Updates", command=lambda: threading.Thread(target=update_app).start(),
                           bg="#333", fg="white", font=("Arial", 10), padx=10, pady=5)
    btn_update.pack(pady=20)
    
    def on_closing(): os._exit(0)
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == '__main__':
    threading.Thread(target=run_server, daemon=True).start()
    start_gui()
