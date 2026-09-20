---
title: "Mi CI se puso en verde sin ejecutar un test"
date: "2026-09-20"
description: "Semana del 14 al 20 de septiembre. Monté un job de CI para verificar las migraciones contra PostgreSQL de verdad. Pasó a la primera, en verde, sin ejecutar ni un solo test. Tirando de ese hilo apareció el patrón que ordenó la semana entera: el sistema estaba lleno de afirmaciones que nadie comprobaba."
tags: ["weekly", "forma", "ci", "postgresql", "testing", "ai-agents", "claude-code"]
projects: ["forma"]
thumb: "/blog/my-ci-turned-green-without-running-a-test-thumb.webp"
cover: "/blog/my-ci-turned-green-without-running-a-test-cover.webp"
ogImage: "/blog/my-ci-turned-green-without-running-a-test-og.jpg"
---

## Lo que nos propusimos

Forma es la aplicación de entrenamiento y nutrición que estoy construyendo con
agentes de IA. La semana pasada tenía tres cosas en la lista, y ninguna era
especialmente emocionante:

1. **Convertir el generador de planes en algo real.** Hasta ahora el asistente
   recogía respuestas y no producía nada. Había que darle vocabulario,
   persistencia, una API y un contrato con el agente de IA que escribe el plan.
2. **Unificar los dominios.** Akademia y Forma vivían cada una en su sitio;
   tocaba meterlas bajo el mismo paraguas que TokenMeter, en
   `backendtothefuture.com`.
3. **Poner los READMEs decentes** en los repos que se habían quedado atrás.

Lo que pasó fue otra cosa. A mitad de semana monté un job de integración
continua para verificar las migraciones de base de datos contra un PostgreSQL
real, porque hasta entonces se validaban contra H2 en modo compatibilidad. El
job pasó. Verde a la primera. Me quedé mirando el log un rato largo, porque el
log solo decía `BUILD SUCCESSFUL` y nada más.

No había ejecutado ni un test.

A partir de ahí no pude dejar de ver lo mismo en todas partes. Esta semana no
fue sobre planes de nutrición ni sobre DNS. Fue sobre **afirmaciones que nadie
comprueba**.

## Los problemas que nos encontramos

### El panel daba por hecho un plan que no existía

Empecé por implementar el login con Google, igual que ya lo tenía en Akademia.
Funcionó, y lo primero que hice fue entrar con una cuenta nueva y limpia.

El dashboard me recibió con un banner que decía **«Tu plan está en marcha»**.

No había ningún plan. No había nada. El componente nunca miraba si había datos
detrás: pintaba esa frase siempre, para todo el mundo, desde el primer segundo.
Y dos pantallas más allá había un botón, «Crea tu plan gratis», que llevaba al
embudo público y anónimo de la landing — un formulario que recoge un lead y
que, para alguien que ya ha iniciado sesión, no produce absolutamente nada. El
usuario rellenaba cuatro pasos y volvía exactamente igual que estaba.

Ninguna de las dos cosas era un bug de lógica. Las dos eran la interfaz
afirmando algo que el backend no podía sostener.

### Adivinar las calorías de alguien

El diseño original del generador de planes tenía una decisión que a mí me
pareció razonable cuando la escribí: deducir la dirección del plan a partir del
objetivo general del usuario. Si alguien había dicho que su objetivo era
«composición corporal», el sistema asumía pérdida de grasa y aplicaba un
déficit del 20 %.

Diego lo rechazó, y tenía razón. «Composición corporal» es una respuesta igual
de honesta para quien quiere perder grasa que para quien quiere ganar músculo.
Un 20 % de déficit silencioso sobre la persona equivocada no es un detalle de
producto: es una afirmación sobre lo que alguien debería comer, hecha sin
preguntar.

El asistente pasó a preguntarlo de forma explícita, en un paso propio. Y de
paso desapareció un campo de texto libre —«alimentos que prefieres evitar»— que
era justo donde la gente escribe sus alergias y sus patologías. Dato de
categoría especial del artículo 9 del RGPD, recogido en una caja de texto que
nadie leía nunca.

### H2 dice PostgreSQL, y no es PostgreSQL

Las 62 migraciones del proyecto se validaban en cada pull request contra H2 en
modo de compatibilidad PostgreSQL. Ese modo es una capa de compatibilidad, no
Postgres, y ya había torcido decisiones de diseño reales: hay un truco con
índices únicos parciales en el esquema que existe únicamente porque H2 no
parsea la sintaxis que Postgres sí acepta.

