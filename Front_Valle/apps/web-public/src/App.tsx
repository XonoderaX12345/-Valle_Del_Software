import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

type Hero = {
  subtitle: string
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
}

type HomePayload = {
  hero: Hero | null
  kpis: Card[]
  capabilities: Card[]
  focusAreas: Card[]
  audiences: Card[]
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
  spotlight: [],
  news: []
}

function useHomeData() {
  const [status, setStatus] = useState('Conectando con plataforma...')
  const [home, setHome] = useState<HomePayload>(emptyPayload)
  const [isLoading, setIsLoading] = useState(true)

  const apiUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4300', [])

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

  return { home, status, isLoading }
}

function PublicLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isValleOpen, setIsValleOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsSidebarOpen(false)
    if (location.pathname.startsWith('/valle-del-software')) {
      setIsValleOpen(true)
    }
  }, [location.pathname])

  return (
    <main className="spa-shell">
      <div className="ambient-grid" />

      {!isSidebarOpen ? <button className="sidebar-toggle-fab" onClick={() => setIsSidebarOpen(true)} type="button">Menu</button> : null}

      <header className="portal-header">
        <Link className="header-login" to="/login">Ingresar</Link>
        <Link className="header-apply" to="/convocatorias">Aplicar</Link>
      </header>

      <aside className={`portal-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top-row">
          <Link className="brand-mark" to="/">
            <span className="brand-overline">Unidad academica</span>
            <span className="brand-title">VALLE DEL SOFTWARE</span>
          </Link>
          <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)} type="button">Cerrar</button>
        </div>

        <nav className="sidebar-nav">
          <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/">Inicio</NavLink>
          <div className="sidebar-item-with-submenu">
            <button className="sidebar-link sidebar-parent" onClick={() => setIsValleOpen((prev) => !prev)} type="button">
              Valle del software
            </button>
            <div className={`sidebar-submenu ${isValleOpen ? 'open' : ''}`}>
              <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/valle-del-software/quienes-somos">Quienes somos</NavLink>
              <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/valle-del-software/software">Valle del software</NavLink>
              <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/valle-del-software/innovacion">Innovacion</NavLink>
              <NavLink className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`} to="/valle-del-software/robotica">Robotica</NavLink>
            </div>
          </div>
          <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/convocatorias">Convocatorias</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/semilleros">Semilleros</NavLink>
          <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} to="/noticias">Noticias</NavLink>
        </nav>
      </aside>

      {isSidebarOpen ? <button className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} type="button" /> : null}

      <div className="spa-content">
        <Outlet />
      </div>
    </main>
  )
}

function HomePage() {
  const { home, status, isLoading } = useHomeData()
  const cards = [
    { id: 'a', title: 'Valle del software', text: 'Conoce quienes somos y nuestras lineas de software, innovacion y robotica.', path: '/valle-del-software/quienes-somos' },
    { id: 'b', title: 'Convocatorias', text: 'Fechas abiertas, requisitos de ingreso y cronograma de postulacion.', path: '/convocatorias' },
    { id: 'c', title: 'Semilleros', text: 'Proyectos, lineas activas y equipos de investigacion aplicada.', path: '/semilleros' },
    { id: 'd', title: 'Noticias', text: 'Novedades institucionales, logros y agenda de eventos del ecosistema.', path: '/noticias' }
  ]

  const kpis = home.kpis.length > 0 ? home.kpis : [
    { id: 'k1', value: '150', suffix: '+', label: 'proyectos' },
    { id: 'k2', value: '2500', suffix: '+', label: 'estudiantes' },
    { id: 'k3', value: '45', suffix: '', label: 'semilleros' },
    { id: 'k4', value: '80', suffix: '', label: 'aliados' }
  ]

  return (
    <section className="page-wrap">
      <article className="hero-shell">
        <p className="chip">Portal universitario de innovacion</p>
        <h1 className="hero-title">
          <span>Construimos el futuro de la</span>
          <span className="hero-highlight">tecnologia universitaria</span>
        </h1>
        <p className="hero-subtitle">{home.hero?.subtitle ?? 'Un ecosistema academico de innovacion que integra formacion en software, investigacion en inteligencia artificial y robotica aplicada.'}</p>
        <p className="hero-status">{status}</p>
      </article>

      <div className="summary-grid">
        {cards.map((item) => (
          <Link className="summary-card" key={item.id} to={item.path}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Link>
        ))}
      </div>

      <div className="mini-kpi-grid">
        {kpis.map((item) => (
          <article className="kpi-card" key={item.id}>
            <p className="kpi-number">{item.value}{item.suffix ?? ''}</p>
            <p className="kpi-label">{item.label}</p>
          </article>
        ))}
      </div>

      {isLoading ? <div className="loader-overlay">Cargando experiencia institucional...</div> : null}
    </section>
  )
}

