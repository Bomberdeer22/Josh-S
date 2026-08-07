import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Volume1, VolumeX, MousePointer, Send, Lock, 
  Delete, CornerDownLeft, Space, Play, SkipBack, SkipForward, 
  Sun, Moon, Monitor, Search, LayoutGrid, Globe, FolderOpen,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Music
} from 'lucide-react';

function App() {
  const [ip, setIp] = useState(window.location.hostname || '');
  const [status, setStatus] = useState('Connecting...');
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('mouse');
  const [mediaTarget, setMediaTarget] = useState('auto');
  const [brightness, setBrightness] = useState(0.5);
  const [volume, setVolume] = useState(50);
  
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

  const handleBrightnessChange = (e) => {
    const val = parseFloat(e.target.value);
    setBrightness(val);
    sendCommand('brightness', { level: val });
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    sendCommand('volume', { level: val });
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
            <Lock size={16} /> Lock
          </button>
        </div>
        <div style={styles.statusBadge}>
          <div style={{...styles.statusDot, backgroundColor: status === 'Connected' ? '#4CAF50' : '#f44336'}} />
          {status}
        </div>
      </header>

      <nav style={styles.tabs}>
        <button 
          style={{...styles.tab, borderBottom: activeTab === 'mouse' ? '2px solid #007aff' : 'none', color: activeTab === 'mouse' ? '#007aff' : '#888'}} 
          onClick={() => setActiveTab('mouse')}
        >Mouse</button>
        <button 
          style={{...styles.tab, borderBottom: activeTab === 'media' ? '2px solid #007aff' : 'none', color: activeTab === 'media' ? '#007aff' : '#888'}} 
          onClick={() => setActiveTab('media')}
        >Media</button>
        <button 
          style={{...styles.tab, borderBottom: activeTab === 'apps' ? '2px solid #007aff' : 'none', color: activeTab === 'apps' ? '#007aff' : '#888'}} 
          onClick={() => setActiveTab('apps')}
        >Apps</button>
      </nav>

      <main style={styles.main}>
        {activeTab === 'mouse' && (
          <div style={styles.tabContent}>
            <div style={styles.touchpadContainer}>
              <div 
                style={styles.touchpad}
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <MousePointer size={40} color="#333" />
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
            
            <div style={styles.arrowGrid}>
                <div />
                <button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'up' })}><ChevronUp /></button>
                <div />
                <button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'left' })}><ChevronLeft /></button>
                <button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'down' })}><ChevronDown /></button>
                <button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'right' })}><ChevronRight /></button>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div style={styles.tabContent}>
            
            <div style={styles.controlSection}>
              <p style={styles.sectionTitle}>Control Target</p>
              <div style={styles.targetRow}>
                 <button style={{...styles.targetBtn, backgroundColor: mediaTarget === 'auto' ? '#007aff' : '#222'}} onClick={() => setMediaTarget('auto')}>Auto</button>
                 <button style={{...styles.targetBtn, backgroundColor: mediaTarget === 'spotify' ? '#1DB954' : '#222'}} onClick={() => setMediaTarget('spotify')}>Spotify</button>
                 <button style={{...styles.targetBtn, backgroundColor: mediaTarget === 'chrome' ? '#4285F4' : '#222'}} onClick={() => setMediaTarget('chrome')}>Browser</button>
                 <button style={{...styles.targetBtn, backgroundColor: mediaTarget === 'music' ? '#FC3C44' : '#222'}} onClick={() => setMediaTarget('music')}>Music</button>
              </div>
            </div>

            <div style={styles.controlSection}>
              <p style={styles.sectionTitle}>Playback</p>
              <div style={styles.mediaGroup}>
                <button style={styles.mediaBtn} onClick={() => sendCommand('media', { action: 'prev', target: mediaTarget })}><SkipBack /></button>
                <button style={styles.mediaBtnPrimary} onClick={() => sendCommand('media', { action: 'play', target: mediaTarget })}><Play fill="white" /></button>
                <button style={styles.mediaBtn} onClick={() => sendCommand('media', { action: 'next', target: mediaTarget })}><SkipForward /></button>
              </div>
            </div>

            <div style={styles.controlSection}>
              <p style={styles.sectionTitle}>Volume</p>
              <div style={styles.sliderRow}>
                <button style={styles.muteBtn} onClick={() => sendCommand('volume', { action: 'mute' })}><VolumeX size={20}/></button>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1" 
                  value={volume} 
                  onChange={handleVolumeChange} 
                  style={styles.slider}
                />
                <Volume2 size={16} color="#555" />
              </div>
            </div>

            <div style={styles.controlSection}>
              <p style={styles.sectionTitle}>Brightness</p>
              <div style={styles.sliderRow}>
                <Moon size={16} color="#555" />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={brightness} 
                  onChange={handleBrightnessChange} 
                  style={styles.slider}
                />
                <Sun size={16} color="#555" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div style={styles.tabContent}>
            <div style={styles.appGrid}>
              <button style={styles.appBtn} onClick={() => sendCommand('launch', { app: 'browser' })}>
                <Globe size={24} />
                <span>Safari/Chrome</span>
              </button>
              <button style={styles.appBtn} onClick={() => sendCommand('launch', { app: 'spotify' })}>
                <Music size={24} color="#1DB954" />
                <span>Spotify</span>
              </button>
              <button style={styles.appBtn} onClick={() => sendCommand('launch', { app: 'finder' })}>
                <FolderOpen size={24} />
                <span>Finder</span>
              </button>
              <button style={styles.appBtn} onClick={() => sendCommand('shortcut', { keys: ['command', 'space'] })}>
                <Search size={24} />
                <span>Spotlight</span>
              </button>
              <button style={styles.appBtn} onClick={() => sendCommand('shortcut', { keys: ['command', 'tab'] })}>
                <LayoutGrid size={24} />
                <span>Switch App</span>
              </button>
              <button style={styles.appBtn} onClick={() => sendCommand('key', { key: 'f11' })}>
                <Monitor size={24} />
                <span>Desktop</span>
              </button>
              <button style={styles.appBtn} onClick={() => sendCommand('shortcut', { keys: ['command', 'q'] })}>
                <X size={24} color="#ff3b30" />
                <span>Quit App</span>
              </button>
            </div>
          </div>
        )}

        <div style={styles.keyboardArea}>
            <form onSubmit={handleTextSubmit} style={styles.inputRow}>
              <input 
                style={styles.textInput} 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="Type here..."
              />
              <button type="submit" style={styles.sendBtn}><Send size={18}/></button>
            </form>
            <div style={styles.specialKeys}>
                <button style={styles.keyBtnSmall} onClick={() => sendCommand('key', { key: 'backspace' })}><Delete size={16} /></button>
                <button style={styles.keyBtnSmall} onClick={() => sendCommand('key', { key: 'space' })}><Space size={16}/></button>
                <button style={styles.keyBtnSmall} onClick={() => sendCommand('key', { key: 'enter' })}><CornerDownLeft size={16}/></button>
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
    padding: '12px 20px',
    backgroundColor: '#111',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
  },
  lockButton: {
    backgroundColor: '#ff3b30',
    color: '#fff',
    border: 'none',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusBadge: {
    fontSize: '11px',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#111',
    borderBottom: '1px solid #222',
  },
  tab: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '15px',
    gap: '12px',
    overflowY: 'auto',
  },
  tabContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  touchpadContainer: {
    flex: 1,
    display: 'flex',
    gap: '10px',
    minHeight: '200px',
  },
  touchpad: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #222',
    touchAction: 'none',
  },
  scrollbar: {
    width: '45px',
    backgroundColor: '#111',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #222',
    touchAction: 'none',
  },
  scrollIcon: {
    color: '#333',
    fontSize: '18px',
  },
  targetRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '5px',
  },
  targetBtn: {
    padding: '8px 2px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  clickGrid: {
    display: 'flex',
    gap: '10px',
  },
  clickBtn: {
    flex: 1,
    padding: '16px',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
  },
  arrowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    width: '180px',
    margin: '0 auto',
  },
  controlSection: {
    backgroundColor: '#111',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid #222',
  },
  sectionTitle: {
    fontSize: '11px',
    color: '#555',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  volumeGroup: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '4px',
  },
  mediaGroup: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
  },
  mediaBtn: {
    backgroundColor: '#1a1a1a',
    border: 'none',
    color: '#fff',
    padding: '12px',
    borderRadius: '50%',
  },
  mediaBtnPrimary: {
    backgroundColor: '#007aff',
    border: 'none',
    color: '#fff',
    padding: '18px',
    borderRadius: '50%',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
  },
  slider: {
    flex: 1,
    accentColor: '#007aff',
  },
  muteBtn: {
    backgroundColor: '#222',
    border: 'none',
    color: '#fff',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  appBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '15px',
    backgroundColor: '#111',
    border: '1px solid #222',
    borderRadius: '16px',
    color: '#aaa',
    fontSize: '12px',
  },
  iconBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#fff',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardArea: {
    marginTop: 'auto',
    backgroundColor: '#111',
    padding: '12px',
    borderRadius: '16px',
    border: '1px solid #222',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  sendBtn: {
    backgroundColor: '#007aff',
    color: '#fff',
    border: 'none',
    padding: '0 12px',
    borderRadius: '8px',
  },
  specialKeys: {
    display: 'flex',
    gap: '8px',
  },
  keyBtn: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#aaa',
    padding: '12px',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyBtnSmall: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    color: '#888',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
};

export default App;
