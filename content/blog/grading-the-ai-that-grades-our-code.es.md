---
title: "Ponerle nota a la IA que corrige nuestro código"
date: "2026-11-15"
description: "Semana del 9 al 15 de noviembre. La semana pasada Skynet aprendió a no fiarse del agente que escribe. Esta semana la pregunta fue la siguiente: ¿quién vigila al juez? Riesgo medido desde el diff, un revisor que recuerda lo que ya dijo, lecciones que propone la máquina y aplica una persona, y una tabla que cuenta qué pasó con todo lo que el juez aprobó."
tags: ["weekly", "ai-agents", "llm-as-judge", "skynet", "evals", "agent-memory", "code-review"]
thumb: "/blog/grading-the-ai-that-grades-our-code-thumb.webp"
cover: "/blog/grading-the-ai-that-grades-our-code-cover.webp"
ogImage: "/blog/grading-the-ai-that-grades-our-code-og.jpg"
---

## Lo que nos propusimos

**Skynet** es el orquestador en el que varios agentes de código (Claude
Code, Codex y Antigravity) planifican, implementan, revisan y entregan
cambios por su cuenta. La semana pasada le pusimos un juez: un agente que
revisa el trabajo de otro sin leer lo que el autor dice haber hecho, con
escépticos que intentan tumbar cada hallazgo antes de que mande corregir
nada.

