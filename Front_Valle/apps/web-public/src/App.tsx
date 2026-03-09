import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

type Hero = {
  title: string
  highlighted: string
  subtitle: string
  primaryCta: string
  primaryHref: string
  secondaryCta: string
  secondaryHref: string
}

type Card = {
  id: string
  title?: string
  label?: string
  value?: string
  suffix?: string | null
  text?: string
  description?: string
  excerpt?: string
  dateText?: string
  tag?: string
  detail?: string
  stage?: string
}

type HomePayload = {
  hero: Hero | null
  kpis: Card[]
  capabilities: Card[]
  focusAreas: Card[]
  audiences: Card[]
  timeline: Card[]
  spotlight: Card[]
  news: Card[]
}

type LoginResponse = {
  accessToken: string
  user: {
    id: string
    email: string
    role: string
  }
}

const emptyPayload: HomePayload = {
  hero: null,
  kpis: [],
  capabilities: [],
  focusAreas: [],
  audiences: [],
  timeline: [],
  spotlight: [],
  news: []
}

function HomePage() {
  const [status, setStatus] = useState('Conectando con plataforma...')
  const [home, setHome] = useState<HomePayload>(emptyPayload)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  const location = useLocation()

  const apiUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4300', [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntro(false)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!location.hash || showIntro) {
      return
    }

    const sectionId = location.hash.slice(1)

    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 20)
  }, [location.hash, showIntro])

  useEffect(() => {
    Promise.all([fetch(`${apiUrl}/health`), fetch(`${apiUrl}/api/cms/home`)])
      .then(async ([healthRes, homeRes]) => {
        if (!healthRes.ok || !homeRes.ok) {
          throw new Error('Servicios no disponibles')
        }

        const healthPayload = await healthRes.json()
        const homePayload = (await homeRes.json()) as HomePayload

        setStatus(`Gateway ${healthPayload.status} | CMS conectado`)
        setHome(homePayload)
      })
      .catch(() => {
        setStatus('No hay conexion con API. Ejecuta npm run dev:core.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [apiUrl])

  return (
    <main className="portal-shell">
      <div className="ambient-grid" />

      {!isSidebarOpen ? <button className="sidebar-toggle-fab" onClick={() => setIsSidebarOpen(true)} type="button">Menu</button> : null}

      <header className="portal-header">
        <Link className="header-login" to="/login">Ingresar</Link>
        <Link className="header-apply" to="/#cta">Aplicar</Link>
      </header>

      <aside className={`portal-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top-row">
          <Link className="brand-mark" onClick={() => setIsSidebarOpen(false)} to="/">
            <span className="brand-overline">Unidad academica</span>
            <span className="brand-title">VALLE DEL SOFTWARE</span>
          </Link>
          <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)} type="button">Cerrar</button>
        </div>

        <nav className="sidebar-nav">
          <Link className="sidebar-link" onClick={() => setIsSidebarOpen(false)} to="/#inicio">Inicio</Link>
          <Link className="sidebar-link" onClick={() => setIsSidebarOpen(false)} to="/#enfoque">El Valle</Link>
          <Link className="sidebar-link" onClick={() => setIsSidebarOpen(false)} to="/#cta">Convocatorias</Link>
          <Link className="sidebar-link" onClick={() => setIsSidebarOpen(false)} to="/#formacion">Formacion</Link>
          <Link className="sidebar-link" onClick={() => setIsSidebarOpen(false)} to="/#semilleros">Semilleros</Link>
          <Link className="sidebar-link" onClick={() => setIsSidebarOpen(false)} to="/#noticias">Noticias</Link>
        </nav>

      </aside>

      {isSidebarOpen ? <button className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} type="button" /> : null}

      <div className="portal-content">

      <section className={`mx-auto max-w-7xl px-6 pb-12 pt-12 md:px-10 md:pt-16 ${showIntro ? 'intro-screen' : ''}`} id="inicio">
        <div className={`hero-shell reveal-up ${showIntro ? 'intro-only' : ''}`}>
          <p className="chip">Portal universitario de innovacion</p>
          <h1 className="hero-title">
            <span>Construimos el futuro de la</span>
            <span className="hero-highlight">tecnologia universitaria</span>
          </h1>

          {!showIntro ? (
            <>
              <p className="hero-subtitle">{home.hero?.subtitle ?? 'Un ecosistema academico de innovacion que integra formacion en software, investigacion en inteligencia artificial y robotica aplicada para impulsar el talento tecnologico del futuro.'}</p>
              <div className="hero-actions">
                <Link className="apply-button" to="/#cta">Aplicar al Valle</Link>
                <Link className="cta-secondary" to="/#semilleros">Ver proyectos</Link>
              </div>
              <p className="hero-status">{status}</p>
            </>
          ) : null}
        </div>
      </section>

      {!showIntro ? (
        <>

      <section className="mx-auto max-w-7xl px-6 pb-14 md:px-10">
        <div className="grid gap-4 md:grid-cols-4">
          {home.kpis.map((kpi, index) => (
            <article className="kpi-card reveal-up" key={kpi.id} style={{ animationDelay: `${index * 120}ms` }}>
              <p className="text-xs uppercase tracking-widest text-cyan-200/70">{kpi.label}</p>
              <p className="mt-2 text-4xl font-black text-white">{kpi.value}{kpi.suffix ?? ''}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 md:grid-cols-[1.1fr_0.9fr] md:px-10" id="formacion">
        <div className="glass-panel reveal-up">
          <p className="section-title">Transformando industrias con IA</p>
          <p className="section-text">
            Nuestros proyectos integran software avanzado, analitica y modelos de inteligencia artificial para llevar soluciones desde el laboratorio hasta escenarios reales.
          </p>
          <div className="mt-7 grid gap-3">
            {home.capabilities.map((capability) => (
              <article className="capability-card" key={capability.id}>
                <p className="font-semibold text-white">{capability.title}</p>
                <p className="mt-1 text-sm text-cyan-100/80">{capability.description}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="brain-frame reveal-up">
          <div className="scanline" />
          <div className="brain-core" />
          <p className="absolute bottom-6 left-6 right-6 text-sm text-cyan-100/80">
            Arquitecturas cloud native, data pipelines, modelos embebidos y fabricas de software orientadas a impacto.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10" id="enfoque">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="glass-panel reveal-up">
            <p className="section-title">Areas de enfoque estrategico</p>
            <ul className="mt-5 space-y-3 text-cyan-50/90">
              {home.focusAreas.map((focus) => (
                <li className="flex gap-3" key={focus.id}>
                  <span className="mt-2 block h-2 w-2 rounded-full bg-[#f2c500]" />
                  <span>{focus.text}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="glass-panel reveal-up">
            <p className="section-title">Quienes hacen parte</p>
            <div className="mt-5 space-y-3">
              {home.audiences.map((audience) => (
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4" key={audience.id}>
                  <p className="font-semibold text-white">{audience.title}</p>
                  <p className="mt-1 text-sm text-cyan-100/80">{audience.description}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10" id="semilleros">
        <p className="section-title reveal-up">Motor operativo El Valle</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {home.spotlight.map((item, index) => (
            <article className="spotlight-card reveal-up" key={item.id} style={{ animationDelay: `${index * 140}ms` }}>
              <p className="text-xs uppercase tracking-widest text-[#f2c500]">{item.tag}</p>
              <p className="mt-2 text-2xl font-bold text-white">{item.title}</p>
              <p className="mt-3 text-sm text-cyan-100/85">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <div className="timeline-grid reveal-up">
          {home.timeline.map((step) => (
            <article className="timeline-item" key={step.id}>
              <p className="text-xs uppercase tracking-wider text-cyan-200">{step.stage}</p>
              <p className="mt-2 text-sm text-cyan-100/85">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10" id="noticias">
        <p className="section-title reveal-up">Noticias y eventos</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {home.news.map((item) => (
            <article className="news-card reveal-up" key={item.id}>
              <p className="text-xs uppercase tracking-widest text-cyan-200">{item.dateText}</p>
              <p className="mt-2 text-xl font-semibold text-white">{item.title}</p>
              <p className="mt-3 text-sm text-cyan-100/80">{item.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10" id="cta">
        <div className="cta-banner reveal-up">
          <p className="text-3xl font-black text-white md:text-5xl">Construyamos el proximo ciclo de innovacion</p>
          <p className="mt-3 max-w-2xl text-cyan-100/90">
            Convocatorias, rutas, semilleros y proyectos conectados en una plataforma integrada de alto rendimiento.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="cta-primary" to="/#noticias">{home.hero?.primaryCta ?? 'Postulate'}</Link>
            <Link className="cta-secondary" to="/login">Ingresar</Link>
          </div>
        </div>
      </section>
        </>
      ) : null}
      </div>

      {isLoading ? <div className="loader-overlay">Cargando experiencia futurista...</div> : null}
    </main>
  )
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()
  const apiUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4300', [])
  const platformUrl = useMemo(() => import.meta.env.VITE_PLATFORM_URL ?? 'http://localhost:5175', [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const payload = (await response.json()) as LoginResponse | { error?: string }

      if (!response.ok || !('accessToken' in payload)) {
        throw new Error('error' in payload && payload.error ? payload.error : 'Credenciales invalidas')
      }

      localStorage.setItem('valle_access_token', payload.accessToken)
      localStorage.setItem('valle_user', JSON.stringify(payload.user))
      setSuccess(`Ingreso exitoso como ${payload.user.role}. Redirigiendo a plataforma...`)

      setTimeout(() => {
        window.location.assign(platformUrl)
      }, 900)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-background" />
      <section className="login-shell reveal-up">
        <p className="chip">Acceso institucional</p>
        <h1 className="login-title">Ingreso a Valle del Software</h1>
        <p className="login-subtitle">Usa tus credenciales de coordinador, mentor, estudiante o cliente.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">Correo</label>
          <input className="login-input" id="email" onChange={(event) => setEmail(event.target.value)} placeholder="correo@institucion.edu" required type="email" value={email} />

          <label className="login-label" htmlFor="password">Contrasena</label>
          <input className="login-input" id="password" onChange={(event) => setPassword(event.target.value)} placeholder="********" required type="password" value={password} />

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button className="login-submit" disabled={isLoading} type="submit">
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-footer">
          <button className="back-link" onClick={() => navigate('/')} type="button">Volver al portal</button>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
