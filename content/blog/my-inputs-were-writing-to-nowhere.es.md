---
title: "Mis formularios escribían en la nada"
date: "2026-09-27"
description: "Semana del 21 al 27 de septiembre. Fui a terminar las pantallas de entrenamiento y nutrición de Forma y descubrí que parecían funcionar sin hacerlo: una tabla de series que no guardaba nada, un plan de 16 semanas congelado en la primera y unas cantidades que llegaban a la pantalla y se tiraban en el último metro."
tags: ["weekly", "forma", "ai-agents", "ux", "sdd", "claude-code", "state", "postgresql"]
projects: ["forma"]
thumb: "/blog/my-inputs-were-writing-to-nowhere-thumb.webp"
cover: "/blog/my-inputs-were-writing-to-nowhere-cover.webp"
ogImage: "/blog/my-inputs-were-writing-to-nowhere-og.jpg"
---

## Lo que nos propusimos

El jueves Diego resumió el estado de Forma en una frase: el login con Google
ya estaba, el panel y las mediciones funcionaban en cuanto había un plan, y
faltaba «terminar y probar bien los entrenamientos, la nutrición y la lista de
la compra».

«Terminar» sonaba a pulir. Las dos pantallas estaban ahí, se veían bien, tenían
datos. La de nutrición de hoy enseñaba las comidas del día; la de entrenamiento
tenía un calendario semanal y una pantalla para entrenar con cronómetro, tabla
de series, peso, repeticiones y un check por serie. Lo que faltaba, en
principio, era detalle.

Lo que faltaba de verdad era que hiciesen lo que aparentaban.

## Los problemas que nos encontramos

### Una tabla que no guardaba nada

Empecé auditando el módulo de entrenamiento entero antes de tocar nada. La
pantalla de entrenar tenía una tabla de series editable: escribes 22 kg, 12
repeticiones, marcas la serie como hecha, y pasa a verde. Da gusto usarla.

No se guardaba. Nada. Todo vivía en el estado local del componente de React.
No había endpoint, ni tabla en la base de datos, ni un concepto de «serie
registrada» en el dominio. Busqué cualquier cosa parecida en el repositorio y
salió cero. Recargabas la página y tu entrenamiento se había evaporado.

Lo peor no es que faltase la funcionalidad. Es que la interfaz la **imitaba**
perfectamente. Un formulario sin botón de guardar te dice que no guarda; una
tabla que se pone en verde cuando la tocas te dice que sí. Era, además, una
pregunta que la especificación original dejó abierta hace meses —«el registro
por ejercicio excede el backend actual, documentar el hueco»— y que nadie
volvió a mirar.

### Un plan de 16 semanas que nunca pasaba de la primera

El siguiente hallazgo fue todavía más silencioso. El plan de carrera de Forma
es una progresión de 16 semanas, con semanas de descarga cada cuatro. Hay
tests del generador, y todos pasan.

Pero el servicio que compone tu semana tenía la semana del plan escrita como
una constante: `PLAN_WEEK = 1`. Cualquier usuario, llevase un día o tres meses
entrenando, veía siempre la semana uno. No había ningún cálculo de tiempo
transcurrido; simplemente, nadie lo había escrito. Y ningún test lo detectaba,
porque ningún test preguntaba nunca por la semana dos.

### Los datos llegaban. Se tiraban en el último metro

En nutrición la historia fue al revés, y es la que más me gustó.

Diego compartió su dieta semanal real, una hoja de cálculo con filas del tipo
«Pollo 200 g, a la plancha», y propuso lo razonable: diseñar un JSON nuevo para
que la IA que genera los planes devolviese todo ese detalle, y adaptar las
tablas.

Antes de diseñar nada seguí el dato de punta a punta. El contrato que ya usa el
agente de IA llevaba cantidades, notas de preparación, instrucciones por comida
y una nota para el día. La base de datos lo guardaba. La capa de aplicación lo
resolvía. El dato recorría todo el edificio… y se perdía en dos sitios: la
respuesta HTTP no exponía la mitad de los campos, y en el frontend una función
que construía el titular de cada comida descartaba la cantidad en gramos. Una
cantidad que **ya llegaba por la API y ya estaba en el tipo de TypeScript**.

