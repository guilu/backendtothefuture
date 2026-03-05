# backendtothefuture.com

Landing page personal para [backendtothefuture.com](https://backendtothefuture.com) — plataforma donde Diego Barrio publica sus proyectos de desarrollo backend y fullstack.

## Stack

- [Next.js 15](https://nextjs.org/) — App Router, static export
- [Tailwind CSS v4](https://tailwindcss.com/)
- TypeScript

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Estructura

```
src/
├── app/
│   ├── layout.tsx       # Root layout + anti-FOUC theme script
│   ├── page.tsx         # Entry point
│   └── globals.css      # CSS variables, temas claro/oscuro, animaciones
└── components/
    ├── Header.tsx        # Navbar con toggle de tema
    ├── ThemeToggle.tsx   # Botón sol/luna (light/dark)
    ├── Hero.tsx          # Hero section con indicador de scroll
    ├── About.tsx         # Bio y highlights
    ├── Projects.tsx      # Proyectos (Akademia featured)
    ├── TechStack.tsx     # Stack tecnológico
    ├── Contact.tsx       # Contacto + terminal card
    └── Footer.tsx        # Footer con links
```

## Temas

Soporta tema claro y oscuro con transición suave. Detecta la preferencia del sistema operativo (`prefers-color-scheme`) y persiste la elección en `localStorage`.

## Proyectos

- **[Akademia](https://akademia.diegobarrioh.dev)** — plataforma de aprendizaje con IA

## Autor

**Diego Barrio** · [diegobarrioh.dev](https://diegobarrioh.dev) · [LinkedIn](https://www.linkedin.com/in/diegobarrioh)
