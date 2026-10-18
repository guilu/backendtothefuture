---
title: "Un simulador solo sabe lo que le contaste"
date: "2026-10-18"
description: "Semana del 12 al 18 de octubre. Skynet aprendió a trabajar con Claude, Codex y Gemini, y cada sustituto que usamos para no tocar la realidad (un simulador, un porcentaje, un CI en verde) dijo la verdad sobre lo que conocía y nada sobre lo demás."
tags: ["weekly", "ai-agents", "skynet", "testing", "multi-provider", "human-in-the-loop", "ci", "aws"]
thumb: "/blog/a-simulator-only-knows-what-you-told-it-thumb.webp"
cover: "/blog/a-simulator-only-knows-what-you-told-it-cover.webp"
ogImage: "/blog/a-simulator-only-knows-what-you-told-it-og.jpg"
---

## Lo que nos propusimos

**Skynet** es el orquestador que Diego está construyendo para que varios
agentes de código planifiquen, implementen, revisen y validen cambios de
software por su cuenta. Hasta el domingo pasado solo sabía hablar con uno:
Claude Code. Los workflows ejecutaban fases, pero una fase era poco más que
un comando que termina.

Esta semana tenía tres frentes. El primero, que Skynet pudiera lanzar
agentes de **Codex** y **Gemini** además de Claude, sin que el resto del
sistema tuviera que saber cuál estaba usando. El segundo, que los workflows
se parecieran a un proceso de verdad: fases que se pasan datos, que se
verifican por separado, que se paran a esperar la aprobación de una
persona, que se reintentan sin perder el motivo del fallo y que se ven como
un grafo. El tercero llegó el sábado, a mitad de camino: una página que
dijera cuánto margen queda en las cuotas de cada CLI y cuánto se ha comido
cada ejecución.

El ciclo de trabajo fue el que ya conocéis. Claude escribe la PR desde Claude
Desktop, Hermes la despliega en la máquina de pruebas y ejecuta su guía de
aceptación, y Diego decide si se fusiona. Veinticinco veces.

## Los problemas que nos encontramos

### El simulador que nunca había visto el programa real

Para probar Skynet sin gastar tokens existe `fake-claude`, un ejecutable que
reproduce sesiones grabadas de Claude Code. Para Codex hacía falta lo mismo,
pero había un problema: no había sesiones reales de Codex que grabar. Así que
`fake-codex` se escribió a mano, leyendo el código fuente del CLI para
imitar sus eventos.

Los tests pasaban. Diego probó el lunes por la noche con el Codex de verdad
y encontró lo que el simulador no podía encontrar: si lanzabas un agente, le
mandabas un mensaje y luego **bifurcabas** la sesión, la rama nueva perdía la
configuración del agente. Ni modelo, ni modo de permisos, ni formato de
salida.

Y lo incómodo vino después. El fallo también estaba en Claude Code, desde
hacía días. Allí no se notaba porque Claude usaba un modelo global que tapaba
el hueco. El simulador había hecho exactamente lo que le pedimos. Lo que no
le pedimos, no lo sabía.

### Tres agentes que no son iguales

Una interfaz común para varios proveedores tiene una tentación: fingir que
todos hacen lo mismo. No lo hacen. Claude Code reanuda y bifurca sesiones.
Codex tiene su propio formato de eventos. Gemini no permite bifurcar
(responde con un error) y no sabe devolver salida estructurada.

La alternativa a fingir era más trabajo: que cada proveedor declare lo que
sabe hacer, que la web desactive y explique lo que no puede y que el runner compense
donde se pueda. A Gemini, por ejemplo, se le pide el JSON dentro del prompt
y Skynet lo valida antes de aceptarlo.

### Implementado, fusionado y sin uso

El sábado, al planificar la página de cuotas, apareció una noticia que nadie
esperaba: Google había cerrado Gemini CLI para cuentas personales en junio y
lo había sustituido por otra herramienta, Antigravity. El proveedor de
Gemini que se fusionó el martes funciona. Pasa sus tests. Y no sirve para la
cuenta de Diego.

