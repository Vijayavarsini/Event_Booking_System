import React, { useState } from 'react';
import { loginUser, registerUser, setAuthSession } from '../api/eventsApi';

function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    const username = form.username.trim();
    if (username.length < 3) return 'Username must be at least 3 characters.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'register' && form.password !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setForm({ username: '', password: '', confirmPassword: '' });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const username = form.username.trim();
      if (mode === 'register') {
        await registerUser({ username, password: form.password });
      }

      const loginResponse = await loginUser({ username, password: form.password });
      setAuthSession(loginResponse.data.access_token, loginResponse.data.username);
      onAuthSuccess(loginResponse.data.username);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <div className="auth-container">
      <div className="card" style={{ overflow: 'visible' }}>
        <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 8 }}>
          <span className="section-title">{isRegister ? 'Create Account' : 'Login'}</span>
        </div>

        <div style={{ padding: '10px 22px 24px' }}>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
            {isRegister
              ? 'Sign up to manage your own bookings.'
              : 'Log in to view and manage your own bookings.'}
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6,
              padding: '10px 12px', marginBottom: 14, fontSize: 13, color: '#b91c1c',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label>Username *</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={updateField}
                  placeholder="e.g. alice"
                  autoComplete="username"
                />
              </div>

              <div>
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder="At least 6 characters"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
              </div>

              {isRegister && (
                <div>
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
              <button type="button" className="btn btn-ghost" onClick={switchMode}>
                {isRegister ? 'Have an account? Login' : 'New here? Register'}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Register & Login' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
