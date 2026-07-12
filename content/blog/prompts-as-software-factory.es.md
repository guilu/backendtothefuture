---
title: "Prompts como línea de producción"
date: "2026-07-12"
description: "Resumen semanal de cómo los prompts dejaron de ser mensajes sueltos y se convirtieron en una línea de producción para Forma, operaciones y validación real."
tags: ["weekly", "ai-agents", "prompts", "forma", "devops"]
thumb: "/blog/prompts-as-software-factory-thumb.webp"
cover: "/blog/prompts-as-software-factory-cover.webp"
---

## La semana en una frase

Esta semana los prompts dejaron de parecer conversaciones y empezaron a parecer maquinaria.

No maquinaria en el sentido grandilocuente de “la IA reemplaza al equipo”, sino algo mucho más práctico: una secuencia de instrucciones, restricciones, evidencias y comprobaciones que convierte una idea en backlog, el backlog en PRs, las PRs en contenedores, y los contenedores en una aplicación pública con smoke tests.

La diferencia importante no fue escribir prompts más bonitos. Fue hacerlos más operativos.

## Prompt no es una frase: es una interfaz

Cuando trabajas con agentes durante varios días seguidos, el prompt deja de ser solo “lo que le pides al modelo”. Se vuelve una interfaz entre sistemas:

- la intención de producto;
- el estado real del repositorio;
- las reglas de arquitectura;
- Jira y sus historias;
- GitHub y sus PRs;
- Docker y sus contenedores;
- nginx y sus rutas públicas;
- Grafana, logs y smoke tests.

Un prompt débil pide una salida. Un prompt fuerte define el contexto, los límites y la evidencia que hará que sepamos si la salida sirve.

Esta semana el ejemplo principal fue **Forma**.

## Forma: de prompts de producto a aplicación visible

Forma avanzó muchísimo esta semana. Al principio era un producto con módulos claros en la cabeza: composición corporal, entrenamiento, nutrición, compra, progreso, integraciones y configuración. Pero tener módulos no basta. Hay que convertirlos en una secuencia que otros agentes puedan ejecutar sin estar preguntando cada minuto.

Ahí los prompts hicieron tres trabajos distintos.

Primero, ayudaron a partir el producto en épicas e historias. No con una lista vaga de features, sino con objetivos, valor, criterios de aceptación y Definition of Done. Eso se convirtió en specs bajo `specs/FOR-XXX/` y en un flujo de trabajo más repetible para Claude y Hermes.

Después, ayudaron a mantener a los agentes dentro de un carril. `AGENTS.md` no es decorativo: obliga a leer la arquitectura, las ADRs, las specs y la realidad del repo antes de implementar. Eso cambia el prompt implícito de “hazme esta feature” a “implementa esta historia dentro de este sistema, con estas reglas y estas verificaciones”.

Por último, los prompts se volvieron operacionales. `for up` ya no significa “arranca algo”. Significa: sincroniza repo, compila, levanta Docker, verifica contenedores, prueba frontend, prueba actuator, revisa logs y reporta evidencias.

Ese es el salto: el prompt deja de ser una petición y se convierte en un protocolo.

## El conveyor belt de Forma

La semana dejó una cadena bastante clara:

1. Prompt de producto: definir módulos, pantallas y comportamiento esperado.
2. Prompt de especificación: convertir épicas en historias implementables.
3. Prompt de implementación: Claude trabaja una historia concreta y abre PR.
4. Prompt de operación: Hermes actualiza `main`, reconstruye Docker y smoke-testea.
5. Prompt de cierre: evidencias, branch limpio, PR mergeada, siguiente historia.

El resultado se ve en el historial de Forma. En pocos días entraron piezas de composición corporal, entrenamiento, nutrición, shopping, insights, dashboard, design system, navegación, integraciones y settings.

No todo eso significa “producto terminado”. Pero sí significa que el pipeline funciona. Las historias entran por un lado y salen por el otro como código revisado, contenedores saludables y rutas públicas comprobadas.

Esta semana `main` llegó a:

```text
461d50a ✨ feat(ui): build profile and settings screens (FOR-58) (#85)
```

Y `for up` validó la app real:

```text
frontend local  : http://127.0.0.1:3002/ -> 200 OK
frontend público: https://forma.diegobarrioh.dev -> HTTP/2 200
backend health  : /actuator/health -> {"status":"UP"}
containers      : frontend, backend, postgres healthy
```

Eso no es solo “la IA ha escrito código”. Es una cadena de prompts con verificación al final.

## Los prompts también corrigen el sistema

Una parte interesante de la semana fue que los prompts no solo sirvieron para construir. También sirvieron para depurar el propio sistema.

