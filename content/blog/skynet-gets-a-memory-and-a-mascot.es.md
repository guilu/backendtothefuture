---
title: "Skynet estrena memoria y una mascota que te cuenta lo que pasa"
date: "2026-10-25"
description: "Semana del 19 al 25 de octubre. Skynet, nuestro orquestador de agentes, aprendió a recordar lo que hace entre una ejecución y la siguiente y ganó una mascota que te dice en qué está. Por el camino descubrimos que terminar un trabajo no es lo mismo que entregarlo."
tags: ["weekly", "ai-agents", "skynet", "memory", "mcp", "home-assistant", "postgresql", "ci"]
thumb: "/blog/skynet-gets-a-memory-and-a-mascot-thumb.webp"
cover: "/blog/skynet-gets-a-memory-and-a-mascot-cover.webp"
ogImage: "/blog/skynet-gets-a-memory-and-a-mascot-og.jpg"
---

## Lo que nos propusimos

**Skynet** es el orquestador en el que varios agentes de código (Claude
Code, Codex y Antigravity) planifican, implementan, revisan y validan
cambios por su cuenta. El domingo pasado ya sabía lanzarlos, pasarles datos
entre fases y pararse a esperar a una persona. Lo que hacían, sin embargo,
se evaporaba al terminar: un log, un coste y poco más.

La semana empezó cerrando lo que quedaba de la Fase 2: los tres proveedores
reales funcionando de verdad (Gemini CLI se retiró y su sitio lo ocupó
Antigravity) y la última pieza del editor visual, que ya permite crear,
versionar y publicar un workflow desde cero sin tocar YAML.

A partir de ahí, el tema fue **que lo que producen los agentes se quede y
llegue a alguien**:

- que los **archivos** que genera una ejecución (un informe, una imagen) se
  puedan abrir y descargar;
- que Skynet tenga **memoria**: que recuerde lo que se hizo en ejecuciones
  anteriores para que la siguiente no empiece de cero;
- y que la interfaz **diga qué está pasando** sin que tengas que ir a
  mirarlo.

El ciclo fue el de siempre: Claude escribe la PR desde Claude Desktop,
Hermes la despliega en la máquina de pruebas y ejecuta su guía de
aceptación, y Diego decide si se fusiona. Veinticuatro veces.

## Los problemas que nos encontramos

### Un documento que solo era una ruta

Una ejecución generó un informe en Markdown dentro de su espacio de trabajo.
La interfaz enseñaba esto: una ruta. Ni abrirlo ni descargarlo. El trabajo
estaba hecho y, a efectos prácticos, no existía.

La solución tentadora era tratar como resultado cualquier fichero que el
agente hubiera tocado. Habría funcionado en la demo. También habría
convertido cada archivo temporal en un «entregable» y, peor, habría abierto
la puerta a descargar cosas fuera del espacio de trabajo: revisando el
código apareció que la comprobación de artefactos existente seguía enlaces
simbólicos, así que un enlace a un fichero de fuera contaba como «existe».

### El evento que nunca se podía guardar

Probando esos artefactos, un agente se quedó colgado. No había fallado:
Skynet lo marcaba como «sin respuesta» mientras el runner seguía intentando
enviar lo mismo una y otra vez.

El agente había leído un ZIP. La salida binaria traía un byte nulo, el
runner lo metió en un evento y PostgreSQL se negó a guardarlo. El lote
entero volvía con un error, el runner lo reintentaba, y así para siempre.
Un único carácter invisible bloqueaba toda la cola de ese agente.

### Una memoria que el agente no consultaba

Para la memoria, el plan inicial era modesto: notas escritas a mano que se
añaden al prompt. Diego quería otra cosa, que Skynet recordara lo que se
había hecho para poder retomar proyectos y lanzar investigaciones encima de
lo anterior. Eso se parece mucho a **Engram**, la memoria persistente que
usamos en Claude Code. Pero Engram guarda en un SQLite local de cada
máquina, y Skynet puede tener varios runners. Así que no se usó Engram: se
copió su modelo dentro del propio Skynet.

