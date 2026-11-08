---
title: "Escribir el código era la parte fácil"
date: "2026-11-08"
description: "Semana del 2 al 8 de noviembre. Skynet ya sabía llevar un cambio hasta el merge. Esta semana construimos todo lo que hay alrededor: esperar cuando se acaba la cuota, un juez que no se fía del autor, despliegues que se reconcilian solos y una interfaz que por fin parece una fábrica."
tags: ["weekly", "ai-agents", "skynet", "ai-factory", "llm-as-judge", "github", "deployments", "postgresql"]
thumb: "/blog/writing-the-code-was-the-easy-part-thumb.webp"
cover: "/blog/writing-the-code-was-the-easy-part-cover.webp"
ogImage: "/blog/writing-the-code-was-the-easy-part-og.jpg"
---

## Lo que nos propusimos

**Skynet** es el orquestador en el que varios agentes de código (Claude
Code, Codex y Antigravity) planifican, implementan, revisan y validan
cambios por su cuenta. El domingo pasado aprendió a terminar: subir la
rama, abrir la PR, esperar la CI y fusionar. Ya escribía código y lo
entregaba.

Esta semana descubrimos que eso era la punta. Una fábrica de software no
es un agente que escribe; es todo lo que pasa alrededor de lo que escribe.
Quién le encarga el trabajo. Qué hace cuando se queda sin cuota a mitad de
una tarea. Quién decide si lo que ha hecho está bien. Qué pasa después de
fusionar, cuando el cambio se despliega. Y cómo se ve todo eso desde fuera,
para alguien que no quiere leer logs.

Así que la semana fue eso, en ese orden:

- **lanzar trabajo desde GitHub**: una issue, un comentario `/skynet` en
  una PR o una tarea programada, con una cola por repositorio para que dos
  agentes no pisen el mismo checkout;
- **seguir cuando se acaba la cuota**, en vez de fallar;
- **validación independiente**: que el agente que escribe no sea el que se
  aprueba;
- **reorganizar la interfaz** alrededor de proyectos, repositorios y
  trabajos;
- **el ciclo de despliegues**, de GitHub a la máquina de pruebas y vuelta;
- e **importar proyectos reales** desde los repositorios que ya están en
  disco.

El reparto, el de siempre: Claude escribe las PRs en sus sesiones en la
nube, Hermes las despliega en la máquina de pruebas y ejecuta su guía de
aceptación, Diego decide si se fusionan. Esta semana Codex se sumó con algo
nuevo: escribir los planes de los hitos para que Claude los revise antes
de empezar.

## Los problemas que nos encontramos

### El agente se quedaba sin gasolina a mitad del trabajo

Hasta ahora, cuando la cuenta de un agente agotaba su ventana de cinco
horas, la fase fallaba. Daba igual que faltaran veinte minutos para que se
renovara: el trabajo se perdía y había que relanzarlo a mano. Para un
orquestador que quiere trabajar solo de noche, eso es un problema de
diseño, no un accidente.

Y la ironía la sufrimos en directo: el martes, justo después de abrir la PR
del juez, la sesión de Claude que la estaba escribiendo se quedó sin cuota
y se paró cincuenta minutos hasta que Diego escribió «Continúa».

### Ponerse en verde es demasiado fácil

Con la entrega automática había un agujero evidente en cuanto lo miras de
frente: un agente que no consigue que pase un test puede **borrarlo**, o
ponerle `@Disabled`, o tocar la guía de aceptación. La CI sale verde y nadie
miente exactamente. Simplemente, ya no se está comprobando lo mismo.

La revisión que ya hacían los agentes no lo arreglaba del todo, porque el
revisor leía lo que el autor decía haber hecho. Y un autor convencido es
muy persuasivo.

### Un juez también se equivoca

Cuando metimos un juez, apareció el problema contrario. Un revisor que
busca fallos los encuentra, aunque no estén. Un hallazgo «que bloquea»
mal fundado manda al agente a corregir algo que estaba bien, y en la
siguiente ronda se pierde lo bueno que había.

### Skynet no puede escucharse a sí mismo