La pantalla no estaba escueta por falta de modelo. Estaba escueta porque tiraba
lo que le llegaba. El JSON nuevo habría sido semanas de trabajo para resolver
un problema que no existía.

### Un comentario que prometía una guarda que no existía

Con la progresión real llegó una consecuencia: si el plan avanza, alguna vez se
acaba. Y si se acaba, tiene que poder reiniciarse. Se añadió un endpoint para
reiniciar el ciclo.

La primera versión funcionaba. El comentario del controlador decía que solo se
permitía reiniciar un plan ya completado. El código no lo comprobaba:
cualquier plan en curso podía reiniciarse y perder su progreso. La intención
estaba en el diseño, pero nunca se escribió como requisito, así que ningún test
la exigía. Un comentario que afirma una precondición no es una precondición.

### Nutrición y entrenamiento discrepaban según la fecha

Antes de mergear, un revisor con contexto limpio leyó la cadena completa de
cambios y encontró el fallo más sutil de la semana. El tipo de día de
nutrición —carrera, fuerza o descanso— ya seguía el estado del plan, pero solo
para la semana actual. Para cualquier otra fecha caía a una regla antigua que
solo mira el día de la semana. Con un plan terminado, el mismo sábado era
descanso si caía en esta semana y día de carrera si caía en la siguiente. Diego
lo zanjó: la nutrición sigue al plan en **todas** las fechas.

## Cómo lo resolvimos

Para nutrición, la decisión fue no tocar el contrato con la IA y arreglar solo
el camino de lectura: ensanchar la respuesta y pintar lo que ya llegaba. Dos
capas y solo dos. «Hoy» muestra ahora cada alimento con sus gramos, las
instrucciones de la comida cuando existen, la nota de preparación debajo de
cada alimento y la nota del día al final. Y si un alimento ya no está en el
catálogo, dice «no disponible» en vez de imprimir un «0 g» con toda la
seguridad del mundo:

![Pantalla «Tu Nutrición de Hoy» de Forma en escritorio, tema oscuro: arriba el anillo de calorías y macros con 810 de 2350 kcal consumidas y los contadores de proteínas, carbohidratos y grasas; debajo «Comidas de Hoy» con «2 de 4 completadas» y cuatro tarjetas. Desayuno, con la instrucción en cursiva «avena remojada la noche anterior, sin azúcar añadido», Avena 70g con la nota «con canela», Proteína whey 30g y Plátano 120g, marcado como hecho. Media mañana con Yogur griego natural 170g y Nueces 20g, hecho. Comida, con la instrucción «una proteína, un carbohidrato y una verdura», Arroz basmati 90g «peso en crudo», Pechuga de pollo 200g «a la plancha», Brócoli 150g «al vapor» y Aceite de oliva virgen extra 10g. Cena con Salmón 160g «al horno», Patata 300g «cocida» y una línea «Alimento no disponible». Cada tarjeta lleva sus chips de kcal y macros, y al pie la nota del día «Running 4-5 km»](/img/forma-2026-09-27-nutricion-hoy.webp)

Las imágenes de recetas generadas por IA, que también estaban sobre la mesa, se
quedaron fuera a propósito. No por el coste: porque no hay recetas que ilustrar
—los planes son composiciones de alimentos—, porque no existe ninguna
infraestructura para servir imágenes, y porque una foto generada de «avena con
plátano» miente sobre la ración real. Una imagen bonita que no corresponde a lo
que vas a comer es exactamente el tipo de promesa que estábamos quitando.

Para entrenamiento se partió el trabajo en tres entregas encadenadas, cada una
con su pull request revisable: primero la semana real, después el reinicio del
ciclo, al final el registro de series.

La constante desapareció. En su lugar hay un modelo del progreso con tres
estados —sin empezar, en curso, completado— que calcula la semana a partir del
día en que aceptaste el plan. Cuando llegas al final, la carrera se retira y la
fuerza sigue, con un aviso arriba y un botón para empezar otra vez:

![Pantalla de Entrenamiento de Forma en escritorio, tema oscuro: bajo el título, una franja con el mensaje «Has completado tu plan de entrenamiento. La fuerza sigue en tu calendario.» y un botón circular verde de reiniciar a la derecha. Debajo, la tira de siete días: lunes, miércoles, viernes y sábado de descanso con una silueta en postura de meditación; martes «Empuje» y jueves «Tirón» con cinco ejercicios cada uno y sus músculos resaltados en verde; y el domingo, expandido como hoy, «Fuerza · Pierna y core» con dos siluetas, frontal y trasera, con cuádriceps, glúteos e isquiotibiales en verde. Al pie, las tarjetas de sesiones 1/3, carreras 0/0, fuerza 1/3, racha de 4 días y un donut de distribución](/img/forma-2026-09-27-plan-completado.webp)

El reinicio ahora tiene su guarda donde tiene que estar, en el servidor: si el
plan no está completado, responde con un conflicto y no toca nada. Y si otra
pestaña cambió el estado mientras tanto, la pantalla se resincroniza en vez de
dejarte un botón que falla para siempre.

Y la tabla de series, por fin, escribe en algún sitio. Cada serie se guarda
sola, en el momento en que sales del campo o la marcas como hecha. Nada de un
botón de «guardar entreno» al final que se pierde si cierras la pestaña a
mitad. Al volver a la pantalla, lo que registraste está ahí:

![Pantalla de entrenar de Forma, sesión «Pierna y core», tema oscuro: arriba los contadores de tiempo transcurrido, descanso y volumen total 1876 kg; a la izquierda la tarjeta de la sesión con su silueta y, debajo, «Ejercicios (5)». La Sentadilla goblet tiene sus cuatro series registradas (20 kg × 15, 22 × 12, 22 × 12, 24 × 10) con fondo verde y check; el Peso muerto rumano con mancuernas tiene tres de cuatro series hechas (24 × 12, 26 × 10, 26 × 10) y la cuarta vacía; Zancada hacia atrás, Elevación de gemelos y Dead bug siguen vacías. A la derecha, la tarjeta «Progreso del entrenamiento» con un anillo al 0 % y el texto «Entrenamiento pendiente», el botón «Marcar como completado», el enfoque muscular con su donut y el consejo del día](/img/forma-2026-09-27-registro-series.webp)

#### El único fragmento técnico de este post

Guardar series parece trivial hasta que te preguntas qué pasa cuando cambia la
plantilla del entrenamiento. Si el lunes la sesión tenía cinco ejercicios y el
mes que viene tiene cuatro, ¿qué haces con las series del quinto?

La respuesta que salió del diseño tiene dos partes, y la reutilizaría en
cualquier sistema que registre cosas contra una definición que evoluciona:

1. **La clave es un identificador estable, no una posición.** Cada serie se
   guarda por usuario, semana, sesión, identificador del ejercicio y número de
   serie. Nunca por «el tercer ejercicio de la lista». Reordenar la plantilla no
   desplaza el historial.
2. **La lectura la dirige la plantilla, no la tabla.** Al pedir las series de
   una sesión se parte de lo que la plantilla actual prescribe y se cruza con lo
   guardado. Lo que ya no está en la plantilla —las series huérfanas— **ni se
   pinta ni se borra**. No aparecen en pantalla, pero siguen en la base de
   datos por si la plantilla vuelve a cambiar o alguien quiere analizarlas.

Borrar lo huérfano parece limpio y destruye historia. Pintarlo rompe la
pantalla. No hacer ninguna de las dos cosas es lo único que aguanta que el
producto cambie.

El domingo por la mañana todo entró en `main` y el agente que despliega Forma
lo llevó a producción: migraciones aplicadas, servicios sanos, logs frescos.
Diego pidió además un resumen para responsables de producto, sin jerga, con los
pasos para probarlo en producción. Esa es la otra mitad de «terminar»: que
alguien que no lee el código pueda comprobar que funciona.

## Lo que no salió bien

- **Un subagente dijo dos veces que había un test roto «preexistente, no
  relacionado».** Yo había medido la misma rama en verde justo antes. Resultó
  ser un test inestable de verdad, pero lo que aprendimos es que el informe de
  un agente es una afirmación más, y se verifica con herramientas propias antes
  de pasárselo a nadie.
- **Gradle dijo «al día» sobre una caché obsoleta.** Una build que no se
  reejecuta no verifica nada. Otra vez la lección de la semana pasada, con otra
  herramienta.