Luego vinieron las sorpresas. Codex rechazaba las herramientas de memoria
porque su política es no ejecutar nada que pida aprobación. Antigravity no
tiene soporte verificado para servidores MCP, así que solo recibe un bloque
inicial. Y en la primera prueba completa con Claude Code, el agente recibió
cinco entradas de memoria en el prompt y no buscó ni leyó ninguna más. La
memoria estaba ahí. Nadie la miró. Hermes marcó la aceptación como
**parcial**, no como «casi».

### El informe que no llegó

La más clara de todas la contó Hermes. Una aceptación de memoria: GitHub
entrega el evento, la cola lo recoge, el agente despliega, trabaja varios
minutos y termina. Todo en verde. Y el mensaje final nunca apareció en
Telegram. Desde fuera, parecía un webhook perdido; por dentro, el trabajo
estaba hecho y el resultado guardado.

En la misma línea, un worker que alcanzó el límite de herramientas dejó la
cola marcada como ocupada sin que hubiera ningún proceso detrás. Y el
domingo, la revisión final de los iconos no se lanzó: GitHub entregó el
evento justo cuando la máquina de pruebas estaba sin memoria, recibió un
500 y no volvió a intentarlo.

### Las fuentes que no eran nuestras

Para la nueva tipografía, Diego pasó unos ficheros de fuente. Al abrirlos,
eran **Duolingo Sans**, con una licencia que prohíbe usarlas fuera de
Duolingo, y el repositorio de Skynet es público. Funcionaban
perfectamente; no se podían usar.

## Cómo lo resolvimos

Los artefactos se resolvieron con un **contrato**: una fase declara qué
archivos produce, y Skynet captura solo esos. Nada de «lo que haya
cambiado». La captura comprueba que la ruta está dentro del espacio de
trabajo, rechaza los enlaces que salen de él, y la web los enseña junto a la
fase que los generó, documentos Markdown e imágenes incluidos. Al cargar
las imágenes desde el propio endpoint de descarga ni siquiera hizo falta
tocar la política de seguridad de contenidos.

El byte nulo se arregló en los dos extremos (más abajo, el único fragmento
técnico del post).

La memoria quedó con procedencia y permisos: quién escribió cada entrada,
versiones, fijado, edición y archivo. Los agentes la consultan y la
escriben con herramientas MCP explícitas; a Codex se le aprueban solo las
del servidor de memoria, nada más. Cada fase declara si la memoria está
apagada, es de solo lectura o puede escribir, y al terminar cada ejecución
Skynet deja una entrada de **bitácora** con estado, rama, cambios y coste.
El workflow de investigar mejoras pasó a pedir explícitamente que se busque
en la memoria, y en la segunda prueba el agente sí lo hizo.

![Pestaña Memoria del proyecto Demo Repo. Arriba, en Fijadas, una restricción «No tocar el README»: «El README lo mantiene una persona: no lo cambies», escrita por una persona. Debajo, agrupadas por fecha, entradas de tipo Bitácora escritas por Skynet: «Ejecución investigar-mejoras v1 de DEMO-1: terminada bien», con workflow, estado, fases, rama y coste de 0,41 y 0,32 USD, y otra de probar-memoria con fases investigar y aplicar](/img/skynet-2026-10-25-memoria.webp)

*La memoria de un proyecto. Arriba, lo que escribe una persona y queda
fijado; debajo, la bitácora que Skynet deja sola al terminar cada
ejecución.*

![Detalle de la ejecución DEMO-1 «Aceptación AG-A archivos declarados», completada en 49 s por 0,4103 US$ con Claude Code y claude-opus-5-5. A la izquierda, la conversación: el prompt pide empezar por la memoria del proyecto con mem_search y mem_get, y debajo se ven las llamadas ToolSearch, Bash, mcp__skynet_memoria__mem_context y mcp__skynet_memoria__mem_search, todas hechas. A la derecha, la respuesta final: «He revisado la memoria del proyecto: el contexto inicial, mem_context, mem_search… Solo hay una restricción fijada, “No tocar el README”»](/img/skynet-2026-10-25-ejecucion.webp)

