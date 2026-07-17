---
title: "Forma madura: la semana en que estandaricé la fábrica de software"
date: "2026-07-12"
description: "Resumen del 6 al 12 de julio: Forma, la app de seguimiento físico que arranqué la semana pasada, gana músculo pantalla a pantalla, y con ella una fábrica estandarizada - dos skills (jira-sdd-ai y jira-sdd-specs) para gestionar e implementar el proyecto, y un agente de operaciones (Hermes) que levanta los sites en nginx, los publica y verifica con un solo comando: for up."
tags: ["weekly", "ai-engineering", "spec-driven-development", "ai-agents", "spring-boot"]
thumb: "/blog/standardizing-the-software-factory-with-ai-agents-thumb.webp"
cover: "/blog/standardizing-the-software-factory-with-ai-agents-cover.webp"
---

## La semana en una frase

**Forma** la arranqué la semana pasada. Esta semana la app dejó de ser un esqueleto con cuatro pantallas y empezó a **ganar músculo** de verdad: módulo tras módulo, historia tras historia. Pero lo que de verdad construí no fue solo la app: fue la **fábrica** que la fabrica. Y como toda fábrica que se precie, lo importante no fueron las piezas sueltas, sino la cadena de montaje: unas skills que estandarizan cómo se piensa y se escribe el código, y un operario que lo despliega y lo verifica sin que yo tenga que mirar.

Déjame contártelo por capas, porque la lección de la semana está justo en cómo encajan.

## Forma crece: de esqueleto a producto

Forma es una app de seguimiento físico: composición corporal, entrenamiento, nutrición, lista de compra, progreso, integraciones y configuración. Spring Boot en el backend, Vite en el frontend, PostgreSQL debajo. La semana pasada era poco más que el andamiaje; esta semana se llenó. Así se ve el dashboard hoy, corriendo en producción:

![Dashboard actual de Forma: navegación lateral con todos los módulos, tarjetas de composición corporal (peso, grasa, masa muscular, IMC), gráfica de evolución del peso y widgets de entrenamiento, nutrición y presupuesto de compra](/img/forma-current-state-2026-07-12.png)

Y ahí está la primera trampa que mucha gente no ve: **tener los módulos claros no es tener el proyecto**. Una idea ordenada en tu cabeza sigue siendo caos para cualquier agente que tenga que implementarla, porque le falta lo que de verdad importa: objetivos, criterios de aceptación, reglas de arquitectura y un orden.

Así que antes de escribir una sola línea de negocio, la pregunta correcta no fue "¿cómo hago la pantalla de nutrición?". Fue "¿cómo convierto esta idea en algo que una cadena de montaje pueda ejecutar historia a historia, sin preguntarme cada minuto?". Esa pregunta es la que dio forma a la fábrica.

## Estandarizar la fábrica: dos skills, dos trabajos

Aquí está el corazón de la semana. Partí el trabajo en **dos skills** que hacen dos cosas deliberadamente distintas. Piénsalo como la diferencia entre el **arquitecto que dibuja los planos** y el **albañil que levanta el muro**: son oficios distintos, con herramientas distintas, y mezclarlos es donde se hunden los proyectos.

**`jira-sdd-specs` - el arquitecto.** Su único trabajo es convertir una épica de Jira en historias implementables: cada una con objetivo, valor, criterios de aceptación y Definition of Done, escritas como specs bajo `specs/FOR-XXX/`. No toca código. Nunca. Y como aquí las decisiones son arquitectónicas -dónde vive cada cosa, qué contrato expone, qué reglas respeta-, esta skill usa **exclusivamente Opus**. El razonamiento caro va donde se decide la forma del edificio.

**`jira-sdd-ai` - el albañil.** Su trabajo es implementar **una** historia a la vez, con el repositorio como fuente de verdad. Lee las specs, lee `AGENTS.md` (que le obliga a conocer la arquitectura, las ADRs y la realidad del repo antes de tocar nada), implementa, abre PR. Como aquí el trabajo es ejecutar un plano que ya existe, esta skill **delega la escritura de código a un subagente Sonnet**. Y la fontanería de Git -mergear, borrar ramas, hacer pull- es candidata a bajarla a Haiku.

¿Por qué separar así los modelos? Porque no todo el trabajo cuesta lo mismo pensarlo. Poner a Opus a mover ramas es como mandar a tu arquitecto senior a barrer la obra: funciona, pero estás quemando el talento donde no aporta. **El modelo caro decide; el modelo barato ejecuta.** Esa es la regla, y quedó grabada en las propias skills para que se cumpla sola.

