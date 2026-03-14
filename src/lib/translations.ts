export type Lang = "en" | "es";

export const t = {
  en: {
    header: {
      nav: ["Projects", "Stack", "Contact", "Blog"],
      portfolio: "Portfolio ↗",
      cta: "Let's talk",
    },
    hero: {
      badge: "Senior Backend Engineer · 15 years shipping production systems.",
      h1: ["Backend **engineering**", "meets **AI**", "execution"],
      description: {
        pre: "Senior backend engineer crafting",
        highlight1: "scalable platforms",
        mid: ", automation workflows and",
        highlight2: "AI-powered applications",
        to: "with",
        highlight3: "modern cloud architecture",
        end: ".",
      },
      cta1: "View Projects",
      cta2: "Portfolio ↗",
      stats: [
        { value: "15+", label: "Years of experience" },
        { value: "3",   label: "Industries shipped" },
        { value: "∞",   label: "Commits to prod" },
      ],
    },
    about: {
      tag: "About",
      h2: ["Senior Backend", "Engineer", "based in Alicante"],
      p1: {
        pre: "I'm",
        name: "Diego Barrio",
        mid: "— a backend engineer with 15+ years building platforms that don't break under pressure. My career spans",
        industries: "fintech, banking, and mobility",
        end: ", always chasing the same goal: resilient systems that scale.",
      },
      p2: "This site is where I ship my own ideas. No clients, no sprints — just clean engineering and things I wanted to exist.",
      highlights: [
        {
          icon: "🏗",
          title: "Architecture first",
          desc: "DDD, Hexagonal, and event-driven patterns applied with intent — not fashion.",
        },
        {
          icon: "⚙️",
          title: "Ops-aware engineering",
          desc: "Observability baked in from day one. Grafana, Splunk, Sentry — nothing goes dark.",
        },
        {
          icon: "🚢",
          title: "Ships to production",
          desc: "CI/CD pipelines, Docker, Kubernetes. Code that reaches users, reliably.",
        },
      ],
    },
    projects: {
      tag: "Projects",
      h2: ["Things I built", "for real"],
      subtitle: "Production-grade apps. Not side projects gathering dust — things you can open right now.",
      featured: {
        label: "First release",
        status: "live",
        tagline: "Your AI-powered learning companion",
        description:
          "A platform that transforms how you learn. Built with a clean backend architecture and AI integration to deliver personalized educational experiences. The first project shipped under the backendtothefuture.com umbrella.",
        metrics: [
          { label: "Type",  value: "Web App" },
          { label: "Stack", value: "Java + Spring" },
          { label: "Status", value: "Live" },
        ],
        openApp: "Open app",
      },
      upcoming: [
        { name: "Project #2", hint: "Something in fintech...",      eta: "Coming soon" },
        { name: "Project #3", hint: "Observability tooling...",      eta: "In progress" },
      ],
    },
    stack: {
      tag: "Stack",
      h2: ["The tools that", "ship things"],
      subtitle: "15 years of production scars — these are the technologies I trust.",
      cta: "Always learning. Always shipping.",
      ctaLink: "Full profile →",
      categories: [
        { label: "Languages & Frameworks", items: ["Java", "Spring Boot", "Spring Cloud", "TypeScript", "Node.js"] },
        { label: "Architecture",           items: ["Microservices", "DDD", "Hexagonal Arch.", "Event-Driven", "Clean Code", "TDD"] },
        { label: "Messaging & Data",       items: ["Apache Kafka", "PostgreSQL", "MongoDB", "Oracle DB", "SQL Server", "Redis"] },
        { label: "Infrastructure",         items: ["Kubernetes", "Docker", "AWS", "GCP", "CI/CD", "Terraform"] },
        { label: "Observability",          items: ["Grafana", "Prometheus", "Splunk", "Sentry", "OpenTelemetry"] },
      ],
    },
    contact: {
      tag: "Contact",
      h2: ["Let's build something", "worth shipping"],
      subtitle: "Open to collaborations, interesting backend challenges, and conversations about architecture. Drop me a line.",
      terminal: {
        whoami: "diego barrio · senior backend engineer",
        location: "alicante, spain 🇪🇸",
        languages: "spanish (native) · english (C1)",
        status: "open to opportunities",
      },
    },
    footer: {
      copyright: "built with Next.js",
    },
  },

  es: {
    header: {
      nav: ["Proyectos", "Stack", "Contacto", "Blog"],
      portfolio: "Portfolio ↗",
      cta: "Hablemos",
    },
    hero: {
      badge: "Senior Backend Engineer · 15 años lanzando sistemas en producción.",
      h1: ["Ingeniería **backend**", "y ejecución", "con **IA**"],
      description: {
        pre: "Senior backend engineer creando",
        highlight1: "plataformas escalables",
        mid: ", flujos de automatización y",
        highlight2: "aplicaciones con IA",
        to: "con",
        highlight3: "arquitectura cloud moderna",
        end: ".",
      },
      cta1: "Ver proyectos",
      cta2: "Portfolio ↗",
      stats: [
        { value: "15+", label: "Años de experiencia" },
        { value: "3",   label: "Sectores trabajados" },
        { value: "∞",   label: "Commits a prod" },
      ],
    },
    about: {
      tag: "Sobre mí",
      h2: ["Senior Backend", "Engineer", "en Alicante"],
      p1: {
        pre: "Soy",
        name: "Diego Barrio",
        mid: "— ingeniero backend con más de 15 años construyendo plataformas que no se rompen bajo presión. Mi carrera abarca",
        industries: "fintech, banca y movilidad",
        end: ", siempre con el mismo objetivo: sistemas resilientes que escalan.",
      },
      p2: "Este sitio es donde publico mis propias ideas. Sin clientes, sin sprints — solo ingeniería limpia y cosas que quería que existieran.",
      highlights: [
        {
          icon: "🏗",
          title: "Arquitectura primero",
          desc: "DDD, Hexagonal y patrones event-driven aplicados con criterio — no por moda.",
        },
        {
          icon: "⚙️",
          title: "Ingeniería orientada a ops",
          desc: "Observabilidad desde el día uno. Grafana, Splunk, Sentry — nada queda en la oscuridad.",
        },
        {
          icon: "🚢",
          title: "Llega a producción",
          desc: "Pipelines CI/CD, Docker, Kubernetes. Código que llega a los usuarios, de forma fiable.",
        },
      ],
    },
    projects: {
      tag: "Proyectos",
      h2: ["Lo que he", "construido de verdad"],
      subtitle: "Apps de calidad productiva. No proyectos acumulando polvo — cosas que puedes abrir ahora mismo.",
      featured: {
        label: "Primera release",
        status: "en vivo",
        tagline: "Tu compañero de aprendizaje con IA",
        description:
          "Una plataforma que transforma cómo aprendes. Construida con arquitectura backend limpia e integración de IA para ofrecer experiencias educativas personalizadas. El primer proyecto publicado bajo el paraguas de backendtothefuture.com.",
        metrics: [
          { label: "Tipo",   value: "Web App" },
          { label: "Stack",  value: "Java + Spring" },
          { label: "Estado", value: "En vivo" },
        ],
        openApp: "Abrir app",
      },
      upcoming: [
        { name: "Proyecto #2", hint: "Algo en fintech...",            eta: "Próximamente" },
        { name: "Proyecto #3", hint: "Herramientas de observabilidad...", eta: "En progreso" },
      ],
    },
    stack: {
      tag: "Stack",
      h2: ["Las herramientas que", "hacen el trabajo"],
      subtitle: "15 años de cicatrices en producción — estas son las tecnologías en las que confío.",
      cta: "Siempre aprendiendo. Siempre publicando.",
      ctaLink: "Perfil completo →",
      categories: [
        { label: "Lenguajes y Frameworks", items: ["Java", "Spring Boot", "Spring Cloud", "TypeScript", "Node.js"] },
        { label: "Arquitectura",           items: ["Microservicios", "DDD", "Arq. Hexagonal", "Event-Driven", "Clean Code", "TDD"] },
        { label: "Mensajería y Datos",     items: ["Apache Kafka", "PostgreSQL", "MongoDB", "Oracle DB", "SQL Server", "Redis"] },
        { label: "Infraestructura",        items: ["Kubernetes", "Docker", "AWS", "GCP", "CI/CD", "Terraform"] },
        { label: "Observabilidad",         items: ["Grafana", "Prometheus", "Splunk", "Sentry", "OpenTelemetry"] },
      ],
    },
    contact: {
      tag: "Contacto",
      h2: ["Construyamos algo", "que valga la pena"],
      subtitle: "Abierto a colaboraciones, retos backend interesantes y conversaciones sobre arquitectura. Escríbeme.",
      terminal: {
        whoami: "diego barrio · senior backend engineer",
        location: "alicante, españa 🇪🇸",
        languages: "español (nativo) · inglés (C1)",
        status: "abierto a oportunidades",
      },
    },
    footer: {
      copyright: "hecho con Next.js",
    },
  },
} as const;