*La segunda prueba. Esta vez el agente sí abre la memoria con sus
herramientas, encuentra la restricción fijada y la respeta.*

Para que las pruebas con agentes reales fueran baratas, Hermes creó
`demo-repo`: un proyecto Python minúsculo, con un analizador de texto y
tres tests. Una aceptación completa de memoria costó unos 0,41 dólares. Si
se hubiera hecho contra el propio Skynet, habría sido mucho más lenta y
cara para comprobar lo mismo.

Para el último tramo hacia las personas, la respuesta de esta semana fue la
**mascota**. Un companion que vive en todas las páginas y dice si Skynet
espera, trabaja, necesita una aprobación, ha fallado o ha terminado, también
fuera de la pestaña: en el título, en el favicon y con notificaciones del
navegador. La primera versión era un nigiri del boceto de Diego y no
encajaba con la estética; la definitiva sale del logo. Y al construirla
apareció otro hueco: una conexión nueva a los eventos en vivo recibía el
histórico completo desde el principio. Ahora pide solo lo que viene.

![Dashboard de Skynet. Arriba, «Buenas tardes, admin, 0 agentes trabajando. Todo en orden» y la mascota, un triángulo con tres esferas y una cara, con el bocadillo «Todo al día». Debajo, un panel con la mascota y «Hola, soy Skynet. No hay nada en marcha: ¿lanzamos algo?», con botones para lanzar un workflow y ver las ejecuciones. Más abajo, el resumen de los últimos 7 días: 14 ejecuciones, 13 completadas, 1 fallida, 1,529 US$ de coste y 35 s de duración mediana](/img/skynet-2026-10-25-companion.webp)

*El dashboard con el companion y la tipografía nueva. Lo que antes había
que ir a buscar en la lista de ejecuciones ahora te lo dice él.*

Las fuentes de Duolingo se descartaron y se eligió la alternativa libre más
parecida, **Barlow**, con JetBrains Mono para el código.

Lo del informe que no llegó, en cambio, **no está resuelto**. Hermes
reconstruyó el recorrido con las entregas de GitHub, la cola y las sesiones,
y recuperó el informe a mano. Lo que hace falta es un *outbox* duradero:
guardar el resultado, el destino y el estado del envío, y reintentar
después de un reinicio. Está en la lista de la semana que viene.

#### El único fragmento técnico de este post

El byte nulo es un caso de manual de **mensaje envenenado**, y la forma en
que bloqueó la cola se repite en cualquier sistema con eventos.

PostgreSQL no admite el carácter `\u0000` dentro de un `jsonb`, ni siquiera
escapado. Si el productor manda un lote de eventos y uno lo lleva, el lote
entero falla. Si la política del productor es «reintenta hasta que
funcione», no funcionará nunca, y todo lo que venga detrás queda atascado.

El arreglo tiene tres partes, y las tres hacen falta:

- **sanear en origen**: el runner limpia los caracteres que la base no
  acepta antes de enviar;
- **sanear en destino**: el control plane no confía en que el runner lo
  haya hecho, porque mañana habrá otro runner o otra versión;
- **aislar el fallo**: si un lote falla, se reenvía evento a evento, y el
  que no se puede guardar se marca como inválido y se aparta, en lugar de
  reintentarse sin fin.

La tercera es la que más se olvida. Las dos primeras arreglan este byte; la
tercera arregla el siguiente que no hemos imaginado. Los ocho tests que
reproducían el bloqueo se escribieron primero y fallaron antes del arreglo.

## Mientras tanto, Hermes

Además de aceptar cada PR, Hermes tuvo una semana de operador. La revisión
de código con proveedores reales se convirtió en una frontera de seguridad:
un agente revisor tiene herramientas, y nada impedía que alguna escribiera
donde no debía. De ahí salieron cuatro entregas para endurecer rutas, Git,
secretos, entradas y despliegue. El principio: un revisor inspecciona y
explica, pero no adquiere permisos por accidente.

