---
title: "Construyendo un orquestador que no se fía de sus agentes"
date: "2026-10-11"
description: "Semana del 5 al 11 de octubre. Skynet, el orquestador de agentes de código, cerró su primera fase, estrenó interfaz y empezó a ejecutar workflows, y cada capa de verificación cazó algo que la anterior había dado por bueno: también el CI."
tags: ["weekly", "ai-agents", "skynet", "verification", "ci", "ui-design", "workflows", "postgresql"]
thumb: "/blog/building-an-orchestrator-that-doesnt-trust-its-agents-thumb.webp"
cover: "/blog/building-an-orchestrator-that-doesnt-trust-its-agents-cover.webp"
ogImage: "/blog/building-an-orchestrator-that-doesnt-trust-its-agents-og.jpg"
---

## Lo que nos propusimos

La semana pasada nació **Skynet**, el orquestador que Diego está construyendo
para que varios agentes de código planifiquen, implementen, revisen y validen
cambios de software por su cuenta, con una persona supervisando y no
tecleando. Terminó con los cimientos en `main` y un agente esperando en cola a
un runner que todavía no existía.

Esta semana tenía un objetivo claro: cerrar la primera fase. Que el runner
ejecutara agentes de verdad, que se pudieran reanudar, reintentar y bifurcar,
que cada ejecución dejara pruebas de lo que hizo y que todo eso estuviera
detrás de un login. Lo que no estaba en el plan llegó a mitad de semana:
Diego decidió que, antes de seguir añadiendo funciones, la interfaz entera
había que rehacerla. Y el sábado, con todo eso cerrado, empezó la segunda
fase: workflows definidos en YAML que Skynet ejecuta paso a paso.

Hubo un cambio más, menos visible y más importante. Todo se construyó desde
Claude Desktop, en hilos de trabajo, y Hermes, el agente que opera la
infraestructura de casa, pasó a desplegar y probar cada pull request por su
cuenta. El ciclo de la semana quedó así: Claude escribe y abre la PR, Hermes
la despliega y ejecuta su guía de pruebas, Diego la prueba en local y dice
«todo ok, fusiona y sigue». Lo dijo más de treinta veces.

## Los problemas que nos encontramos

### Tres fallos con el CI en verde

El martes, antes de fusionar la PR que enseñaba al runner a bifurcar sesiones,
Claude hizo una última revisión de su propio código. El CI estaba en verde y
nadie había comentado nada. Aun así, aparecieron tres fallos: los ficheros que
no eran texto UTF-8 se corrompían al copiarse a la rama bifurcada, los enlaces
simbólicos se seguían hasta fuera del repositorio, y un fork que fallaba a
medias dejaba una rama y un directorio de trabajo huérfanos.

Ninguno lo habría detectado la batería de tests, porque ninguno de esos casos
estaba en ella. El verde decía que lo probado funcionaba. No decía nada de lo
que no se había probado.

### Un runner que decía «sí» a todo

Esa misma mañana Diego probó la reanudación de sesiones en local y la
respuesta nueva nunca llegó. El agente se quedaba «Arrancando» para siempre.
La causa la encontró él: el runner que estaba corriendo era el binario
anterior, compilado antes de que existiera la reanudación.

Recompilar lo arregló, pero lo inquietante era otra cosa. El runner viejo
había recibido una orden que no entendía y la había **confirmado**. Ni error
ni rechazo: un «recibido» y un agente colgado. Un sistema que reconoce algo que
no sabe hacer es peor que uno que falla, porque el fallo al menos se ve.

### Un diseño que nadie había pedido rehacer

El jueves, con la primera fase cerrada, Diego paró antes de empezar los
workflows. La interfaz funcionaba, pero era la típica herramienta interna:
gris, densa y difícil de leer de un vistazo. Claude estudió diecinueve
herramientas de flujos agénticos (Temporal, Prefect, n8n, Langfuse, Dify…) y,
como sus webs estaban bloqueadas desde el entorno, sacó las conclusiones de su
código fuente. La recomendación fue la que usan casi todas: shadcn/ui.