### Los números que nadie te da

La página de uso tenía una idea sencilla: enseñar cuántos tokens quedan en
la ventana de cinco horas y en la semanal de cada CLI. Resultó que ninguno
de los tres da esa cifra. Dan un **porcentaje** usado y una hora de
renovación. Claude Code, además, solo informa de su cuota dentro de la
salida de un agente que esté corriendo.

Habría sido fácil inventar una equivalencia («el 40 % son unos tantos
tokens»). Habría quedado bien en un gráfico. Habría sido mentira.

Y el domingo, al probar la página, la tarjeta de Claude no salía: en la
máquina de pruebas no había corrido ningún agente desde el despliegue, así
que no había muestra. Revisándolo apareció otra cosa: el runner de esa
máquina tenía Codex apuntando todavía a `fake-codex`. El simulador, otra vez,
haciéndose pasar por el real sin que nadie lo notara.

### Flechas que solo desaparecían en CI

El grafo de una ejecución perdía las flechas cada vez que llegaba un evento
nuevo. En local, nunca. En CI, siempre. La librería del grafo medía la
posición de cada caja en el navegador para saber dónde enganchar las flechas,
y en el entorno de CI esa medición llegaba tarde.

### Diecisiete minutos para mover una columna

El domingo, un cambio de una línea de CSS para que tres tarjetas ocuparan el
ancho completo disparó lo de siempre: diecisiete minutos de CI, el webhook,
el redespliegue de contenedores y runners, y la guía completa de Hermes.
Diego hizo la pregunta que cualquiera haría: ¿no hay una forma de hacer
cambios pequeños sin todo el protocolo?

## Cómo lo resolvimos

La bifurcación dejó de heredar la configuración de la última ejecución y
pasó a leerla siempre de la definición del agente. Antes de arreglarlo se
escribió un test que repite la secuencia exacta: lanzar, mensaje, bifurcar,
mensaje a la rama. Y luego se volvió a probar todo con Claude Code y Codex
reales, en un repositorio desechable. Desde entonces, la regla es explícita:
el simulador sirve para que los tests sean deterministas; la aceptación final
se hace con el ejecutable de verdad.

Para Gemini se reservó un hito propio para Antigravity. Hasta entonces, en la
página de uso, Antigravity solo se usa para leer cuotas.

La página de uso enseña lo que los CLIs dan, porcentaje y hora de
renovación, y al lado los tokens y el coste que Skynet sí puede atribuir a
cada agente y a cada ejecución. Ni una cifra inventada. Las tarjetas de los
proveedores salen siempre, con un «Sin datos» honesto hasta la primera
lectura. Y para grabar las cuotas reales hizo falta un segundo intento,
porque el `grep` del primer comando era, en la máquina de Diego, un alias de
otra herramienta.

Las flechas del grafo dejaron de depender de una medición: cada caja trae
sus puntos de conexión ya calculados. El test que reproduce el fallo se
escribió primero y falló antes del arreglo.

Lo de los diecisiete minutos tuvo la respuesta menos vistosa. Se propusieron
tres formas de acortar el ciclo y Diego decidió no tocar nada todavía. Un
cambio de CSS no necesita una aceptación completa; un cambio de migración,
sí. Distinguir uno de otro es justo el tipo de juicio que no conviene dejar a
un atajo improvisado un domingo. Primero hay que medir.

Con todo eso, Skynet terminó la semana con:

- **proveedores intercambiables**: Claude, Codex y Gemini, cada uno con sus
  capacidades declaradas y la web diciendo qué puede hacer cada uno;
- **fases que se pasan datos** y verificaciones que se ejecutan aparte de lo
  que el agente dice haber hecho;
- **puertas de aprobación**: una ejecución avanza sola hasta que hace falta
  una persona, que puede aprobar o pedir cambios, y un centro de aprobaciones
  que lo reúne todo;
- **reintentos, límites de tiempo y cancelación**, conservando el motivo del
  primer fallo;
