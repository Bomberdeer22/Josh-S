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

VERSION = "2.8.0"
REPO_URL = "https://github.com/Bomberdeer22/Josh-S/archive/refs/heads/arena/019fd9f2-josh-s.zip"

gui_queue = queue.Queue()
active_connections = {} # Stores {ip: {last_seen: time, user_agent: str}}

# --- Advanced Location Engine ---
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
            self.parent.got_fix = False

    class LocationManager(object):
        def __init__(self):
            self.loc_data = {"lat": 0, "lon": 0, "status": "Ready"}
            self.got_fix = False
            try:
                self.manager = CoreLocation.CLLocationManager.alloc().init()
                self.delegate = LocationDelegate.alloc().initWithManager_(self)
                self.manager.setDelegate_(self.delegate)
            except: pass

        def get_coords(self, timeout=3):
            if not HAS_PRO_CONTROLLER: return 0, 0, "Not Supported"
            self.got_fix = False
            self.manager.startUpdatingLocation()
            start_time = time.time()
            while not self.got_fix and (time.time() - start_time) < timeout:
                NSRunLoop.currentRunLoop().runUntilDate_(NSDate.dateWithTimeIntervalSinceNow_(0.1))
            self.manager.stopUpdatingLocation()
            return self.loc_data["lat"], self.loc_data["lon"], self.loc_data["status"]

    loc_manager = LocationManager()
else:
    loc_manager = None

def get_ip_location():
    providers = ["https://ipwho.is/", "https://ipapi.co/json/", "http://ip-api.com/json/"]
    for url in providers:
        try:
            r = requests.get(url, timeout=3).json()
            lat = r.get('latitude') or r.get('lat')
            lon = r.get('longitude') or r.get('lon')
            city = r.get('city') or 'Unknown City'
            if lat and lon: return float(lat), float(lon), f"{city} (IP Location)"
        except: continue
    return 51.5074, -0.1278, "Location Unavailable"

def set_mac_brightness(level):
    level = float(level)
    if HAS_PRO_CONTROLLER:
        try:
            main_id = Quartz.CGMainDisplayID()
            bundle_path = '/System/Library/PrivateFrameworks/DisplayServices.framework'
            if os.path.exists(bundle_path):
                ds_bundle = NSBundle.bundleWithPath_(bundle_path)
                functions = [('DisplayServicesSetBrightness', b'vIf')]
                objc.loadBundleFunctions(ds_bundle, globals(), functions)
                for d_id in {main_id, 0, 1, 2}:
                    try: DisplayServicesSetBrightness(d_id, level)
                    except: pass
        except: pass
    os.system(f"osascript -e 'tell application \"System Events\" to set brightness of display 1 to {level}' 2>/dev/null")

# --- APIs ---
@app.route('/register', methods=['POST'])
def register():
    ip = request.remote_addr
    ua = request.headers.get('User-Agent', 'Unknown Device')
    # Simple logic to identify Samsung/Android
    device_name = "Samsung Device" if "Android" in ua else "Mobile Device"
    active_connections[ip] = {"name": device_name, "last_seen": time.time()}
    gui_queue.put(('view', 'connections'))
    return jsonify({"status": "registered"})

@app.route('/lost_info', methods=['GET'])
def get_lost_info():
    try:
        raw = subprocess.check_output(["pmset", "-g", "batt"]).decode()
        percent = raw.split("%")[0].split("\t")[-1] + "%" if "%" in raw else "100%"
    except: percent = "--"
    lat, lon, status = 0, 0, "Scanning..."
    if loc_manager: lat, lon, status = loc_manager.get_coords()
    if lat == 0 or lat is None: lat, lon, status = get_ip_location()
    return jsonify({"battery": percent, "location": status, "lat": lat, "lon": lon, "ip": get_ip()})

@app.route('/play_noise', methods=['POST'])
def play_noise():
    os.system("osascript -e 'set volume output volume 100'")
    os.system("afplay /System/Library/Sounds/Sosumi.aiff &")
    return jsonify({"status": "success"})