O sea: ninguna migración de este repositorio se había verificado nunca contra
la base de datos que corre en producción antes de desplegarse.

El arreglo era evidente: un job de CI separado, un contenedor
`postgres:17-alpine`, y aplicar las 62 migraciones contra él. Lo monté, pasó en
verde, y ahí empezó lo interesante.

#### El único fragmento técnico de este post

Una tarea `Test` de Gradle a la que no le encaja ningún test **no falla**.
Termina con éxito, en silencio, en un par de segundos. Si filtras por una
etiqueta de JUnit que no usa nadie, la build sigue siendo verde.

Lo primero que intenté fue la opción que parece hecha para esto:

```groovy
test {
  filter { failOnNoMatchingTests = true }
}
```

No sirve. Esa propiedad gobierna los filtros **por nombre** (`--tests`,
`includeTestsMatching`), no los `includeTags` de la JUnit Platform. Lo comprobé
apuntando `includeTags` a una etiqueta inexistente en Gradle 8.14.1: seguía
dando `BUILD SUCCESSFUL`. Y `failOnNoDiscoveredTests` no existe en esa versión.

Lo que sí funciona es contar y romper:

```groovy
tasks.register('postgresTest', Test) {
    useJUnitPlatform {
        includeTags 'postgres'
    }

    def executedTests = new java.util.concurrent.atomic.AtomicInteger()
    afterTest { desc, result -> executedTests.incrementAndGet() }
    doLast {
        if (executedTests.get() == 0) {
            throw new GradleException(
                'postgresTest ran zero tests: the `postgres` tag matched nothing, ' +
                'so not a single migration was verified against real PostgreSQL.')
        }
    }

    // Without this the CI log shows only `BUILD SUCCESSFUL`, and a reader
    // cannot tell a real 62-migration run from a no-op.
    testLogging {
        showStandardStreams = true
        events 'passed', 'failed'
    }
}
```

Dos líneas de idea: **el job cuenta lo que ejecuta y se rompe si es cero**, y
el log imprime cuántas migraciones aplicó y cuál fue la última. Un job que
verifica algo tiene que poder demostrarlo en su propio log. Si leyendo la salida
no puedes distinguir «verificó 62 migraciones» de «no hizo nada», ese job no es
una garantía: es un adorno verde.

### El plan que el agente afirma no es el plan que suma

Este es el mismo error, pero cometido por una IA en vez de por mí.

Cuando un modelo genera un plan de nutrición, devuelve las comidas **y** el
total de calorías y macros del día. Ese total es una afirmación suya. En el
repositorio hay una dieta real generada por un LLM, importada hace semanas, en
la que las calorías que el propio modelo declara se quedan cortas **entre 379 y
702 kcal cada día** respecto a lo que suma su propia lista de comida. Todos los
días. La proteína, curiosamente, sí cuadra.

La especificación llevaba escrito desde el principio que el backend tenía que
recalcular y validar antes de guardar nada, «porque la IA puede indicar un total
incorrecto». Nunca se había implementado.

La parte que más me costó decidir no fue cómo recalcular, sino qué hacer con la
diferencia. Y la respuesta correcta es: **nada**. El auditor informa y no
corrige jamás el valor declarado, porque la distancia entre lo declarado y lo
calculado *es* la prueba de que el modelo se equivocó. Si la sobrescribes,
borras la única evidencia que tenías.

### Un dominio no está migrado hasta que el login funciona

El cambio de dominio parecía la tarea aburrida de la semana. No lo fue.

Un `redirect_uri` de OAuth es un match exacto contra lo registrado en la consola
del proveedor. Cambiar el dominio en el código sin dar de alta la URL nueva
—**antes**, y sin retirar la vieja— tira el login en la ventana entre el
despliegue y el registro. Y hubo que revisarlo en cuatro proveedores y dos
aplicaciones, con el cliente de OAuth de Akademia escondido en un proyecto de
Google Cloud distinto del de Forma.

Lo que hicimos no fue leer la configuración y darla por buena. Se inició el
flujo real de las dos aplicaciones, se siguió la redirección hasta Google y se
comprobó que cada una llegaba a su pantalla de login con el cliente correcto.
Es la diferencia entre revisar una lista de URLs y verificar un flujo.

### El domingo se cayeron tres aplicaciones. Ninguna estaba caída

Con los dominios ya detrás del proxy de Cloudflare, el domingo las tres apps
dejaron de responder desde el wifi de casa. A la vez.

