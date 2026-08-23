---
title: "El día de la semana era mi clave primaria"
date: "2026-08-23"
description: "Semana del 17 al 23 de agosto en Forma. Un lunes por la mañana la app decía que ya había entrenado dos sesiones. La tarjeta sumaba bien: el error estaba en una cadena de texto que fundía qué era una sesión con cuándo tocaba hacerla. De ahí salió el resto de la semana."
tags: ["weekly", "forma", "claude-code", "ai-agents", "data-modeling", "design", "rgpd"]
thumb: "/blog/the-day-of-the-week-was-my-primary-key-thumb.webp"
cover: "/blog/the-day-of-the-week-was-my-primary-key-cover.webp"
ogImage: "/blog/the-day-of-the-week-was-my-primary-key-og.jpg"
---

## Lo que nos propusimos

Forma es la aplicación de entrenamiento y nutrición que estoy construyendo con
agentes de IA. La semana anterior habíamos terminado las siluetas musculares:
las tarjetas de entrenamiento ya enseñaban qué músculos trabaja cada sesión.

Esta semana empezó sin plan. Abrí la app un lunes a las ocho de la mañana para
mirar otra cosa y me encontré con que la tarjeta «Resumen semanal» decía **2/6
sesiones completadas**. No había entrenado nada. Ni ese lunes ni el domingo
anterior.

Lo que salió de tirar de ese hilo ocupó la semana entera, y acabó tocando tres
cosas que yo tenía por separadas:

1. **Que la app supiera en qué semana estamos.** Que era el bug de verdad
   detrás del 2/6.
2. **Que la página de Entrenamiento cupiera en una pantalla.** Obligaba a hacer
   scroll y yo creía que era un problema de espacio.
3. **Que la portada dejara de prometer cosas que no existen** — y que el embudo
   dejara de tirar a la basura a quien lo termina.

El hilo que las une lo vi al final, y es el que da título a esto.

## Los problemas que nos encontramos

### El lunes decía que ya había entrenado

Mi primera hipótesis fue la obvia: la tarjeta suma mal. Era falsa. La tarjeta
sumaba perfectamente. El problema estaba tres capas más abajo, en una tabla que
guardaba una fila por usuario y sesión, donde la sesión se identificaba con una
cadena de texto:

```
"MONDAY:RUNNING"
```

Ahí está el bug entero, en esa cadena. **El día de la semana ERA la identidad de
la sesión.** Y en ninguna parte del esquema había nada que registrara a qué
semana pertenecía esa fila.

De esa única decisión de modelado —tomada meses atrás, en cinco segundos, sin
que nadie la discutiera— salían dos problemas que yo había estado tratando como
si no tuvieran nada que ver:

El primero: **el estado no caducaba nunca.** Una sesión completada en cualquier
semana pasada se reaplicaba a todas las siguientes, indefinidamente. Yo había
buscado el «reset semanal» por todo el código pensando que estaba roto. No
estaba roto: no existía. No se puede resetear contra una semana que el modelo no
sabe que existe.

El segundo: **las sesiones no se podían mover.** Yo quería poder aplazar el
rodaje del lunes al martes, que es lo que pasa en la vida real. Y no es que no
hubiéramos escrito esa función todavía: es que el modelo la hacía imposible de
escribir. Cambiar el día habría cambiado la identidad de la sesión, no su fecha.
La sesión del martes no sería la del lunes movida; sería otra sesión distinta.

Dos síntomas, un error. La cadena fundía tres hechos en uno:

```
QUÉ es          -> session_key    ("RUNNING:EASY", "STRENGTH:PUSH")
CUÁNDO toca     -> scheduled_day
CUÁNDO se hizo  -> completed_at
```

Separarlos fue una migración pequeña. Lo caro fue tardar meses en verlo, porque
desde arriba el síntoma era una tarjeta que sumaba mal.

### La página no necesitaba más espacio: decía lo mismo tres veces

Con el estado ya correcto, la página de Entrenamiento seguía obligando a hacer
scroll. Estuve un rato pensando en cómo comprimir las tarjetas. Pregunta
equivocada.

