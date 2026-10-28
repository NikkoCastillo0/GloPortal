import Header from '../components/layout/Header.jsx'
import './Login.css'
import { supabase } from '../lib/supabase.js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import ErrorPopup from '../components/error/ErrorPopup.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('') // for error displayed under email text field
  const [passwordError, setPasswordError] = useState('') // for error displayed under password text field
  const [errorMessage, setErrorMessage] = useState('') // for error in the error popup
  
  const emailValid = email.includes('@') && email.includes('.')
  const emailEmptyCheck = email.trim() !== '';
  const passwordEmptyCheck = password.trim() !== '';

  const [role, setRole] = useState('');

  const logInFunction = async () => {
    setErrorMessage('')

    try{
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

        setRole(profile.role);

    } catch (er) {
        console.error(er)
        if (er.code === 'invalid_credentials') { //email or password error
          setErrorMessage('The email or password you entered is incorrect. Please try again.')
        }
        else{ // auth error
          setErrorMessage('An error has occurred. Please try again later.')
        }
    } finally{
      
    }
  }

  const navigate = useNavigate();

  useEffect(() =>{
  if (role === 'customer') {
    navigate('/customerportal', { replace: true})
  }
  if (role === 'admin') {
    navigate('/adminportal', { replace: true}) //replace prevents going back to login page if back button is used
  }
  }, [role])

  const emailBlur = (e) =>{
    if (emailEmptyCheck === false || emailValid === false){
      setEmailError('Please enter a valid email address')
    }
    else {
      setEmailError('')
    }
  }

  const passwordBlur = (e) =>{
    if (passwordEmptyCheck === false){
      setPasswordError('Please enter your password')
    }
    else {
      setPasswordError('')
    }
  }

  return (
    <div className="login-page">
      <Header role="customer" showNavigation />
      {errorMessage && (
        <ErrorPopup
          text={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      <main className="login-main">
        <section className="login-card" aria-labelledby="login-title">
          <h1 id="login-title">Log In</h1>

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
                value={email}
                onChange={e => setEmail(e.target.value)} //onChange always updates
                onBlur={emailBlur} // onBlur updates when clicked off from
              />
              {emailError && <p className="login-error">{emailError}</p>}
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={passwordBlur}
              />
              {passwordError && <p className="login-error">{passwordError}</p>}
            </div>
          </div>

          <button 
          className="login-button" 
          type="button" 
          onClick={logInFunction} 
          disabled={!emailValid ||!emailEmptyCheck || !passwordEmptyCheck}>Log In</button>

          {/* Mobile Figma copy; signup navigation belongs to its own subtask. */}
          <p className="login-signup">New to Garage Glo? Sign up</p>
        </section>
      </main>
    </div>
  )
}