@app.route('/lost_mode', methods=['POST'])
def activate_lost_mode():
    show_lost_screen(request.json.get('message', 'Lost device.'))
    return jsonify({"status": "success"})

@app.route('/stop_lost', methods=['POST'])
def stop_lost():
    gui_queue.put('close_lost')
    return jsonify({"status": "success"})

@app.route('/')
def index(): return send_from_directory(app.static_folder, 'index.html')
@app.route('/<path:path>')
def static_proxy(path): return send_from_directory(app.static_folder, path)

# ... (Standard Control APIs: move, click, scroll, type, key, shortcut, volume, brightness, media, launch, lock, empty_trash)
@app.route('/move', methods=['POST'])
def move_mouse():
    pyautogui.moveRel(request.json.get('dx', 0), request.json.get('dy', 0))
    return jsonify({"status": "success"})
@app.route('/click', methods=['POST'])
def click():
    pyautogui.click(button=request.json.get('button', 'left'))
    return jsonify({"status": "success"})
@app.route('/scroll', methods=['POST'])
def scroll():
    pyautogui.scroll(request.json.get('amount', 0))
    return jsonify({"status": "success"})
@app.route('/type', methods=['POST'])
def type_text():
    pyautogui.write(request.json.get('text', ''))
    return jsonify({"status": "success"})
@app.route('/key', methods=['POST'])
def press_key():
    k = request.json.get('key', '')
    if k: pyautogui.press(k)
    return jsonify({"status": "success"})
@app.route('/shortcut', methods=['POST'])
def shortcut():
    k = request.json.get('keys', [])
    if k: pyautogui.hotkey(*k)
    return jsonify({"status": "success"})
@app.route('/volume', methods=['POST'])
def volume():
    lvl = request.json.get('level')
    if lvl is not None: os.system(f"osascript -e 'set volume output volume {lvl}'")
    else:
        act = request.json.get('action', 'up')
        if act == 'up': os.system("osascript -e 'set volume output volume (output volume of (get volume settings) + 7)'")
        elif act == 'down': os.system("osascript -e 'set volume output volume (output volume of (get volume settings) - 7)'")
        elif act == 'mute': os.system("osascript -e 'set volume output muted not (output muted of (get volume settings))'")
    return jsonify({"status": "success"})
@app.route('/brightness', methods=['POST'])
def brightness():
    lvl = request.json.get('level')
    if lvl is not None: set_mac_brightness(float(lvl))
    return jsonify({"status": "success"})
@app.route('/media', methods=['POST'])
def media():
    act = request.json.get('action', 'play')
    t = request.json.get('target', 'auto')
    if t == "chrome" or t == "browser":
        if act == 'play':
            script = 'tell application "Google Chrome" to tell active tab of window 1 to execute javascript "var v=document.querySelector(\'video, audio\'); if(v) { v.paused ? v.play() : v.pause(); \'success\' } else { \'fail\' }"'
            res = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
            if "success" not in res.stdout: pyautogui.press('space')
        elif act == 'next': os.system("osascript -e 'tell application \"Google Chrome\" to tell active tab of window 1 to execute javascript \"document.querySelector(\\\".ytp-next-button\\\")?.click()\"' 2>/dev/null")
        elif act == 'prev': os.system("osascript -e 'tell application \"Google Chrome\" to tell active tab of window 1 to execute javascript \"window.history.back()\"' 2>/dev/null")
    elif t == "spotify": os.system(f"osascript -e 'tell application \"Spotify\" to {act if act != 'play' else 'playpause'} track' 2>/dev/null")
    elif t == "music": os.system(f"osascript -e 'tell application \"Music\" to {act if act != 'play' else 'playpause'}' 2>/dev/null")
    else:
        ck = {'play': 'playpause', 'next': 'nexttrack', 'prev': 'prevtrack'}[act]
        pyautogui.press(ck)
    return jsonify({"status": "success"})
@app.route('/launch', methods=['POST'])
def launch():
    app_name = request.json.get('app', '')
    if app_name == 'browser': os.system("open -a 'Google Chrome' || open -a 'Safari'")
    elif app_name == 'finder': os.system("open ~")
    elif app_name.lower() == 'spotify': os.system("open -a 'Spotify'")
    return jsonify({"status": "success"})
