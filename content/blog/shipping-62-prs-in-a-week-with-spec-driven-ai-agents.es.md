---
title: "62 pull requests en una semana: desarrollo dirigido por especificaciones con agentes IA"
date: "2026-07-19"
description: "Semana del 13 al 19 de julio: 62 PRs mergeadas en Forma con un bucle de specs y agentes, OAuth cifrado de Withings, mi plan real de entrenamiento convertido en software — y una tarde entera perdida depurando un Google Analytics que funcionaba perfectamente."
tags: ["weekly", "spec-driven-development", "ai-agents", "ai-engineering", "spring-boot", "oauth"]
thumb: "/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents-thumb.webp"
cover: "/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents-cover.webp"
ogImage: "/blog/shipping-62-prs-in-a-week-with-spec-driven-ai-agents-og.jpg"
---

## La semana en una frase

España ganó el Mundial y Forma dejó de ser una maqueta.

Suena a broma, pero las dos mitades de esa frase están más conectadas de lo que parece, y me llevó toda la semana darme cuenta.

Los números primero, porque son los que te van a hacer levantar la ceja: **62 pull requests mergeadas** entre el lunes 13 y el domingo 19. 708 ficheros tocados. Más de 51.000 líneas añadidas. Todo en [Forma](https://forma.diegobarrioh.dev), la app de salud y forma física que arranqué a finales de junio.

No escribí ni una línea de Java a mano.

Y antes de que pienses lo que estás pensando: **no, la velocidad no es el logro**. La velocidad es el síntoma. El logro es que dejé de tomar la misma decisión dos veces.

## El fin de semana en que España ganó el Mundial

Contexto, porque importa para lo que viene.

El **martes 14 de julio**, semifinal contra Francia. 0-2. Un partido en el que España no ganó por genialidad individual sino por lo de siempre cuando gana bien: un plan, ejecutado por fases, sin que nadie intentara resolver el partido él solo.

El **domingo 19**, la final contra Argentina. 1-0. Ni un gol de más, ni uno de menos. **Campeones.**

Y ahí, viendo la final el domingo por la noche —con el recap de la semana sin escribir, cosa que asumo—, se me juntaron las dos cosas. Llevaba siete días construyendo una aplicación **de entrenamiento** con exactamente la misma mecánica con la que se gana un Mundial: un plan escrito antes de empezar, ejecutado en bloques pequeños, sin heroicidades, sin saltarse fases.

Forma no es un proyecto de fitness porque quede bonito en el portfolio. Es la app con la que sigo mi propio plan: peso, composición corporal, entrenamiento de fuerza, carrera, nutrición, compra, progreso. Y esta semana metí dentro de ella **mi plan real**, el que llevaba tiempo manteniendo a mano en una hoja de cálculo.

Ver a una selección ganar por método, mientras escribes software por método, para una app que te hace entrenar por método, es la clase de coincidencia que uno no busca pero agradece.

Así se ve Forma hoy, corriendo en producción con datos reales:

![Dashboard de Forma en producción: navegación lateral con Dashboard, Mediciones, Entrenamiento, Nutrición, Lista de compra, Progreso y Objetivos; tarjetas de composición corporal con peso, grasa corporal, masa muscular e IMC; gráfica de evolución del peso; widgets de próximo entrenamiento, nutrición del día y presupuesto de la compra; y una tarjeta de Withings marcada como Conectado](/img/forma-current-state-2026-07-19.png)

Fíjate abajo a la izquierda: **Withings · Conectado**. Eso es una báscula real mandando mediciones reales. Volvemos a ello.

## El bucle

Lo que pasó esta semana no fue "programar mucho". Fue repetir un bucle:

```
/jira-sdd-specs FOR-XX   → genera las specs de la épica (documentación, cero código)
/jira-sdd-ai  FOR-YYY    → implementa UNA historia desde sus specs
PR de docs   → merge → limpia ramas
PR de código → merge → limpia ramas
```

Más de treinta veces. La frase que más escribí en toda la semana, con diferencia, fue literalmente `pr mergeada limpia ramas`.

Y aquí está lo que quiero que te lleves: **mi input dejó de ser técnico y pasó a ser de dirección.** No escribí código. Escribí decisiones. Qué historia entra ahora. Qué es una rebanada y qué es un habilitador. Qué hueco se arregla y qué hueco se anota.

Eso no es "la IA programa por mí". Eso es que **yo subí de altitud**. Que es exactamente lo que debería pasar y casi nunca pasa, porque la mayoría de la gente usa la IA para escribir más rápido el mismo código que escribía antes, en vez de para cambiar el nivel al que trabaja.

## Stub, slice, gap: el patrón que sostiene todo

Este es el trozo técnico de la semana. Si te llevas una sola cosa, que sea esta.

Cuando implementaba las pantallas de UX aparecía siempre el mismo problema: **la pantalla necesita un endpoint que no existe**. La tentación es obvia y es fortísima: arreglarlo ahí mismo, en la misma PR, "que son cinco minutos".

No lo hice ni una vez.

En su lugar: **anotar el hueco y seguir.** Al terminar el bloque de UX, todos los huecos acumulados se convirtieron en historias nuevas bajo dos épicas de *UI backend enablers*, agrupadas en tres stubs grandes:

- **FOR-102** — nutrición
- **FOR-103** — integraciones
- **FOR-104** — progreso

Y un stub no se implementa de una sentada. **Se rebana.** FOR-103 fueron tres slices (conexión → OAuth cifrado → sync real). FOR-102, cuatro. FOR-104, cinco. Cada slice con su carpeta de specs, su PR de documentación, su PR de código y su merge.

¿Por qué importa esto tanto? Por dos razones que van juntas:

1. **Ni una sola PR de la semana fue inrevisable.** Ninguna. Con 62 PRs, esa es la única razón por la que el sistema no se convirtió en un pantano.
2. **El contexto del agente nunca tuvo que sostener el sistema entero.** Solo una rebanada, con sus specs delante. Un agente al que le das todo el proyecto y le pides "haz la nutrición" te devuelve barro. Un agente al que le das una spec cerrada de 200 líneas te devuelve una PR que puedes leer.

Es el mismo principio que en el campo: nadie intenta resolver el partido solo. Cada uno hace su fase.

## Withings: OAuth de verdad, y dónde vive el cifrado

La pieza que más me gustó. Di de alta una aplicación real en el portal de desarrolladores de Withings para sincronizar las mediciones de mi báscula. Tres rebanadas:

**Slice 1 (FOR-126)** — dominio de conexión, estado, y API de connect/disconnect/sync. Con el puerto de aplicación **sin tokens**, a propósito, aunque en ese momento el connect fuera un mock.

**Slice 2 (FOR-131)** — el OAuth real. Y aquí está la decisión de arquitectura que quiero que veas:

> El puerto de aplicación **sigue sin conocer un solo token**. El cifrado, el intercambio de código por token, el refresh, el revoke: todo vive en el adaptador. El dominio no sabe que Withings existe.

En concreto: migración V15 en una **tabla separada** (no una columna nueva en `integration_connection`, que habría sido lo cómodo y lo incorrecto), PKCE y `state` de un solo uso con expiración para el CSRF, y un test que verifica que los bytes guardados **no son** el texto plano. Más aserciones explícitas de que ni el token, ni el `code`, ni el `state` se filtran a una respuesta, una cabecera o un log.

Esto es arquitectura hexagonal haciendo su trabajo. No es un adorno académico: es lo que te permite que mañana entre Garmin o Fitbit sin tocar el dominio.

**Slice 3 (FOR-132)** — sync real de medidas a `BodyMeasurement`. Más FOR-133 para la ruta `/auth` del frontend, porque el `redirect_uri` de Withings apunta al SPA, no al backend, y el SPA llama después al callback del backend con `{code, state}`.

## El resto de lo que se construyó

Rápido, porque la lista es larga:

- **Accesibilidad** (FOR-112 a FOR-114): jerarquía de encabezados enhebrada en `Card`, `MetricCard` y `ChartContainer`, estados de error y vacío compartidos, y **tests automáticos de a11y con `jest-axe`**. Meter accesibilidad en CI es de esas cosas que si no haces pronto, no haces nunca.
- **Backend real bajo la UI**: perfil y preferencias, tema persistido en servidor, respuestas del onboarding guardadas de verdad, lista de la compra con cantidades, unidades y raciones reales, historial de insights con deltas semana contra semana. **La UI dejó de mentir.**
- **Objetivos, adherencia, logros**: dominio de objetivos e hitos, pantalla de Objetivos, modelo de lectura de adherencia (planificado vs completado por categoría), logros persistidos dirigidos por reglas y un mapa de músculo trabajado para las sesiones de fuerza.
- **Nutrición e hidratación**: consumo de comidas contra objetivo del día, resolutor de tipo de día por fecha, registro de agua con progreso, nutrientes clave en el catálogo.
- **Progreso**: rachas, barras de historial semanal y subida de fotos de progreso con almacenamiento privado acotado al dueño.

## Y entonces, el plan de verdad

El sábado y el domingo llegó el giro que convierte esto de proyecto en producto.

Cogí mi plan real —un `.xlsm` que llevaba tiempo manteniendo a mano— y lo convertí en historias: plantillas de fuerza reales (cinco ejercicios por bloque, con programación por ejercicio), plan de carrera real con curva de volumen, series de 6x400m y semana de descarga, **reglas de ajuste semanal sacadas literalmente de la hoja "Reglas"**, registro de seguimiento semanal, catálogos reales de alimentos y de Mercadona con umbral de coste, y mis propios valores de partida sembrados en el perfil.

Ahí Forma dejó de ser *una* app de fitness y pasó a ser **mi** app de fitness.

Y esa es la parte que enlaza con el domingo por la noche. Una selección no gana un Mundial improvisando, y tú no cambias de composición corporal improvisando. Lo que hace un plan escrito —en el campo, en el gimnasio o en el repositorio— es quitarte la decisión de encima cuando no tienes ganas de decidir. El plan decide por ti. Tú solo ejecutas la rebanada de hoy.

Es literalmente el mismo mecanismo que las specs.

## Enrutado de modelos: pensar caro, teclear barato

Una decisión pequeña con consecuencias grandes.

Llevaba días con la duda: si tengo Opus seleccionado, ¿escribe Opus todo el código? Lo pregunté y acabó en una regla explícita metida en las propias skills:

- **`jira-sdd-specs`** (pensar, decidir, escribir la especificación) → **Opus**, siempre.
- **`jira-sdd-ai`** (implementar desde una spec ya cerrada) → delega en un subagente **Sonnet**.

El razonamiento es el de siempre: **pensar es caro y merece la pena; teclear desde una spec cerrada, no.** Si la especificación está bien hecha, la implementación es trabajo mecánico, y pagar precio de arquitecto por trabajo mecánico es tirar dinero.

También me planteé bajar las tareas de git (mergear, borrar ramas, commit, pull) a Haiku. De momento siguen inline, pero la pregunta era la correcta: **no todo el trabajo de una sesión merece el mismo modelo.**

## Lowlights

### La tarde que perdí depurando un sistema que funcionaba

El lunes migré `diegobarrioh.dev` de `gtag` inline a Google Tag Manager. La migración fue limpia: PR mergeada, GTM publicado, desplegado. Diez minutos.

Y después me pasé **horas** persiguiendo un fantasma: Realtime marcaba 0 usuarios activos. Probé en incógnito. Probé desde el móvil con 4G. Lancé hits con Chrome headless. Nada.

No estaba roto. Eran **tres cosas a la vez**, y cada una habría bastado:

- Chrome headless recibe 204 y registra eventos, pero GA4 lo marca como **bot** y no lo cuenta como usuario activo.
- Mi navegador principal manda `traffic_type=internal`, y el filtro de tráfico interno de GA4 —activo, y bien configurado— me excluye **por diseño**.
- Mi móvil sale por un relay con IP en París, y cuando el relay bloqueaba, la petición a `google-analytics.com` ni llegaba a salir.

O sea: gasté una tarde depurando un sistema correcto porque **los tres instrumentos de medida estaban contaminados**. Lo resolvió DebugView con `?debug_mode=1`, que finalmente mostró usuario activo = 1 con `user_engagement`, la firma de un humano de verdad.

La lección duele y por eso la escribo: **antes de depurar el sistema, valida el instrumento.** Si tu forma de medir está rota, vas a "arreglar" cosas que no estaban mal.

### Deuda mergeada a sabiendas

Varias veces dije, literalmente, "he mergeado así, si hay algún gap, anota para futuro". Es una decisión consciente y la defiendo, pero hay que decirla en voz alta: **la deuda anotada sigue siendo deuda.** La única diferencia —y no es pequeña— es que esta tiene número de Jira y specs.

### El recap del domingo

No lo escribí. España jugaba la final. Prioridades.

## Lo que me llevo

1. **Cuando el proceso está estandarizado, el volumen deja de ser el problema.** 62 PRs no salieron de escribir más rápido, salieron de no decidir dos veces lo mismo.
2. **Anotar el hueco en vez de arreglarlo es lo que mantiene las PRs pequeñas.** Requiere disciplina, porque arreglarlo *ahí* siempre parece más barato de lo que es.
3. **Usa el modelo caro para pensar y el barato para teclear.** El valor está en la spec, no en el tecleo.
4. **Valida el instrumento antes que el sistema.**
5. Y la de fondo: un plan escrito te quita la decisión de encima el día que no tienes ganas de decidir. Sirve para ganar un Mundial, para bajar el porcentaje de grasa y para mergear 62 PRs sin dejar un pantano detrás.

## Qué viene

**Design System v2** ya está andando (FOR-162 y sus hijas FOR-163 a FOR-168): reconciliar los tokens con las plantillas de mockups, alinear los componentes compartidos, sidebar a altura completa y barra de navegación móvil flotante. Y quedan las historias de UI FOR-143 a FOR-161 por rematar.

Forma ya se sostiene sola en producción, con datos reales y una báscula conectada. Ahora toca que se vea como debe.

Vamos, campeones. 🏆
