---
title: "Un prefijo en el título no es una política de despliegue"
date: "2026-11-22"
description: "Semana del 16 al 22 de noviembre. Skynet terminó su memoria, aprendió a conversar y pasó cinco días de cambios rápidos de interfaz. Cuanto más rápido iban los cambios, más claro quedaba dónde estaba el cuello de botella: no en el código, sino en decidir qué se despliega solo."
tags: ["weekly", "ai-agents", "deployment", "skynet", "ci", "chat", "frontend"]
thumb: "/blog/a-title-prefix-is-not-a-deploy-policy-thumb.webp"
cover: "/blog/a-title-prefix-is-not-a-deploy-policy-cover.webp"
ogImage: "/blog/a-title-prefix-is-not-a-deploy-policy-og.jpg"
---

## Lo que nos propusimos

**Skynet** es el orquestador en el que varios agentes de código planifican,
implementan, revisan y entregan cambios por su cuenta. Las últimas semanas
le enseñamos a desconfiar del autor y a ponerle nota al juez. Esta semana
tocaba algo más cercano: que Skynet **recuerde** lo que pasa en cada
proyecto y que se pueda **hablar con él**.

La semana tuvo tres tramos, y cada uno fue más rápido que el anterior:

- de domingo noche a lunes por la mañana, **terminar la memoria**: una wiki
  por proyecto, un contexto que se reparte con cabeza y un curador que
  propone ordenar lo que se acumula;
- de lunes a martes, **el chat con Skyny**, la mascota, que pasó de dibujo a
  asistente: ocho PRs en algo más de un día;
- y de miércoles a domingo, **cambios pequeños de interfaz**, uno detrás de
  otro, en un hilo que se llamaba literalmente «Hacer pequeños cambios
  rápidos en el frontend». Se llevó 32 de los 56 mensajes de la semana.

El reparto, el de siempre: Claude escribe las PRs en sus sesiones en la
nube, Hermes las despliega en la máquina de pruebas y comprueba que
funcionan, Diego decide qué se fusiona. Y esta semana Gemini volvió a
mandar su propio informe, el primero desde junio: había pasado la semana
diseñando a Skyny en 3D junto con ChatGPT.

## Los problemas que nos encontramos

### Un asistente que actúa no puede aprobarse a sí mismo

Un chat que solo responde preguntas es fácil. Diego quería algo más: que
Skyny pudiera lanzar un workflow, crear un trabajo o reintentar una
ejecución desde la conversación. Y ahí aparece la pregunta de siempre en
Skynet, con otra cara: **¿quién da el visto bueno?**

La primera tentación es pedirle al modelo que pregunte antes de actuar.
Pero eso es una instrucción, y una instrucción se puede olvidar, malinterpretar
o saltar. Lo que hace falta es que, aunque quiera, **no pueda**.

Hubo otro roce, más pequeño y más revelador. El plan decía que cada turno
del chat sería una ejecución de agente «de tipo chat». Pero esa columna ya
significaba otra cosa (empezar, continuar, reintentar, bifurcar), y meter
ahí un valor nuevo la habría vuelto ambigua para todo lo demás. El chat
tenía que entrar en Skynet por la misma puerta que los jueces, no por una
nueva.

### El bucle rápido sacó todos los detalles

A partir del miércoles el ritmo cambió. Diego miraba la web en el móvil,
pedía un ajuste, y una hora después lo estaba mirando otra vez. Y en ese
ritmo salieron cosas que una revisión de código no ve nunca:

- la cortina del chat **bajaba desde arriba de la página**, no desde la
  barra; y en móvil, el cuadro de texto se enfocaba solo y el teclado
  aparecía a media animación, empujándolo todo;
- Skyny **se veía primero en 2D y luego saltaba a 3D**: la librería 3D se
  carga aparte, y mientras llegaba, la web pintaba el dibujo plano de
  respaldo;
- en iPad, las páginas cortas **hacían un poco de scroll sin motivo**. La
  causa probable: una altura de pantalla que en móvil incluye la barra del
  navegador.

Ninguno era difícil. Todos eran de los que solo ves usando la aplicación.

### El diseño vivía en el fichero de otra IA

El sábado, Diego trajo a Claude su estudio de Skyny: un HTML autocontenido
que va puliendo con Gemini y ChatGPT, con 34 estados de ánimo, gorro, cara
y complementos. Lo quería dentro de la web.

