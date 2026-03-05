import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.homeHero.deleteMany();
  await prisma.homeKpi.deleteMany();
  await prisma.homeCapability.deleteMany();
  await prisma.homeFocus.deleteMany();
  await prisma.homeAudience.deleteMany();
  await prisma.homeTimeline.deleteMany();
  await prisma.homeSpotlight.deleteMany();
  await prisma.homeNews.deleteMany();

  await prisma.homeHero.create({
    data: {
      title: "Valle del Software y la",
      highlighted: "Inteligencia Artificial",
      subtitle:
        "Un ecosistema de formacion, investigacion aplicada y fabrica de software para convertir talento en soluciones reales.",
      primaryCta: "Ver convocatorias",
      primaryHref: "/convocatorias",
      secondaryCta: "Ingresar a plataforma",
      secondaryHref: "/ingresar"
    }
  });

  await prisma.homeKpi.createMany({
    data: [
      { label: "Cohortes activas", value: "12", suffix: null, order: 1 },
      { label: "Estudiantes", value: "480", suffix: "+", order: 2 },
      { label: "Semilleros", value: "9", suffix: null, order: 3 },
      { label: "Proyectos PMO", value: "34", suffix: null, order: 4 }
    ]
  });

  await prisma.homeCapability.createMany({
    data: [
      {
        title: "Procesamiento de Lenguaje Natural",
        description: "Asistentes inteligentes, analitica semantica y automatizacion de procesos academicos.",
        icon: "brain",
        order: 1
      },
      {
        title: "Computer Vision",
        description: "Modelos para analisis de imagen, monitoreo y clasificacion de evidencia visual.",
        icon: "vision",
        order: 2
      },
      {
        title: "IA en Edge Computing",
        description: "Soluciones optimizadas para dispositivos IoT y laboratorios con baja latencia.",
        icon: "bolt",
        order: 3
      }
    ]
  });

  await prisma.homeFocus.createMany({
    data: [
      { text: "Arquitecturas de software escalables con IA integrada", order: 1 },
      { text: "Modelos de Deep Learning y Transfer Learning", order: 2 },
      { text: "Sistemas inteligentes autonomos y adaptativos", order: 3 },
      { text: "Big Data Analytics con prediccion avanzada", order: 4 }
    ]
  });

  await prisma.homeAudience.createMany({
    data: [
      {
        title: "Estudiantes",
        description: "Participan en rutas intensivas, semilleros y proyectos aplicados con acompanamiento de mentores.",
        order: 1
      },
      {
        title: "Docentes y Mentores",
        description: "Dirigen cohortes, evalunan evidencias y transforman investigacion en resultados concretos.",
        order: 2
      },
      {
        title: "Industria y Clientes",
        description: "Canalizan requerimientos de software e IA mediante un flujo PMO con entregables medibles.",
        order: 3
      }
    ]
  });

  await prisma.homeTimeline.createMany({
    data: [
      { stage: "Convocatoria", detail: "Postulacion digital y validacion por coordinacion academica.", order: 1 },
      { stage: "Cohortes", detail: "Asignacion, agenda en Teams y seguimiento de asistencia.", order: 2 },
      { stage: "Evidencias", detail: "Carga, rubricas, retroalimentacion y trazabilidad completa.", order: 3 },
      { stage: "Impacto", detail: "Certificacion, semilleros y proyectos escalables hacia producto.", order: 4 }
    ]
  });

  await prisma.homeSpotlight.createMany({
    data: [
      {
        title: "Semilleros de Alto Impacto",
        description: "Equipos multidisciplinarios publicando prototipos funcionales en ciclos semestrales.",
        tag: "Semilleros",
        order: 1
      },
      {
        title: "Fabrica de Software",
        description: "Gestion de proyectos con backlog, sprints, aprobaciones y cierre con lecciones aprendidas.",
        tag: "PMO",
        order: 2
      },
      {
        title: "Formacion Acelerada",
        description: "Rutas enfocadas en IA aplicada y desarrollo de software de vanguardia.",
        tag: "Formacion",
        order: 3
      }
    ]
  });

  await prisma.homeNews.createMany({
    data: [
      {
        title: "Nueva cohorte IA aplicada 2026",
        excerpt: "Abiertas postulaciones para estudiantes enfocados en soluciones de impacto regional.",
        dateText: "Mar 2026",
        order: 1
      },
      {
        title: "Demo day de semilleros",
        excerpt: "Presentacion de resultados, prototipos y trabajos destacados ante aliados externos.",
        dateText: "Abr 2026",
        order: 2
      },
      {
        title: "Laboratorio PMO en marcha",
        excerpt: "Arranca la gestion de proyectos institucionales con seguimiento de entregables.",
        dateText: "May 2026",
        order: 3
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
