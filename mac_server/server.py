import flask
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pyautogui
import os
import socket
import threading
import tkinter as tk
from tkinter import messagebox, font as tkfont
import subprocess
import requests
import zipfile
import shutil
import io
import queue
import time

# Advanced Mac Controllers
try:
    import objc
    import Quartz
    from Foundation import NSBundle, NSRunLoop, NSDate
    import CoreLocation
    HAS_PRO_CONTROLLER = True
except ImportError:
    HAS_PRO_CONTROLLER = False

app = Flask(__name__, static_folder='static')
CORS(app)

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0

VERSION = "2.5.2"
REPO_URL = "https://github.com/Bomberdeer22/Josh-S/archive/refs/heads/arena/019fd9f2-josh-s.zip"

gui_queue = queue.Queue()

# --- High Precision Location Engine ---
if HAS_PRO_CONTROLLER:
    class LocationDelegate(CoreLocation.NSObject):
        def initWithManager_(self, parent):
            self = objc.super(LocationDelegate, self).init()
            if self is None: return None
            self.parent = parent
            return self

        def locationManager_didUpdateLocations_(self, manager, locations):
            loc = locations.lastObject()
            coord = loc.coordinate()
            self.parent.loc_data["lat"] = coord.latitude
            self.parent.loc_data["lon"] = coord.longitude
            self.parent.loc_data["status"] = "High Precision ✅"
            self.parent.got_fix = True

        def locationManager_didFailWithError_(self, manager, error):
            self.parent.loc_data["status"] = f"Error: {error.code()}"
            self.parent.got_fix = False

    class LocationManager(object):
        def __init__(self):
            self.loc_data = {"lat": 0, "lon": 0, "status": "Ready"}
            self.got_fix = False
            try:
                self.manager = CoreLocation.CLLocationManager.alloc().init()
                self.delegate = LocationDelegate.alloc().initWithManager_(self)
                self.manager.setDelegate_(self.delegate)
            except Exception as e:
                self.loc_data["status"] = f"Init Failed: {e}"

        def get_coords(self):
            if not HAS_PRO_CONTROLLER: return 0, 0, "Hardware not supported"
            
            self.got_fix = False
            # Request permission if not determined
            self.manager.requestWhenInUseAuthorization()
            self.manager.startUpdatingLocation()
            
            # Give the system run loop time to process location events
            timeout = 5 # 5 seconds max
            start_time = time.time()
            while not self.got_fix and (time.time() - start_time) < timeout:
                NSRunLoop.currentRunLoop().runUntilDate_(NSDate.dateWithTimeIntervalSinceNow_(0.5))
            
            self.manager.stopUpdatingLocation()
            
            if not self.got_fix:
                return 0, 0, "Wait timed out (Check Privacy Settings)"
            
            return self.loc_data["lat"], self.loc_data["lon"], self.loc_data["status"]

    loc_manager = LocationManager()
else:
    loc_manager = None

# ... (Brightness, Media, etc. remain the same)
def set_mac_brightness(level):
    level = float(level)
    success = False
    if HAS_PRO_CONTROLLER:
        try:
            main_id = Quartz.CGMainDisplayID()
            bundle_path = '/System/Library/PrivateFrameworks/DisplayServices.framework'
            if os.path.exists(bundle_path):
                ds_bundle = NSBundle.bundleWithPath_(bundle_path)
                functions = [('DisplayServicesSetBrightness', b'vIf')]
                objc.loadBundleFunctions(ds_bundle, globals(), functions)
                for d_id in {main_id, 0, 1, 2, 3}:
                    try:
                        DisplayServicesSetBrightness(d_id, level)
                        success = True
                    except: pass
        except: pass
    os.system(f"osascript -e 'tell application \"System Events\" to set brightness of display 1 to {level}' 2>/dev/null")
    return success

# --- Lost Mode Functions ---
lost_window = None
def show_lost_screen(message):
    global lost_window
    if lost_window:
        try: lost_window.destroy()
        except: pass
    def create_window():
        global lost_window
        lost_window = tk.Tk()
        lost_window.attributes('-fullscreen', True)
        lost_window.attributes('-topmost', True)
        lost_window.configure(bg='black')
        tk.Label(lost_window, text="LOST MACBOOK", font=("Helvetica", 60, "bold"), fg="red", bg="black").pack(expand=True, pady=(100, 0))
        tk.Label(lost_window, text=message, font=("Helvetica", 30), fg="white", bg="black", wraplength=800).pack(expand=True)
        tk.Label(lost_window, text="This Mac is being tracked.", font=("Helvetica", 18), fg="#444", bg="black").pack(side='bottom', pady=50)
        lost_window.mainloop()
    threading.Thread(target=create_window, daemon=True).start()