@app.route('/lock', methods=['POST'])
def lock_mac():
    os.system("pmset displaysleepnow; osascript -e 'tell application \"System Events\" to lock screen' &")
    return jsonify({"status": "success"})
@app.route('/empty_trash', methods=['POST'])
def empty_trash():
    os.system("osascript -e 'tell application \"Finder\" to empty trash' &")
    return jsonify({"status": "success"})

@app.route('/show_window', methods=['POST'])
def show_window():
    gui_queue.put('toggle')
    return jsonify({"status": "success"})
@app.route('/update', methods=['POST'])
def trigger_update():
    gui_queue.put('update')
    return jsonify({"status": "success"})

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try: s.connect(('10.255.255.255', 1)); IP = s.getsockname()[0]
    except: IP = '127.0.0.1'
    finally: s.close()
    return IP

def run_server():
    try: app.run(host='0.0.0.0', port=5005, threaded=True)
    except Exception as e: gui_queue.put(f'error:{str(e)}')

def update_app():
    try:
        r = requests.get(REPO_URL, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
        z = zipfile.ZipFile(io.BytesIO(r.content))
        base = os.path.dirname(os.path.abspath(__file__))
        temp = os.path.join(base, "temp_update")
        if os.path.exists(temp): shutil.rmtree(temp)
        os.makedirs(temp); z.extractall(temp)
        root_f = os.listdir(temp)[0]
        new_s = os.path.join(temp, root_f, "mac_server")
        shutil.copy2(os.path.join(new_s, "server.py"), os.path.join(base, "server.py"))
        sd = os.path.join(base, "static")
        if os.path.exists(sd): shutil.rmtree(sd)
        shutil.copytree(os.path.join(new_s, "static"), sd)
        shutil.rmtree(temp)
        try: subprocess.Popen(["open", "-n", "/Applications/Josh S.app"])
        except: pass
        os._exit(0)
    except Exception as e: gui_queue.put(f'error:Update failed: {str(e)}')

def open_settings_location(): os.system("open 'x-apple.systempreferences:com.apple.preference.security?Privacy_LocationServices'")

class ModernButton(tk.Frame):
    def __init__(self, parent, text, command, bg_color, fg_color, font):
        super().__init__(parent, bg=bg_color, padx=10, pady=5)
        self.command = command
        self.label = tk.Label(self, text=text, fg=fg_color, bg=bg_color, font=font)
        self.label.pack(expand=True, fill='both')
        self.label.bind("<Button-1>", lambda e: self.command())
        self.bind("<Button-1>", lambda e: self.command())

# --- Lost Mode Window ---
lost_window = None
def show_lost_screen(message):
    global lost_window
    if lost_window: 
        try: lost_window.destroy()
        except: pass
    def create():
        global lost_window
        lost_window = tk.Tk()
        lost_window.attributes('-fullscreen', True, '-topmost', True)
        lost_window.configure(bg='black')
        tk.Label(lost_window, text="LOST MACBOOK", font=("Helvetica", 60, "bold"), fg="red", bg="black").pack(expand=True, pady=(100,0))
        tk.Label(lost_window, text=message, font=("Helvetica", 30), fg="white", bg="black", wraplength=800).pack(expand=True)
        lost_window.mainloop()
    threading.Thread(target=create, daemon=True).start()

# --- Main GUI ---
is_visible = True

def start_gui():
    root = tk.Tk()
    root.title(f"Josh S")
    root.geometry("450x580")
    root.configure(bg='#000000')
    root.resizable(False, False)

    # Frame Switcher
    container = tk.Frame(root, bg="#000000")
    container.pack(expand=True, fill='both')

    frames = {}

    def show_frame(name):
        frame = frames[name]
        frame.tkraise()

    # Views
    connect_frame = tk.Frame(container, bg="#000000", padx=30, pady=30)
    manage_frame = tk.Frame(container, bg="#000000", padx=30, pady=30)

    for f in (connect_frame, manage_frame):
        f.grid(row=0, column=0, sticky='nsew')
        f.grid_propagate(False)
        f.config(width=450, height=580)

    frames['connect'] = connect_frame
    frames['connections'] = manage_frame

    # --- Connect View ---
    tk.Label(connect_frame, text="Josh S", font=("Helvetica", 32, "bold"), fg="#ffffff", bg='#000000').pack()
    tk.Label(connect_frame, text=f"v{VERSION}", font=("Helvetica", 10), fg="#555555", bg='#000000').pack()
    
    st_b = tk.Frame(connect_frame, bg='#111111', pady=10, padx=20); st_b.pack(pady=20, fill='x')
    tk.Label(st_b, text="Ready for Connection", font=("Helvetica", 14), fg="#007aff", bg='#111111').pack()
    tk.Label(st_b, text="Scan with your phone", font=("Helvetica", 10), fg="#888888", bg='#111111').pack()
    
    url = f"http://{get_ip()}:5005"
    tk.Label(connect_frame, text="CONNECT YOUR PHONE", font=("Helvetica", 10, "bold"), fg="#007aff", bg='#000000').pack(pady=(20, 10))
    e_u = tk.Entry(connect_frame, font=("Courier", 20, "bold"), justify='center', bd=0, bg='#0a0a0a', fg="#ffffff")
    e_u.insert(0, url); e_u.config(state='readonly'); e_u.pack(pady=5, ipady=10)

    # --- Manage View ---
    tk.Label(manage_frame, text="Connections", font=("Helvetica", 28, "bold"), fg="#ffffff", bg='#000000').pack()
    conn_list_frame = tk.Frame(manage_frame, bg="#111111", pady=20, padx=20)
    conn_list_frame.pack(pady=20, fill='x')
    
    conn_label = tk.Label(conn_list_frame, text="1 Active Remote", font=("Helvetica", 16), fg="#4CAF50", bg="#111111")
    conn_label.pack()
    
    device_info_label = tk.Label(conn_list_frame, text="Samsung Device (Connected)", font=("Helvetica", 12), fg="#888888", bg="#111111")
    device_info_label.pack(pady=5)

    ModernButton(manage_frame, "Add New Device", lambda: show_frame('connect'), "#222222", "#ffffff", ("Helvetica", 12, "bold")).pack(pady=20, fill='x')

    # Bottom Actions (Global)
    def create_bottom_buttons(parent):
        btn_f = tk.Frame(parent, bg='#000000'); btn_f.pack(side='bottom', pady=10, fill='x')
        ModernButton(btn_f, "Check for Updates", lambda: threading.Thread(target=update_app).start(), "#007aff", "white", ("Helvetica", 12, "bold")).pack(side='top', fill='x', pady=5)
        ModernButton(btn_f, "Hide Window", lambda: gui_queue.put('hide'), "#333333", "#ffffff", ("Helvetica", 11)).pack(side='top', fill='x', pady=5)

    create_bottom_buttons(connect_frame)
    create_bottom_buttons(manage_frame)

    show_frame('connect')

    def check_queue():
        global lost_window, is_visible
        try:
            msg = gui_queue.get_nowait()
            if msg == 'toggle':
                if is_visible: root.withdraw(); is_visible = False
                else: root.deiconify(); root.lift(); is_visible = True
            elif msg == 'hide': root.withdraw(); is_visible = False
            elif msg == 'update': threading.Thread(target=update_app).start()
            elif msg == 'close_lost':
                if lost_window: lost_window.destroy(); lost_window = None
            elif isinstance(msg, tuple) and msg[0] == 'view':
                show_frame(msg[1])
                # Show window if it was hidden when a device connected
                root.deiconify(); root.lift(); is_visible = True
            elif msg.startswith('error:'):
                root.deiconify(); is_visible = True; messagebox.showerror("Josh S Error", msg.replace('error:', ''))
        except queue.Empty: pass
        root.after(100, check_queue)

    root.after(100, check_queue)
    threading.Thread(target=lambda: (time.sleep(3), gui_queue.put('hide')), daemon=True).start()
    root.mainloop()

if __name__ == '__main__':
    threading.Thread(target=run_server, daemon=True).start()
    start_gui()