El estudio estaba en su Mac, fuera del alcance del agente, y hubo que
conectarlo en solo lectura. Pero el problema de verdad era otro: **entre
versión y versión, el estudio se había reescrito entero**. Ya no casaba con
los módulos 3D que la web había hecho a partir de la versión anterior. Al
portarlo salieron los fallos que un HTML suelto disimula: Skyny salía
demasiado azul porque heredaba el color del dibujo plano, un estado había
perdido su configuración, y en «Conflicto de Git» **Skyny se volvía
invisible** por una división que devolvía `NaN`.

Diego hizo la pregunta que importa: «¿qué tengo que hacer cuando añada
estados nuevos o cree una versión 4.4?». Al día siguiente llegó la 4.4.

### Y el cuello de botella se mudó

Con PRs pequeñas entrando cada pocas horas, apareció el atasco de verdad.
**Hermes no desplegaba las PRs de interfaz**: su regla de despliegue
automático reconocía el código de fase del título («CH-D», «MV-F»), y estas
no lo llevaban. Además, cada una relanzaba todas las pruebas de punta a
punta, que tardan una eternidad, aunque no tocara nada de lo que prueban.

La solución parecía obvia, y Diego la propuso con naturalidad: **las PRs
cuyo título empiece por `UI:` se despliegan solas**. Un prefijo. Una línea
en una regla.

No era una línea.

## Cómo lo resolvimos

### Skyny propone, una persona confirma

Las acciones del chat quedaron como **propuestas**. Skyny tiene
herramientas para lanzar, crear, cancelar, reintentar o guardar en la
memoria, pero ninguna hace nada: dejan una tarjeta pendiente que caduca en
una hora. Quien confirma es la persona, desde la web, con su sesión.

Y lo importante: **el token con el que habla Skyny no llega a las rutas de
la web**. Si lo intenta, recibe un 403. No es que se le pida no
confirmarse a sí mismo: es que no puede. Lo que Skyny guarda en la memoria
entra sin confirmar, igual que lo de cualquier otro agente, y cada
conversación se resume sola al archivarla o tras media hora de silencio.

El turno de chat entró como un rol más, igual que los jueces, con límites
cortos: un modelo pequeño, solo las herramientas de Skynet, como mucho
cinco minutos y medio dólar por turno.

![La cortina del chat de Skynet abierta sobre la página de Inicio. Arriba, Skyny en 3D, un robot triangular azul claro con dos esferas blancas y una pantalla negra, con la etiqueta «En reposo». Debajo, la pregunta «Que hay en marcha ahora mismo» y la respuesta: no hay nada en marcha, 0 ejecuciones activas; un runner de pruebas sin latido desde el 7 de noviembre y avisos de cuota en el runner omarchy, Claude Code al 54 % y Codex al 35 % de su ventana de 7 días. Luego la pregunta «Tienes acceso a la wiki?» y el campo «Pregúntale a Skyny» con el modelo Haiku](/img/skynet-2026-11-22-chat.webp)

*La cortina del chat, abierta desde el logo de la barra superior, con una
conversación real del domingo.*

### La interfaz, ajuste a ajuste

Los cinco días de cambios rápidos se notan en toda la aplicación. La barra
superior ocupa todo el ancho y el logo abre el chat. El menú lateral, que
ya no cabía, se agrupó en pestañas. Proyectos y runners pasaron a tarjetas
anchas, con las versiones de cada agente en chips. La cortina sale ahora
de detrás de la barra, sin autofoco en móvil, y el hueco de Skyny se funde
mientras llega el 3D en vez de enseñar el dibujo plano.

![Página Agentes de Skynet con la barra superior a todo lo ancho y «SKYNET» en texto a la izquierda. Arriba, tres pestañas: Runners, Proveedores y Consumo. Dos tarjetas anchas de runner: ip-b-acceptance, con la etiqueta «Sin latido» y sus agentes simulados en chips naranjas; y omarchy, «En línea», con chips de Antigravity CLI 1.5.14, Claude Code 2.1.319, Codex 0.167.0 y «Chat con Skyny»](/img/skynet-2026-11-22-runners.webp)

*Runners en tarjetas, con pestañas. El chip «Chat con Skyny» es lo que
declara un runner para poder atender turnos del chat.*