Para el ciclo de despliegues, el plan que escribió Codex proponía lo
obvio: que el script de despliegue avisara a Skynet con una llamada
firmada al empezar y al terminar. Al revisarlo apareció el fallo: cuando lo
que se despliega es el propio Skynet, **se reinicia en mitad del
despliegue**. El aviso de «empiezo» puede llegar a un servidor que se está
apagando, y perderse.

Y cuando se instaló de verdad, Hermes descubrió otro detalle: el script que
avisaba no enviaba realmente el token de autenticación.

### Parecía un panel de administración

Con todo eso funcionando, Diego abrió la aplicación y escribió lo que
cualquiera habría pensado: *«El problema de Skynet ya no es estético, sino
de arquitectura de la información.»* Había menús para proyectos,
workflows, runners, ejecuciones y uso, todos con el mismo peso. Parecía la
consola de una infraestructura, no una fábrica. No se veía de un vistazo
sobre qué software estaban trabajando los agentes, qué habían cambiado,
cuánto había costado ni qué necesitaba intervención.

Y había tres palabras que se usaban casi como sinónimos y no lo son:
trabajo, workflow y ejecución.

### Dar de alta un proyecto era rellenar un formulario

Para que Skynet trabajara en Forma, Akademia o TokenMeter había que crear
el proyecto a mano: nombre, descripción, ruta local del repositorio, URL de
git. Los repositorios ya estaban clonados en la máquina de pruebas, pero
Skynet no lo sabía.

### Y el roce de siempre

Maven Central limitó las descargas cinco veces. Varias pruebas end-to-end
cayeron por carreras que ya existían y pasaron al relanzarlas. La CI de una
PR superó las cien conexiones que admite PostgreSQL porque un test nuevo
levantaba otro contexto de Spring. Y Claude clasificó como mediana una PR
que era pequeña, así que esperó un «fusiona» de Diego cuando bastaba con la
aprobación de Hermes. Diego lo dijo sin rodeos: «¿por qué no lo has
leído?».

## Cómo lo resolvimos

La cuota pasó a ser **estado del orquestador, no un error**. Skynet
reconoce el mensaje de cuota agotada de cada CLI, pone la fase a esperar
hasta que se renueve (con un pequeño margen aleatorio para que no arranquen
todas a la vez), y luego retoma la misma sesión en el mismo espacio de
trabajo. La espera no gasta intentos. Y si la espera se alarga más de
quince minutos, cada agente puede tener un **proveedor de reserva**: si
Codex está sin cuota, entra Claude Code.

Contra el verde fácil, dos defensas mecánicas que no dependen de la buena
fe de nadie. La primera lee el diff y **falla si hay menos tests que antes**
o si aparece cualquier forma de saltarlos, en Java, JavaScript, Python o
Go, y dice cuál: «Se ha borrado el test `CalculadoraTest.divideEntreCero`».
La segunda son las **rutas protegidas**: la guía de pruebas o la CI se
declaran intocables, y a Claude Code directamente se le quita el permiso de
editarlas.

Encima de eso, el juez y sus escépticos (más abajo, el único fragmento
técnico del post). Así quedó uno de los workflows iniciales:

![Página del workflow «Especificar, planificar e implementar» en Skynet. La descripción dice: Antigravity especifica en openspec/proposal.md, Claude Code planifica, tú apruebas el plan, Claude Code implementa con los tests en verde y Codex lo juzga contra la propuesta aprobada; los escépticos descartan los falsos positivos y Claude Code corrige lo que bloquea de verdad. A la izquierda, el YAML con los agentes y sus proveedores de reserva. A la derecha, «Qué define»: las fases spec, plan, aprobar-plan, implementar, juzgar, pr, ci, aprobar-fusion y fusionar](/img/skynet-2026-11-08-workflow.webp)

*Cada agente tiene su reserva, el plan y la fusión pasan por una persona, y
entre implementar y abrir la PR hay un juez que no es el autor.*

