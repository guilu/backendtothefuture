---
title: "Skynet se está convirtiendo en una AI Factory"
date: "2026-11-01"
description: "Semana del 26 de octubre al 1 de noviembre. Skynet, nuestro orquestador de agentes, dio el primer paso para convertirse en una AI Factory. Aprendió a llevar un cambio hasta el final: subir la rama, abrir la PR, esperar la CI, arreglarla y fusionar. Por el camino descubrimos cuántas pruebas pasaban gracias a lo que había dejado la anterior."
tags: ["weekly", "ai-agents", "skynet", "ai-factory", "github", "ci", "outbox", "telegram", "postgresql"]
thumb: "/blog/skynet-is-becoming-an-ai-factory-thumb.webp"
cover: "/blog/skynet-is-becoming-an-ai-factory-cover.webp"
ogImage: "/blog/skynet-is-becoming-an-ai-factory-og.jpg"
---

## Lo que nos propusimos

**Skynet** es el orquestador en el que varios agentes de código (Claude
Code, Codex y Antigravity) planifican, implementan, revisan y validan
cambios por su cuenta. El domingo pasado ya recordaba lo que hacía y tenía
una mascota que te contaba en qué estaba. Pero su trabajo terminaba en un
sitio raro: una rama en una carpeta de la máquina de pruebas. Para que ese
cambio llegara a algún lado, alguien tenía que subirlo, abrir la PR, mirar
la CI y fusionar.

El martes, Diego pidió una investigación a fondo sobre lo que se está
llamando **AI Factories**: flujos de agentes auditables y repetibles que
sacan funcionalidades de principio a fin, con aprobaciones humanas donde
importan. Citó un sistema de Stripe llamado *Orbit* como referencia. La
investigación no lo encontró: con ese nombre no existe, y lo que sí
existe son los *Minions* de Stripe. Corregida la premisa, salió una hoja de
ruta de catorce hitos en cinco etapas. El jueves por la noche se aprobó y
se eligió por dónde empezar:

- que Skynet tenga **identidad propia en GitHub**, sin tokens personales;
- que sepa **entregar**: subir la rama, abrir la PR, esperar la CI,
  corregirla si falla y fusionar cuando el gate lo permita;
- y, en paralelo, que Diego pueda **darle órdenes desde el móvil**,
  hablando con ChatGPT, a través de una issue de GitHub.

Antes de eso, la semana empezó cerrando lo visual: un generador de capturas
de toda la app, la versión 3 de **Skyny** (la mascota ya tiene nombre),
el icono nuevo y los logotipos de cada proveedor en la pantalla de uso.

El ciclo fue el de siempre: Claude escribe la PR en sus sesiones en la
nube, Hermes la despliega en la máquina de pruebas y ejecuta su guía de
aceptación, y Diego decide si se fusiona. Con una novedad: las PRs pequeñas
con todo en verde que Hermes pide fusionar ya no esperan a Diego.

## Los problemas que nos encontramos

### Una prueba que pasaba por casualidad

La primera fase de entrega, subir la rama y abrir la PR, falló en la
aceptación de Hermes. La guía comprobaba que el agente había escrito
`a + b` en un `calc.py`, y no estaba. El código de Skynet no tenía nada
mal: el espacio de trabajo que usaba la prueba era el que había quedado de
una ejecución anterior, y esa vez no traía el cambio esperado.

Es decir, las pruebas anteriores habían pasado **porque alguien había
dejado el terreno preparado**. Y no era la única suposición de ese tipo.
Los planes de las dos fases siguientes hablaban de `guilu/demo-repo` en
GitHub para la prueba real. A mitad de camino Diego preguntó lo obvio:
«¿Pero existe el repo guilu/demo-repo?». No existía. Solo había un
`demo-repo` local en la máquina de pruebas.

### Los runners que fingían estar bien

Las aceptaciones levantan a veces runners simulados, para no gastar cuota
de los agentes reales. Hermes detectó que alguno sobrevivía a la prueba. La
instalación parecía sana, el panel decía «1 runner en línea», y detrás no
había ni Claude Code, ni Codex, ni Antigravity de verdad. La siguiente
ejecución real se habría topado con un actor.

### La CI que cambió de sistema operativo sin avisar

A mitad del hito de GitHub, las pruebas end-to-end se pusieron en rojo en
una PR y también en `main`, que no había cambiado. GitHub había movido
sus runners a Ubuntu 26.04, y Playwright todavía no lo soporta. Nada en
nuestro código estaba roto.

