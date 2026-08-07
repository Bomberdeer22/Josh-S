import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Volume1, VolumeX, MousePointer, Keyboard, Send } from 'lucide-react';

function App() {
  const [ip, setIp] = useState(window.location.hostname || '');
  const [status, setStatus] = useState('Disconnected');
  const [text, setText] = useState('');
  const lastPos = useRef({ x: 0, y: 0 });
  
  // Buffering for smoother movement
  const moveBuffer = useRef({ dx: 0, dy: 0 });
  const scrollBuffer = useRef(0);
  const isMoving = useRef(false);

  useEffect(() => {
    localStorage.setItem('mac_ip', ip);
  }, [ip]);

  // Movement loop - sends updates every 30ms if there's movement
  useEffect(() => {
    const interval = setInterval(() => {
      if (moveBuffer.current.dx !== 0 || moveBuffer.current.dy !== 0) {
        sendCommand('move', { dx: moveBuffer.current.dx, dy: moveBuffer.current.dy });
        moveBuffer.current = { dx: 0, dy: 0 };
      }
      if (scrollBuffer.current !== 0) {
        sendCommand('scroll', { amount: scrollBuffer.current });
        scrollBuffer.current = 0;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [ip]);

  const sendCommand = async (endpoint, data) => {
    try {
      const response = await fetch(`/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setStatus('Connected');
      } else {
        setStatus('Error');
      }
    } catch (e) {
      setStatus('Failed to connect');
    }
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    if (lastPos.current.x !== 0) {
      moveBuffer.current.dx += (touch.clientX - lastPos.current.x) * 2;
      moveBuffer.current.dy += (touch.clientY - lastPos.current.y) * 2;
    }
    lastPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleScrollMove = (e) => {
    const touch = e.touches[0];
    if (lastPos.current.y !== 0) {
        scrollBuffer.current += (lastPos.current.y - touch.clientY) * 5;
    }
    lastPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    lastPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    lastPos.current = { x: 0, y: 0 };
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (text) {
      sendCommand('type', { text });
      setText('');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Josh S Remote</h1>
        <div style={styles.statusLine}>
          <input 
            placeholder="Mac IP" 
            value={ip} 
            onChange={(e) => setIp(e.target.value)}
            style={styles.input}
          />
          <span style={{ color: status === 'Connected' ? '#4CAF50' : '#f44336' }}>{status}</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.touchpadContainer}>
          <div 
            style={styles.touchpad}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <MousePointer size={48} color="#555" />
            <p>Touchpad</p>
          </div>
          <div 
            style={styles.scrollbar}
            onTouchMove={handleScrollMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            ↕️
          </div>
        </div>

        <div style={styles.clickButtons}>
          <button style={styles.button} onClick={() => sendCommand('click', { button: 'left' })}>Left Click</button>
          <button style={styles.button} onClick={() => sendCommand('click', { button: 'right' })}>Right Click</button>
        </div>

        <div style={styles.controls}>
          <button style={styles.iconButton} onClick={() => sendCommand('volume', { action: 'down' })}><Volume1 /></button>
          <button style={styles.iconButton} onClick={() => sendCommand('volume', { action: 'mute' })}><VolumeX /></button>
          <button style={styles.iconButton} onClick={() => sendCommand('volume', { action: 'up' })}><Volume2 /></button>
        </div>

        <form onSubmit={handleTextSubmit} style={styles.keyboardSection}>
          <input 
            style={styles.textInput} 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Type here..."
          />
          <button type="submit" style={styles.iconButton}><Send /></button>
        </form>
        
        <div style={styles.specialKeys}>
            <button style={styles.button} onClick={() => sendCommand('key', { key: 'enter' })}>Enter</button>
            <button style={styles.button} onClick={() => sendCommand('key', { key: 'backspace' })}>Back</button>
            <button style={styles.button} onClick={() => sendCommand('key', { key: 'space' })}>Space</button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: '#121212',
    color: '#fff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '20px',
    backgroundColor: '#1e1e1e',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
  },
  statusLine: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  input: {
    backgroundColor: '#333',
    border: 'none',
    color: '#fff',
    padding: '8px',
    borderRadius: '4px',
    width: '150px',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    gap: '20px',
  },
  touchpadContainer: {
    flex: 1,
    display: 'flex',
    gap: '10px',
  },
  touchpad: {
    flex: 5,
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px dashed #444',
    touchAction: 'none',
  },
  scrollbar: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '2px dashed #444',
    touchAction: 'none',
    fontSize: '24px',
  },
  clickButtons: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    flex: 1,
    padding: '15px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: '15px',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardSection: {
    display: 'flex',
    gap: '10px',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#333',
    border: 'none',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
  },
  specialKeys: {
    display: 'flex',
    gap: '10px',
  }
};

export default App;