El estudio de Skyny se portó **entero**: en lugar de remendar los módulos
3D para que se parecieran a la versión nueva, el motor de la web pasó a ser
el del estudio, traducido a TypeScript. Así, la próxima versión no
necesita una reinterpretación, solo otro port. El login se quedó con lo
mínimo: «Entra en Skynet», y Skyny saludando con letreros que cruzan su
pantalla.

![Pantalla de acceso de Skynet: Skyny en 3D, inclinado, con «HOLA» en cian en su pantalla, sobre el título «Entra en Skynet» y los campos Usuario y Contraseña con el botón Entrar](/img/skynet-2026-11-22-login.webp)

*El login nuevo. Skyny entra volando, saluda y va pasando mensajes mientras
espera.*

### El prefijo, a medias, y con razón

La parte de las pruebas sí se resolvió: las PRs `UI:` que solo tocan la web
ya no lanzan las pruebas largas de punta a punta. Siguen corriendo al
fusionar en la rama principal, si la PR toca las propias pruebas o algo
fuera de la web, o si alguien pone la etiqueta para pedirlas.

El despliegue automático, en cambio, **no se activó**. Hermes construyó el
mecanismo, lo probó aislado y encontró por qué no debía encenderlo.

#### El único fragmento técnico de este post

Un despliegue automático por prefijo parece una condición:

```
si el título empieza por "UI:" y la CI está verde → desplegar
```

Pero cada palabra de esa línea esconde una pregunta:

- **«La CI está verde»**: ¿en qué momento? La PR se abre con la CI
  pendiente. Alguien tiene que volver a mirar cuando termine, y ese «volver
  a mirar» tiene que sobrevivir a un reinicio del servicio. Además, una
  prueba que se saltó a propósito no es lo mismo que una prueba que no
  llegó a ejecutarse, y desde fuera las dos se parecen mucho a «nada en
  rojo».
- **«Desplegar»**: ¿qué commit? Si alguien empuja otro mientras se
  despliega el anterior, ¿cuál gana? En las pruebas aisladas de Hermes, la
  cola existente dejaba que **un worker antiguo liberara el turno de otro**,
  y que un evento nuevo **se quedara pendiente sin arrancar nunca**.
- **«Solo frontend»**: para la CI que se acaba de escribir, «solo web»
  ignora los ficheros `.md`. Para la regla que Diego autorizó, «solo
  frontend» era estricto. La PR que se estaba desplegando a mano, la #351,
  tocaba documentación fuera de la carpeta web. **La misma PR era «solo
  frontend» para una regla y no para la otra.**

El prefijo es una **afirmación** que hace quien escribe el título. Lo que
hace falta es una **comprobación**: los ficheros que cambian, el commit
exacto, la base, qué checks corrieron y cuáles se saltaron, y una única
autoridad que decida qué se despliega cuando llegan dos cosas a la vez.
Hasta que eso exista, la #351 se despliega a mano.

## Mientras tanto, Hermes

Hermes tuvo una semana con dos caras. En Skynet, desplegó cada fusión y
comprobó los servicios, pero dejó claro algo que repite cada semana: **un
despliegue sano no es una aceptación**. Dos pruebas de aceptación se
quedaron bloqueadas porque sus guías eran interactivas y no tenían un
script acotado que Hermes pudiera ejecutar solo, y la integración con
GitHub sigue sin poder leer su clave privada en algunos arranques, aunque
la API diga que está todo bien.

Fuera de Skynet, Hermes **se duplicó**: hay una segunda instancia en un
portátil antiguo con Debian, con su propio bot, coordinada desde la
máquina principal. Comparten la wiki privada del laboratorio, que es la
fuente común de hechos, pero no la memoria, las conversaciones ni las
credenciales. Esa wiki también es la que ChatGPT ayudó a abrir a los demás
agentes esta semana: Hermes escribe, el resto lee con un clon y tres
comandos (orientarse, buscar, leer).

Y un recordatorio de que compilar no es funcionar: el driver de Wi-Fi del
portátil se recompiló sin errores y seguía sin encontrar redes. Hubo que
volver al driver anterior y comprobarlo con un reinicio de verdad.

## Lo que no salió bien

- El despliegue automático de las PRs `UI:` **no está activado**, y la PR
  más visible de la semana se despliega a mano.
- Dos aceptaciones quedaron sin cerrar por falta de un driver acotado, y
  la clave de la integración de GitHub sigue fallando.