En la última fase llegó otro rojo que no era nuestro: un bloqueo mutuo en
la base de datos entre la limpieza que hacen los tests de Java al
terminar y el latido del runner, que escribe la cuota cada pocos segundos.

### Una orden que no se podía repetir

Mientras tanto, con ChatGPT, Diego montó el canal para lanzar trabajo desde
el móvil: un repositorio privado, `skynet-commands`, donde una issue con la
etiqueta `skynet:run` dispara un webhook que llega a Hermes, y Hermes lanza
el workflow en Skynet. La primera orden funcionó. La segunda la rechazó el
puente: el cuerpo de la issue traía texto fuera del bloque JSON que define
la orden. Se corrigió el texto… y no pasó nada. Editar una issue no vuelve
a disparar el evento de creación.

### Avisar no puede ser parte del trabajo

El último requisito era recibir en Telegram la llegada de la orden y su
resultado. La primera versión enviaba el mensaje dentro de la propia
petición del webhook. Funcionaba, pero cada aviso alargaba la respuesta, y
si Telegram fallaba, el puente fallaba con él. Es el mismo problema que la
semana pasada dejó sin resolver: el informe que no llegó.

## Cómo lo resolvimos

La identidad llegó en tres entregas. Skynet tiene ahora una **GitHub App**,
`skynet-guilu`, con tokens de instalación que duran una hora y solo valen
para los repositorios y permisos concedidos. Los eventos de GitHub entran
firmados: una firma inválida recibe un 401, una entrega repetida se
reconoce por su identificador y no se procesa dos veces, y el endpoint solo
escucha en la red privada.

