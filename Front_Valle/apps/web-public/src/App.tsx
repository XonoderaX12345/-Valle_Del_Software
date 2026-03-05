import { useEffect, useMemo, useState } from 'react'

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

function App() {
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

  return (
    <main className="relative overflow-hidden">
      <div className="ambient-grid" />
      <div className="floating-orb orb-a" />
      <div className="floating-orb orb-b" />

      <header className="sticky top-0 z-20 border-b border-cyan-300/20 bg-[#020d33]/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-sm md:px-10">
          <p className="font-semibold tracking-widest text-cyan-100">EL VALLE</p>
          <div className="hidden items-center gap-5 text-cyan-100/90 md:flex">
            <a href="#capabilities">Formacion</a>
            <a href="#spotlight">Semilleros</a>
            <a href="#news">Noticias</a>
            <a href="#focus">Enfoque</a>
          </div>
          <a className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 font-semibold text-cyan-100" href="#cta">
            Ingresar
          </a>
        </nav>
      </header>

      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-14 md:px-10 md:pt-20">
        <div className="hero-shell reveal-up">
          <p className="chip">Unidad de innovacion academica</p>
          <h1 className="max-w-5xl text-4xl font-black leading-[1.03] text-white md:text-7xl">
            {home.hero?.title ?? 'Valle del Software y la'}
            <span className="hero-highlight block">{home.hero?.highlighted ?? 'Inteligencia Artificial'}</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-cyan-50/85 md:text-2xl">{home.hero?.subtitle ?? 'Cargando contenido institucional...'}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="cta-primary" href={home.hero?.primaryHref ?? '#'}>{home.hero?.primaryCta ?? 'Convocatorias'}</a>
            <a className="cta-secondary" href={home.hero?.secondaryHref ?? '#'}>{home.hero?.secondaryCta ?? 'Ingresar'}</a>
          </div>
          <p className="mt-8 text-xs uppercase tracking-widest text-cyan-100/80">{status}</p>
        </div>
      </section>

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

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 md:grid-cols-[1.1fr_0.9fr] md:px-10" id="capabilities">
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

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10" id="focus">
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

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10" id="spotlight">
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

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10" id="news">
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
            <a className="cta-primary" href={home.hero?.primaryHref ?? '#'}>{home.hero?.primaryCta ?? 'Postulate'}</a>
            <a className="cta-secondary" href={home.hero?.secondaryHref ?? '#'}>{home.hero?.secondaryCta ?? 'Ingresar'}</a>
          </div>
        </div>
      </section>

      {isLoading ? <div className="loader-overlay">Cargando experiencia futurista...</div> : null}
    </main>
  )
}

export default App