«Entrenamiento de hoy» y «Calendario semanal» eran **el mismo día dibujado a dos
tamaños**, y había que mantenerlos en sintonía a mano. Y «Resumen semanal», el
contador «Sesiones completadas» y «Distribución semanal» contaban exactamente
las mismas sesiones. El `1/6` se imprimía en tres sitios distintos, a tres
tamaños distintos. Eso no son tres tarjetas: son tres oportunidades de
contradecirse, y tres filas de alto.

Y al juntar por fin los dos elementos en la misma franja apareció algo que
llevaba meses escondido: para el mismo estado de una sesión, un componente decía
**«Pendiente»** y el otro decía **«Planificado»**. Dos palabras para una sola
cosa. Habían convivido tranquilamente mientras vivían en tarjetas separadas, a
cuatrocientos píxeles de distancia. En cuanto quedaron una al lado de la otra,
el desajuste era imposible de no ver.

Esto me ha pasado suficientes veces como para llamarlo regla: **los desajustes
de vocabulario no se descubren leyendo el código, se descubren cuando dos
componentes caen en la misma franja.**

### Un bug de 0,31 píxeles

A mitad de semana rehíce la portada y dejé la rama principal en rojo. El test
decía que el botón «Crear mi plan gratis» partía en dos líneas en un móvil, pero
**solo fallaba en el servidor de integración**: en mi Mac pasaba sin problema.

Durante un rato di por hecho que era cosa del runner. Me equivoqué. Medido en el
navegador, a 375 píxeles de ancho:

```
caja de contenido   206,00 px
ancho del texto     205,69 px
margen                0,31 px
```

Menos de un tercio de píxel. La fuente cargaba en los dos sitios —fue lo primero
que comprobé, porque «la tipografía no llega» era la hipótesis obvia, y era
falsa—, así que lo que lo tiraba al otro lado era simplemente cómo rasteriza las
letras cada sistema operativo, que entre plataformas siempre difiere en más de
0,31 píxeles.

**El defecto no estaba en el servidor de integración: estaba en un diseño
apoyado justo en el borde, y el servidor fue lo único que se dio cuenta.**

El arreglo fue ensanchar el botón hasta dejarle un 12% de margen. Pero lo que me
llevo es el test: el que había solo se enteraba **cuando la etiqueta ya había
partido**, que es tarde y depende de la plataforma. El nuevo mide cuánto sitio
sobra y exige un 8%, así que falla mientras todavía se puede arreglar. Y lo
verifiqué fallando con el valor viejo, para que no fuera un guardia vacío.

### La pantalla de éxito no guardaba nada

El sábado por la noche hice una pregunta que debería haber hecho mucho antes:
*¿se guarda en algún sitio el correo de quien pide un plan?*

No. El endpoint validaba las cuatro pantallas del embudo y respondía que sí.
Nada más. Alguien rellenaba el formulario entero, daba su correo, veía una
pantalla de éxito, y **no sobrevivía ni un rastro suyo a la petición.** El propio
controlador lo decía en mayúsculas en un comentario y lo llamaba «lo primero que
hay que arreglar».

Peor: en el último paso había una casilla de «he leído el aviso de privacidad» y
ese enlace **era un 404**. Es decir, se estaba recogiendo un consentimiento sobre
un documento que no se podía leer.

Aquí es donde el ejercicio se puso interesante. Como referencia le pasé al agente
la página de privacidad de otro producto del sector, y me devolvió que **no
servía**: era mexicana. «Derechos ARCO» es la ley mexicana; nosotros estamos bajo
el RGPD, que da seis derechos y no cuatro, y que exige cosas que aquella página
no tenía —base jurídica, plazo de conservación, cómo retirar el consentimiento y
a qué autoridad reclamar—. Copiar la estructura habría producido un documento con
aspecto de aviso legal y valor legal cero.

Dos detalles de esa parte que me parecen los más transferibles de toda la semana:

- **La prueba del consentimiento son tres columnas, no un booleano.** Qué se
  aceptó, cuándo, y qué versión del aviso estaba en vigor en ese momento. El
  RGPD pide poder demostrarlo, y un `true` no demuestra nada. Y la versión **la
  pone el servidor**, nunca el navegador: el navegador es exactamente la parte
  que puede mentir sobre qué documento leyó.
- **La retención se cuenta en meses de calendario, no en días.** Si el aviso dice
  «doce meses» y tú borras a los `12*30` días, estás borrando casi una semana
  antes de lo que has declarado. Lo declarado es lo que manda.

## Cómo quedó

La página de Entrenamiento dejó de tener una tarjeta de «hoy» y un calendario
aparte: **la semana ES la página**. Siete columnas, y hoy es simplemente la que
se abre.

![Página de Entrenamiento de Forma en escritorio: siete columnas de días de lunes a sábado con la silueta muscular de cada sesión y su nombre debajo (Rodaje suave 5,0 km, Empuje 5 ejercicios, Series 6x400 m, Tirón 5 ejercicios, Descanso, Tirada larga 12,0 km), y a la derecha la columna de hoy expandida mostrando Fuerza · Pierna y core con las dos siluetas frontal y posterior y sus botones de acción; debajo una franja con los contadores Sesiones 2/6, Carreras 1/3, Fuerza 1/3, Racha 4 días y un donut de distribución semanal](/img/forma-2026-08-23-training-week.webp)

Al abrir el detalle de una sesión aparece el desglose real de ejercicios junto al
mapa muscular. Y abajo a la izquierda está lo que el modelo de datos antiguo
hacía imposible: **mover la sesión a otro día.**

![Diálogo de detalle de sesión sobre la página de Entrenamiento: a la izquierda la tarjeta Músculos trabajados con las siluetas frontal y posterior resaltando piernas y core, y debajo la leyenda en dos columnas (Frente: Cuádriceps carga alta, Core carga media, Abdomen carga baja; Espalda: Glúteo carga alta, Isquiotibiales carga alta, Gemelos carga media); a la derecha el título Pierna y core con la etiqueta Planificado y la lista numerada de cinco ejercicios con sus series, repeticiones, RIR y descanso, y al pie un selector Mover a otro día con los botones Saltar y Completar](/img/forma-2026-08-23-session-detail.webp)

La portada se rehízo alrededor de lo único que Forma dibuja y nadie más dibuja:
el mapa muscular. Estaba enterrado dentro de la aplicación mientras el hero
enseñaba una foto de archivo de un móvil. Y no es una captura del componente:
**es el componente**, así que la portada y la aplicación no pueden divergir.

![Portada pública de Forma en escritorio, tema oscuro: a la izquierda la etiqueta Sin cuenta · sin tarjeta · 4 pasos, el titular Entrenamiento y nutrición con la compra ya hecha con las tres últimas palabras en degradado naranja, un párrafo explicativo y los botones Crear mi plan gratis y Ver cómo funciona; a la derecha una tarjeta Sesión de hoy · Empuje con las dos siluetas musculares frontal y posterior y sus grupos resaltados en verde, con la leyenda Primario y Secundario](/img/forma-2026-08-23-landing-hero.webp)

En el mismo movimiento se cayeron de la portada la promesa de integración con
Garmin y Apple Watch, un «98%» y un «algoritmo propietario». Ninguna de las tres
existe. Si no está construido, no se anuncia.

El embudo se reordenó en una sola columna alrededor de una **cifra viva**: según
mueves los deslizadores, el gasto calórico se recalcula arriba. La cifra es lo
que hace que responder la siguiente pregunta merezca la pena.

![Paso 1 de 4 del generador de plan nutricional de Forma: panel verde Tu gasto diario mostrando 2585 kcal con la etiqueta Mifflin-St Jeor, tarjetas de sexo Hombre y Mujer con Hombre seleccionado, deslizadores de Edad 38 años, Peso 78 kg y Altura 178 cm, y cinco niveles de actividad de Sedentario a Atleta con Moderado seleccionado](/img/forma-2026-08-23-generator.webp)