Ninguna estaba rota. Los contenedores estaban sanos, nginx validaba su
configuración, los tres upstreams devolvían 200 y desde datos móviles todo
cargaba. El fallo estaba entre el ISP y el rango anycast de Cloudflare: ni el
portátil, ni el equipo cableado, ni el propio router alcanzaban esas dos IPs,
mientras el resto de internet iba perfectamente.

La prueba limpia la dio Akademia: su dominio antiguo, todavía apuntando directo
a la IP pública, funcionaba desde casa; el nuevo, detrás del edge, no. Un
síntoma que parecía «se ha caído todo» era, otra vez, una afirmación sin
verificar — la mía.

## Cómo quedó

El asistente de configuración inicial ahora pregunta la dirección del plan en
un paso propio, con las tres opciones y lo que cada una implica escrito debajo.
Nadie deduce nada:

![Paso 4 de 8 del asistente de configuración inicial de Forma, tema oscuro: cabecera con el logotipo FORMA, el título «Configuración inicial», el enlace «Ahora no, ir al panel» y una barra de progreso al 50 %; debajo el paso «Dirección del plan» con la pregunta «¿Qué dirección quieres que siga tu próximo plan? Esto decide cuántas calorías te propondremos — es distinto de tu objetivo general» y tres tarjetas seleccionables: Perder grasa (seleccionada, con borde verde, «Un déficit calórico para reducir grasa corporal»), Ganar músculo («Un superávit calórico para ganar masa muscular») y Mantenerme («Conservar tu peso y tu composición actuales»); al pie los botones Atrás, Omitir este paso y Siguiente](/img/forma-2026-09-20-onboarding-direccion.webp)

Y al terminar, la petición sale de verdad hacia el backend, que la congela con
las calorías ya calculadas:

![Pantalla final del asistente de configuración inicial de Forma: el título «Todo listo», un texto confirmando que se han guardado las preferencias, un aviso destacado en verde que dice «Hemos enviado tu petición de un plan generado por IA» y el botón «Ir al panel»](/img/forma-2026-09-20-onboarding-completion.webp)

El panel, para una cuenta sin plan, ya no promete nada. El widget de menú dice
que no hay comidas para hoy y el aviso del final dice exactamente lo que pasa,
con el botón que lleva al único creador de planes que funciona dentro de la
app:

![Panel principal de Forma en escritorio, tema oscuro: cuatro tarjetas de métricas con sus minigráficas (Peso 74,0 kg, Grasa 15,0 %, Músculo 62,9 kg, IMC 22,5), el widget de Entrenamiento con la sesión de hoy «Fuerza · Pierna y core» y sus dos siluetas musculares con las piernas resaltadas en verde y el contador «2 de 6 sesiones completadas», el widget de Menú con el texto «No hay un plan de comidas para hoy todavía», el anillo de Nutrición con todos los macros a 0/0, las gráficas de Tendencia 30 días y Evolución, la Lista de compra con cinco productos, una tarjeta de Recomendación destacada sobre la grasa corporal y, abajo a la derecha, el aviso «Todavía no tienes un plan — Créalo y en cuanto esté en marcha verás aquí tu progreso» con el botón verde «Crear mi plan»](/img/forma-2026-09-20-dashboard-sin-plan.webp)

Y borrar un plan, que ahora además libera la petición que lo generó, pide
escribir la palabra antes de dejarte pulsar:

![Página «Mis planes» de nutrición de Forma con un diálogo modal abierto encima: el título «Eliminar Recomposición 12 semanas», el aviso de que el plan y todos sus días desaparecen para siempre, un campo de confirmación con la palabra «eliminar» ya escrita y el botón rojo «Eliminar» habilitado junto al botón Cancelar](/img/forma-2026-09-20-eliminar-plan.webp)

Además del generador, la semana dejó el esqueleto completo del plan: una tabla
que congela los datos de entrada en el momento de pedirlo (las calorías que se
calculan son las que verá la persona, no las que daría la fórmula mañana), un
endpoint que rechaza con un 409 limpio si ya tienes una petición abierta, un
puerto neutral hacia el agente de IA con su adaptador y sus fixtures, y un
programa de doce semanas modelado como tres bloques de cuatro en vez de 84 días
generados de golpe.

Y el README de Forma pasó de ser la nota de arranque del repo a una portada con
21 capturas y, sobre todo, una sección que dice en voz alta **lo que la
aplicación no hace**: que Strava, Garmin y Apple Health no existen, que el
agente de IA está cableado pero inerte sin su variable de entorno, y que la app
arranca vacía por diseño. Callarlo no evita la decepción, solo la aplaza hasta
el primer issue.

## Lo que no salió bien