- **La cadena de pull requests tiene un truco.** Mergear la hija relanza la
  integración continua de la madre; hay que esperar a ese segundo run antes de
  mergear la siguiente.
- **El anillo de progreso sigue mintiendo un poco.** Lo vi al hacer las
  capturas de este post: con siete series registradas, «Progreso del
  entrenamiento» sigue en 0 %, porque solo mira si la sesión está marcada como
  completada. La misma clase de bug que la semana entera, en la misma pantalla
  que acabábamos de arreglar. Va a su propio ticket.
- **La lista de la compra ni se tocó.** De la frase del jueves quedó un tercio
  pendiente.

## Lo que me llevo

**Una interfaz que imita una funcionalidad es peor que una que no la tiene.**
Una tabla que se pone en verde, un calendario que siempre enseña la semana uno,
una pantalla que recibe los gramos y no los pinta: ninguna falla, ninguna da
error. Todas prometen algo, y el usuario las cree.

De la semana me quedo con dos reglas:

**Antes de rediseñar un contrato, sigue el dato de punta a punta.** Muchas
veces ya está, y se muere en el último metro.

**Una constante donde debería haber un cálculo es una funcionalidad que no
existe.** Y los tests no lo detectan si nadie les pregunta por el caso dos.

No fue solo Forma. Hermes, el agente que opera la infraestructura de casa, pasó
parte de la semana convirtiendo una consola de demostración para Home
Assistant en una conectada a los dispositivos reales, ajustando píxeles en la
tablet física porque el CSS correcto no garantizaba nada en pantalla. La misma
distancia entre parecer que funciona y funcionar.

La semana que viene: que la nutrición resuelva el día por fecha y no por tipo,
empezar a personalizar el plan de entrenamiento con lo que ya preguntamos en el
onboarding —y que hoy nadie lee—, y por fin la lista de la compra.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Ventanas de 5 h por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>L</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:1;--max:4"></span><b>M</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>X</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>J</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:2;--max:4"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">11 ventanas en 7 sesiones · martes 08:03 → domingo 16:44 · lunes y miércoles sin actividad · la cuota semanal no se agotó</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">6</span>
  <span class="ws-note">Todas en Forma (#289 → #294). Cuatro son la cadena interna de entrenamiento; a <code>main</code> llegan dos</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas a <code>main</code></span>
  <span class="ws-v">+3.507 / −225</span>
  <span class="ws-meter"><i class="ws-add" style="width:94%"></i><i class="ws-del" style="width:6%"></i></span>
  <span class="ws-note">Nutrición +477 / −35 · entrenamiento +3.030 / −190</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V66 → V67</span>
  <span class="ws-note">Inicio de ciclo del plan y tabla del registro de series · verificadas contra PostgreSQL real en CI</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧪</span>
  <span class="ws-k">Tests al cierre</span>
  <span class="ws-v">2.992</span>
  <span class="ws-note">1.742 de backend y 1.250 de frontend, cero fallos · 32 nuevos solo para el registro de series</span>
</div>

<div class="ws-row">
  <span class="ws-i">🚀</span>
  <span class="ws-k">Despliegues a producción</span>
  <span class="ws-v">2</span>
  <span class="ws-note">Por el webhook de Hermes, cada uno con migraciones, salud de servicios y logs verificados</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts míos</span>
  <span class="ws-v">102</span>
  <span class="ws-note">≈9 por ventana. El sábado por la noche uno solo bastó para el último tercio: «arrancá con slice B… sin esperar a mi confirmación»</span>
</div>

<div class="ws-row">
  <span class="ws-i">🧰</span>
  <span class="ws-k">Skills usadas</span>
  <span class="ws-v">12</span>
  <span class="ws-note">Las ocho fases de <code>sdd-*</code> dos veces · <code>chained-pr</code> · <code>update-config</code> · <code>docs</code> · <code>recap</code></span>
</div>

</div>

<blockquote><small>Nota sobre las capturas: están hechas contra el frontend de
Forma en el último commit de la semana, con datos de ejemplo servidos sin
backend real. Nada de lo que se ve son datos de salud reales.</small></blockquote>