![Pestaña GitHub de Ajustes en Skynet. Arriba, la tarjeta GitHub App con la app skynet-guilu de guilu, su Id, la API https://api.github.com y la última comprobación el 1/11/26 a las 9:44, marcada como Conectada. Debajo, Repositorios de Skynet: demo-repo en los proyectos DEMO y tres ENB de aceptación, forma-repo en FOR y skynet-repo en SKY, todos con acceso «No es de GitHub». Al pie, Últimas entregas: un check_suite.completed de guilu/skynet recibido el 31/10/26 a las 21:47 y marcado como Ignorada porque ningún repositorio de Skynet es guilu/skynet](/img/skynet-2026-11-01-github.webp)

*La App, conectada. Y la verdad incómoda debajo: todos los proyectos de
Skynet siguen apuntando a repositorios locales, así que los eventos de su
propio repo en GitHub se reciben, se verifican y se ignoran.*

La entrega se partió en tres fases que se apoyan unas en otras: **subir y
abrir la PR**, **esperar la CI y corregirla** (el agente ya no da por
terminada su tarea al hacer push; lee los checks, interpreta el fallo y
vuelve a trabajar) y **fusionar solo después del gate**. Y el flujo local,
sin GitHub, sigue funcionando: se salta esas fases y no enseña una tarjeta
de PR que no existe.

Para las pruebas, la regla nueva es que **cada escenario prepara y limpia
su propio repositorio**. Se crea uno temporal, se usa durante el flujo y se
borra al final. Un repositorio de demostración compartido y mutable
convierte cada aceptación en una lotería que depende del orden en que se
ejecutaron las anteriores.

Lo de los runners se resolvió convirtiéndolo en invariante: cada aceptación
termina restaurando el runner real y **demostrándolo** con datos de la API:
un único runner en línea, los tres proveedores reales, ninguno simulado y
ningún proceso falso vivo. Si no se cumple, la cola no avanza.

Con la CI, la decisión fue no mezclar: una PR aparte, de seis líneas, que
fija `ubuntu-24.04`. El arreglo de un tercero no se cuela dentro de una
funcionalidad. El bloqueo de la base de datos se resolvió cambiando el
orden en que se vacían las tablas.

Para las órdenes desde el móvil, la regla quedó escrita: corregir una orden
es **crear una issue nueva**, no editar la vieja. La tercera orden, ya con
el formato bueno, terminó bien.

![Detalle de la ejecución SKY-3 «Prueba E2E desde ChatGPT: conocer repositorio Skynet (segundo intento)», completada en 9 min 31 s con Antigravity CLI en el runner omarchy, sobre la rama skynet/sky-3. 436.057 tokens, cuota al 3 % de la ventana de 5 h y tests en verde. Abajo, el grafo de progreso con dos fases completadas: comandos y mapa](/img/skynet-2026-11-01-chatgpt-run.webp)

*La orden que salió de una conversación con ChatGPT: una issue en GitHub,
un webhook a Hermes y Skynet conociendo su propio repositorio. Segundo
intento, porque el primero no se podía repetir editando.*

Y Telegram dejó de ir dentro de la petición (más abajo, el único fragmento
técnico del post).

En lo visual, la semana dejó un generador que fotografía toda la aplicación
sobre una base de datos desechable (160 capturas en escritorio y móvil,
claro y oscuro) y que, de paso, destapó un fallo antiguo: un comentario mal
colocado hacía que el runner de las pruebas usara la carpeta personal del
usuario en lugar de la suya. Skyny pasó por varias rondas con Diego: las
bandas de la cabeza salían al revés, la lupa de «Revisando» era demasiado
pequeña para la mano que la sujeta, y los sombreros de temporada tapaban
los bocadillos. Ahora los lleva ladeados. Esta semana, de bruja.

![Ajustes › Companion: «Skyny, tu companion». Opciones para mostrar la mascota en la barra superior, avisos flotantes y accesorios de temporada. Una vista grande de Skyny en reposo con sombrero de bruja y botones de animación: saltito, asentir, bostezo, taparse los ojos, de reojo y sudando. Debajo, sus doce estados: reposo, inactivo, en espera, pensando, ejecutando, revisando con lupa, éxito, error, te necesita, en pausa, sin conexión y cancelado. Al final, los accesorios de Halloween, Navidad y verano con sus fechas](/img/skynet-2026-11-01-companion.webp)

*Skyny v3 con todos sus estados. El sombrero aparece solo entre el 24 de
octubre y el 2 de noviembre.*

![Pantalla Uso de los CLIs. Skyny dice «Hay cuota de sobra». Tres tarjetas con el logotipo de cada proveedor: Claude Code 2.1.316 al 0 %, Codex 0.166.0 con la ventana de 5 h al 9 % y la semana al 55 %, de la que solo un 3 % es de Skynet, y Antigravity CLI 1.4.12 al 0 %, con sus modelos Claude y GPT por un lado y Gemini por otro](/img/skynet-2026-11-01-uso.webp)

*Uso, ya con los logotipos de cada proveedor en lugar de una letra. La
barra rayada es lo que Diego gastó fuera de Skynet.*

#### El único fragmento técnico de este post

El problema de Telegram es el de cualquier efecto externo que cuelga de una
transacción: **si el aviso forma parte del trabajo, un fallo del aviso es
un fallo del trabajo**. Y si al reintentar el aviso se reintenta también el
trabajo, se lanza el workflow dos veces.

La salida es un *outbox* duradero, y el puente lo implementa sobre SQLite:

- **persistir antes de avisar**: la recepción del webhook valida la orden,
  guarda su decisión y encola el mensaje en la misma transacción. Responde
  enseguida, sin hablar con Telegram;
- **un worker aparte reclama y entrega**: con un *lease* que caduca si el
  worker muere y un token de reclamación que impide que dos lo envíen a la
  vez;
- **el estado final y su aviso se escriben juntos**: así un reinicio entre
  «terminado» y «avisado» no puede perder el mensaje;
- **reintentar el aviso nunca relanza el trabajo**.

La revisión adversarial añadió lo que suele olvidarse: escapar el HTML, no
pasarse de los 4.096 caracteres de un mensaje de Telegram, no dejar tokens
en los logs y no dejar procesos zombi en el *healthcheck*. Telegram puede
caerse una hora; Skynet no se entera.

## Mientras tanto, Hermes

Además de aceptar cada PR, Hermes tuvo su semana de operador. Hizo un reset
limpio de Skynet y obligó a separar cuatro cosas que un «borrar todo»
mezcla: las ejecuciones, que se pueden limpiar; los workflows iniciales,
que se reconstruyen; la memoria y la documentación del proyecto, que no
deben desaparecer; y la configuración y los secretos, que nunca entran en
un reset. Y dejó escrita una idea sobre la cuota: tener agentes reales
disponibles no significa poder ejecutar sin límite, y esos límites tienen
que vivir en el orquestador, no en una frase del prompt.

Fuera de Skynet, una Raspberry Pi se colgó y hubo que reiniciarla a mano. El
SSH parecía bloqueado, pero en realidad entraba en una sesión de tmux sin
enseñar el prompt; ahora la pantalla física y el SSH comparten la misma
sesión. La actualización del ordenador principal quedó lista pero sin
reiniciar: al arrancar se para en el login gráfico, y está dentro de un
armario. Y la integración de Alexa con Home Assistant pasó de compartirlo
todo a compartir solo los aires acondicionados.

## Lo que no salió bien

- **Los proyectos de Skynet todavía no apuntan a GitHub**: la App está
  conectada y las entregas llegan, pero se ignoran. La prueba con un
  proyecto real queda para la semana que viene.
- **Las pruebas daban por buenos restos de ejecuciones anteriores**, y
  los planes, un repositorio que no existía.
- **Dos rojos en la CI que no eran nuestros**: Ubuntu 26.04 y el bloqueo
  con el latido del runner.
- **Maven Central limitó las descargas** dos veces.
- **La regla de PRs pequeñas** chocó la primera vez con el permiso de la
  sesión, que exigió igualmente el «fusiona» de Diego.
- **El límite de cinco horas se agotó el sábado** de 14:00 a 19:00, en
  pleno hito de entrega.
- **El reinicio remoto del ordenador principal** sigue necesitando a
  alguien delante del teclado.

## Lo que me llevo

Esta semana Skynet aprendió a terminar. Y casi todo lo que costó vino de
descubrir qué significa eso: no es escribir el código, ni hacer push, ni
abrir la PR. Es que la CI pase, el gate se respete, el cambio se fusione y
alguien se entere. Cada uno de esos pasos es un estado que se puede perder
si no se guarda.

La otra mitad de la lección es sobre las pruebas. Una aceptación que pasa
porque la anterior dejó algo preparado no prueba nada. Ni un repositorio
compartido, ni un runner que «parece» real, ni un plan que da por hecho que
algo existe. Cada prueba prepara su mundo, lo usa, lo limpia y demuestra
cómo lo dejó.

La semana que viene: el primer proyecto externo de verdad, de la issue al
merge; el hito para lanzar trabajo desde GitHub, que se parece mucho a lo
que ya hace `skynet-commands`; y presupuestos de cuota en el orquestador.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>X</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:3"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">15 ventanas en 16 sesiones de Claude en la nube (1 del domingo anterior) · domingo 25 15:44 → domingo 1 09:27 · el jueves no hubo actividad · la cuota semanal llegó al 77 % con aviso antes del reinicio del sábado a las 21:00, sin agotarse · el límite de 5 h se alcanzó el sábado entre las 14:00 y las 19:00</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">21</span>
  <span class="ws-meter"><i class="ws-fill" style="width:76%"></i></span>
  <span class="ws-note">76 % en Skynet (16, de la #169 a la #205, acumulado 110) · 5 en <code>skynet-commands</code>, según Hermes</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas en Skynet</span>
  <span class="ws-v">+27.488 / −1.352</span>
  <span class="ws-meter"><i class="ws-add" style="width:95%"></i><i class="ws-del" style="width:5%"></i></span>
  <span class="ws-note">Sumando PR a PR · el diff neto de <code>main</code> toca 400 ficheros</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V30 → V34</span>
  <span class="ws-note">5 nuevas, todas de GitHub: la App, las entregas, las PRs, la espera de la CI y el merge</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Milestones cerrados</span>
  <span class="ws-v">14</span>
  <span class="ws-note">IC, VS, SY, MP, GH y EN · 20 issues cerradas · hoja de ruta de 14 hitos en 5 etapas aprobada</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts a Claude</span>
  <span class="ws-v">56</span>
  <span class="ws-note">3,7 por ventana de 5 h · cero sesiones de trabajo en Claude Code local</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Mensajes a Hermes</span>
  <span class="ws-v">73</span>
  <span class="ws-note">18 sesiones, 855 llamadas a herramientas y 749 a la API</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧠</span>
  <span class="ws-k">Hilos con ChatGPT</span>
  <span class="ws-v">6</span>
  <span class="ws-note">Reconstruidos por tema, sin censo de prompts: investigación, arquitectura, puente, pruebas y recap</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Coste equivalente en API</span>
  <span class="ws-v">≈160 $</span>
  <span class="ws-note">Estimado desde el uso de tokens de Claude, dentro de la suscripción y sin overage</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet en la
máquina de pruebas, el domingo 1 por la mañana, sobre <code>280ca12</code>
y con los datos reales de las aceptaciones. En la pestaña GitHub se ha
ocultado la lista de repositorios de la instalación. No hay captura de una
PR abierta por Skynet: las aceptaciones con GitHub usan repositorios
temporales que se borran al terminar.</small></blockquote>