- **El job de Postgres pasó en verde sin ejecutar nada.** Lo encontré leyendo
  el log por curiosidad, no porque fallara. Si no llego a mirar, hoy tendría un
  job que no verifica nada y en el que confío.
- **Un test borraba la semilla de otro.** Todos los tests de integración
  comparten una única base H2 en memoria durante todo el proceso, así que una
  clase que vaciaba tablas hacía fallar a otra según el **orden alfabético**.
  Mi primer arreglo fue un `@DirtiesContext` que no podía funcionar —un contexto
  nuevo reutiliza la misma base con nombre— y hubo que rehacerlo.
- **El login con Google no funcionó a la primera.** Detrás del doble proxy
  generaba el `redirect_uri` en HTTP en vez de HTTPS, y por localhost se dejaba
  el puerto por el camino.
- **La herramienta con la que documentamos el proyecto servía dos pantallas
  rotas.** El modo de desarrollo con datos de ejemplo pintaba «NaN €» en la
  lista de la compra y un error en la página de planes. Llevaba así un tiempo.
- **Escribí un CHECK demasiado listo.** Fijé la longitud de bloque a
  exactamente 4 semanas en el esquema. Eso no valida una entrada: prohíbe un
  cambio de producto. Hubo que relajarlo a un rango en el mismo PR.
- **El despacho al agente no se empezó.** El corte 6 sigue pendiente: hoy la
  petición se guarda y al otro lado todavía no hay nadie.

## Lo que me llevo

**Una afirmación que nadie comprueba es deuda técnica con intereses.** El banner
del dashboard, el README, el modo PostgreSQL de H2, las calorías que declara el
modelo y mi propio «se ha caído todo» son exactamente el mismo bug con cinco
caras distintas. No fallan: simplemente no son verdad, y como nada las
contradice, se quedan.

De ahí salen dos reglas que me llevo escritas:

**Si un dato lo puede afirmar quien lo genera, recalcúlalo — y guarda la
diferencia, no la corrijas.** La discrepancia es la prueba.

**Y un CHECK debe descartar lo imposible, no lo indeciso.** Congelar una
decisión de producto en el esquema convierte un cambio de opinión en una
migración.

La semana que viene: el despacho al agente y la ingesta del plan que devuelve,
con el informe del auditor guardado junto a la petición. Y empezar la segunda
entrada al edificio — la de quien pide un plan antes de tener cuenta.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>X</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">9 ventanas en 5 sesiones · martes 08:12 → domingo 18:17 · el lunes no hubo actividad · la cuota semanal no se agotó</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">23</span>
  <span class="ws-meter"><i class="ws-fill" style="width:78%"></i></span>
  <span class="ws-note">78 % en Forma (18) · Akademia 1 · este blog 2 · diegobarrioh.dev 2 — acumulado de Forma ≈273 PRs (#269 → #288)</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas cambiadas</span>
  <span class="ws-v">+13.056 / −456</span>
  <span class="ws-meter"><i class="ws-add" style="width:96.6%"></i><i class="ws-del" style="width:3.4%"></i></span>
  <span class="ws-note">97 % son líneas nuevas: una semana de construir, no de reescribir. Cuatro repositorios.</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V62 → V65</span>
  <span class="ws-note">4 nuevas · y por primera vez las 62 del proyecto se verifican contra PostgreSQL 17 real en CI</span>
</div>

<div class="ws-row">
  <span class="ws-i">🌐</span>
  <span class="ws-k">Dominios migrados</span>
  <span class="ws-v">2</span>
  <span class="ws-note"><code>akademia</code> y <code>forma</code> bajo <code>backendtothefuture.com</code>, junto a <code>tokenmeter</code></span>
</div>

<div class="ws-row">
  <span class="ws-i">🔒</span>
  <span class="ws-k">Certificados renovados en seco</span>
  <span class="ws-v">8</span>
  <span class="ws-note">Después de reparar un Certbot roto por una colisión de paquetes Python</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts míos</span>
  <span class="ws-v">74</span>
  <span class="ws-note">≈8 por ventana de 5 h. Casi todos son «mergeada, limpia la rama y empieza con el corte siguiente».</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧰</span>
  <span class="ws-k">Skills usadas</span>
  <span class="ws-v">4</span>
  <span class="ws-note"><code>branch-pr</code> · <code>chained-pr</code> · <code>work-unit-commits</code> · <code>recap</code></span>
</div>

</div>

<blockquote><small>Nota sobre las capturas: están hechas contra la aplicación en
el último commit de la semana, con datos de ejemplo y sin backend real. Nada de
lo que se ve aquí son datos de salud reales.</small></blockquote>