- Se fusionó una PR con seis avisos de Sonar que el agente **no podía
  leer**: no tiene acceso a la web de Sonar y depende de que Diego pegue el
  texto.
- Una issue no se cerró porque la PR decía «Cierra #306». GitHub solo
  entiende las palabras en inglés.
- Algunos arreglos de móvil están **sin verificar en el dispositivo**: el
  scroll fantasma del iPad y que Skyny siga el dedo en la cortina.
- Wiki y curador funcionan, pero en la máquina de pruebas siguen **vacíos**:
  el proyecto de prueba no tiene historia que curar.

## Lo que me llevo

- **Una etiqueta es una afirmación, no una comprobación.** Sirve para
  expresar intención; la decisión la toman los hechos que se pueden
  verificar.
- **Las palabras de una regla se definen una vez.** «Solo frontend» acabó
  significando dos cosas en dos sitios en la misma semana.
- **Cuando el bucle de cambios se acelera, el cuello de botella se muda.**
  Con cambios grandes cada pocos días, desplegar a mano no molestaba. Con
  cambios pequeños cada hora, se volvió el problema principal.
- **Un asistente que puede actuar no debe poder aprobarse.** No por
  instrucción, por diseño: su credencial no llega a donde se confirma.
- **Un diseño hecho en otra IA es un contrato.** Se porta entero, no se
  reinterpreta trozo a trozo.

Lo siguiente: una autoridad de despliegue única para las PRs `UI:`,
probada con la CI pendiente, cambios de commit y reinicios; decidir si la
documentación cuenta como frontend; fusionar la #351; y llenar la wiki con
proyectos de verdad.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>M</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>X</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">16 ventanas en 6 sesiones de Claude en la nube, una de ellas el domingo anterior · domingo 15 17:15 → domingo 22 16:07 · el jueves no hubo actividad · la cuota semanal llegó al 79 % con aviso antes del reinicio del sábado a las 21:00, sin agotarse · ningún límite de 5 h</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">16</span>
  <span class="ws-note">Todas en Skynet, de la #329 a la #350 · acumulado 185 · la #351 sigue abierta</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas en Skynet</span>
  <span class="ws-v">+15.721 / −1.188</span>
  <span class="ws-meter"><i class="ws-add" style="width:93%"></i><i class="ws-del" style="width:7%"></i></span>
  <span class="ws-note">Sumando PR a PR · el diff neto de <code>main</code> toca 168 ficheros</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V58 → V66</span>
  <span class="ws-note">9 nuevas: wiki, curación, quién vio qué, conversaciones, su token, acciones, turnos y resúmenes</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Hitos terminados</span>
  <span class="ws-v">2</span>
  <span class="ws-note">MV «Memoria viva» y CH «Chat con Skyny» · 11 issues cerradas</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts a Claude</span>
  <span class="ws-v">56</span>
  <span class="ws-meter"><i class="ws-fill" style="width:57%"></i></span>
  <span class="ws-note">57 % en el hilo de cambios rápidos de interfaz (32) · 3,5 por ventana de 5 h</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Mensajes a Hermes</span>
  <span class="ws-v">43</span>
  <span class="ws-note">14 sesiones y 308 llamadas a herramientas en la semana natural · una segunda instancia en marcha</span>
</div>

<div class="ws-row">
  <span class="ws-i">🎨</span>
  <span class="ws-k">Sesiones de Gemini</span>
  <span class="ws-v">6</span>
  <span class="ws-note">≈156k tokens estimados, casi todo el estudio 3D de Skyny (v4.3 y v4.4) · ChatGPT: 3 hilos sobre la wiki y las diapositivas</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Coste equivalente en API</span>
  <span class="ws-v">≈174 $</span>
  <span class="ws-note">Estimado desde el uso de tokens de Claude, dentro de la suscripción y sin overage · Gemini, dentro de su tarifa plana</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet en la
máquina de pruebas, el domingo 22 por la tarde, con la #351 desplegada a
mano. La conversación del chat es real, del domingo por la mañana; por eso
habla de un runner de pruebas sin latido y de cuotas que ya se han
reiniciado. Wiki y curador no salen porque en ese despliegue estaban
vacíos. El recuento de Hermes es de su índice local de la semana natural;
sus Insights, con una ventana móvil del 15 al 22, dan otras cifras. Los
tokens de Gemini son su propia estimación.</small></blockquote>