Diego la rechazó por demasiado estándar. Quería algo con personalidad: un
lenguaje visual inspirado en las apps educativas gamificadas, con esquinas muy
redondeadas, botones que parecen físicos, sombras cortas y cada estado
comunicado a la vez con color, icono y texto. La maqueta salió a la primera.
Lo difícil vino después: rehacer cada pantalla sin romper nada de lo que ya
funcionaba, en ocho entregas en dos días.

### El motor que se esperaba a sí mismo

El sábado, la primera versión del motor de workflows falló en el CI con algo
que no se ve todos los días en el log de Postgres: interbloqueos. El motor
decidía qué fase venía después dentro de la misma transacción que registraba
el cambio de estado, y esa decisión esperaba a una ejecución que tenía
bloqueada un worker.

La semana pasada, asignar la secuencia de eventos bajo un bloqueo hasta el
commit era lo que garantizaba un timeline sin huecos. Esta semana se vio el
precio: si una transacción hace demasiadas cosas mientras sostiene ese
bloqueo, acaba esperando a quien la espera a ella.

### Un editor que no se dejaba tocar

El domingo por la mañana, antes de aprobar los nodos de comando, Diego probó
el editor de workflows desde el iPhone. No podía seleccionar texto, ni copiar,
ni pegar. Monaco, el editor de VS Code que Skynet usa en la web, no admite
pantallas táctiles e intercepta los toques. Ningún test lo habría encontrado,
porque ningún test corre en un Safari de móvil con un dedo.

### El verde que no era aceptación

Y el último. La PR de los nodos condicionales terminó la semana con sus cinco
checks de GitHub en verde: Java, Vite, Playwright, Docker Compose y
SonarCloud. Hermes la desplegó, ejecutó su guía de pruebas y encontró que un
test de la web no localizaba un enlace que debía estar ahí. 130 de 131.

El CI decía que la PR estaba lista. No lo estaba.

## Cómo lo resolvimos

Los tres fallos del fork se corrigieron con un test cada uno antes de
fusionar. El runner que confirmaba lo que no entendía se convirtió en una
regla: un agente que pierde dos latidos pasa a «Fallida», y el comando que
levanta Skynet recompila siempre el runner desde la misma revisión que la API.

La primera fase se cerró con lo que la hace útil: el runner sube el prompt,
los logs, los commits y el diff de cada invocación, y ejecuta verificaciones
por su cuenta. La web distingue entre lo que el agente **dice** que ha hecho y
lo que el sistema **ha comprobado**. Para probar todo eso sin gastar tokens,
existe `fake-claude`, un ejecutable que reproduce sesiones grabadas de Claude
Code (éxito, cancelación, presupuesto agotado, permisos denegados) y que
incluso puede editar ficheros y hacer commits de verdad.

La interfaz nueva se entregó entera: navegación, dashboard, una vista de
ejecución en tres paneles (pasos, actividad e inspector) que se redimensionan
con el teclado, colores personalizables con comprobación de contraste, la
posibilidad de archivar y eliminar sin perder la historia, y la identidad
visual que Diego diseñó para Skynet.

![Dashboard de Skynet en tema oscuro con la interfaz nueva. A la izquierda, la navegación con Dashboard, Proyectos, Workflows, Ejecuciones, Runners, Actividad y Ajustes, y abajo «1 runner en línea». Arriba, una franja verde: «Nada requiere atención ahora mismo». Debajo, las métricas de los últimos 7 días en tarjetas redondeadas: 0 activas, 0 fallidas, 1,7861 US$ de coste, 12 s de duración mediana, 13 ejecuciones, 9 completadas, 4 canceladas. Al final, un gráfico de barras de ejecuciones por día del 4 al 11 de octubre](/img/skynet-2026-10-11-dashboard.webp)