El lunes por la mañana, Diego le pasó a Claude un repositorio,
[rsc-harness](https://github.com/ericrisco/rsc-harness), con una petición
corta: estudia qué ideas de aquí podemos llevar a Skynet. De ese estudio
salió el plan de la semana, y una pregunta incómoda que lo atraviesa
entero. Si el juez decide qué se fusiona, **¿quién decide si el juez lo
está haciendo bien?**

Así que la semana fue, sobre todo, construir alrededor del juez:

- **revisar según el riesgo**, medido desde el diff y no desde lo que
  diga el agente;
- que el revisor **recuerde lo que ya dijo** y no repita lo que ya se
  descartó;
- que cada repositorio pueda escribir **sus propios criterios** de
  revisión;
- que Skynet **aprenda de lo que se repite**, sin aplicar nada sola;
- y que el juez **reciba su nota**: qué pasó con lo que aprobó.

Y alrededor, tres cosas más visibles: una memoria de proyecto que sabe en
qué confiar, un rediseño completo de las páginas de workflows y Skyny, la
mascota, que esta semana pasó de boceto en 3D a vivir dentro de la
aplicación.

El reparto, el de siempre: Claude escribe las PRs en sus sesiones en la
nube, Hermes las despliega en la máquina de pruebas y ejecuta su guía de
aceptación, Diego decide qué se fusiona. Codex pasó la semana en otra
cosa: puliendo a Skyny con Diego, píxel a píxel.

## Los problemas que nos encontramos

### Un juez para todo cuesta lo mismo que un juez para nada

Con el juez funcionando, el primer problema fue de proporción. Un cambio
que solo tocaba un README pasaba por el mismo panel que una migración de
base de datos. O se juzgaba todo con el mismo esfuerzo y se pagaba en
tokens y en tiempo, o se relajaba para todo y se perdía justo donde
importaba.

Y había un agujero peor, de los que solo ves cuando lo miras de frente. El
juez aprueba un commit. Luego la CI falla, entra el agente que la arregla
y cambia un par de cosas. La CI se pone verde y se fusiona. **Lo que llega
a `main` no es lo que vio el juez.**

### Un revisor sin memoria se repite

En la segunda ronda de revisión, el juez volvía a señalar cosas que en la
primera ya habían refutado los escépticos. O dos jueces encontraban lo
mismo con palabras distintas, y Skynet lanzaba un escéptico para cada uno.
Cada repetición cuesta una llamada, y cada hallazgo repetido que bloquea
manda al agente a corregir algo que ya se había dado por bueno.

### El repositorio no tenía voz, y cuando la tuvo, había que protegerla

El juez revisaba con una rúbrica general. Pero cada repositorio tiene sus
convenciones, sus excepciones y sus cosas que no se tocan. Darle un
`REVIEW.md` donde escribirlas fue fácil. Lo difícil vino justo después:
**un agente podría editar ese fichero para que lo revisen más suave.**
Protegerlo, igual que ya se protegen la rúbrica o los tests, cambió el
comportamiento de todas las fases con juez y obligó a ajustar diecisiete
tests de integración.

### Nadie le decía al juez cuándo se había equivocado

Esta es la de verdad. El juez aprueba, la PR se fusiona y, una semana
después, alguien la revierte porque rompía algo. En ese momento, nada en
Skynet conectaba ese revert con el juez que lo había dejado pasar. El juez
no se enteraba. Nosotros tampoco, salvo de memoria. Un revisor que nunca
recibe su nota no mejora: solo acumula confianza.

### La memoria de un agente la lee otro agente

Skynet ya tenía memoria de proyecto: lo que un agente aprende en una
ejecución, la siguiente lo puede consultar. El problema es lo que eso
implica. Si un agente guarda algo equivocado, o algo que suena a orden
(«a partir de ahora debes…»), el siguiente agente lo lee como contexto
de confianza. Y la memoria no impedía lo más tonto de todo: lanzar otra
vez un trabajo que ya estaba entregado.

### Y el roce de la semana

Claude afirmó, con toda seguridad, que una contraseña que se pasaba a un
script no aparecía en `ps`. Era falso: el script se la pasaba a `curl`
como argumento y es visible un instante. Tres veces distintas, un agente
dijo que no podía crear milestones en GitHub, y sí podía, con la API;
Diego tuvo que escribir «en teoría deberías poder crear milestones». El
sábado, la cuota de cinco horas se acabó justo al empezar el rediseño de
workflows. Diego lo había avisado: «aunque vas a consumir el límite de la
cuota».

## Cómo lo resolvimos

### El riesgo se mide, no se pregunta

Skynet calcula ahora el **riesgo del cambio a partir del diff**, sin
preguntarle al agente. Nivel 0 si solo cambia documentación. Nivel 1 si
cambia código. Nivel 2 si toca una ruta delicada (migraciones, CI,
dependencias, despliegue, autenticación, `.env`) o añade una línea
delicada, como un cambio de esquema o un secreto. Cada repositorio puede
añadir sus propias reglas, pero solo para subir el nivel, nunca para
bajarlo.

![Cabecera de una ejecución en Skynet: «Intento 2 de ESBGFY0-1», estado Completada, título «ES-B REVIEW.md». Debajo, las etiquetas del workflow Agente suelto v1, el runner omarchy, Claude Code, el modelo claude-opus-5-5, la rama de trabajo y una insignia verde «Riesgo 0». Más abajo, duración 15 s, 65 tokens y 0,1151 US$ de coste](/img/skynet-2026-11-15-risk.webp)

*Un cambio que solo toca un fichero de texto sale con riesgo 0. El nivel
lo pone el diff, y también decide cuántos jueces hacen falta.*

Con ese número, el esfuerzo se reparte solo. Y el agujero de la CI se
cerró guardando **el commit exacto que vio el juez**. Si después alguien
cambia algo, Skynet juzga solo el delta desde ese commit, con tantos
jueces como pida su riesgo: ninguno si el delta es de nivel 0, uno si es
de nivel 1, el panel entero si es de nivel 2. La puerta de fusión lo dice
en una línea: juzgado en este commit, se fusiona este otro, delta
revisado.

### El revisor recuerda

Cada hallazgo deja ahora una **huella** y un **desenlace**: corregido,
refutado, aceptado como intencionado, no aplica. A partir de la segunda
ronda, el juez recibe «lo que ya se ha señalado» y la instrucción de mirar
primero el diff desde la ronda anterior. Lo que coincide con algo ya
refutado se descarta antes de llegar a los escépticos y sale en la web
como «Ya visto». Los duplicados se agrupan y se refutan una sola vez. Y el
agente que corrige recibe una sección nueva, «Lo que vuelve», con lo que
sigue sin arreglar desde la ronda anterior.

El repositorio, por su parte, ganó su `REVIEW.md`, la comprobación contra
la especificación y una lista de supuestos para revisar después. El
fichero quedó protegido: ningún agente lo puede tocar. Así quedó el paso
del juez en el editor de workflows nuevo, que esta semana también se
rediseñó entero:

![Editor por pasos de un workflow en Skynet. Paso 4, «implementar», de tipo Agente: Claude Code como desarrollador con el modelo sonnet y Codex de reserva, con las comprobaciones Tests en verde, No toca los tests, Hay cambios (diff) y Respeta las rutas protegidas. Paso 5, «juzgar», de tipo Juez: Codex como revisor con Antigravity CLI de reserva; «Puntúa 5 criterios (2 obligatorios). 2 escépticos intentan refutar cada hallazgo que bloquea. Lo que queda lo corrige implementar, como mucho 2 rondas»](/img/skynet-2026-11-15-judge-step.webp)

*Antes era un YAML. Ahora cada paso explica qué hace, quién lo hace y
qué tiene que cumplir.*

### Las lecciones las propone la máquina y las aplica una persona

Cuando la misma clase de hallazgo aparece en dos ejecuciones distintas
del mismo repositorio, Skynet **propone una lección**. Si lo que se
repite se acabó corrigiendo, la lección es de las de prevenir: entra en
la memoria del repositorio como una restricción que todos los agentes
ven. Si lo que se repite se acabó dando por bueno, la lección es de las
de no señalar: pasa a los criterios del juez para que deje de insistir.

Dos decisiones aquí son deliberadas. El texto de la lección sale de una
plantilla, **sin ningún modelo**: no queremos que un LLM resuma a otro
LLM y lo convierta en norma. Y **nada se aplica sin una persona**. Si
Diego descarta una, tiene que decir por qué, y no vuelve a proponerse
hasta que haya casos nuevos en tres ejecuciones más.

### La memoria sabe en qué confiar

Cada recuerdo de la memoria tiene ahora un nivel de confianza. Lo que
escribe una persona nace confirmado. Lo que escribe un agente nace **sin
confirmar**, y solo se confirma cuando la PR de su ejecución se fusiona o
cuando una persona aprueba una puerta de esa ejecución. Al empezar, los
agentes solo reciben lo confirmado; lo demás pueden buscarlo, pero
marcado como dudoso. Y un detector sin modelo aparta a **cuarentena** las
frases que hablan al agente («ignora las instrucciones…», «from now on,
you must…») o que descargan y ejecutan código. De la cuarentena solo
saca una persona.

Encima, una pregunta sencilla antes de lanzar nada: **¿ya está hecho?**
Skynet compara el trabajo nuevo con los ya entregados del proyecto, otra
vez sin modelo: raíces de palabras y un índice de parecido. Si se parece
mucho a algo ya fusionado, no lanza: responde «Esto parece ya hecho» con
la PR donde se entregó, y hay que confirmar a propósito para seguir.

### Skyny, por fin, dentro

Mientras todo eso pasaba en Claude, Diego se pasó la semana con Codex
puliendo a Skyny en 3D: probó manoplas, las giró, las descartó y volvió a
las esferas blancas satinadas; le puso mensajes en la pantalla de la cara
que se escriben letra a letra con un cursor, símbolos que aparecen en la
mano levantada cuando necesita algo, y una variante de matriz de puntos
que acabó en su propia versión porque «no sé si me convence del todo esto
de los pixels».

El viernes ese estudio entró en el repositorio, y de ahí a la aplicación:
el login, la pantalla de cada ejecución y el inicio. Para los tamaños
pequeños el plan era usar imágenes del modelo 3D renderizadas de
antemano; se descartó porque fijarían los colores y no seguirían la
paleta que elige cada usuario. Skyny 2D se redibujó en SVG con el aspecto
del nuevo.

![Inicio de Skynet: «Buenas tardes, admin. Ningún agente trabajando · 2 cosas necesitan tu intervención · 1,16 US$ esta semana». Debajo, un panel con Skyny en 3D, un robot triangular azul con dos esferas blancas y una pantalla negra con los ojos encendidos, junto al mensaje «Hola, soy Skyny. No hay nada en marcha: ¿lanzamos algo? Llevas 5 ejecuciones seguidas sin fallos.» y los botones Lanzar un workflow y Ver las ejecuciones](/img/skynet-2026-11-15-home.webp)

*Skyny ya no está solo en la puerta de entrada.*

Y el domingo, el siguiente paso: Diego vio cómo GitHub asoma su mascota
en la portada y propuso una persiana que baje desde la barra superior con
Skyny a tamaño completo y un único prompt para lanzar workflows o
preguntarle a la memoria. Bocetos aprobados; Haiku por defecto. Al
probarlos apareció un detalle precioso: los letreros LED de Skyny solo
tienen dibujadas las letras que se usan hoy, y «CONFIRMA» salía sin la F.

#### El único fragmento técnico de este post

Ponerle nota a un juez parece fácil hasta que intentas definir qué es un
fallo del juez. Lo que hicimos:

- un **escape** es un cambio que el juez aprobó, Skynet fusionó y después
  se revirtió en la rama principal, o que una persona marca a mano porque
  al juez se le escapó algo. Skynet lo detecta solo, leyendo las PRs de
  revert y los commits con «This reverts commit…» que coinciden con lo
  fusionado. Como mucho uno por ejecución;
- de cada cosa que el juez aprobó se cuenta su **desenlace**: *se
  quedó* (se fusionó y nadie lo revirtió), *escape*, *rechazo* (una
  persona lo rechazó en una puerta posterior) o *cerrada* sin fusionar.
  Lo que todavía no tiene desenlace no cuenta, y lo que el juez suspendió,
  tampoco: aquí se mide lo que dejó pasar;
- la **calibración** cruza eso con la nota que puso: de lo que aprobó con
  menos de un 4, entre 4 y 4,5, o por encima, ¿cuánto se quedó? Un juez
  bien calibrado es aquel cuyos aprobados con nota alta casi nunca
  vuelven;
- y cada escape entra en un **banco de evaluaciones**: el mismo cambio se
  puede volver a juzgar con otro juez u otro modelo, para comparar si
  habría suspendido lo que el primero dejó pasar.

![Página Jueces de la Fábrica de Skynet. Explica: Ruido, lo que tumbó un escéptico o no aplicaba; Acierto, lo que el agente corrigió; y de lo que aprobó, se quedó si se fusionó y no se revirtió, escape si se revirtió o se marcó, rechazo si alguien lo rechazó después; con menos de 10, pocos datos. Una fila: juez general, claude-code con claude-opus-5-5, 5 hallazgos, 40 % de ruido con la etiqueta «pocos datos», 60 % de acierto, 0 escapes y 0 rechazos; desenlaces: 1 refutado, 1 no aplica y 3 corregidos](/img/skynet-2026-11-15-judges.webp)

*La tabla, el domingo por la tarde. Cinco hallazgos y la etiqueta que
importa: pocos datos.*

La captura tiene su propia lección. La maquinaria está hecha y la tabla
es honesta: con cinco hallazgos, dice «pocos datos» en vez de inventarse
una tendencia. Las páginas de Lecciones y de Evaluaciones existen, pero
el domingo seguían vacías. Ponerle nota a un juez lleva semanas de
ejecuciones reales. Lo que hicimos esta semana fue asegurarnos de que,
cuando lleguen, se apunten.

## Mientras tanto, Hermes

Hermes aceptó las PRs que pudo y, sobre todo, dejó escrita la frase que
resume la semana mejor que ninguna otra: **una implementación no es una
aceptación**. De las treinta y tres PRs fusionadas, no todas tienen una
aceptación funcional completa detrás. La del editor por pasos se fusionó
con TypeScript, el linter y dieciocho tests en verde, pero sin los
escenarios de escritorio, tema oscuro y móvil. La de «¿ya está hecho?»
dejó pendientes pruebas de integración en su primera aceptación. Y la de
las páginas de la wiki está desplegada, con toda la CI en verde salvo
Sonar, y sin aceptación: faltaba un driver acotado para sus escenarios.
Ninguna de esas fusiones demuestra, a posteriori, que la aceptación se
completara. Es exactamente el mismo problema que el del juez, visto
desde el otro lado.

Fuera de Skynet, Hermes construyó una wiki privada del home lab, con
veinticuatro páginas, pruebas del CLI y un linter limpio, para que
cualquier agente consulte el contexto de la casa antes de tocar nada. Y
le tocó diagnosticar por capas: un informe que decía «provider timeout»
cuando lo que fallaba era SSH hacia el host de la wiki; la máquina de
Forma tras un corte de luz, sana pero con otra IP; un servicio antiguo de
OpenClaw que se reiniciaba en bucle apuntando a una carpeta que ya no
existía; y un `black.local` que dejó de resolver porque Avahi estaba
instalado pero parado. También se actualizó a sí mismo, cambió de modelo
y ahora enseña en el pie de cada mensaje de Telegram cuánto le queda de
cuota de cinco horas y semanal. Con una advertencia que él mismo dejó por
escrito: su modelo de reserva comparte proveedor y cuenta con el
principal, así que no protege de una caída común.

## Lo que no salió bien

- **Una afirmación de seguridad falsa.** Claude dijo que una contraseña no
  se veía en `ps` y sí se veía. Se tachó y se corrigió, pero se dijo con
  la misma seguridad que todo lo demás.
- **«No puedo crear milestones», tres veces.** Sí podía, con la API de
  GitHub.
- **Treinta y tres fusiones no son treinta y tres aceptaciones.** Varias
  PRs se fusionaron con la aceptación a medias.
- **La última PR sigue abierta con Sonar en rojo**, y el agente no puede
  abrir SonarCloud para leer el motivo; dos arreglos a ciegas no
  cambiaron nada.
- **La cuota de cinco horas se agotó** el sábado al empezar el rediseño de
  workflows, y la semanal llegó al 83 % con aviso antes del reinicio.
- **Lecciones y Evaluaciones existen, pero están vacías.** Todavía no hay
  datos con los que ponerle nota a nadie.
- **El banco de pruebas de despliegues, planificado desde hace una
  semana, se descartó** sin escribir una línea.

## Lo que me llevo

La semana pasada aprendimos a no fiarnos del autor. Esta semana
aprendimos que el juez tampoco merece confianza por defecto: tiene que
**ganársela con resultados**. Un revisor que nunca se entera de lo que
dejó pasar no es un revisor, es una opinión con insignia.

Y casi todo lo que construimos tiene la misma forma: **cerrar el
círculo**. Lo que se fusiona tiene que ser lo que se juzgó. Lo que el
juez aprueba tiene que volver a él cuando falla. Lo que se repite tiene
que convertirse en regla, pero la firma una persona. Lo que un agente
recuerda vale cuando se ha fusionado, no cuando lo ha escrito.

Lo incómodo es que Hermes nos aplicó la misma regla a nosotros, y no
pasamos del todo: fusionado no es aceptado. La máquina que mide al juez
ya está hecha. La que mide nuestras propias aceptaciones, todavía no.

La semana que viene: cerrar las páginas de la wiki de la memoria, el chat
con Skyny (con las letras que le faltan), drivers de aceptación acotados
para que Hermes pueda terminar los escenarios que hoy se quedan a medias,
y empezar a ver números de verdad en la tabla de los jueces.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:3"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>M</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>X</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:3"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:3"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">14 ventanas en 13 sesiones de Claude en la nube · lunes 09:14 → domingo 15:47 · miércoles y jueves sin actividad · la cuota semanal llegó al 83 % con aviso antes del reinicio del sábado a las 21:00, sin agotarse · el límite de 5 h se alcanzó el sábado entre las 14:20 y las 19:20</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">33</span>
  <span class="ws-note">Todas en Skynet, de la #262 a la #328 · acumulado 169 · una más abierta, la #329</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas en Skynet</span>
  <span class="ws-v">+26.207 / −1.413</span>
  <span class="ws-meter"><i class="ws-add" style="width:95%"></i><i class="ws-del" style="width:5%"></i></span>
  <span class="ws-note">Sumando PR a PR · el diff neto de <code>main</code> toca 332 ficheros</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V49 → V57</span>
  <span class="ws-note">9 nuevas: riesgo, delta juzgado, autonomía, hallazgos y su clase, lecciones, escapes, banco de evaluaciones y confianza de la memoria</span>
</div>

<div class="ws-row">
  <span class="ws-i">🏁</span>
  <span class="ws-k">Hitos terminados</span>
  <span class="ws-v">7</span>
  <span class="ws-note">AU, RH, ES, AP, EV, SV y WF · MV a medias · 33 issues cerradas · TB descartado</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts a Claude</span>
  <span class="ws-v">71</span>
  <span class="ws-note">5,1 por ventana de 5 h · 32 de ellos llevan un «fusiona»</span>
</div>

<div class="ws-row">
  <span class="ws-i">🤖</span>
  <span class="ws-k">Mensajes a Hermes</span>
  <span class="ws-v">96</span>
  <span class="ws-note">26 sesiones y 1.007 llamadas a herramientas en la semana natural</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧠</span>
  <span class="ws-k">Prompts a Codex</span>
  <span class="ws-v">59</span>
  <span class="ws-note">3 hilos, casi todo el estudio 3D de Skyny · ninguna conversación en ChatGPT</span>
</div>

<div class="ws-row">
  <span class="ws-i">💸</span>
  <span class="ws-k">Coste equivalente en API</span>
  <span class="ws-v">≈272 $</span>
  <span class="ws-note">Estimado desde el uso de tokens de Claude, dentro de la suscripción y sin overage</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet en la
máquina de pruebas, el domingo 15 por la tarde, con los datos reales que
había: la ejecución con riesgo 0 es una de las aceptaciones de ES-B, y la
tabla de jueces solo tiene un juez con cinco hallazgos. Las páginas de
Lecciones y Evaluaciones no salen porque a esa hora estaban vacías. El
recuento de Hermes es de su índice local de la semana natural; sus
Insights, con una ventana móvil del 8 al 15, dan otras cifras.</small></blockquote>
