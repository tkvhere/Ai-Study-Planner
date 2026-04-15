import { useState } from 'react';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function LoginPage({ onBackHome, onLoginSuccess, onRegisterClick }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Unable to login.');
        return;
      }

      onLoginSuccess({
        message: data.message || `Welcome ${formData.email}`,
        email: data.email || formData.email.trim().toLowerCase(),
        rememberMe: Boolean(data.rememberMe),
      });
    } catch (requestError) {
      setErrorMessage('Cannot reach server. Make sure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-route-shell">
      <section className="login-route-card">
        <p className="eyebrow">Secure Access</p>
        <h1>Login to AI Study Planner</h1>
        <p className="muted-line">
          Use your email and password. New users are automatically created at first sign-in.
        </p>

        {errorMessage && <p className="login-error">{errorMessage}</p>}

        <form className="login-route-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
          />

          <label className="remember-row" htmlFor="rememberMe">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            Remember me
          </label>

          <div className="login-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
            <button type="button" className="secondary" onClick={onBackHome}>
              Back to Home
            </button>
          </div>
        </form>

        <p className="footer-text">
          Don't have an account?{' '}
          {onRegisterClick ? (
            <button type="button" className="link-button" onClick={onRegisterClick}>
              Register here
            </button>
          ) : null}
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