*El dashboard con el lenguaje visual nuevo: tarjetas con volumen, estados
con color, icono y texto, y lo primero que se lee es si algo necesita
atención.*

![Ejecución SKY-9 «Lanzo Revisar y arreglar», completada. En la cabecera, el workflow «Revisar y arreglar v1», el runner omarchy, el modelo claude-opus-5-5 y la rama, con los botones Reintentar, Bifurcar y Eliminar worktree. Debajo, duración 2 min 41 s, 13.341 tokens y 1,1337 US$. En «Progreso», cuatro fases unidas por líneas: review completada en 2 min 40 s, fix omitida (línea discontinua), limpio y final completadas. Abajo empiezan los paneles de conversación e inspector](/img/skynet-2026-10-11-ejecucion.webp)

*Una ejecución de un workflow de cuatro fases, lanzada mientras Hermes
probaba la PR de las condiciones, todavía sin fusionar. La fase `fix` queda
omitida porque la revisión no encontró nada bloqueante, y Skynet lo enseña
como un salto, no como un fallo.*

![Pantalla de Ajustes. Arriba, seis paletas para elegir: Skynet (seleccionada), Bosque, Laguna, Mandarina, Frambuesa y Grafito. A la izquierda, los seis colores editables con su uso: Acento, Correcto, Aviso, Fallo, En curso y En espera, cada uno con su código hexadecimal. A la derecha, una vista previa en tema claro y oscuro con botones «Lanzar agente», «Aprobar» y «Eliminar», píldoras de estado y un diff](/img/skynet-2026-10-11-colores.webp)

*Los colores se eligen por pieza y el resto se deriva solo, en los dos
temas, comprobando que el texto llegue siempre al contraste AA.*

El motor dejó de decidir la siguiente fase dentro de la transacción del cambio:
ahora lo hace el worker, después del commit, y el interbloqueo desapareció.
Con eso llegaron los workflows versionados (borrador y publicado), los nodos
que ejecutan comandos y las fases en paralelo, cada una en su propio
directorio de trabajo. En móvil, el editor YAML cambia Monaco por un campo de
texto nativo con la misma validación.

![Editor de un workflow «revisar-y-arreglar» en YAML: un agente revisor que devuelve un booleano hasBlockingFindings y cuatro fases, review, fix (con la condición review.hasBlockingFindings), limpio (tipo conditional) y final (tipo command, ejecuta «echo terminado»). A la derecha, el panel «Problemas» con un error, «Clave output desconocida» en la línea 6, y dos avisos amarillos: «condition todavía no se usa: llega en W3» y «El tipo conditional todavía no se ejecuta: llega en W3». Debajo, «Qué define», con cada fase, su tipo y de qué depende](/img/skynet-2026-10-11-workflow.webp)

*El editor de workflows en el despliegue del domingo. Fíjate en los avisos
amarillos: la versión fusionada todavía no sabe ejecutar condiciones, y el
propio editor lo dice en lugar de fingir que sí.*

La PR de las condiciones sigue abierta. No se cuenta como entregada.

#### El único fragmento técnico de este post

Hermes no prueba las PRs con una lista de pasos que alguien mantiene aparte.
**La propia PR trae su prueba de aceptación.** Desde el miércoles, cada PR se
titula con su hito (`M6-B - Nombre`) y añade o modifica un fichero
`docs/tests/probar-m6b.md` con la guía para validarla. Cuando GitHub avisa de
una PR abierta o actualizada, Hermes comprueba un contrato antes de tocar nada:

- la PR está abierta, contra `main` y no es un borrador;
- el directorio de trabajo está limpio;
- el SHA es exacto, y es el que se despliega;
- el milestone coincide con el título;
- y la PR añade o modifica su propio `probar-*.md`.

Solo entonces reconstruye los contenedores, recompila el runner desde esa
misma revisión, ejecuta la guía y manda el resultado por Telegram. Un build
correcto no es aceptación; la guía es la aceptación.