function ModulePage({ title, subtitle, cards }: { title: string; subtitle: string; cards: Array<{ id: string; title: string; text: string; meta: string }> }) {
  return (
    <section className="page-wrap">
      <article className="module-header-card">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </article>
      <div className="module-grid-card">
        {cards.map((card) => (
          <article className="module-card" key={card.id}>
            <p className="module-meta">{card.meta}</p>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function QuienesSomosPage() {
  const { home } = useHomeData()
  const source = home.audiences.length > 0 ? home.audiences : [
    { id: 'q1', title: 'Estudiantes', description: 'Participan en rutas de formacion, semilleros y proyectos aplicados.' },
    { id: 'q2', title: 'Mentores', description: 'Guian cohortes, evaluan evidencias y acompanan resultados.' },
    { id: 'q3', title: 'Empresas', description: 'Conectan retos reales con talento universitario.' }
  ]
  const cards = source.map((item) => ({ id: item.id, title: item.title ?? 'Perfil', text: item.description ?? 'Descripcion institucional.', meta: 'Actor del ecosistema' }))
  return <ModulePage cards={cards} subtitle="Roles que articulan el ecosistema Valle del Software." title="Quienes somos" />
}

function ValleSoftwarePage() {
  const { home } = useHomeData()
  const source = home.capabilities.length > 0 ? home.capabilities : [
    { id: 'vs1', title: 'Desarrollo web y movil', description: 'Rutas de aprendizaje orientadas a producto y despliegue cloud.' },
    { id: 'vs2', title: 'Arquitectura de software', description: 'Diseno de sistemas escalables para escenarios academicos y empresariales.' }
  ]
  const cards = source.map((item) => ({ id: item.id, title: item.title ?? 'Linea', text: item.description ?? 'Linea institucional.', meta: 'Valle del software' }))
  return <ModulePage cards={cards} subtitle="Programas de formacion y desarrollo de software aplicado." title="Valle del software" />
}

function InnovacionPage() {
  const cards = [
    { id: 'in1', title: 'Transferencia de conocimiento', text: 'Conectamos academia y sector productivo para resolver retos reales.', meta: 'Innovacion' },
    { id: 'in2', title: 'Laboratorios de prototipado', text: 'Validacion temprana de ideas, MVPs y pilotos de impacto.', meta: 'Innovacion' },
    { id: 'in3', title: 'Emprendimiento', text: 'Acompaniamiento para startups tecnicas con enfoque sostenible.', meta: 'Innovacion' }
  ]
  return <ModulePage cards={cards} subtitle="Estrategias para convertir conocimiento en valor aplicado." title="Innovacion" />
}

function RoboticaPage() {
  const cards = [
    { id: 'ro1', title: 'Sistemas autonomos', text: 'Diseno y pruebas de soluciones roboticas para industria y educacion.', meta: 'Robotica' },
    { id: 'ro2', title: 'Vision por computador', text: 'Modelos de deteccion y analitica visual con IA aplicada.', meta: 'Robotica' },
    { id: 'ro3', title: 'Investigacion aplicada', text: 'Publicaciones, semilleros y desarrollos de impacto regional.', meta: 'Robotica' }
  ]
  return <ModulePage cards={cards} subtitle="Programas y proyectos de robotica e inteligencia artificial." title="Robotica" />
}

function ConvocatoriasPage() {
  const cards = [
    { id: 'c1', title: 'Convocatoria general 2026', text: 'Proceso abierto para rutas de software, innovacion y robotica aplicada.', meta: 'Estado: abierta' },
    { id: 'c2', title: 'Convocatoria empresas aliadas', text: 'Vinculacion de organizaciones para retos de I+D+i y practicas.', meta: 'Estado: proxima' }
  ]
  return <ModulePage cards={cards} subtitle="Fechas, requisitos y estados de postulacion." title="Convocatorias" />
}

function SemillerosPage() {
  const { home } = useHomeData()
  const source = home.focusAreas.length > 0 ? home.focusAreas : [
    { id: 's1', text: 'Arquitecturas escalables con IA integrada.' },
    { id: 's2', text: 'Sistemas inteligentes autonomos para industria 4.0.' }
  ]
  const cards = source.map((item, index) => ({ id: item.id, title: `Semillero ${index + 1}`, text: item.text ?? 'Linea de investigacion.', meta: 'Semilleros' }))
  return <ModulePage cards={cards} subtitle="Lineas activas, equipos y avances de investigacion." title="Semilleros" />
}

function NoticiasPage() {
  const { home } = useHomeData()
  const source = home.news.length > 0 ? home.news : [
    { id: 'n1', title: 'Sin noticias registradas', excerpt: 'Publica noticias en CMS para mostrarlas aqui.', dateText: 'Actualizacion' }
  ]
  const cards = source.map((item) => ({ id: item.id, title: item.title ?? 'Noticia', text: item.excerpt ?? 'Contenido institucional.', meta: item.dateText ?? 'Noticia' }))
  return <ModulePage cards={cards} subtitle="Comunicados, eventos y novedades del ecosistema." title="Noticias" />
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
      <Route element={<PublicLayout />}>
        <Route element={<HomePage />} path="/" />
        <Route element={<Navigate replace to="/valle-del-software/software" />} path="/valle-del-software" />
        <Route element={<QuienesSomosPage />} path="/valle-del-software/quienes-somos" />
        <Route element={<ValleSoftwarePage />} path="/valle-del-software/software" />
        <Route element={<InnovacionPage />} path="/valle-del-software/innovacion" />
        <Route element={<RoboticaPage />} path="/valle-del-software/robotica" />
        <Route element={<ConvocatoriasPage />} path="/convocatorias" />
        <Route element={<SemillerosPage />} path="/semilleros" />
        <Route element={<NoticiasPage />} path="/noticias" />
      </Route>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
