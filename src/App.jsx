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
    tags: ''
  });

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
      setDreams(data);
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
      setDreams([added, ...dreams]);
      setShowAddModal(false);
      setNewDream({ title: '', content: '', isLucid: false, tags: '' });
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
              <div className="dream-date">
                {new Date(dream.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>
              <h3 className="dream-title">{dream.title}</h3>
              <span className={`dream-type ${dream.isLucid ? 'type-lucid' : 'type-regular'}`}>
                {dream.isLucid ? '✧ Lucid Trance' : '☾ Deep Slumber'}
              </span>
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
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', position: 'relative' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Record a Memory</h2>
            <form onSubmit={handleAddDream}>
              <div className="input-group">
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
                <label>The Experience</label>
                <textarea 
                  rows="6" 
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
