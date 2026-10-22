import Header from '../components/home/Header.jsx'
import './Login.css'

export default function Login() {
  return (
    <div className="login-page">
      <Header role="customer" showNavigation />

      <main className="login-main">
        <section className="login-card" aria-labelledby="login-title">
          <h1 id="login-title">Log In</h1>

          {/* GP-81 is layout only. GP-82 will add the form and submit handling. */}
          <div className="login-fields">
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@example.com"
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button className="login-button" type="button">Log In</button>

          {/* Mobile Figma copy; signup navigation belongs to its own subtask. */}
          <p className="login-signup">New to Garage Glo? Sign up</p>
        </section>
      </main>
    </div>
  )
}