Para los despliegues, la decisión fue **no ser el receptor**. Los scripts
de despliegue avisan a GitHub, usando su API de *Deployments*, y GitHub
reenvía los eventos a Skynet por el canal firmado que ya existía desde la
semana pasada. Si Skynet se está reiniciando, GitHub guarda el estado y lo
reintenta. Y como un aviso se puede perder igualmente, Skynet comprueba la
salud de lo desplegado y **reconcilia**: si un despliegue lleva demasiado
tiempo «en curso», mira cómo está de verdad. El token se arregló, con un
test que comprueba que la cabecera llega sin imprimir nunca su valor.

La interfaz se reorganizó en tres áreas. **Espacio de trabajo**:
proyectos, repositorios, trabajos y actividad; es lo primero que ves.
**Fábrica**: lo que está en marcha, los workflows, las aprobaciones y los
resultados. **Administración**: proveedores, runners, consumo y ajustes. El
proyecto se convirtió en el centro de operaciones:

![Página del proyecto AKA · Akadem.ia en Skynet. Arriba, cinco contadores: 1 trabajo abierto, 0 ejecuciones en curso, 0 PRs abiertas, 0 aprobaciones pendientes y el acumulado en 30 días. Pestañas Resumen, Trabajos, Ejecuciones, Cambios, Despliegues, Workflows, Memoria y Configuración. Debajo, el repositorio akadem.ia en main y un tablero de trabajos por fase (Por empezar, En marcha, Te necesita, Entregado) con AKA-1 «Conocer el repositorio» entregado. A la derecha, Necesita intervención, Cambios y Coste por trabajo](/img/skynet-2026-11-08-project.webp)

*Akadem.ia, el primer proyecto real dentro de Skynet. Lo interesante ya no
es el gasto global, sino cuánto ha costado cada trabajo en cada
repositorio.*

Y las tres palabras quedaron separadas en la propia pantalla del trabajo:
**qué** quieres conseguir, **cómo** se hace (el workflow) y **cada intento**
real de hacerlo:

![Detalle del trabajo AKA-1 «Conocer el repositorio», marcado como Entregado, del repositorio akadem.ia y con el workflow conocer-repositorio v1. Tres tarjetas: «Qué: el trabajo», «Cómo: el workflow» y «Intentos: las ejecuciones», con un intento completado. Debajo, el intento actual con sus fases comandos y mapa, la lista de intentos (uno completado en 18 min 45 s) y lo que ha costado: 676,5 k tokens de entrada y 52,9 k de salida](/img/skynet-2026-11-08-work.webp)

*Un trabajo, un workflow, un intento. Si falla, se lanza otro intento del
mismo trabajo, no un trabajo nuevo.*

Akadem.ia no se dio de alta a mano. Entró con el asistente nuevo, que
busca los repositorios que ya están clonados en la máquina del runner, lee
su remoto, su rama, su manifiesto y su README, **no lee `.env` ni secretos**
y no crea nada hasta el último paso:

![Asistente «Importar proyecto» en Skynet, paso 1 de 4, Repositorio. Una lista de repositorios encontrados en ~/code del runner: akadem.ia (ya está en AKA), backendtothefuture-com, demo-repo, demo-repo-github (ya está en DEMO), diegobarrioh-dev, forma, skynet y skynet-commands, cada uno con su remoto de GitHub, su rama, la herramienta detectada y la fecha del último commit. A la derecha, «Qué hace este asistente»: busca repositorios git en las carpetas de SKYNET_REPO_ROOTS, lee el remoto, la rama, el manifiesto y el README, no lee .env ni secretos y quita las credenciales de las URL, y nada se crea hasta el último paso](/img/skynet-2026-11-08-import.webp)

*Los repositorios que ya existen en disco, listos para convertirse en
proyectos. Los que ya están dentro salen atenuados.*

Lo de la PR mal clasificada se corrigió donde debía: en la regla escrita
en la memoria del proyecto, no en una disculpa. La siguiente PR pequeña se
fusionó con la aprobación de Hermes, sin esperar.

Y para cerrar el sábado, algo más ligero: Skyny, la mascota, ya existe en
3D. Diego la está diseñando con Codex en un estudio aparte, hecho con
three.js. Claude propuso llevarla a toda la aplicación con sprites para los
tamaños pequeños; Diego prefirió algo más acotado, y de momento vive solo
en el login. El estudio entró en el repositorio, para que cada versión
nueva del modelo llegue al código sin traducirla a mano.