- **grafos** del workflow y de cada ejecución, con carriles;
- la **página de uso**, y dos rediseños más: el dashboard y el detalle de
  una ejecución en dos paneles.

![Ejecución SKY-10 «Con Gemini», completada. Chips: workflow «Con Gemini v1», runner omarchy, proveedor Gemini CLI, modelo gemini-2.5-pro y la rama. El botón «Bifurcar…» aparece desactivado y debajo se lee «Gemini CLI no permite bifurcar una sesión». Métricas: 17 s, 24.620 tokens, 0,0444 US$ y cuota sin dato. Abajo, el grafo de progreso con dos fases completadas, fix y review](/img/skynet-2026-10-18-gemini.webp)

*Una ejecución con Gemini. Skynet no finge que todos los agentes son
iguales: el botón de bifurcar está, pero desactivado, y dice por qué.*

![Ejecución SKY-9 «Lanzo Revisar y arreglar» con la vista nueva. Cabecera con estado, chips de workflow, runner, Claude Code, modelo y rama, y el aviso de que el worktree se eliminó. Cuatro tarjetas: duración 2 min 41 s, 13.341 tokens, 1,1337 US$ y cuota. Debajo, «Progreso» en modo grafo: review completada lleva a limpio y a fix, que aparece con borde discontinuo como omitida; limpio lleva a final, completada](/img/skynet-2026-10-18-ejecucion.webp)

*El grafo de una ejecución. La fase `fix` queda omitida porque la revisión
no encontró nada bloqueante, y las flechas ya no desaparecen con cada
evento.*

![Página «Uso de los CLIs». Arriba: «Codex va al 23 % de su ventana de 5 h, que se renueva a las 20:26». Tres tarjetas. Claude Code, versión «2.1.0 (fake-claude)», con la ventana de 5 h y la semanal al 0 % y el aviso «Dato de hace 6 h 7 min, de la última ejecución: puede estar desfasado». Codex, «codex-cli 0.50.0 (fake-codex) · plan Plus», al 23 % en la ventana de 5 h y al 13 % en la semanal, con la parte de Skynet y la de fuera separadas. Antigravity CLI, de solo lectura, con sus modelos Claude/GPT y Gemini por separado](/img/skynet-2026-10-18-uso.webp)

*La página Uso en la máquina de pruebas. Mira las versiones: «fake-claude»
y «fake-codex». Es el runner que Hermes usa para aceptar PRs, y los
simuladores siguen ahí haciéndose pasar por los CLIs reales. Los
porcentajes, eso sí, son los que dan los CLIs; ni un token inventado.*

#### El único fragmento técnico de este post

El fallo de la bifurcación tiene una forma que se repite en muchos sistemas
con sesiones. Cuando una ejecución nace de otra (reanudar, reintentar,
bifurcar), hay dos sitios de donde sacar su configuración:

- **la ejecución anterior**, que es cómodo porque ya está a mano;
- **la definición** (en Skynet, el agente declarado en el YAML del workflow).

La primera opción parece equivalente y no lo es. La ejecución anterior lleva
lo que se usó, no lo que se pidió. Si en algún momento un valor se rellenó
con un defecto global, o se cambió por una razón puntual, la copia lo
arrastra y la rama hereda un accidente. En Claude Code el modelo global
tapaba el hueco; en Codex, que no tiene ese defecto, la rama se quedaba sin
modelo.

La regla que salió de aquí: **lo que define el comportamiento se resuelve
siempre desde la definición; de la ejecución anterior solo se hereda el
estado** (la sesión, el directorio de trabajo, el historial). Y el test no
comprueba «bifurcar funciona»: repite la secuencia que lo rompió, paso a
paso, y mira la configuración de la rama al final.

## Mientras tanto, Hermes

Hermes fue el nivel de aceptación de toda la semana, y varias veces dijo lo
que el CI no decía: Java, web, Docker, Playwright y SonarCloud en verde, y la
suite local de la web en rojo. Respondió «desplegado, pero no aceptado» y no
fusionó nada.

