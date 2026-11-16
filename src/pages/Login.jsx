import Header from '../components/layout/Header.jsx'
import { supabase } from '../lib/supabase.js'
import { useEffect, useState } from 'react'
import ErrorPopup from '../components/error/ErrorPopup.jsx'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [role, setRole] = useState('')

  const navigate = useNavigate()
  const emailValid = email.includes('@') && email.includes('.')
  const emailEmptyCheck = email.trim() !== ''
  const passwordEmptyCheck = password.trim() !== ''

  const logInFunction = async () => {
    setErrorMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile.role)
    } catch (er) {
      console.error(er)

      if (er.code === 'invalid_credentials') {
        setErrorMessage(
          'The email or password you entered is incorrect. Please try again.',
        )
      } else {
        setErrorMessage('An error has occurred. Please try again later.')
      }
    }
  }

  useEffect(() => {
    if (role === 'customer') {
      navigate('/customerportal', { replace: true })
    }

    if (role === 'admin') {
      navigate('/adminportal', { replace: true })
    }
  }, [role, navigate])

  const emailBlur = () => {
    if (!emailEmptyCheck || !emailValid) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const passwordBlur = () => {
    if (!passwordEmptyCheck) {
      setPasswordError('Please enter your password')
    } else {
      setPasswordError('')
    }
  }

  return (
    <div
      className="
        min-h-[100svh] bg-[#999999] text-[#242424]
        [font-family:Inter,'Inter_Variable',sans-serif]
        md:[--login-unit:min(.65px,0.05787037vw,0.055vh)]
        md:bg-[#919191] md:text-[#1e1e1e]
      "
    >
      <Header role="customer" showNavigation={false} />

      {errorMessage && (
        <ErrorPopup
          text={errorMessage}
          onClose={() => setErrorMessage('')}
        />
      )}

      <main className="px-[18px] py-[44px] md:px-0 md:pt-[calc(95_*_var(--login-unit))] md:pb-[calc(370_*_var(--login-unit))]">
        <section
          className="
            mx-auto w-full rounded-[24px] bg-[#ececec]
            px-5 pt-7 pb-[30px]
            md:w-[calc(1454_*_var(--login-unit))]
            md:rounded-[calc(120_*_var(--login-unit))]
            md:bg-[#ebebeb]
            md:px-[calc(227_*_var(--login-unit))]
            md:pt-[calc(113_*_var(--login-unit))]
            md:pb-[calc(133_*_var(--login-unit))]
          "
          aria-labelledby="login-title"
        >
          <h1
            id="login-title"
            className="
              mb-6 text-center text-[28px] font-bold leading-[34px]
              md:mb-[calc(32_*_var(--login-unit))]
              md:text-[calc(64_*_var(--login-unit))]
              md:leading-[calc(78_*_var(--login-unit))]
              md:text-black
            "
          >
            Log In
          </h1>

          <div className="grid gap-[22px] md:gap-[calc(92_*_var(--login-unit))]">
            <div className="grid min-w-0 gap-[10px] md:gap-[calc(30_*_var(--login-unit))]">
              <label
                htmlFor="login-email"
                className="text-base font-normal leading-5 md:text-[calc(48_*_var(--login-unit))] md:leading-[calc(58_*_var(--login-unit))]"
              >
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={emailBlur}
                className="
                  box-border h-10 w-full min-w-0 rounded-lg border border-[#d9d9d9]
                  bg-white px-4 text-base text-[#242424]
                  placeholder:text-[#b3b3b3] placeholder:opacity-100
                  focus-visible:outline-2 focus-visible:outline-offset-[3px]
                  focus-visible:outline-[#323232]
                  md:h-[calc(120_*_var(--login-unit))]
                  md:rounded-[calc(24_*_var(--login-unit))]
                  md:border-[calc(3_*_var(--login-unit))]
                  md:px-[calc(32_*_var(--login-unit))]
                  md:text-[calc(36_*_var(--login-unit))]
                  md:placeholder:text-transparent
                "
              />
              {emailError && (
                <p className="text-[20px] text-[red]">{emailError}</p>
              )}
            </div>

            <div className="grid min-w-0 gap-[10px] md:gap-[calc(30_*_var(--login-unit))]">
              <label
                htmlFor="login-password"
                className="text-base font-normal leading-5 md:text-[calc(48_*_var(--login-unit))] md:leading-[calc(58_*_var(--login-unit))]"
              >
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={passwordBlur}
                className="
                  box-border h-10 w-full min-w-0 rounded-lg border border-[#d9d9d9]
                  bg-white px-4 text-base text-[#242424]
                  placeholder:text-[#b3b3b3] placeholder:opacity-100
                  focus-visible:outline-2 focus-visible:outline-offset-[3px]
                  focus-visible:outline-[#323232]
                  md:h-[calc(120_*_var(--login-unit))]
                  md:rounded-[calc(24_*_var(--login-unit))]
                  md:border-[calc(3_*_var(--login-unit))]
                  md:px-[calc(32_*_var(--login-unit))]
                  md:text-[calc(36_*_var(--login-unit))]
                  md:placeholder:text-transparent
                "
              />
              {passwordError && (
                <p className="text-[20px] text-[red]">{passwordError}</p>
              )}
            </div>
          </div>

          <button
            className="
              mx-auto mt-[22px] block h-12 w-[180px] max-w-full
              cursor-pointer rounded-full border-0 bg-[#2c2c2c]
              px-4 text-base font-normal text-[#f5f5f5]
              focus-visible:outline-2 focus-visible:outline-offset-[3px]
              focus-visible:outline-[#323232]
              disabled:cursor-not-allowed disabled:bg-[#656565]
              md:mt-[calc(133_*_var(--login-unit))]
              md:h-[calc(120_*_var(--login-unit))]
              md:w-[calc(219_*_var(--login-unit))]
              md:rounded-lg md:text-[calc(36_*_var(--login-unit))]
              md:font-semibold
            "
            type="button"
            onClick={logInFunction}
            disabled={!emailValid || !emailEmptyCheck || !passwordEmptyCheck}
          >
            Log In
          </button>

          <p
            className="
              mt-5 text-center text-[13px] leading-4 text-[#757575]
              md:mt-[calc(28_*_var(--login-unit))]
              md:text-[clamp(13px,1.3889vw,24px)] md:leading-[1.5]
            "
          >
            New to Garage Glo?{' '}
            <Link to="/signup" className="login-signup-link">
              Sign up
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}