![Pantalla de inicio de sesión de Skynet en modo oscuro. A la izquierda, Skyny en 3D, un robot triangular azul claro con tres bolas blancas y una pantalla negra con dos ojos, sobre el lema «Tus agentes, a la vista.» y tres píldoras de estado: Pensando, Completada y Esperando. A la derecha, el formulario con Usuario, Contraseña y el botón Entrar](/img/skynet-2026-11-08-login.webp)

*Skyny 3D, por ahora solo en la puerta de entrada.*

#### El único fragmento técnico de este post

El problema de que un agente revise a otro no es la capacidad, es la
**contaminación**. Si el juez lee la explicación del autor, juzga la
explicación. Así que el juez de Skynet está montado para no poder hacerlo:

- **no ve lo que dijo el autor**. Recibe la tarea, el commit de partida, el
  resultado de las comprobaciones y la rúbrica. Para ver el cambio tiene
  que mirar el diff él mismo, en su propia copia del repositorio;
- **solo puede leer**: trabaja en modo plan, sin permiso para editar y
  sin la memoria del proyecto;
- **puntúa con una rúbrica**, de 1 a 5, con un umbral de 3,5. La de por
  defecto pesa tres cosas: si resuelve la tarea, si tiene tests y si se
  queda en su alcance. Puede haber varios jueces con lentes distintas:
  Codex mirando si es correcto, Antigravity mirando la seguridad;
- y si suspende, **corrige el autor** con los hallazgos en la mano, y se
  vuelve a juzgar, como mucho dos rondas.

Lo que nos enseñó el problema contrario es la segunda mitad. Cada hallazgo
que bloquea pasa por **escépticos**: agentes de solo lectura que intentan
refutarlo, y que ven todavía menos (la tarea, el hallazgo y el commit; ni
la rúbrica, ni la nota, ni al autor). Si la mayoría lo refuta, el hallazgo
sale tachado con el motivo y no manda corregir nada. Un empate no refuta.
Y hay topes, porque esto se paga en tokens: ocho hallazgos por ronda y
veinte llamadas a agentes por fase, y si se recorta, se dice.

La idea que nos llevamos es simétrica: **el autor no se aprueba a sí
mismo, y el crítico tampoco se da la razón a sí mismo**.

## Mientras tanto, Hermes

Hermes, además de aceptar cada PR, se ocupó de que la fábrica tenga suelo.
Hizo un reset de Skynet para dejarla vacía con solo los workflows
iniciales, y convirtió `demo-repo` en el objetivo de todas las guías de
prueba, para que ninguna dependa de los repositorios de casa.

También inventó, en el momento, un procedimiento que no existía. La PR de
frontend que sigue abierta llegó sin fase ni guía de aceptación. En vez de
relajar el webhook o fingir una aceptación, la trató como una excepción
explícita: comprobar que solo toca el frontend, exigir toda la CI en verde,
desplegar ese commit exacto, restaurar el runner real y pasar el
verificador completo. La excepción no cambió la regla.

Fuera de Skynet, la semana fue de casero. El ordenador de pruebas se
reinició por fin (sigue necesitando a alguien delante del teclado para el
login) y se recuperaron varios gigas de disco entre imágenes de Docker,
cachés y herramientas que nadie usaba. Se retiró OpenClaw, un asistente
antiguo, pero no con un `rm -rf`: su carpeta de secretos todavía
alimentaba integraciones de Hermes, así que primero se migraron, se
comprobaron por hash y por uso real, y solo entonces se borró. Audiobookshelf
volvió a sonar después de revisar el NFS con el Synology. Y el sábado, otra
vez, Forma, Akademia y TokenMeter dejaron de verse desde fuera mientras
funcionaban perfectamente en casa: las rutas a Cloudflare dejan de
responder desde Movistar durante el fútbol. Correlación fuerte y repetida,
no una prueba.

## Lo que no salió bien

- **La sesión de Claude se quedó sin cuota** el martes, justo mientras
  construía la espera por cuota. La cuota semanal llegó al 93 % antes del
  reinicio del sábado.