Igual de importante es lo que el webhook **no** puede hacer. No ejecuta
`git reset --hard` ni limpia un directorio de trabajo sucio: si encuentra
cambios, se para y dice qué rutas son. Cuando una guía pedía algo destructivo
o activaba la política de aprobación, Hermes no buscó un rodeo: desplegó lo
que podía verificar, marcó la aceptación como incompleta y liberó la cola. Un
automatismo es útil por lo bien acotado que está, no por cuánto puede hacer.

## Lo que no salió bien

- **Los nodos condicionales no se entregaron.** CI en verde, aceptación en
  rojo.
- **SonarCloud era inaccesible desde Claude Desktop.** Tres veces hizo falta
  que Diego pasara capturas, y una vez Claude cambió código para un aviso que
  no podía ver y adivinó mal.
- **Los milestones de GitHub no existían.** Se llevaban días enlazando issues
  como si los hubiera, hasta que Diego vio una PR sin el suyo.
- **El webhook abortó varias veces sin motivo real**, por acciones que
  activaban la aprobación o por un E2E que buscaba el Postgres equivocado.
- **La cuota semanal llegó al 98 %** antes de reiniciarse el sábado por la
  noche. No se agotó, pero no sobró nada.

## Lo que me llevo

**Cada capa de verificación cazó algo que la anterior había dado por bueno.**
La autorrevisión encontró fallos con el CI en verde. La prueba de Diego
encontró un binario viejo y un editor que no se dejaba tocar. La aceptación
de Hermes encontró una regresión con los cinco checks en verde.

Un check en verde es una afirmación, igual que un agente diciendo «he
terminado». Ninguna de las dos es mentira, pero ninguna es una prueba. Skynet
existe precisamente para no creerse ninguna sin evidencia, y esta semana ha
empezado a aplicarse esa regla a sí mismo.

La semana que viene: arreglar las condiciones y cerrar los nodos de W3,
preparar el hito para que los workflows puedan usar Codex o Gemini además de
Claude, y reducir los falsos abortos del webhook sin aflojar ni uno de sus
límites.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>X</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:4"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">20 ventanas en 10 sesiones de Claude Desktop · lunes 08:46 → domingo 08:56 · ningún día sin actividad · la cuota semanal llegó al 98 % antes del reinicio del sábado a las 22:00, sin agotarse</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">35</span>
  <span class="ws-note">Todas en Skynet, de la #16 a la #70 · acumulado 42 · la #71 abierta</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas</span>
  <span class="ws-v">+50.844 / −4.787</span>
  <span class="ws-meter"><i class="ws-add" style="width:91%"></i><i class="ws-del" style="width:9%"></i></span>
  <span class="ws-note">Sumando PR a PR · el diff neto de <code>main</code> toca 429 ficheros</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V4 → V14</span>
  <span class="ws-note">11 nuevas: proyecciones, sesiones, artefactos, políticas, archivado, workflows y fases paralelas</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones cerrados</span>
  <span class="ws-v">11</span>
  <span class="ws-note">Fase 1 completa, UI-A → UI-H, archivado y W1–W2 · 24 issues cerradas</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts en Claude Desktop</span>
  <span class="ws-v">79</span>
  <span class="ws-note">4,0 por ventana de 5 h · cero sesiones en Claude Code</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Prompts a Hermes</span>
  <span class="ws-v">130</span>
  <span class="ws-note">84 sesiones (cada evento del webhook abre una) y 2.564 llamadas a herramientas</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Coste equivalente en API</span>
  <span class="ws-v">≈325 $</span>
  <span class="ws-note">Estimado desde el uso de tokens, dentro de la suscripción y sin overage · el 43 % en el hilo de la Fase 1</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet del
domingo 11 por la mañana, con los datos reales de las pruebas de la
semana.</small></blockquote>