Y ahora, cuando alguien acepta el aviso de privacidad, hay un aviso de privacidad
que aceptar. Con los datos del responsable todavía por rellenar, marcados a la
vista: hay un test que comprueba que **se ven**, precisamente para que a nadie se
le olvide.

![Página de aviso de privacidad de Forma: titular Qué hacemos con tus datos, un resumen en una frase de que los datos se usan para construir el plan y que no hay analítica ni rastreo, la fecha de última actualización, una tabla de responsable con los campos razón social, NIF, domicilio y correo marcados como pendientes de completar, y la sección Qué datos tratamos explicando qué recoge el generador y destacando que no pregunta por patologías, alergias ni restricciones alimentarias](/img/forma-2026-08-23-privacy.webp)

## Un desvío que salvó la semana

A mitad de semana perdí una tarde en algo que no era una funcionalidad: **poder
ver la aplicación.**

Este portátil no tiene Docker, así que no hay backend ni base de datos, y sin
backend la parte privada de la app no se puede abrir: la autenticación es de
servidor, así que arrancar el frontend a secas solo deja navegar la portada. Yo
llevaba semanas juzgando rediseños contra tests y maquetas, sin mirarlos.

Ya teníamos datos de mentira para los tests automáticos. Lo que hice fue bajarlos
una capa: en vez de que los sirva el navegador de los tests, los sirve el propio
servidor de desarrollo. Misma fuente, dos consumidores, cero copias que puedan
divergir. Y de pronto la aplicación se navega en un navegador normal, a cualquier
tamaño de ventana, con las herramientas de desarrollo de verdad.

**Todas las capturas de este artículo están hechas con eso.** La herramienta que
construí el miércoles a regañadientes es la que el domingo me deja fotografiar lo
que había construido el resto de la semana.

## Lo que no salió bien

- **Dejé la rama principal en rojo cuatro días**, con dos ramas encadenadas
  heredando el fallo, porque di por buena la explicación cómoda («es un test
  quisquilloso con la tipografía»).
- **Dos veces se me olvidaron comprobaciones de la integración continua** que ya
  sabía que existían. Pasar los tests no es pasar el build.
- **El rediseño grande se implementó a ciegas.** Se validó con 924 tests y con
  el diseño, no con los ojos. Es exactamente lo que el desvío de herramientas
  vino a arreglar, pero llegó dos días tarde.

## Lo que me llevo

**Si un identificador contiene un hecho que puede cambiar, no es un
identificador: son dos columnas fundidas en una.** `"MONDAY:RUNNING"` fundía
qué-es con cuándo-toca, y ese único error producía dos bugs que parecían no
tener ninguna relación entre sí. Cuando dos síntomas raros no se dejan arreglar
por separado, muchas veces es porque comparten una columna.

Y el corolario, que es el que me ha ordenado la semana: **duplicar una vista no
es duplicar píxeles, es duplicar la oportunidad de contradecirse.** El `1/6` en
tres sitios eran tres verdades independientes que daba la casualidad de que
coincidían.

La semana que viene: que el generador construya el plan de verdad. Ahora mismo
guarda la petición y el consentimiento, pero al otro lado todavía no hay nadie.

## La semana en cifras

| | |
|---|---|
| PRs mergeadas en Forma | **14** (#233 → #247) |
| Acumulado del proyecto | 234 PRs |
| Líneas | **+15.076 / −4.351** en 150 ficheros |
| Migraciones de base de datos | 2 (Flyway V60 y V61) |
| PRs en este blog | 1 (#25) · 1 despliegue a producción |
| Sesiones de trabajo con Claude Code | 8 |
| Ventanas de 5 h consumidas | 15 |
| Ventana semanal | no se agotó |
| Prompts míos | 107 |
| Skills usadas | `branch-pr`, `chained-pr`, `work-unit-commits`, `design` |

<blockquote><small>Nota sobre las capturas: están hechas contra la aplicación en
el último commit de la semana, con datos de ejemplo y sin backend real. Nada de
lo que se ve aquí son mis datos de salud. Los campos <code>[COMPLETAR …]</code>
del aviso de privacidad salen así a propósito.</small></blockquote>