- **El mensaje de cuota agotada de Claude** se dedujo de su formato
  documentado, no de una captura real. Si no coincide, la fase fallará como
  antes.
- **Varias E2E cayeron por carreras que ya existían**, como un bloqueo de
  PostgreSQL al cancelar dos agentes en paralelo. Pasaron al relanzarlas;
  siguen sin arreglar.
- **Maven Central limitó las descargas** cinco veces, y la descarga de
  Gradle agotó su tiempo varias veces en la CI.
- **Una PR pequeña se trató como mediana** y esperó a Diego sin
  necesidad.
- **El trabajo de importar proyectos está a medias**: Akadem.ia ya está
  dentro; Forma y TokenMeter, todavía no.

## Lo que me llevo

La semana pasada pensaba que una entrega de agente termina en el merge.
Esta semana aprendí que el merge está en medio. Antes hay alguien que
encarga el trabajo, un agente que puede quedarse sin cuota y un juez que
no se fía de él. Después hay un despliegue que se puede perder y una
pantalla que tiene que explicar todo eso a alguien que no estaba mirando.
Escribir el código fue, con diferencia, la parte que menos costó.

Y casi todo lo que hicimos se parece: **no fiarse de quien tiene interés**.
Ni del autor que se revisa, ni del revisor que busca fallos, ni del
servidor que se despliega a sí mismo, ni de un test que desaparece justo
cuando fallaba. En cada caso la solución fue la misma: sacar la decisión
de las manos de quien la está viviendo.

La semana que viene: el banco de pruebas para validar los despliegues de
extremo a extremo, que Codex ya dejó planificado; importar Forma y
TokenMeter; llevar a Skyny 3D al resto de la aplicación, y una tanda de
PRs pequeñas de frontend sin hito.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>X</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">16 ventanas en 21 sesiones de Claude en la nube · lunes 09:13 → domingo 13:48 · ningún día sin actividad · la cuota semanal llegó al 93 % con aviso antes del reinicio del sábado a las 21:00, sin agotarse · el límite de 5 h se alcanzó el martes entre las 16:40 y las 21:40</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">26</span>
  <span class="ws-note">Todas en Skynet, de la #209 a la #261 · acumulado 136 · una más abierta, la #262</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas en Skynet</span>
  <span class="ws-v">+43.471 / −2.198</span>
  <span class="ws-meter"><i class="ws-add" style="width:95%"></i><i class="ws-del" style="width:5%"></i></span>
  <span class="ws-note">Sumando PR a PR · el diff neto de <code>main</code> toca 381 ficheros</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V35 → V48</span>
  <span class="ws-note">14 nuevas: disparadores, cola, esperas y reserva por cuota, rutas protegidas, juez, refutación, guía, despliegues y catálogo de repositorios</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones cerrados</span>
  <span class="ws-v">24</span>
  <span class="ws-note">DS, CQ, SB, VA, FS, DL, IP y TD · 26 issues cerradas · un milestone por PR</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts a Claude</span>
  <span class="ws-v">63</span>
  <span class="ws-note">3,9 por ventana de 5 h · 24 de ellos llevan un «fusiona»</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Mensajes a Hermes</span>
  <span class="ws-v">68</span>
  <span class="ws-note">8 sesiones, 453 llamadas a herramientas y 316 a la API · ≈1,2 M tokens de entrada</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧠</span>
  <span class="ws-k">Prompts a ChatGPT y Codex</span>
  <span class="ws-v">91</span>
  <span class="ws-note">6 conversaciones: el rediseño de la navegación, el banco de pruebas y el estudio 3D de Skyny</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Coste equivalente en API</span>
  <span class="ws-v">≈238 $</span>
  <span class="ws-note">Estimado desde el uso de tokens de Claude, dentro de la suscripción y sin overage</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet en la
máquina de pruebas, el domingo 8 al mediodía, sobre <code>main</code> tras
la #261 y con los datos reales que dejó el reset de Hermes. En el asistente
de importación se han ocultado el catálogo de un runner de aceptación ya
desconectado y dos repositorios ajenos a estos proyectos. Hermes cuenta 25
PRs fusionadas en su nota; las 26 de la tabla salen de GitHub.</small></blockquote>