@app.route('/lost_info', methods=['GET'])
def get_lost_info():
    battery_raw = subprocess.check_output(["pmset", "-g", "batt"]).decode()
    percent = battery_raw.split("%")[0].split("\t")[-1] + "%" if "%" in battery_raw else "Unknown"
    
    lat, lon, status = 0, 0, "Searching..."
    if loc_manager:
        lat, lon, status = loc_manager.get_coords()

    location_name = status
    if lat == 0:
        try:
            r = requests.get("http://ip-api.com/json/", timeout=5).json()
            if r.get('status') == 'success':
                lat, lon = r.get('lat'), r.get('lon')
                location_name = f"{r.get('city')} (IP Fallback)"
        except: pass
        
    return jsonify({"battery": percent, "location": location_name, "lat": lat, "lon": lon, "ip": get_ip()})

@app.route('/play_noise', methods=['POST'])
def play_noise():
    os.system("osascript -e 'set volume output volume 100'")
    os.system("afplay /System/Library/Sounds/Sosumi.aiff &")
    os.system("afplay /System/Library/Sounds/Sosumi.aiff &")
    return jsonify({"status": "success"})

@app.route('/lost_mode', methods=['POST'])
def activate_lost_mode():
    data = request.json
    show_lost_screen(data.get('message', 'Please return this device.'))
    return jsonify({"status": "success"})

@app.route('/stop_lost', methods=['POST'])
def stop_lost():
    gui_queue.put('close_lost')
    return jsonify({"status": "success"})

# --- Standard API Endpoints ---
@app.route('/')
def index(): return send_from_directory(app.static_folder, 'index.html')
@app.route('/<path:path>')
def static_proxy(path): return send_from_directory(app.static_folder, path)
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
    level = data.get('level')
    if level is not None: os.system(f"osascript -e 'set volume output volume {level}'")
    else:
        action = data.get('action', 'up')
        if action == 'up': os.system("osascript -e 'set volume output volume (output volume of (get volume settings) + 7)'")
        elif action == 'down': os.system("osascript -e 'set volume output volume (output volume of (get volume settings) - 7)'")
        elif action == 'mute': os.system("osascript -e 'set volume output muted not (output muted of (get volume settings))'")
    return jsonify({"status": "success"})
@app.route('/brightness', methods=['POST'])
def brightness():
    data = request.json
    level = data.get('level')
    if level is not None: set_mac_brightness(float(level))
    return jsonify({"status": "success"})
@app.route('/media', methods=['POST'])
def media():
    data = request.json
    action = data.get('action', 'play')
    target = data.get('target', 'auto')
    if target == "chrome" or target == "browser":
        if action == 'play':
            script = 'tell application "Google Chrome" to tell active tab of window 1 to execute javascript "var v=document.querySelector(\'video, audio\'); if(v) { v.paused ? v.play() : v.pause(); \'success\' } else { \'fail\' }"'
            result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
            if "success" not in result.stdout: pyautogui.press('space')
        elif action == 'next': os.system("osascript -e 'tell application \"Google Chrome\" to tell active tab of window 1 to execute javascript \"document.querySelector(\\\".ytp-next-button\\\")?.click()\"' 2>/dev/null")
        elif action == 'prev': os.system("osascript -e 'tell application \"Google Chrome\" to tell active tab of window 1 to execute javascript \"window.history.back()\"' 2>/dev/null")
    elif target == "spotify": os.system(f"osascript -e 'tell application \"Spotify\" to {action if action != 'play' else 'playpause'} track' 2>/dev/null")
    elif target == "music": os.system(f"osascript -e 'tell application \"Music\" to {action if action != 'play' else 'playpause'}' 2>/dev/null")
    else:
        cmd_key = {'play': 'playpause', 'next': 'nexttrack', 'prev': 'prevtrack'}[action]
        pyautogui.press(cmd_key)
    return jsonify({"status": "success"})
@app.route('/launch', methods=['POST'])
def launch():
    data = request.json
    app_name = data.get('app', '')
    if app_name == 'browser': os.system("open -a 'Google Chrome' || open -a 'Safari'")
    elif app_name == 'finder': os.system("open ~")
    elif app_name == 'spotify': os.system("open -a 'Spotify'")
    return jsonify({"status": "success"})
@app.route('/lock', methods=['POST'])
def lock_mac():
    os.system("pmset displaysleepnow")
    os.system("osascript -e 'tell application \"System Events\" to lock screen' &")
    return jsonify({"status": "success"})
@app.route('/empty_trash', methods=['POST'])
def empty_trash():
    os.system("osascript -e 'tell application \"Finder\" to empty trash' &")
    return jsonify({"status": "success"})
@app.route('/show_window', methods=['POST'])
def show_window():
    gui_queue.put('show')
    return jsonify({"status": "success"})
@app.route('/update', methods=['POST'])
def trigger_update():
    gui_queue.put('update')
    return jsonify({"status": "success"})

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception: IP = '127.0.0.1'
    finally: s.close()
    return IP

def run_server():
    try: app.run(host='0.0.0.0', port=5005, threaded=True)
    except Exception as e: gui_queue.put(f'error:{str(e)}')

def update_app():
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        r = requests.get(REPO_URL, headers=headers, timeout=15)
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
        try: subprocess.Popen(["open", "-n", "/Applications/Josh S.app"])
        except: pass
        os._exit(0)
    except Exception as e: gui_queue.put(f'error:Update failed: {str(e)}')