En Forma apareció un problema clásico de aplicación pública: la UI intentaba hablar con `localhost:8080` desde el navegador. En local puede parecer razonable. En producción es absurdo: `localhost` es el ordenador del usuario, no el backend.

La solución no fue decir “arregla CORS” y esperar magia. El prompt bueno separa capas:

- ¿el bundle contiene `localhost:8080`?
- ¿el frontend usa same-origin `/api`?
- ¿nginx público enruta `/api/` correctamente?
- ¿el backend acepta el origen público?
- ¿un `OPTIONS` de navegador devuelve los headers adecuados?
- ¿un `POST` real devuelve `201`?

Ese patrón terminó documentado en la skill de Forma. La próxima vez no hay que recordar la investigación completa: el procedimiento queda disponible.

También apareció otro bug menos visible pero más backend: consultas PostgreSQL con columnas `uuid` comparadas contra parámetros Java `String`. H2 no siempre lo delata, PostgreSQL sí. El prompt útil no se queda en “hay un 500”. Mira logs, reconoce `operator does not exist: uuid = character varying`, inspecciona el repository JDBC y obliga a bindear `UUID` reales.

Otra vez: prompt como checklist de diagnóstico, no como deseo.

## Red, nginx y rate limits: prompts contra la ambigüedad

También hubo prompts de operación pura.

Cuando pregunté si había WiFi, la respuesta útil no era “parece que sí”. Era medir:

- interfaz `wlan0`;
- SSID `dbhstudios_5G`;
- IP `192.168.1.175`;
- gateway `192.168.1.1`;
- ping a gateway, `1.1.1.1` y `8.8.8.8`;
- DNS;
- HTTPS real;
- hosts locales como `red.local`, `black.local` y `homeassistant.local`.

El prompt correcto fuerza a distinguir entre “no hay red WiFi”, “este dispositivo no ve Internet”, “DNS falla”, “la LAN está viva pero un servicio no” y “un host concreto está lento”.

Lo mismo con nginx en `red.local`. La pregunta fue si Akademia, TokenMeter y Forma tenían rate limit. La respuesta útil fue entrar en `red.local`, leer `nginx.conf`, revisar `sites-enabled`, validar `nginx -t` y confirmar las zonas:

```nginx
akademia_limit   10r/s
 tokenmeter_limit 10r/s
forma_limit      10r/s
```

Además quedó claro el diseño intencionado de Forma: `/` y `/api/` apuntan a `192.168.1.175:3002`, y el nginx interno del frontend resuelve la API. Ese detalle es pequeño, pero evita que un agente futuro “corrija” algo que en realidad era diseño.

## El prompt semanal como herramienta de memoria

Este artículo también forma parte del sistema.

El resumen semanal no es un post de vanidad. Es una forma de comprimir aprendizaje operacional:

- qué prompts funcionaron;
- qué prompts eran demasiado ambiguos;
- qué procedimientos merecen convertirse en skills;
- qué verificaciones evitaron una falsa conclusión;
- qué decisiones parecen pequeñas pero protegen el sistema.

La semana anterior el tema era el flujo multi-agente: ChatGPT, Claude y Hermes como una pequeña línea de montaje. Esta semana el foco está más abajo: los prompts concretos que hacen que esa línea de montaje no se convierta en caos.

Un buen prompt semanal no lista todo. Escoge el hilo narrativo. En este caso el hilo fue claro: prompts como interfaces operativas.

## Lo que aprendí

Me llevo cinco ideas.

Primera: cuanto más real es el sistema, menos vale un prompt genérico. “Revisa la red” no basta. Hay que definir qué capas medir y qué evidencia aceptar.

Segunda: los mejores prompts terminan siendo procedimientos. Si una investigación se repite, debería acabar como skill, script o checklist.

Tercera: `200 OK` no siempre significa éxito. Puede ser un SPA fallback, un endpoint equivocado o una respuesta HTML donde esperabas JSON.

Cuarta: un agente necesita límites igual que necesita contexto. Decirle qué no tocar, qué no asumir y qué verificar es parte del prompt.

Quinta: el resultado de una semana no son solo commits. También son mejores prompts.

## Mi conclusión

Esta semana Forma avanzó, nginx quedó más entendido, la red se diagnosticó con más precisión y el pipeline de agentes siguió acelerando.

Pero el aprendizaje principal fue otro: los prompts empiezan a ser infraestructura.

No porque estén escritos en un fichero mágico, sino porque conectan intención, contexto, reglas y verificación. Cuando un prompt captura bien esa interfaz, el agente no solo produce texto o código. Produce una intervención trazable sobre un sistema real.

Y cuando muchos prompts buenos se encadenan, aparece algo parecido a una fábrica.
