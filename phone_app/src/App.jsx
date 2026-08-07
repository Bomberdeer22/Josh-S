import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, Volume1, VolumeX, MousePointer, Send, Lock, 
  Delete, CornerDownLeft, Space, Play, SkipBack, SkipForward, 
  Sun, Moon, Monitor, Search, LayoutGrid, Globe, FolderOpen,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X, Music,
  Eye, RefreshCw, Trash2, ShieldAlert, Battery, MapPin, AlertCircle, Power, ExternalLink
} from 'lucide-react';

function App() {
  const [ip, setIp] = useState(window.location.hostname || '');
  const [status, setStatus] = useState('Connecting...');
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState('mouse');
  const [mediaTarget, setMediaTarget] = useState('auto');
  const [brightness, setBrightness] = useState(0.5);
  const [volume, setVolume] = useState(50);
  const [lostMsg, setLostMsg] = useState('This Mac is lost. Please return to Josh S.');
  const [lostInfo, setLostInfo] = useState({ battery: '--', location: 'Fetching...', lat: 0, lon: 0 });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [messages, setMessages] = useState([]);
  
  const lastPos = useRef({ x: 0, y: 0 });
  const moveBuffer = useRef({ dx: 0, dy: 0 });
  const scrollBuffer = useRef(0);
  const latestBrightness = useRef(0.5);
  const latestVolume = useRef(50);
  const brightnessTimer = useRef(null);
  const volumeTimer = useRef(null);

  useEffect(() => {
    const registerDevice = async () => {
      try {
        let batteryLevel = 0;
        try {
          if ('getBattery' in navigator) {
            const batt = await (navigator).getBattery();
            batteryLevel = Math.round(batt.level * 100);
            batt.addEventListener('levelchange', () => {
              registerDevice();
            });
          }
        } catch (e) {}

        let storageInfo = { used: 32, total: 128 }; // Default Samsung guess
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                // Browsers provide quota for the APP, not the device.
                // We'll use a mix of real quota and device-realistic defaults for a better 'feel'
                const rawUsed = Math.round((estimate.usage || 0) / (1024 * 1024 * 1024)); 
                storageInfo.used = rawUsed > 0 ? rawUsed : 45; // Minimum 45GB used (Android OS + Apps)
                storageInfo.total = 128; // Standard Samsung base
            }
        } catch (e) {}

        const specs = {
          model: navigator.userAgent.includes('Android') ? 'Samsung Galaxy' : 'Mobile Remote',
          platform: navigator.platform,
          battery: batteryLevel,
          storage: storageInfo,
          screen: `${window.screen.width}x${window.screen.height}`
        };

        await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(specs),
        });
      } catch (e) {}
    };
    registerDevice();

    const fetchMessages = async () => {
      try {
        const res = await fetch('/messages');
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (e) {}
    };
    const msgInterval = setInterval(fetchMessages, 3000);

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
    return () => { clearInterval(interval); clearInterval(msgInterval); };
  }, []);

  const sendCommand = async (endpoint, data = {}, method = 'POST') => {
    try {
      const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (method === 'POST') options.body = JSON.stringify(data);
      const response = await fetch(`/${endpoint}`, options);
      if (response.ok) {
          setStatus('Connected');
          if (endpoint === 'lost_info') {
              const info = await response.json();
              setLostInfo(info);
          }
      } else setStatus('Error');
    } catch (e) { setStatus('Offline'); }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    await sendCommand('broadcast', { message: broadcastMsg });
    setBroadcastMsg('');
  };

  const handleBrightnessChange = (e) => {
    const val = parseFloat(e.target.value);
    setBrightness(val);
    latestBrightness.current = val;
    if (brightnessTimer.current) return;
    brightnessTimer.current = setTimeout(() => {
      sendCommand('brightness', { level: latestBrightness.current });
      brightnessTimer.current = null;
    }, 50);
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    latestVolume.current = val;
    if (volumeTimer.current) return;
    volumeTimer.current = setTimeout(() => {
      sendCommand('volume', { level: latestVolume.current });
      volumeTimer.current = null;
    }, 50);
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

  const handleTouchEnd = () => { lastPos.current = { x: 0, y: 0 }; };

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
          <div style={styles.headerBtns}>
              <button style={styles.headerBtn} onClick={() => window.location.reload()}><RefreshCw size={16} /> Refresh</button>
              <button style={styles.headerBtn} onClick={() => sendCommand('show_window')}><Eye size={16} /> Show</button>
              <button style={{...styles.headerBtn, backgroundColor: '#ff3b30'}} onClick={() => sendCommand('lock')}><Lock size={16} /> Lock</button>
          </div>
        </div>
        <div style={styles.statusBadge}>
          <div style={{...styles.statusDot, backgroundColor: status === 'Connected' ? '#4CAF50' : '#f44336'}} />
          {status}
        </div>
      </header>

      <nav style={styles.tabs}>
        <button style={{...styles.tab, color: activeTab === 'mouse' ? '#007aff' : '#888', borderBottom: activeTab === 'mouse' ? '2px solid #007aff' : 'none'}} onClick={() => setActiveTab('mouse')}>Mouse</button>
        <button style={{...styles.tab, color: activeTab === 'media' ? '#007aff' : '#888', borderBottom: activeTab === 'media' ? '2px solid #007aff' : 'none'}} onClick={() => setActiveTab('media')}>Media</button>
        <button style={{...styles.tab, color: activeTab === 'apps' ? '#007aff' : '#888', borderBottom: activeTab === 'apps' ? '2px solid #007aff' : 'none'}} onClick={() => setActiveTab('apps')}>Apps</button>
        <button style={{...styles.tab, color: activeTab === 'lost' ? '#ff3b30' : '#888', borderBottom: activeTab === 'lost' ? '2px solid #ff3b30' : 'none'}} onClick={() => { setActiveTab('lost'); sendCommand('lost_info', {}, 'GET'); }}>Lost</button>
      </nav>

      <main style={styles.main}>
        {activeTab === 'mouse' && (
          <div style={styles.tabContent}>
            <div style={styles.touchpadContainer}>
              <div style={styles.touchpad} onTouchMove={handleTouchMove} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}><MousePointer size={40} color="#333" /></div>
              <div style={styles.scrollbar} onTouchMove={handleScrollMove} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}><div style={styles.scrollIcon}>↕</div></div>
            </div>
            <div style={styles.clickGrid}>
              <button style={styles.clickBtn} onClick={() => sendCommand('click', { button: 'left' })}>Left Click</button>
              <button style={styles.clickBtn} onClick={() => sendCommand('click', { button: 'right' })}>Right Click</button>
            </div>
            <div style={styles.arrowGrid}>
                <div /><button style={styles.keyBtn} onClick={() => sendCommand('key', { key: 'up' })}><ChevronUp /></button><div />
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
                 {['auto', 'spotify', 'chrome', 'music'].map(t => (
                     <button key={t} style={{...styles.targetBtn, backgroundColor: mediaTarget === t ? (t==='spotify'?'#1DB954':t==='chrome'?'#4285F4':t==='music'?'#FC3C44':'#007aff') : '#222'}} onClick={() => setMediaTarget(t)}>{t.toUpperCase()}</button>
                 ))}
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
                <input type="range" min="0" max="100" step="1" value={volume} onChange={handleVolumeChange} style={styles.slider} />
                <Volume2 size={16} color="#555" />
              </div>
            </div>
            <div style={styles.controlSection}>
              <p style={styles.sectionTitle}>Brightness</p>
              <div style={styles.sliderRow}>
                <Moon size={16} color="#555" />
                <input type="range" min="0" max="1" step="0.05" value={brightness} onChange={handleBrightnessChange} style={styles.slider} />
                <Sun size={16} color="#555" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apps' && (
          <div style={styles.tabContent}>
            <div style={styles.appGrid}>
              <button style={styles.appBtn} onClick={() => sendCommand('launch', { app: 'browser' })}><Globe size={24} /><span>Browser</span></button>
              <button style={styles.appBtn} onClick={() => sendCommand('launch', { app: 'spotify' })}><Music size={24} color="#1DB954" /><span>Spotify</span></button>
              <button style={styles.appBtn} onClick={() => sendCommand('launch', { app: 'finder' })}><FolderOpen size={24} /><span>Finder</span></button>
              <button style={styles.appBtn} onClick={() => sendCommand('shortcut', { keys: ['command', 'space'] })}><Search size={24} /><span>Spotlight</span></button>
              <button style={styles.appBtn} onClick={() => sendCommand('shortcut', { keys: ['command', 'tab'] })}><LayoutGrid size={24} /><span>Switch App</span></button>
              <button style={styles.appBtn} onClick={() => sendCommand('key', { key: 'f11' })}><Monitor size={24} /><span>Desktop</span></button>
              <button style={{...styles.appBtn, color: '#ff3b30'}} onClick={() => { if(window.confirm("Empty trash?")) sendCommand('empty_trash') }}><Trash2 size={24} color="#ff3b30" /><span>Empty Trash</span></button>
              <button style={{...styles.appBtn, border: '1px solid #007aff'}} onClick={() => sendCommand('update')}><RefreshCw size={24} color="#007aff" /><span style={{color: '#007aff'}}>Update Mac</span></button>
            </div>
            <div style={styles.controlSection}>
              <p style={styles.sectionTitle}>Global Device Chat</p>
              <div style={styles.msgFeed}>
                {messages.map((m, i) => (
                  <div key={i} style={styles.msgItem}><span style={styles.msgSender}>{m.sender}:</span> {m.content}</div>
                ))}
              </div>
              <form onSubmit={sendBroadcast} style={styles.inputRow}>
                <input style={styles.textInput} value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} placeholder="Broadcast message..." />
                <button type="submit" style={styles.sendBtn}><Send size={18}/></button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'lost' && (
          <div style={styles.tabContent}>
            <div style={styles.infoCard}>
                <div style={styles.infoItem}><Battery color="#4CAF50" /> <div><p style={styles.infoLabel}>Battery</p><strong>{lostInfo.battery}</strong></div></div>
                <div style={styles.infoItem}><MapPin color="#ff3b30" /> <div><p style={styles.infoLabel}>Location</p><strong>{lostInfo.location}</strong></div></div>
                {lostInfo.lat !== 0 && (
                   <div style={styles.mapContainer}>
                      <img style={styles.mapImg} src={`https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${lostInfo.lon},${lostInfo.lat}&z=13&l=map&size=450,200&pt=${lostInfo.lon},${lostInfo.lat},pm2rdl`} alt="Map" />
                      <button style={styles.mapLink} onClick={() => window.open(`https://www.google.com/maps?q=${lostInfo.lat},${lostInfo.lon}`, '_blank')}><ExternalLink size={14} /> Open in Maps</button>
                   </div>
                )}
                <button style={styles.refreshBtn} onClick={() => sendCommand('lost_info', {}, 'GET')}><RefreshCw size={14} /> Refresh Info</button>
            </div>
            <div style={styles.controlSection}>
                <p style={styles.sectionTitle}>Lost Mode Controls</p>
                <div style={styles.lostActions}>
                    <button style={styles.noiseBtn} onClick={() => sendCommand('play_noise')}><AlertCircle size={20} /> Play Loud Sound</button>
                    <div style={styles.msgBox}>
                        <textarea style={styles.msgInput} value={lostMsg} onChange={(e) => setLostMsg(e.target.value)} />
                        <button style={styles.activateBtn} onClick={() => sendCommand('lost_mode', { message: lostMsg })}><ShieldAlert size={18}/> Activate Lost Mode</button>
                    </div>
                </div>
            </div>
          </div>
        )}

        <div style={styles.keyboardArea}>
            <form onSubmit={handleTextSubmit} style={styles.inputRow}>
              <input style={styles.textInput} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type here..." />
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
  container: { fontFamily: '-apple-system, system-ui, sans-serif', backgroundColor: '#000', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '12px 20px', backgroundColor: '#111' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  title: { fontSize: '18px', fontWeight: '700', margin: 0 },
  headerBtns: { display: 'flex', gap: '8px' },
  headerBtn: { backgroundColor: '#222', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' },
  statusBadge: { fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%' },
  tabs: { display: 'flex', backgroundColor: '#111', borderBottom: '1px solid #222' },
  tab: { flex: 1, padding: '12px', backgroundColor: 'transparent', border: 'none', fontSize: '12px', fontWeight: '600' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', padding: '15px', gap: '12px', overflowY: 'auto' },
  tabContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' },
  touchpadContainer: { flex: 1, display: 'flex', gap: '10px', minHeight: '180px' },
  touchpad: { flex: 1, backgroundColor: '#111', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #222', touchAction: 'none' },
  scrollbar: { width: '45px', backgroundColor: '#111', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #222', touchAction: 'none' },
  scrollIcon: { color: '#333', fontSize: '18px' },
  targetRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' },
  targetBtn: { padding: '8px 2px', border: 'none', borderRadius: '6px', color: 'white', fontSize: '10px', fontWeight: 'bold' },
  clickGrid: { display: 'flex', gap: '10px' },
  clickBtn: { flex: 1, padding: '16px', backgroundColor: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: '12px', fontSize: '14px', fontWeight: '600' },
  arrowGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '180px', margin: '0 auto' },
  controlSection: { backgroundColor: '#111', padding: '12px', borderRadius: '16px', border: '1px solid #222' },
  sectionTitle: { fontSize: '11px', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' },
  volumeGroup: { display: 'flex', justifyContent: 'space-around', backgroundColor: '#1a1a1a', borderRadius: '12px', padding: '4px' },
  mediaGroup: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' },
  mediaBtn: { backgroundColor: '#1a1a1a', border: 'none', color: '#fff', padding: '12px', borderRadius: '50%' },
  mediaBtnPrimary: { backgroundColor: '#007aff', border: 'none', color: '#fff', padding: '18px', borderRadius: '50%' },
  sliderRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' },
  slider: { flex: 1, accentColor: '#007aff' },
  muteBtn: { backgroundColor: '#222', border: 'none', color: '#fff', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  appGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  appBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '15px', backgroundColor: '#111', border: '1px solid #222', borderRadius: '16px', color: '#aaa', fontSize: '12px' },
  infoCard: { backgroundColor: '#1a1a1a', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '15px' },
  infoLabel: { fontSize: '12px', color: '#888', margin: 0 },
  mapContainer: { borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', border: '1px solid #333', marginTop: '5px' },
  mapImg: { width: '100%', height: 'auto', display: 'block' },
  mapLink: { width: '100%', padding: '10px', backgroundColor: '#222', border: 'none', color: '#007aff', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  refreshBtn: { backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', marginTop: '10px' },
  msgFeed: { backgroundColor: '#0a0a0a', borderRadius: '8px', padding: '10px', height: '120px', overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '5px' },
  msgItem: { fontSize: '11px', color: '#ccc' },
  msgSender: { color: '#007aff', fontWeight: 'bold', marginRight: '5px' },
  lostActions: { display: 'flex', flexDirection: 'column', gap: '15px' },
  noiseBtn: { backgroundColor: '#ff3b30', color: '#fff', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  msgBox: { display: 'flex', flexDirection: 'column', gap: '10px' },
  msgInput: { backgroundColor: '#222', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', minHeight: '60px' },
  activateBtn: { backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '12px', padding: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  keyboardArea: { marginTop: 'auto', backgroundColor: '#111', padding: '12px', borderRadius: '16px', border: '1px solid #222' },
  inputRow: { display: 'flex', gap: '8px', marginBottom: '8px' },
  textInput: { flex: 1, backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '10px', borderRadius: '8px', fontSize: '14px' },
  sendBtn: { backgroundColor: '#007aff', color: '#fff', border: 'none', padding: '0 12px', borderRadius: '8px' },
  specialKeys: { display: 'flex', gap: '8px' },
  keyBtnSmall: { flex: 1, backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#888', padding: '8px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }
};

export default App;
