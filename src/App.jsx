import React, { useState, useEffect } from 'react';
import { api } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for New Dream
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDream, setNewDream] = useState({
    title: '',
    content: '',
    isLucid: false,
    date: new Date().toISOString().split('T')[0],
    sleepHours: 8,
    vividness: 5,
    mood: 'Neutral'
  });

  const moods = [
    { label: 'Happy', emoji: '😊' },
    { label: 'Scared', emoji: '😨' },
    { label: 'Curious', emoji: '🤔' },
    { label: 'Peaceful', emoji: '😌' },
    { label: 'Intense', emoji: '🔥' },
    { label: 'Neutral', emoji: '😐' }
  ];

  useEffect(() => {
    const savedPassword = localStorage.getItem('dream_vault_password');
    if (savedPassword) {
      handleVerify(savedPassword);
    }
  }, []);

  const handleVerify = async (pw) => {
    setLoading(true);
    const success = await api.verify(pw);
    if (success) {
      localStorage.setItem('dream_vault_password', pw);
      setIsAuthenticated(true);
      fetchDreams();
    } else {
      setError('Wrong password. Access denied.');
      localStorage.removeItem('dream_vault_password');
    }
    setLoading(false);
  };

  const fetchDreams = async () => {
    try {
      setLoading(true);
      const data = await api.getDreams();
      // Sort: Manual Date first (desc), then created date
      const sorted = data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setDreams(sorted);
    } catch (err) {
      setError('Could not fetch dreams. Session expired?');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDream = async (e) => {
    e.preventDefault();
    if (!newDream.title || !newDream.content) return;
    
    try {
      setLoading(true);
      const added = await api.addDream(newDream);
      const updatedDreams = [added, ...dreams].sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setDreams(updatedDreams);
      setShowAddModal(false);
      setNewDream({ 
        title: '', content: '', isLucid: false, 
        date: new Date().toISOString().split('T')[0], 
        sleepHours: 8, vividness: 5, mood: 'Neutral' 
      });
    } catch (err) {
      alert('Failed to save dream.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await api.deleteDream(id);
      setDreams(dreams.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to delete.');
    }
  };

  const filteredDreams = dreams.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="auth-form glass-panel">
        <h1 className="logo" style={{ marginBottom: '1.5rem' }}>Dream Vault</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Whisper the password to open the gates.</p>
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(password); }}>
          <div className="input-group">
            <label>Master Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p style={{ color: 'var(--accent)', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Unlock Vault'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1 className="logo" onClick={() => fetchDreams()} style={{ cursor: 'pointer' }}>Dream Vault</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ New Memory</button>
          <button className="btn" style={{ background: 'hsla(0, 0%, 100%, 0.1)', width: 'auto' }} onClick={() => {
            localStorage.removeItem('dream_vault_password');
            setIsAuthenticated(false);
          }}>Lock</button>
        </div>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <input 
          type="text" 
          placeholder="Search through your subconscious..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-panel"
          style={{ padding: '1.2rem 2rem', borderRadius: '50px' }}
        />
      </section>

      {loading && dreams.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.5 }}>Conjuring your dreams...</p>
      ) : (
        <div className="dream-grid">
          {filteredDreams.map((dream) => (
            <div key={dream.id} className={`dream-card glass-panel ${dream.isLucid ? 'lucid' : ''}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="dream-date">
                  {new Date(dream.date || dream.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </div>
                {dream.mood && <div title={dream.mood}>{moods.find(m => m.label === dream.mood)?.emoji}</div>}
              </div>
              <h3 className="dream-title">{dream.title}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span className={`dream-type ${dream.isLucid ? 'type-lucid' : 'type-regular'}`}>
                  {dream.isLucid ? '✧ Lucid Trance' : '☾ Deep Slumber'}
                </span>
                {dream.sleepHours && <span className="dream-type" style={{ background: 'hsla(0,0%,100%,0.05)', color: 'var(--text-muted)' }}>💤 {dream.sleepHours}h</span>}
                {dream.vividness && <span className="dream-type" style={{ background: 'hsla(0,0%,100%,0.05)', color: 'var(--accent)' }}>✦ {dream.vividness}/10</span>}
              </div>
              <p className="dream-content">{dream.content}</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  onClick={() => alert(dream.content)} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Read More
                </button>
                <button 
                  onClick={() => handleDelete(dream.id)} 
                  style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.5)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredDreams.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
          <p>No memories found in this corner of the vault.</p>
        </div>
      )}

      {/* Add Dream Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem', backdropFilter: 'blur(10px)'
        }}>
          <div className="glass-panel" style={{ maxWidth: '700px', width: '100%', padding: '2.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Record a Memory</h2>
            <form onSubmit={handleAddDream}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                  <label>Dream Title</label>
                  <input 
                    type="text" 
                    value={newDream.title} 
                    onChange={e => setNewDream({...newDream, title: e.target.value})}
                    placeholder="The Floating City..."
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Dream Date</label>
                  <input 
                    type="date" 
                    value={newDream.date} 
                    onChange={e => setNewDream({...newDream, date: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Sleep Duration (Hours)</label>
                  <input 
                    type="number" 
                    min="0" max="24"
                    value={newDream.sleepHours} 
                    onChange={e => setNewDream({...newDream, sleepHours: e.target.value})}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Vividness: {newDream.vividness}/10</label>
                <input 
                  type="range" 
                  min="1" max="10"
                  value={newDream.vividness} 
                  onChange={e => setNewDream({...newDream, vividness: e.target.value})}
                  style={{ cursor: 'pointer' }}
                />
              </div>

              <div className="input-group">
                <label>Dominant Mood</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {moods.map(m => (
                    <button 
                      key={m.label}
                      type="button"
                      className={`btn ${newDream.mood === m.label ? 'btn-primary' : ''}`}
                      style={{ 
                        width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem',
                        background: newDream.mood === m.label ? '' : 'hsla(0,0%,100%,0.05)',
                        border: '1px solid var(--glass-border)'
                      }}
                      onClick={() => setNewDream({...newDream, mood: m.label})}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>The Experience</label>
                <textarea 
                  rows="4" 
                  value={newDream.content} 
                  onChange={e => setNewDream({...newDream, content: e.target.value})}
                  placeholder="Describe your journey..."
                  required
                />
              </div>

              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="checkbox" 
                  style={{ width: 'auto' }} 
                  checked={newDream.isLucid}
                  onChange={e => setNewDream({...newDream, isLucid: e.target.checked})}
                />
                <label style={{ marginBottom: 0 }}>Was this a Lucid Dream? ✧</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Safe to Vault'}
                </button>
                <button type="button" className="btn" style={{ background: 'none' }} onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
