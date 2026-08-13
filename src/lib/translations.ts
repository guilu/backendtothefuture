export type Lang = "en" | "es";

export const t = {
  en: {
    header: {
      nav: ["Projects", "Blog", "Stack", "About", "Contact"],
      portfolio: "Portfolio ↗",
      cta: "Let's connect",
    },
    hero: {
      badge: "Senior Backend Engineer • 15 years shipping production systems",
      badgeMobile: "Senior Backend Engineer · 15 years +",
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
      // Ordered newest first. No published dates exist for these, so the order
      // is editorial and lives here rather than being derived from anything.
      featured: [
        {
          id: "forma",
          name: "FORMA",
          label: "WIP",
          status: "live",
          tagline: "Training and nutrition, with Mercadona and Withings",
          description:
            "A fitness platform with a training plan and a nutrition plan. Measurements arrive on their own from a Withings scale and the shopping list comes out every week with Mercadona products and their prices, which is what makes it easy to follow.",
          tags: ["AI", "Spring Boot", "React", "PostgreSQL", "Nutrition"],
          metrics: [
            { label: "Type",  value: "Web App" },
            { label: "Stack", value: "Java + React" },
            { label: "Status", value: "WIP" },
          ],
          openApp: "Open app",
          url: "https://forma.diegobarrioh.dev/plan",
          browserUrl: "forma.diegobarrioh.dev/plan",
        },
        {
          id: "akademia",
          name: "akadem.ia",
          label: "WIP",
          status: "live",
          tagline: "Your AI-powered learning companion",
          description:
            "A platform that transforms how you learn. Built with a clean backend architecture and AI integration to deliver personalized educational experiences. The first project shipped under the backendtothefuture.com umbrella.",
          tags: ["AI", "Spring Boot", "Java", "Backend", "Education"],
          metrics: [
            { label: "Type",  value: "Web App" },
            { label: "Stack", value: "Java + Spring" },
            { label: "Status", value: "WIP" },
          ],
          openApp: "Open app",
          url: "https://akademia.diegobarrioh.dev",
          browserUrl: "akademia.diegobarrioh.dev",
        },
        {
          id: "tokenmeter",
          name: "tokenmeter",
          label: "Released",
          status: "live",
          tagline: "AI repository cost intelligence",
          description:
            "Estimate what it would cost to regenerate any public GitHub repository with modern AI models. tokenmeter scans the codebase, measures its token footprint, and benchmarks raw, assisted, and agentic generation workflows across providers.",
          tags: ["AI", "Next.js", "TypeScript", "Tokenizer", "Cost Analysis"],
          metrics: [
            { label: "Type",  value: "Web App" },
            { label: "Stack", value: "Next.js + TS" },
            { label: "Status", value: "Released" },
          ],
          openApp: "Open app",
          url: "https://tokenmeter.backendtothefuture.com",
          browserUrl: "tokenmeter.backendtothefuture.com",
        },
      ],
      upcoming: [],
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
      cookies: "Cookies",
    },
    consent: {
      message:
        "I use Google Analytics cookies to measure aggregated traffic. Nothing loads until you choose — you can change your mind anytime.",
      accept: "Accept",
      reject: "Reject",
      learnMore: "Learn more",
      ariaLabel: "Cookie consent",
    },
    cookies: {
      title: "Cookie Policy",
      updated: "Last updated",
      sections: [
        {
          h: "What this site uses",
          p: "Backend to the Future is a static site. It does not use cookies or any tracking technology by default. The only non-essential technology is Google Analytics 4, and it loads exclusively after you accept it in the cookie banner.",
        },
        {
          h: "Your consent decision",
          p: "Your choice (accept or reject) is stored locally in your browser under the key 'ga-consent'. This is not a cookie sent to any server — it never leaves your device, and it only records whether you agreed to analytics. No analytics runs unless you explicitly accept.",
        },
        {
          h: "Google Analytics cookies",
          p: "If — and only if — you accept, Google Analytics 4 sets cookies (_ga and _ga_*) used to distinguish visitors and measure aggregated, pseudonymous traffic (page views, sessions, approximate geography). GA4 does not store full IP addresses. The data processor is Google, which may process data in the United States; this constitutes an international transfer covered by Google's data-processing terms.",
        },
        {
          h: "Withdraw or change your consent",
          p: "You can change your decision at any time using the “Cookies” link in the footer, which reopens this banner. Rejecting after having accepted removes the analytics cookies and stops further tracking. Withdrawing is exactly as easy as giving consent.",
        },
        {
          h: "Contact",
          p: "Questions about data handling: diegobarrioh@gmail.com.",
        },
      ],
      manage: "Review my cookie choice",
    },
  },

  es: {
    header: {
      nav: ["Proyectos", "Blog", "Stack", "Sobre mí", "Contacto"],
      portfolio: "Portfolio ↗",
      cta: "Conectemos",
    },
    hero: {
      badge: "Senior Backend Engineer • 15 años en producción",
      badgeMobile: "Senior Backend Engineer · 15 años +",
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
      // Ordenadas de más reciente a más antigua. No hay fechas de publicación
      // de estas apps, así que el orden es editorial y vive aquí.
      featured: [
        {
          id: "forma",
          name: "FORMA",
          label: "WIP",
          status: "en vivo",
          tagline: "Entrenamiento y nutrición con Mercadona y Withings",
          description:
            "Plataforma de fitness con plan de entrenamiento y de nutrición. Las mediciones entran solas desde una báscula Withings y la lista de la compra sale cada semana con productos de Mercadona y sus precios, que es lo que lo hace fácil de seguir.",
          tags: ["IA", "Spring Boot", "React", "PostgreSQL", "Nutrición"],
          metrics: [
            { label: "Tipo",   value: "Web App" },
            { label: "Stack",  value: "Java + React" },
            { label: "Estado", value: "WIP" },
          ],
          openApp: "Abrir app",
          url: "https://forma.diegobarrioh.dev/plan",
          browserUrl: "forma.diegobarrioh.dev/plan",
        },
        {
          id: "akademia",
          name: "akadem.ia",
          label: "WIP",
          status: "en vivo",
          tagline: "Tu compañero de aprendizaje con IA",
          description:
            "Una plataforma que transforma cómo aprendes. Construida con arquitectura backend limpia e integración de IA para ofrecer experiencias educativas personalizadas. El primer proyecto publicado bajo el paraguas de backendtothefuture.com.",
          tags: ["IA", "Spring Boot", "Java", "Backend", "Educación"],
          metrics: [
            { label: "Tipo",   value: "Web App" },
            { label: "Stack",  value: "Java + Spring" },
            { label: "Estado", value: "WIP" },
          ],
          openApp: "Abrir app",
          url: "https://akademia.diegobarrioh.dev",
          browserUrl: "akademia.diegobarrioh.dev",
        },
        {
          id: "tokenmeter",
          name: "tokenmeter",
          label: "Released",
          status: "en vivo",
          tagline: "Inteligencia de coste para repos con IA",
          description:
            "Estima cuánto costaría regenerar cualquier repositorio público de GitHub con los modelos de IA actuales. tokenmeter escanea el código, mide su huella en tokens y compara flujos de generación raw, assisted y agentic entre proveedores.",
          tags: ["IA", "Next.js", "TypeScript", "Tokenizer", "Análisis de coste"],
          metrics: [
            { label: "Tipo",   value: "Web App" },
            { label: "Stack",  value: "Next.js + TS" },
            { label: "Estado", value: "Released" },
          ],
          openApp: "Abrir app",
          url: "https://tokenmeter.backendtothefuture.com",
          browserUrl: "tokenmeter.backendtothefuture.com",
        },
      ],
      upcoming: [],
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
      cookies: "Cookies",
    },
    consent: {
      message:
        "Uso cookies de Google Analytics para medir el tráfico de forma agregada. No se carga nada hasta que elijas — puedes cambiar de opinión cuando quieras.",
      accept: "Aceptar",
      reject: "Rechazar",
      learnMore: "Más información",
      ariaLabel: "Consentimiento de cookies",
    },
    cookies: {
      title: "Política de cookies",
      updated: "Última actualización",
      sections: [
        {
          h: "Qué usa este sitio",
          p: "Backend to the Future es un sitio estático. Por defecto no usa cookies ni ninguna tecnología de seguimiento. La única tecnología no esencial es Google Analytics 4, y se carga exclusivamente después de que la aceptes en el banner de cookies.",
        },
        {
          h: "Tu decisión de consentimiento",
          p: "Tu elección (aceptar o rechazar) se guarda localmente en tu navegador bajo la clave 'ga-consent'. No es una cookie que se envíe a ningún servidor — nunca sale de tu dispositivo y solo registra si aceptaste la analítica. No se ejecuta ninguna analítica salvo que aceptes de forma explícita.",
        },
        {
          h: "Cookies de Google Analytics",
          p: "Si — y solo si — aceptas, Google Analytics 4 instala cookies (_ga y _ga_*) que sirven para distinguir visitantes y medir tráfico agregado y seudónimo (páginas vistas, sesiones, geografía aproximada). GA4 no almacena direcciones IP completas. El encargado del tratamiento es Google, que puede procesar datos en Estados Unidos; esto constituye una transferencia internacional cubierta por las condiciones de tratamiento de datos de Google.",
        },
        {
          h: "Retirar o cambiar tu consentimiento",
          p: "Puedes cambiar tu decisión en cualquier momento con el enlace «Cookies» del pie de página, que reabre este banner. Rechazar después de haber aceptado elimina las cookies de analítica y detiene el seguimiento. Retirar el consentimiento es exactamente tan fácil como darlo.",
        },
        {
          h: "Contacto",
          p: "Dudas sobre el tratamiento de datos: diegobarrioh@gmail.com.",
        },
      ],
      manage: "Revisar mi elección de cookies",
    },
  },
} as const;
