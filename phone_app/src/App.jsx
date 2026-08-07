import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Volume1, VolumeX, MousePointer, Keyboard, Send, Lock, Delete, CornerDownLeft, Space } from 'lucide-react';

function App() {
  const [ip, setIp] = useState(window.location.hostname || '');
  const [status, setStatus] = useState('Connecting...');
  const [text, setText] = useState('');
  const lastPos = useRef({ x: 0, y: 0 });
  
  const moveBuffer = useRef({ dx: 0, dy: 0 });
  const scrollBuffer = useRef(0);

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
  }, []);

  const sendCommand = async (endpoint, data = {}) => {
    try {
      const response = await fetch(`/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) setStatus('Connected');
      else setStatus('Error');
    } catch (e) {
      setStatus('Offline');
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
        <div style={styles.headerTop}>
          <h1 style={styles.title}>Josh S</h1>
          <button style={styles.lockButton} onClick={() => sendCommand('lock')}>
            <Lock size={20} /> Lock Mac
          </button>
        </div>
        <div style={styles.statusBadge}>
          <div style={{...styles.statusDot, backgroundColor: status === 'Connected' ? '#4CAF50' : '#f44336'}} />
          {status}
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
            <MousePointer size={40} color="#444" />
          </div>
          <div 
            style={styles.scrollbar}
            onTouchMove={handleScrollMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div style={styles.scrollIcon}>↕</div>
          </div>
        </div>

        <div style={styles.clickGrid}>
          <button style={styles.clickBtn} onClick={() => sendCommand('click', { button: 'left' })}>Left Click</button>
          <button style={styles.clickBtn} onClick={() => sendCommand('click', { button: 'right' })}>Right Click</button>
        </div>

        <div style={styles.controlRow}>
          <div style={styles.volumeGroup}>
            <button style={styles.iconBtn} onClick={() => sendCommand('volume', { action: 'down' })}><Volume1 /></button>
            <button style={styles.iconBtn} onClick={() => sendCommand('volume', { action: 'mute' })}><VolumeX /></button>
            <button style={styles.iconBtn} onClick={() => sendCommand('volume', { action: 'up' })}><Volume2 /></button>
          </div>
        </div>

        <div style={styles.keyboardArea}>
            <form onSubmit={handleTextSubmit} style={styles.inputRow}>
              <input 
                style={styles.textInput} 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Type something..."
              />
              <button type="submit" style={styles.sendBtn}><Send size={20}/></button>
            </form>
            <div style={styles.specialKeys}>
                <button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'backspace' })}><Delete size={18} /></button>
                <button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'space' })}><Space size={18}/></button>
                <button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'enter' })}><CornerDownLeft size={18}/></button>
            </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#000',
    color: '#fff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '15px 20px',
    backgroundColor: '#111',
    borderBottom: '1px solid #222',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    color: '#fff',
  },
  lockButton: {
    backgroundColor: '#ff3b30',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusBadge: {
    fontSize: '12px',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    gap: '15px',
  },
  touchpadContainer: {
    flex: 1,
    display: 'flex',
    gap: '12px',
  },
  touchpad: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #333',
    touchAction: 'none',
  },
  scrollbar: {
    width: '50px',
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #333',
    touchAction: 'none',
  },
  scrollIcon: {
    color: '#444',
    fontSize: '20px',
  },
  clickGrid: {
    display: 'flex',
    gap: '10px',
  },
  clickBtn: {
    flex: 1,
    padding: '18px',
    backgroundColor: '#222',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
  },
  controlRow: {
    display: 'flex',
    justifyContent: 'center',
  },
  volumeGroup: {
    display: 'flex',
    backgroundColor: '#1a1a1a',
    borderRadius: '30px',
    padding: '4px',
    border: '1px solid #333',
  },
  iconBtn: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  keyboardArea: {
    backgroundColor: '#111',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid #222',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#222',
    border: '1px solid #333',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  sendBtn: {
    backgroundColor: '#007aff',
    color: '#fff',
    border: 'none',
    padding: '0 15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  specialKeys: {
    display: 'flex',
    gap: '8px',
  },
  keyBtn: {
    flex: 1,
    backgroundColor: '#222',
    border: '1px solid #333',
    color: '#aaa',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
};

export default App;