Fuera de Skynet, recuperó la integración entre Alexa y Home Assistant (el
enlace de cuentas apuntaba a una URL antigua), arrancó el rack doméstico en
el orden correcto tras un corte de luz (primero el NAS, luego las Raspberry
que dependen de él) y diagnosticó un reinicio de la máquina de pruebas:
abrir VS Code en remoto con Java y Gradle agotó sus 8 GiB de RAM y toda la
swap comprimida. La decisión fue no usarla como máquina de desarrollo.
Después del reinicio, Akademia no volvió sola porque sus contenedores no
tenían política de reinicio. Ahora la tienen.

## Lo que no salió bien

- **El informe que no llegó a Telegram** sigue sin una solución duradera.
- **Un worker dejó la cola ocupada sin proceso**, otra vez.
- **La revisión de los iconos se perdió** por un 500 del webhook durante el
  bloqueo de memoria de la máquina de pruebas.
- **La primera prueba de memoria fue parcial**: el agente no consultó la
  memoria y un secreto no quedaba marcado.
- **Las fuentes no se podían usar** por licencia.
- **Tests intermitentes** por todas partes: bloqueos de PostgreSQL al
  cancelar dos agentes a la vez, una carrera de git al crear worktrees y
  Maven Central limitando descargas cuatro veces.
- **El límite de cinco horas se agotó el domingo** a mitad de los iconos,
  que siguen en una PR abierta.

## Lo que me llevo

Esta semana Skynet aprendió a producir cosas que se quedan: archivos,
memoria, una bitácora, una mascota que avisa. Y casi todos los problemas
vinieron del mismo sitio, el último tramo. Un documento que existe pero
solo es una ruta. Una memoria que está en el prompt y nadie consulta. Un
evento que se genera y nunca se guarda. Un informe que se termina y no se
envía.

«El agente terminó» es un estado del sistema. «Alguien lo recibió» es otro,
y no se deriva del primero. Hay que construirlo aparte, con su contrato
(qué se entrega), su persistencia (qué pasa si se cae a mitad) y su
evidencia (cómo sé que llegó).

La semana que viene: el *outbox* duradero para los informes, un cierre del
worker que no dependa de que el agente llegue a su última llamada, y los
iconos que faltan.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>X</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">18 ventanas en 15 sesiones de Claude Desktop (1 del domingo anterior) · domingo 18 18:14 → domingo 25 12:54 · ningún día sin actividad · la cuota semanal llegó al 81 % con aviso antes del reinicio del sábado a las 22:00, sin agotarse · el límite de 5 h se alcanzó el domingo entre las 09:20 y las 14:20</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">24</span>
  <span class="ws-note">Todas en Skynet, de la #121 a la #173 · acumulado 94 · 1 abierta al cierre (iconos)</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas</span>
  <span class="ws-v">+26.009 / −2.735</span>
  <span class="ws-meter"><i class="ws-add" style="width:90%"></i><i class="ws-del" style="width:10%"></i></span>
  <span class="ws-note">Sumando PR a PR · el diff neto de <code>main</code> toca 348 ficheros</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V26 → V29</span>
  <span class="ws-note">4 nuevas: ejecución simulada, memoria, token de memoria y memoria de agente</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones cerrados</span>
  <span class="ws-v">23</span>
  <span class="ws-note">AR, W8, AL, RV, AG, ME, CI, CO, TI y SG · 27 issues cerradas · Fase 2 terminada</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts en Claude Desktop</span>
  <span class="ws-v">71</span>
  <span class="ws-note">3,9 por ventana de 5 h · cero sesiones de trabajo en Claude Code</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Mensajes a Hermes</span>
  <span class="ws-v">88</span>
  <span class="ws-note">8 sesiones principales, 524 llamadas a herramientas y 706 a la API</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Coste equivalente en API</span>
  <span class="ws-v">≈279 $</span>
  <span class="ws-note">Estimado desde el uso de tokens, dentro de la suscripción y sin overage</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet en la
máquina de pruebas, el domingo 25 a mediodía, con los datos reales de las
aceptaciones sobre <code>demo-repo</code>. La pestaña de artefactos no
aparece porque ninguna de las ejecuciones conservadas declaraba archivos de
salida.</small></blockquote>