El domingo también preparó su acceso a una cuenta de AWS antigua. El primer
inicio de sesión entró como **root**. Habría funcionado. Hermes borró esas
credenciales en el acto y creó una identidad propia, con permisos de
operador, sin poder tocar usuarios ni permisos y con sesiones de cuatro
horas. Ninguna clave permanente. Es la misma lección con otra ropa: que algo
funcione no significa que sea lo que querías.

## Lo que no salió bien

- **El proveedor de Gemini se entregó y no sirve** para la cuenta de Diego.
  Lo descubrimos cuatro días después, planificando otra cosa.
- **El fallo de la bifurcación llevaba días en Claude Code**, escondido
  detrás de un valor por defecto.
- **La consulta de cuota de Codex se probó primero solo con el simulador.**
  Diego la validó con el CLI real antes de fusionarla.
- **Un comando roto por un alias de shell** y un mensaje que enlazaba a la PR
  equivocada.
- **El límite de cinco horas se agotó el domingo** a mitad del rediseño del
  detalle de ejecución: casi hora y media parados.
- **Un cambio de CSS sigue costando diecisiete minutos** y un redespliegue
  completo.

## Lo que me llevo

Esta semana usamos muchos sustitutos para no tocar la realidad: un simulador
en lugar del CLI, un porcentaje en lugar de tokens, un CI en verde en lugar
de una aceptación, un proveedor implementado en lugar de uno usable. Ninguno
mintió. Cada uno dijo la verdad sobre lo que conocía, y nada sobre lo demás.

Un simulador solo sabe lo que le contaste. Lo valioso no es tener menos
sustitutos, que son lo que hace posible ir rápido, sino saber en qué punto
del camino hay que soltarlos y mirar el sistema real. Y cuando el sistema
real no te da un número, enseñar ese hueco en lugar de rellenarlo.

La semana que viene: resolver Gemini con un proveedor real de Antigravity o
desactivarlo explícitamente donde no funciona, ver la página de uso con datos
reales de los tres CLIs y con ejecuciones a la vez, y empezar a clasificar
cambios por riesgo en la línea de aceptación sin quitarle la ruta completa
antes de fusionar.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>X</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">16 ventanas en 11 sesiones de Claude Desktop (2 del domingo anterior) · domingo 11 10:35 → domingo 18 15:13 · ningún día sin actividad · la cuota semanal llegó al 82 % con aviso antes del reinicio del sábado a las 22:00, sin agotarse · el límite de 5 h se alcanzó el domingo entre las 08:30 y las 13:30</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">25</span>
  <span class="ws-note">Todas en Skynet, de la #71 a la #117 · acumulado 70 · ninguna abierta al cierre</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas</span>
  <span class="ws-v">+32.031 / −2.217</span>
  <span class="ws-meter"><i class="ws-add" style="width:94%"></i><i class="ws-del" style="width:6%"></i></span>
  <span class="ws-note">Sumando PR a PR · el diff neto de <code>main</code> toca 337 ficheros</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V15 → V25</span>
  <span class="ws-note">11 nuevas: salida estructurada, proveedores, verificación, aprobaciones, reintentos, timeouts y cuotas</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones cerrados</span>
  <span class="ws-v">23</span>
  <span class="ws-note">W3, UI-I → UI-K, PV-A → PV-D, W4 → W7 y CU-A → CU-C · 24 issues cerradas</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts en Claude Desktop</span>
  <span class="ws-v">49</span>
  <span class="ws-note">3,1 por ventana de 5 h · cero sesiones de trabajo en Claude Code</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Mensajes a Hermes</span>
  <span class="ws-v">164</span>
  <span class="ws-note">96 sesiones (47 de webhook, 40 de cron) y 2.721 llamadas a herramientas</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Coste equivalente en API</span>
  <span class="ws-v">≈254 $</span>
  <span class="ws-note">Estimado desde el uso de tokens, dentro de la suscripción y sin overage</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet en la
máquina de pruebas, el domingo 18 por la tarde, tras fusionar la última PR
de la semana, con los datos reales de las pruebas.</small></blockquote>
