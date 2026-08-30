---
title: "El verde ya significaba peso"
date: "2026-08-30"
description: "Semana del 24 al 30 de agosto: terminé el panel de Forma y, al ir a homologar los colores de sus gráficas, descubrí que el valor por defecto de un componente llevaba meses afirmando algo falso en cuatro pantallas distintas."
tags: ["weekly", "forma", "claude-code", "design-systems", "data-viz", "accesibilidad", "react"]
thumb: "/blog/green-already-meant-weight-thumb.webp"
cover: "/blog/green-already-meant-weight-cover.webp"
ogImage: "/blog/green-already-meant-weight-og.jpg"
---

## De dónde partía la semana

Dos cosas en la lista. La primera, montar la publicación automática de este
recap en Mastodon y en LinkedIn, para dejar de copiar y pegar los domingos por
la noche. La segunda, terminar el panel de Forma: la última pantalla grande que
seguía teniendo huecos.

La primera salió como estaba previsto y ocupó lunes y martes por la mañana. La
segunda ocupó el resto de la semana y acabó siendo otra cosa.

Porque el encargo, tal y como lo escribí, era cosmético: *«los roscos de
nutrición tienen calorías en morado, proteínas en azul, carbohidratos en verde y
grasas en naranja; pon las gráficas del panel igual»*. Diez minutos de trabajo,
pensé. Cuatro PRs después seguía tirando del hilo.

## El nudo

### Primera capa: dos pantallas que se contradecían

Antes incluso de tocar las gráficas apareció lo primero. El widget de nutrición
del panel y la página de Nutrición dibujaban **los mismos macronutrientes con
colores distintos**. En el panel, las proteínas eran verdes y los carbohidratos
ámbar. En la página, las proteínas eran azules y los carbohidratos verdes. Las
dos llevaban meses en producción, las dos estaban «bien», y nadie las había
visto nunca juntas porque están en rutas diferentes.

Ganó la de la página, que ya se usaba en las etiquetas de las comidas. Pero eso
no era el problema: era el síntoma.

### Segunda capa: el valor por defecto era una afirmación

El componente que dibuja todas las gráficas de línea de la aplicación acepta una
prop `color`. Y si no se la pasas, cae en el acento de la marca. Verde.

El detalle es que **verde ya significaba PESO**. Lo significaba en las fichas de
composición corporal y en las filas de la tarjeta de tendencia, que sí pasaban su
color explícitamente. Así que cualquier gráfica escrita sin pensar en el color
salía verde, y salir verde no era «salir sin color»: era **decir peso**.

Cuatro pantallas lo decían. La tarjeta de Evolución del panel, donde eliges la
métrica en un desplegable y el trazo se quedaba verde tanto si mirabas grasa
como si mirabas músculo. Las cinco gráficas de Mediciones. Las tres tarjetas de
Progreso. Todas afirmando lo mismo sobre datos distintos.

Nadie escribió ese error. Lo escribió el valor por defecto.

### Tercera capa: arreglarlo destapó una colisión

Al devolverle el verde a Peso, Músculo tuvo que irse al azul. Y en la leyenda de
«Distribución corporal» de la página de Mediciones, **Agua ya era ese azul**. Dos
puntos de cuatro del mismo color le dicen al lector que las dos filas son la
misma cosa.

Aquí es donde el problema deja de ser de estilo y pasa a ser de accesibilidad,
que es la única parte de la semana que merece una explicación larga.

La opción evidente era mover Agua a un cyan: un tono vecino, para que la fila
siga leyéndose como agua en lugar de convertirse en un color arbitrario. Pero un
azul y un cyan del mismo brillo son exactamente el par que una deficiencia de
visión del color **aplana hasta hacerlos indistinguibles**. El tono es
justamente lo que se pierde. La luminancia no.

Así que el token no se declara una vez, sino dos: `#22d3ee` en el tema oscuro y
`#0e7490` en el claro. No es una concesión al contraste sobre el fondo —que
también—, es que la separación respecto al azul de Músculo tenía que ser de
**brillo**: 2,04:1 en oscuro y 2,20:1 en claro. Una diferencia de brillo
sobrevive a cualquier daltonismo, porque el brillo no depende del matiz.

La alternativa era devolver Agua al gris, que es lo que sugiere la propia regla
que esa tarjeta documenta —color para los valores reales, gris para los
estimados—. Se descartó para que la leyenda mantenga cuatro marcas legibles en
lugar de dos colores y dos grises.

### Y de paso, los números no se escribían igual

Mientras estaba dentro apareció el mismo patrón en otro sitio. Mediciones y
Progreso escribían «74.0» con punto. Nutrición, el generador y las fichas del
panel pasaban por `Intl` en español y escribían «74,0» con coma. La tarjeta de
tendencia acabó poniendo los dos separadores en tarjetas contiguas, que es
exactamente donde se ve que no es un detalle: es la aplicación contradiciéndose
a sí misma a diez píxeles de distancia.

