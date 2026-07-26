---
title: "Desarrollo dirigido por specs con Gentle AI: proceso impecable, factura en tokens brutal"
date: "2026-07-26"
description: "Semana del 20 al 26 de julio: cambié mis skills caseras de Jira por el ciclo SDD de Gentle AI en Forma — 20 PRs, autenticación multi-usuario real y landing pública. El proceso es excelente. Cada historia se comía una ventana de 5 horas y el viernes agoté la cuota semanal."
tags: ["weekly", "spec-driven-development", "ai-agents", "gentle-ai", "claude-code", "nginx", "seo"]
thumb: "/blog/spec-driven-ai-agents-with-gentle-ai-and-the-token-bill-thumb.webp"
cover: "/blog/spec-driven-ai-agents-with-gentle-ai-and-the-token-bill-cover.webp"
ogImage: "/blog/spec-driven-ai-agents-with-gentle-ai-and-the-token-bill-og.jpg"
---

## La semana en una frase

Esta semana todo lo que se rompió era un **límite mal calibrado**. Ninguno era un bug de lógica.

El rate limit de Nginx que echaba a mis propios usuarios. El presupuesto de revisión de 400 líneas de una PR. El alcance del analizador estático. La cuota semanal de tokens que me quedé sin ella el viernes por la tarde.

Y esa última merece que empiece por ahí, porque es la decisión más importante que he tomado en semanas.

## Cambié mis skills por las de otro

La [semana pasada fueron 62 pull requests](/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents) con dos skills que me había escrito yo: `/jira-sdd-specs` generaba las specs de una épica de Jira, `/jira-sdd-ai` implementaba una historia desde esas specs. Ciclo corto, dos pasos, un agente. Funcionaba muy bien.