def open_settings_accessibility(): os.system("open 'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility'")
def open_settings_location(): os.system("open 'x-apple.systempreferences:com.apple.preference.security?Privacy_LocationServices'")

class ModernButton(tk.Frame):
    def __init__(self, parent, text, command, bg_color, fg_color, font):
        super().__init__(parent, bg=bg_color, padx=10, pady=5)
        self.command = command
        self.label = tk.Label(self, text=text, fg=fg_color, bg=bg_color, font=font)
        self.label.pack(expand=True, fill='both')
        self.label.bind("<Button-1>", lambda e: self.command())
        self.bind("<Button-1>", lambda e: self.command())
        self.bind("<Enter>", lambda e: self.config(bg=self.lighten(bg_color)))
        self.label.bind("<Enter>", lambda e: self.config(bg=self.lighten(bg_color)))
        self.bind("<Leave>", lambda e: self.config(bg=bg_color))
        self.label.bind("<Leave>", lambda e: self.config(bg=bg_color))
    def lighten(self, hex_color):
        if hex_color == "#007aff": return "#2691ff"
        if hex_color == "#222222": return "#333333"
        return hex_color

def start_gui():
    root = tk.Tk()
    root.title(f"Josh S")
    root.geometry("450x620")
    root.configure(bg='#000000')
    root.resizable(False, False)

    def auto_hide():
        time.sleep(3)
        gui_queue.put('hide')

    def check_queue():
        global lost_window
        try:
            msg = gui_queue.get_nowait()
            if msg == 'show':
                root.deiconify()
                root.lift()
            elif msg == 'hide': root.withdraw()
            elif msg == 'update': threading.Thread(target=update_app).start()
            elif msg == 'close_lost':
                if lost_window: lost_window.destroy(); lost_window = None
            elif msg.startswith('error:'):
                root.deiconify()
                messagebox.showerror("Josh S Error", msg.replace('error:', ''))
        except queue.Empty: pass
        root.after(100, check_queue)

    root.after(100, check_queue)
    threading.Thread(target=auto_hide, daemon=True).start()

    title_font = tkfont.Font(family="Helvetica", size=32, weight="bold")
    subtitle_font = tkfont.Font(family="Helvetica", size=14)
    label_font = tkfont.Font(family="Helvetica", size=12)
    url_font = tkfont.Font(family="Courier", size=20, weight="bold")

    main_frame = tk.Frame(root, bg='#000000', padx=30, pady=30)
    main_frame.pack(expand=True, fill='both')

    tk.Label(main_frame, text="Josh S", font=title_font, fg="#ffffff", bg='#000000').pack(pady=(0, 5))
    tk.Label(main_frame, text=f"Version {VERSION}", font=("Helvetica", 10), fg="#555555", bg='#000000').pack()

    status_badge = tk.Frame(main_frame, bg='#111111', pady=10, padx=20)
    status_badge.pack(pady=20, fill='x')
    status_color = "#4CAF50" if HAS_PRO_CONTROLLER else "#f44336"
    status_msg = "Tracker Active ✅" if HAS_PRO_CONTROLLER else "Tracker Error"
    tk.Label(status_badge, text=status_msg, font=subtitle_font, fg=status_color, bg='#111111').pack()
    tk.Label(status_badge, text="High-Precision Engine", font=label_font, fg="#888888", bg='#111111').pack()

    ip_addr = get_ip()
    url = f"http://{ip_addr}:5005"
    tk.Label(main_frame, text="CONNECT YOUR PHONE", font=("Helvetica", 10, "bold"), fg="#007aff", bg='#000000').pack(pady=(20, 10))
    entry_url = tk.Entry(main_frame, font=url_font, justify='center', width=18, bd=0, highlightthickness=1, highlightbackground="#222222", bg='#0a0a0a', fg="#ffffff")
    entry_url.insert(0, url)
    entry_url.config(state='readonly', readonlybackground="#0a0a0a")
    entry_url.pack(pady=5, ipady=10)

    btn_frame = tk.Frame(main_frame, bg='#000000')
    btn_frame.pack(side='bottom', pady=10, fill='x')

    ModernButton(btn_frame, "Check for Updates", lambda: threading.Thread(target=update_app).start(), "#007aff", "white", ("Helvetica", 12, "bold")).pack(side='top', fill='x', pady=5)
    ModernButton(btn_frame, "Fix Accessibility", open_settings_accessibility, "#222222", "#ffffff", ("Helvetica", 11)).pack(side='top', fill='x', pady=5)
    ModernButton(btn_frame, "Fix Location Permission", open_settings_location, "#222222", "#ffffff", ("Helvetica", 11)).pack(side='top', fill='x', pady=5)
    ModernButton(btn_frame, "Hide Window", lambda: root.withdraw(), "#333333", "#ffffff", ("Helvetica", 11)).pack(side='top', fill='x', pady=5)

    def on_closing(): root.withdraw()
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == '__main__':
    threading.Thread(target=run_server, daemon=True).start()
    start_gui()
