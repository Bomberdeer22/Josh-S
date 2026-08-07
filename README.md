# Josh S Remote Control

This project allows you to remotely control your MacBook from your Samsung phone (or any device with a browser) over WiFi.

## Features
-   **Touchpad**: Control mouse movement with a large touch area.
-   **Clicks**: Left and Right click buttons.
-   **Volume**: Increase, decrease, or mute volume.
-   **Keyboard**: Send text and special keys (Enter, Space, Backspace).
-   **PWA**: Can be saved to your phone's home screen for an "app-like" experience.

## Setup Instructions

### 1. On your MacBook:
1.  Open the `mac_server` folder.
2.  Install dependencies:
    ```bash
    pip3 install flask flask-cors pyautogui
    ```
3.  **Permissions (Crucial)**:
    -   Go to **System Settings** -> **Privacy & Security**.
    -   Under **Accessibility**, add and enable your Terminal (or VS Code).
    -   Under **Screen Recording**, add and enable your Terminal.
4.  Run the server:
    ```bash
    python3 server.py
    ```
5.  The terminal will display your Mac's IP address (e.g., `http://192.168.1.5:5000`).

### 2. On your Samsung Phone:
1.  Ensure your phone is on the **same WiFi network** as your Mac.
2.  Open Chrome or your preferred browser.
3.  Enter the URL shown on your Mac (e.g., `http://192.168.1.5:5000`).
4.  To make it a real "app":
    -   Tap the three dots (menu) in Chrome.
    -   Select **"Add to Home screen"**.
    -   Now you can launch "Josh S" directly from your app drawer!

## Project Structure
-   `mac_server/`: Contains the Python backend and the built frontend.
-   `phone_app/`: Source code for the React-based mobile interface.