Esta semana, a mitad de camino, me pasé a **SDD con [Gentle AI](https://github.com/Gentleman-Programming/gentle-ai)** — una suite de skills y agentes de código abierto que ya había usado antes en otros proyectos. Y el número cambió: **20 pull requests mergeadas** (de la #151 a la #170), 519 ficheros tocados, +26.258 / −3.070 líneas.

Menos de un tercio de PRs que la semana anterior. Y sin embargo la sensación fue de haber hecho **más** ingeniería, no menos.

La diferencia está en la forma del ciclo. Mis skills tenían dos pasos. Gentle AI plantea la cadena completa, con dependencias explícitas, y cada fase corre en un **sub-agente distinto con contexto limpio**:

```
explore → propose → spec → design → tasks → apply → verify → archive
                      ↑
                   (design entra por proposal)
```

Contexto limpio significa que el agente que escribe las tareas no arrastra las divagaciones del que exploró el repo. Es la misma idea que separar responsabilidades en el código, aplicada a la conversación.

Pero lo que de verdad me ganó fue un guardarraíl.

### El guard de las 400 líneas

Cuando la fase de `tasks` estima que el cambio se va a pasar del presupuesto de revisión de **400 líneas**, el flujo **para** y te obliga a decidir: o troceas en PRs encadenadas, o aceptas explícitamente una `size:exception` dejando constancia.

No es una recomendación en un README. Es un *gate*.

Esa distinción no es cosmética. Todos tenemos una guía de estilo que dice "PRs pequeñas". Nadie la cumple, porque un documento no interrumpe a nadie a las once de la noche. Un gate sí.

Y me paró de verdad: la PR-B de la landing pública se me fue a ~930 líneas. El guard saltó, y acepté la excepción **conscientemente** —la slice visual perdía cohesión si la troceaba— en vez de descubrirlo cuando el revisor abriera el diff. El guard funcionó. Mi estimación previa, no.

## Lo que se construyó en Forma

El corte del cambio de proceso se ve limpio en el historial. El lunes 20 todavía cerré con el flujo viejo. El jueves 23 arranqué `FOR-171` con `/sdd-new` y no volví atrás.

**La app dejó de ser mía.** `FOR-169` eliminó todos los datos personales y de demo sembrados. Suena a limpieza menor y es exactamente lo contrario: hasta esta semana [Forma](https://forma.diegobarrioh.dev) era *mi* app, con mis mediciones horneadas dentro. Ahora arranca vacía.

**El dominio salió del código Java.** El primer cambio que pasó por el ciclo SDD completo produjo... documentación. `FOR-171`: 618 líneas de ADR, cero código. Porque el diagnóstico previo era duro: casi todo el dominio de planes estaba **estático en código**, no en base de datos — el catálogo de ejercicios, el generador de planes de running, el de nutrición, los 23 alimentos. Y todas las tablas persistidas usaban un `owner_id = "default-user"` fijo.

Después, `FOR-172` y `FOR-173` bajaron los catálogos de ejercicios y alimentos a tablas reales: schema, seed, claves foráneas y repositorio en una PR; API de lectura en la siguiente. Cuatro PRs para una sola idea: **el catálogo deja de ser una constante de compilación**.

**Y llegó el multi-usuario de verdad.** Seis PRs (`FOR-145` a, b-1, b-2, c, d): tabla `users`, sesión, hashing con **Argon2id**, aislamiento por usuario en dos clases, borrado del `owner_id` legacy y flujo de sesión en el frontend con `/login` y `/registro`. La decisión de producto que lo desbloqueó fue elegir **registro público abierto**, ni invitación ni cuenta única.

**Con puerta de entrada.** `FOR-185` en tres PRs apiladas: primero la frontera de rutas (`/` pública, todo el árbol protegido bajo `/app`, preservando `pathname`, `search` y `hash` a través del login), luego la landing temática, y por último la reestructuración del layout con barra de navegación global.

## El detalle técnico que te va a morder

Metí en el repo los templates HTML de diseño (`docs/0-landing.html`, `docs/1-dashboard.html`…) como referencia para los agentes.

SonarCloud los analizó **como si fueran páginas de producción**.

Los inputs de login del mockup no tenían label. Eso es `Web:InputWithoutLabelCheck`, que cuenta como **BUG**, no como *code smell*. El `new_reliability_rating` se fue a C y el Quality Gate falló.

Párate a mirar la forma de ese fallo, porque es preciosa: **cuanto más fiel es el mockup que commiteas, peor puntúas**. La señal está invertida. Estás siendo castigado por documentar bien.

El arreglo es una línea — excluir `docs/**` de `sonar.exclusions`. La lección no. Un artefacto de diseño versionado **no es código de producción**, y si tu analizador estático no sabe distinguirlos, el que tiene que saberlo eres tú. Cada herramienta de calidad que instalas trae una definición implícita de "qué es mi código". Casi nunca coincide con la tuya.

Regalo del mismo día: el Quality Gate de `main` **ya estaba en rojo antes** de mi PR. Un check rojo en tu rama no demuestra que lo hayas roto tú. Se comprueba directo y sin autenticación:

```bash
curl -sS "https://sonarcloud.io/api/qualitygates/project_status?projectKey=<key>&pullRequest=<N>"
```

Y uno de CSS, del rediseño del layout: **`position: sticky` no puede fijar una barra que ocupa su propia fila de grid**, porque un elemento sticky solo viaja dentro de su bloque contenedor. Pero si la pones `fixed`, sale del flujo y **no ocupa su fila**, así que el contenido enrutado se auto-coloca encima. La solución es `fixed` más `padding-top` en el layout raíz para reservar el hueco. Y su corolario: las alturas en porcentaje no se resuelven bajo un padre con `min-height`, así que las páginas centradas verticalmente van con `calc(100dvh - var(--topbar-height))`.

## Lowlights

**Los tokens. Esto es lo grande.**

El proceso de Gentle AI es específico y riguroso, y **quema tokens como papel en una hoguera**. Piensa en la aritmética: cada fase es un sub-agente con contexto limpio que vuelve a leer el repo, las specs y los ADRs. Multiplícalo por ocho fases. Por PRs encadenadas. Por las revisiones adversariales frescas que el propio flujo recomienda.

Resultado real: **cada historia individual, por poca sustancia que tuviera, se comía la ventana de 5 horas**. Y el viernes agoté la **ventana semanal** después de un par de Jiras.

No es una queja contra el proceso. Es su precio, y hay que decirlo en voz alta antes de que alguien lo adopte pensando que sale gratis. Elegir proceso es elegir presupuesto — igual que elegir Kubernetes es elegir una factura de infraestructura.

**La skill `branch-pr` de Gentle AI no aplica a Forma.** Está escrita para el repo de Gentle AI: exige `Closes #N`, exactamente una etiqueta `type:*`, ramas `feat/…` y shellcheck. Forma usa Jira sin issues de GitHub, ramas `feature/FOR-NNN-…`, sin plantilla de PR ni etiquetas. Configuración de agentes de código abierto = **trae los supuestos del repo de origen**. Se audita antes de adoptarla, no se instala y ya.

**Fidelidad visual sin verificar.** No había navegador headless en aquel entorno, así que la landing nunca se comparó con el mockup *con los ojos*. Los 660 tests pasaban. Eso no es lo mismo que "se ve bien", y conviene no confundirlo nunca.

**Un `node_modules/` colgado en la raíz del repo**, cortesía de lanzar `npx vitest --root frontend` desde el directorio equivocado. No estaba en `.gitignore`. Se habría commiteado.

## Fuera de Forma: los otros límites

**Nginx echando a mis propios usuarios.** En el homelab, `audio.diegobarrioh.dev` (Audiobookshelf) devolvía **429** en navegación normal. La causa: la app carga muchos assets y portadas en paralelo, y el rate limit estaba en `10r/s + burst 20 nodelay`. Ajustado a **`60r/s + burst 300`**: se mantiene la protección anti-abuso y desaparecen los falsos positivos de uso legítimo.

Es el mismo patrón que el guard de las 400 líneas, pero al revés. Un límite calibrado para un patrón de uso **imaginado** en vez del real. La misma semana también validé compatibilidad ARMv7 de imágenes Docker antes de actualizar una Raspberry Pi 2 — otro límite, este físico y no negociable.

**Google no indexaba diegobarrioh.dev.** Diez páginas sin indexar en Search Console, tres causas reales encontradas sondeando el sitio en vivo:

- `/contact` hacía `Astro.redirect('/#contact')`, y en build estático eso emite un meta-refresh **a un fragmento**. Google lo marca como error de redirección. Los fragmentos no son URLs para un crawler.
- `/about`, `/cv` y `/projects` estaban **huérfanas**: cero enlaces internos, porque el nav apunta a fragmentos de la home. Y encima duplicaban su contenido.
- `www.diegobarrioh.dev` devolvía **200** en lugar de redirigir al apex.

Y aquí la joya de la semana: ese 200 en www era **caché rancia de Cloudflare**. Con un query cache-buster aparecía el 301 real, que llevaba ahí todo el tiempo. Cloudflare está delante de la Raspberry, así que después de cada deploy hay que purgar caché o Google —y los visitantes— ven HTML viejo. **Estuve depurando un servidor que ya estaba bien.**

**Y un detalle de SEO que parece trivia y no lo es.** Renombré el PDF del CV de `/pdf/diegobarrioh_mk4.pdf` a `/cv/diego-barrio-hortiguela-cv.pdf`. Dos razones: el **guion bajo `_` no separa palabras para Google**, solo el guion `-` — así que `diegobarrioh_mk4` era literalmente un token opaco sin keywords. Y la diéresis de "Hortigüela" jamás va en una URL: el navegador la percent-encodea a `%C3%BC` y eso es frágil en rsync y en nginx. Se translitera: `güe → gue`.

## El hilo

Cuatro proyectos distintos, cuatro problemas que parecían no tener nada que ver, y todos eran el mismo:

| Límite | Calibrado para | La realidad |
|---|---|---|
| `10r/s` en Nginx | un scraper abusivo | una app que carga 40 portadas de golpe |
| 400 líneas por PR | una slice bien troceada | una landing visual cohesionada |
| Alcance de SonarCloud | "todo el HTML es producción" | mockups de diseño versionados |
| Ventana de tokens | conversación asistida | ocho sub-agentes releyendo el repo |

Ninguno era un bug. Todos eran un **default puesto por alguien que imaginó tu caso de uso sin conocerlo**. Y el trabajo de esta semana, en los cuatro sitios, fue el mismo: medir el uso real y recalibrar.

Es la parte del oficio que no sale en los tutoriales. Los tutoriales te dan el valor por defecto. Nadie te enseña a saber cuándo el default está mintiendo.

## Lo que me llevo

1. **El buen proceso no es gratis.** Gentle AI hace ingeniería muy específica y muy correcta. Su coste en tokens es real y grande. Elegir proceso es elegir presupuesto.
2. **Los guardarraíles funcionan si son gates, no consejos.** Un README nunca me habría parado a las once de la noche. El guard sí.
3. **La configuración de agentes ajena trae supuestos ajenos.** Auditar antes de adoptar, siempre.
4. **Los tests verdes no son verificación visual.** 660 tests en verde y una landing que nadie había mirado con los ojos.

## Lo siguiente

Terminar la épica del modelo de datos v2: el agregado `plan` con ciclo de vida y un único plan activo, estructura de entrenamiento y nutrición, lista de la compra derivada del plan, y un onboarding que genere el plan al vuelo.

Y una decisión pendiente que es de arquitectura de *proceso*, no de código: cómo bajar el coste en tokens sin perder el rigor. La hipótesis con la que voy a trabajar es reservar el ciclo SDD completo para los cambios que de verdad lo merecen —un modelo de datos, un sistema de autenticación— y dejar las slices pequeñas en un carril más corto.

Porque un proceso que no te puedes permitir ejecutar no es un proceso. Es un póster.