## Cómo acabó

El color dejó de ser decoración y pasó a ser **un contrato**: una métrica, un
tono, en todas las pantallas. Calorías e IMC en violeta, proteínas y músculo en
azul, carbohidratos y peso en verde, grasas en ámbar, agua en cyan. Tres PRs
—una por pantalla— y una única fuente de la paleta con un test que se rompe a
propósito si alguien la mueve de sitio.

En ninguna de las tres el color es el único portador de la distinción: el
selector nombra la métrica, cada gráfica lleva su etiqueta accesible y cada
tarjeta su título. El color añade, no sustituye.

![Panel de Forma en escritorio, tema oscuro: arriba la barra de fecha con las pastillas Última, -30 d y -1 año junto al selector de calendario; debajo cuatro fichas de composición corporal —Peso 74.0 kg (+0.2) con gráfica verde, Grasa 15.0 % (-0.1) con gráfica naranja, Músculo 62.9 kg (+0.2) con gráfica azul e IMC 22.5 (+0.1) con gráfica violeta—; en la fila siguiente las tarjetas de Entrenamiento con las siluetas musculares y su barra de progreso azul, Menú con su barra violeta y Nutrición con los cuatro aros concéntricos y la leyenda de calorías, proteínas, carbohidratos y grasas; más abajo Tendencia 30 días con tres series de colores distintos, Evolución de peso en verde, Lista de compra y Recomendación destacada](/img/forma-2026-08-29-panel.webp)

La tarjeta de nutrición cambió a la vez. Pasó de un donut de calorías más tres
barras de macros a **cuatro aros concéntricos**, al estilo de los anillos de
Apple Fitness: las calorías son el aro exterior y dentro van proteínas,
carbohidratos y grasas. Y la página de Nutrición, que partía lo mismo en dos
tarjetas que podían discrepar, ahora usa exactamente el mismo bloque.

![Página de Nutrición de Forma en escritorio: la tarjeta Calorías y macros con los cuatro aros concéntricos a la izquierda —violeta para calorías, azul para proteínas, verde para carbohidratos y naranja para grasas— y a la derecha las cuatro cifras con su objetivo (626 de 2300 kcal, 72.4 de 160 g de proteína, 48 de 250 g de carbohidratos, 12.8 de 70 g de grasas) y el texto Te quedan 1674 kcal; debajo la lista Comidas de Hoy con Desayuno Avena y Comida Pollo, cada una con sus etiquetas de kcal y macros en los mismos colores](/img/forma-2026-08-29-nutricion-aros.webp)

Del dibujo salieron dos decisiones que no eran obvias. La primera: son cuatro
aros y no tres porque las calorías son el número titular del día y el centro no
valía como sitio —el agujero mide unos 24 píxeles en la tarjeta del panel: cabe
`446`, no cabe `/ 2320 kcal`—. La segunda: el extremo redondeado del arco se
desactiva cuando el valor es cero. Un `stroke-linecap` redondeado a ratio cero
pinta un punto, y ese punto afirma un dato que nadie ha registrado.

En Mediciones el cambio se ve en las cinco gráficas a la vez, y la leyenda de
distribución corporal es donde vive el cyan:

![Página de Mediciones de Forma en escritorio: cinco fichas en fila —Peso 74.0 kg con gráfica verde, Grasa corporal 15.0 % con gráfica naranja, Masa muscular 62.9 kg con gráfica azul, IMC 22.5 con gráfica violeta y Agua corporal 58.0 % marcada como estimación—; debajo la tarjeta Evolución de peso con una gráfica verde grande de siete días; abajo a la izquierda la tabla Últimas mediciones con fecha, peso, grasa, masa muscular, IMC y fuente manual, y a la derecha la tarjeta Distribución corporal con la silueta y la leyenda de cuatro puntos: Músculo en azul, Grasa en naranja, Hueso en gris y Agua en cyan](/img/forma-2026-08-29-mediciones.webp)

Y en Progreso, las tres tarjetas que antes decían todas «peso»:

![Página de Progreso de Forma en escritorio: tres tarjetas en fila con sus gráficas de siete días —Evolución de peso 74.0 kg en verde, Evolución de grasa corporal 15.0 % en naranja y Evolución de masa magra 62.9 kg en azul—, cada una con su valor actual y la fecha de la última medición](/img/forma-2026-08-29-progreso.webp)

El separador decimal se unificó en punto y, sobre todo, se centralizó: ahora hay
**un único módulo donde se decide cómo se escribe un número** en toda la
aplicación. Cuatro funciones, porque hay cuatro necesidades distintas y
mezclarlas era parte del lío.

