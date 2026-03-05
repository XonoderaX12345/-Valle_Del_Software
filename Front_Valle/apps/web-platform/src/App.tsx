import { useEffect, useState } from 'react'

function App() {
  const [profilesCount, setProfilesCount] = useState<number | null>(null)
  const [homeTitle, setHomeTitle] = useState('Panel inteligente')

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4300'

    Promise.all([fetch(`${apiUrl}/api/users/profiles`), fetch(`${apiUrl}/api/cms/home`)])
      .then(async ([profilesRes, cmsRes]) => {
        if (!profilesRes.ok || !cmsRes.ok) {
          throw new Error('No API')
        }

        const profilesPayload = await profilesRes.json()
        const cmsPayload = await cmsRes.json()

        setProfilesCount(Array.isArray(profilesPayload) ? profilesPayload.length : 0)
        if (cmsPayload?.hero?.highlighted) {
          setHomeTitle(`Centro operativo ${cmsPayload.hero.highlighted}`)
        }
      })
      .catch(() => setProfilesCount(null))
  }, [])

  return (
    <main className="min-h-screen p-6 md:p-10">
      <section className="mx-auto max-w-6xl rounded-3xl border border-blue-200 bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-black text-blue-950 md:text-5xl">Plataforma Operativa El Valle</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-700">
          Esta app servira para panel por roles, gestion academica y PMO. Ya consume datos reales de usuarios desde el gateway.
        </p>
        <p className="mt-2 text-sm font-medium text-blue-700">{homeTitle}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm text-blue-700">Modulo activo</p>
            <p className="mt-1 text-xl font-bold text-blue-950">Usuarios y perfiles</p>
          </article>
          <article className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <p className="text-sm text-yellow-700">Total perfiles</p>
            <p className="mt-1 text-xl font-bold text-yellow-900">
              {profilesCount === null ? 'Sin conexion con API' : profilesCount}
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm text-emerald-700">Servicios</p>
            <p className="mt-1 text-xl font-bold text-emerald-900">Gateway + Auth + Users + CMS</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