El resultado de estandarizar así fue un ritmo casi hipnótico que se repite en cada transcripción de la semana: *especifica la épica → implementa una historia → abre PR → mergea → limpia ramas → siguiente*. Docenas de veces. De FOR-15 hasta la tanda FOR-56-63. En pocos días entraron composición corporal, entrenamiento, nutrición, compra, insights, dashboard, design system, navegación, integraciones y settings. No es "producto terminado", pero es algo mejor: **es un pipeline que funciona**. Las historias entran por un lado y salen por el otro como código revisado.

## Hermes: el operario que publica y verifica

Una cadena de montaje que produce código pero no lo despliega está a medias. Ahí entra el tercer personaje: **Hermes**, el agente de operaciones. Si `jira-sdd-specs` es el arquitecto y `jira-sdd-ai` el albañil, Hermes es el **jefe de obra que entrega las llaves** y comprueba que la casa está en pie.

Hermes se encargó de dos cosas grandes esta semana. Primero, **generar los sites en nginx y publicarlos**: configurar las rutas públicas, levantar `forma.diegobarrioh.dev` sobre el servidor, y confirmar los detalles que un agente descuidado rompería -por ejemplo, que en Forma tanto `/` como `/api/` apuntan al mismo `192.168.1.175:3002` **por diseño**, y no es un bug que "arreglar"-. También dejó documentados los rate limits reales tras leer `nginx.conf` y validar con `nginx -t`: `forma_limit`, `akademia_limit` y `tokenmeter_limit`, a 10r/s cada uno.

Y segundo, lo más útil: destiló todo el ritual de despliegue en **un solo comando, `for up`**. Esto es puro pensamiento de fábrica. `for up` ya no significa "arranca algo"; significa una secuencia completa y verificada:

1. sincroniza el repo
2. compila
3. levanta los contenedores Docker
4. verifica que estén *healthy*
5. prueba el frontend y el `/actuator/health` del backend
6. revisa logs y **reporta evidencias**

La diferencia entre "creo que funciona" y esto:

```text
frontend local  : http://127.0.0.1:3002/ -> 200 OK
frontend público: https://forma.diegobarrioh.dev -> HTTP/2 200
backend health  : /actuator/health -> {"status":"UP"}
containers      : frontend, backend, postgres healthy
```

Eso es lo que te da un buen procedimiento: convierte una investigación que hiciste una vez en algo que se ejecuta siempre igual. La próxima vez no recuerdas los pasos -los ejecutas.

## Las lecciones que dejaron dos bugs

Dos fallos enseñaron más que muchas historias verdes.

**El bug de `localhost`.** El frontend se compilaba con `http://localhost:8080` clavado como `VITE_API_BASE_URL`. En local, perfecto; en producción, apuntando al ordenador del propio usuario. La raíz: **las variables de build de Vite se hornean en tiempo de compilación, no de ejecución**. Un `ARG` con default de `localhost` en un `Dockerfile` es una trampa esperando a producción. Y el arreglo bueno no fue "arregla el CORS": fue bajar capa por capa -¿el bundle contiene `localhost`? ¿el front usa same-origin `/api`? ¿nginx enruta `/api/`? ¿un `POST` real devuelve `201`?- y dejar ese checklist documentado en la skill de Forma para no volver a investigarlo.

**El bug de `uuid = varchar`.** Consultas comparando columnas `uuid` de PostgreSQL contra parámetros Java `String`. H2 lo perdona; PostgreSQL no, y suelta un `operator does not exist: uuid = character varying`. Moraleja: `200 OK` no siempre es éxito, y un test que pasa en H2 no garantiza nada en la base real.

## El hilo que conecta todo

La app avanzó, sí. Pero si dentro de un mes me preguntan qué construí esta semana, la respuesta honesta no es "las pantallas de Forma". Es **la fábrica**: dos skills que separan pensar de ejecutar, un operario que publica y verifica con un comando, y una regla clara de qué modelo hace qué. Forma fue el primer producto que salió de esa línea de montaje. No será el último.

## Takeaways

- **Una idea ordenada en tu cabeza no es un proyecto.** Hasta que no tiene specs con criterios de aceptación, sigue siendo caos para quien la implementa.
- **Separa el arquitecto del albañil.** `jira-sdd-specs` piensa (Opus), `jira-sdd-ai` ejecuta (Sonnet). Mezclarlos es donde mueren los proyectos.
- **El modelo caro decide, el barato ejecuta.** Poner a Opus a mover ramas es quemar talento donde no aporta.
- **Un buen procedimiento se ejecuta, no se recuerda.** `for up` convirtió un ritual de despliegue en un solo comando con evidencias.
- Las variables de frontend en build-time son un pie constante: nunca un default de `localhost` en un `ARG`.

## Qué viene

Seguir bajando las épicas de "UI Backend enablers" para cerrar los gaps de wiring, y terminar la tanda FOR-56-63 con la nota de deltas que alimentará el enabler final. Y, en algún momento, volver a Backend to the Future -que esta semana solo vio pasar este recap-.