De la misma tanda salió la variación respecto a la medición anterior, que ahora
va al lado del valor: «74.0 kg (+0.2)». Va en tinta apagada a propósito, no en
el color de la serie. Un número en verde o en ámbar diría «bien» o «mal», y
bajar de peso no es lo uno ni lo otro hasta que alguien decide qué está
buscando. Y como «(-0.5)» suelto no significa nada leído en voz alta, esa forma
se oculta del árbol de accesibilidad y la sustituye una frase completa: «0.5 kg
menos que la medición anterior».

Lo último del panel fue el navegador de fecha. Eran dos flechas: con novecientas
mediciones, llegar a la de hace un año eran novecientas pulsaciones. Ahora la
misma barra ofrece tres granularidades —saltos rápidos, el calendario del
sistema y las flechas de siempre— y navega por las fechas que **tienen**
medición, no por el calendario: ni los saltos ni el calendario aterrizan en una
fecha exacta, caen en la medición más cercana. Los saltos, además, son relativos
a lo que estás mirando y no a hoy, que es lo que permite recorrer el historial a
zancadas en vez de que el botón quede inerte a partir de la segunda pulsación.

![Panel de Forma en móvil, tema oscuro: cabecera con el saludo Hola Diego y la barra de fecha, y debajo las fichas de composición corporal apiladas en dos columnas con sus gráficas de colores, seguidas de la tarjeta de Entrenamiento con las siluetas musculares](/img/forma-2026-08-29-panel-movil.webp)

Y una historia paralela que merece un párrafo: el martes por la tarde producción
empezó a devolver errores 429. La primera hipótesis fue que la aplicación pedía
de más, y era verdad a medias —había peticiones duplicadas, y arreglarlas bajó
la ráfaga inicial del panel de doce peticiones a ocho—, pero los 429 seguían.
Los ponía el nginx de delante, con una única zona de *rate limiting* compartida
entre los ficheros estáticos y la API. Un panel que carga ocho peticiones y un
puñado de recursos se estrangulaba a sí mismo. La lección no es de código sino
de método: **peticiones sueltas nunca disparan un limitador**. Si la prueba no
es una ráfaga, no es una prueba.

## Lo que me llevo

**Un valor por defecto es una afirmación.** «Sin color» no existe: existe
«verde», y el verde ya significaba algo. Si un componente puede pintarse sin que
le digas qué representa, tarde o temprano representará lo que no es. Y el error
no aparecerá en ninguna revisión, porque nadie lo escribió.

**Cuando el color pasa a ser dato, hereda las obligaciones del dato**: una única
fuente, un test que se rompe si alguien la mueve, contraste medido en los dos
temas, y nunca ser el único portador del significado.

**Para separar dos tonos vecinos, mueve el brillo, no el matiz.** El matiz es
exactamente lo que una deficiencia de visión del color aplana.

**Dos pantallas que dibujan lo mismo son dos oportunidades de contradecirse.**
El panel y la página de Nutrición llevaban meses discrepando sin que nadie las
viera juntas, y un separador decimal distinto en tarjetas contiguas es el mismo
fallo con otra ropa.

Y una de trabajar con agentes: **hay que comprobar siempre que un test nuevo
falla ANTES del arreglo**. Dos veces esta semana escribí un test verde que no
demostraba nada. Una de ellas porque estaba midiendo contra fixtures donde todo
responde en el mismo instante, así que dos peticiones separadas en el tiempo
parecían fundirse en una: di por arreglada una petición duplicada que seguía
duplicada. El usuario del otro lado del teclado acertó varias veces donde yo me
equivoqué, y eso también es parte del método.

## La semana que viene

El generador de plan de verdad. La petición ya se guarda desde hace dos semanas,
pero todavía no hay nada que construya el plan a partir de ella. Y publicar este
mismo post en Mastodon y en LinkedIn con los scripts que escribí el lunes, que
hasta hoy sólo se han probado en seco.

## La semana en cifras

| | |
|---|---|
| PRs mergeadas en Forma | **19** (#248 → #266) |
| Acumulado del proyecto | 258 PRs |
| Líneas en Forma | **+9.961 / −3.199** |
| Migraciones de base de datos | **0** — primera semana 100 % frontend |
| PRs en este blog | 5 (#28 → #32) · **+935 / −38** |
| Sesiones de trabajo con Claude Code | 11 |
| Ventanas de 5 h consumidas | 14 |
| Ventana semanal | no se agotó |
| Prompts míos | 149 |
| Skills usadas | `branch-pr`, `work-unit-commits`, `design`, `dataviz` |

<blockquote><small>Nota sobre las capturas: están hechas contra la aplicación en
el último commit de la semana, con datos de ejemplo y sin backend real. Nada de
lo que se ve aquí son mis datos de salud.</small></blockquote>
