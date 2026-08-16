---
title: "Para arreglar una pantalla, primero construí otras dos apps"
date: "2026-08-16"
description: "Semana del 10 al 16 de agosto en Forma: para poder trabajar la interfaz con IA acabamos construyendo dos aplicaciones auxiliares —un laboratorio de overlays musculares y un playground sin backend—, y con ellas las tarjetas de entrenamiento pasaron de una silueta genérica a un cuerpo con los músculos del día encendidos."
tags: ["weekly", "forma", "claude-code", "ai-agents", "design-system", "accessibility", "svg", "tooling"]
thumb: "/blog/to-fix-one-screen-i-built-two-apps-first-thumb.webp"
cover: "/blog/to-fix-one-screen-i-built-two-apps-first-cover.webp"
ogImage: "/blog/to-fix-one-screen-i-built-two-apps-first-og.jpg"
---

## Lo que nos propusimos

La semana pasada la resumí así: la app dejó de inventarse los números. Ésta iba
de dar el paso siguiente, que resulta ser más difícil de lo que parece: **hacer
que el dibujo también diga la verdad**.

Tres frentes. El primero, la tarjeta de "Entrenamiento de hoy", que llevaba
desde el rediseño enseñando la misma silueta gris todos los días —daba igual si
tocaba pierna, tirón, carrera o descanso— mientras el backend sabía
perfectamente qué músculos trabajaba cada sesión. El segundo, los botones: la
app había ido acumulando maneras distintas de dibujar el mismo control y ya
había que ponerles orden. Y el tercero, uno pequeño pero que condicionó todo lo
demás: **cómo probar la aplicación en un portátil donde no se puede levantar el
backend**.

Lo que no estaba en el plan es cómo acabó resolviéndose. Para poder trabajar
esa pantalla —para ver qué estaba pasando, iterar con la IA y validar el
resultado— hubo que construir antes **dos aplicaciones que no son la
aplicación**: un laboratorio de overlays musculares y un modo *playground* que
levanta Forma ya logueada sin backend ninguno. Ninguna de las dos se despliega.
Las dos están commiteadas. Y sin ellas, esta semana no habría salido.

Cero migraciones de base de datos, por cierto. Todo pasó en el frontend.

## Los problemas que nos encontramos

### El miércoles que anunciaba pecho y tríceps

El bug que abre la semana lo vio el usuario un miércoles cualquiera. Tocaba
"Carrera · Series", y la ficha de ENTRENAMIENTO DE HOY anunciaba, tan tranquila,
un enfoque de **"Pecho, Hombros, Tríceps"**. Que es un día de fuerza. Al lado,
"4 / 6 ejercicios" y "55 min".

No era un fallo de cálculo. Eran constantes: un objeto `PLACEHOLDER` con
duración fija, enfoque fijo y número de ejercicios fijo, conviviendo dentro de
la misma tarjeta con datos reales del plan. La pantalla se estaba
contradiciendo a sí misma, y lo hacía con la seguridad de quien recita algo de
memoria.

Es exactamente el mismo animal que cazamos la semana pasada en nutrición, pero
disfrazado: allí eran cifras de relleno, aquí era una descripción de relleno. Y
mientras tanto, el dato bueno existía. El endpoint que devuelve el mapa
muscular de una sesión está en producción **desde julio**. Su única salida en
pantalla era esa línea de texto con comas: "Enfoque: Cuádriceps, Glúteo,
Isquiotibiales…". Información anatómica servida como una lista de la compra.

### Treinta y cinco ficheros CSS dibujando su propio botón

El segundo frente empezó con una observación del usuario mirando pantallazos:
*"creo que tenemos que estandarizar los botones"*. Lo medimos antes de tocar
nada, y el número era peor de lo que sonaba: existía un componente `Button` con
cinco variantes y, **en paralelo, treinta y cinco módulos CSS dibujando botones
a mano**. Noventa elementos con estilo propio repartidos en cuarenta archivos.
Seis tamaños distintos para el mismo control. Y tres semánticas de
accesibilidad diferentes para la misma pestaña.

Al levantar esa alfombra apareció lo de verdad grave, que no era estético.

El token `--color-accent-strong` —el verde que usa la app para **texto**:
enlaces, el ítem activo del menú, los glifos— estaba en un valor cuyo contraste
sobre el fondo era de **2,77:1**. El mínimo de la WCAG para texto normal es
4,5:1. Ni siquiera llegaba al 3:1 que se le exige al texto grande. Llevaba
semanas ahí.

Y tres formularios (registrar comida, agua, plan listo) referenciaban dos
variables CSS **que no existen en el tema**. Cuando eso pasa, la regla cae a su
valor de reserva, y el valor de reserva que alguien dejó escrito era un azul.
Así que en una aplicación cuyo color es el verde, la opción seleccionada del
formulario de comidas se pintaba **azul**. Nadie lo había reportado.

### No hay Docker, no hay backend, no hay app

Y el problema logístico, que planteó el usuario tal cual: *"en esta máquina no
tengo Docker y no puedo levantar el backend; con `npm run dev` solo veo la
landing, porque no hay base de datos. ¿Cómo pruebo la app como si estuviera
logueado?"*.

No es un problema de configuración, es de arquitectura: la autenticación de
Forma vive en el servidor. El contexto de sesión del frontend le pregunta al
backend quién eres, y un 401 significa anónimo. Sin backend, **la app no tiene
forma de creerse que hay una sesión abierta**. Puedes mirar la portada y poco
más.

### Y el iPad, que nunca cabe

El último problema es el más tonto y el que más iteraciones costó. Una vez
metidas las siluetas, la tarjeta cabía bien en escritorio y bien en móvil, y en
iPad salía **altísima**: al ponerla en una sola fila, ocupaba media pantalla
antes de llegar a los botones.

## Cómo lo resolvimos

### Encender el cuerpo

La solución al primero fue tirar el `PLACEHOLDER` y derivar el enfoque del mapa
muscular real, y después usar ese mismo mapa para lo que de verdad importaba:
**encender los músculos sobre una silueta**.

El usuario trajo cuatro láminas anatómicas (hombre y mujer, vista frontal y
posterior) más figuras propias para los días de carrera y de descanso. A partir
de ahí, cada sesión pinta su cuerpo.

![Pantalla de Entrenamiento de Forma en escritorio, tema oscuro: cabecera "Entrenamiento · Sigue tu plan y mejora cada día" con el selector de fecha "Domingo, 16 ago 2026"; la tarjeta ENTRENAMIENTO DE HOY ocupa la columna principal con el título "Fuerza · Pierna y core", 5 ejercicios, la línea de enfoque "Cuádriceps, Glúteo, Isquiotibiales, Gemelos, Core, Abdomen", un anillo de progreso al 0 % y, en el centro, las dos siluetas masculinas frontal y posterior con los cuádriceps, glúteos, isquiotibiales, gemelos y abdominales iluminados en verde sobre el cuerpo gris; a la derecha el panel de Resumen semanal con sesiones totales 2/6, carreras 1/3 y fuerza 1/3, y debajo la distribución semanal](/img/forma-2026-08-16-training-web.webp)

Se enseñan **las dos caras siempre**, no solo la que le corresponda a la sesión.
Fue una decisión deliberada: los músculos de un entrenamiento no respetan esa
división. Un día de tirón trabaja dorsal y tríceps por detrás y bíceps por
delante. Enseñar una sola cara escondería la mitad de lo que estás entrenando.

En iPad, la tarjeta acabó en **dos columnas**: a la izquierda la cabecera, el
título, los ejercicios y el enfoque, con el anillo debajo; a la derecha, las dos
siluetas ocupando el espacio que antes se estiraba hacia abajo.

![La tarjeta ENTRENAMIENTO DE HOY en iPad, en dos columnas: a la izquierda el título "Fuerza · Pierna y core", 5 ejercicios, la línea de enfoque y el anillo de progreso al 0 % con la etiqueta "En progreso · 0 / 1 sesión"; a la derecha las dos siluetas anatómicas frontal y posterior con las piernas, los glúteos y el abdomen encendidos en verde; abajo a la derecha los botones Saltar, Detalle y Entrenar](/img/forma-2026-08-16-training-ipad.webp)

Y en móvil, la misma tarjeta se recompone sola: el texto se estrecha, las
siluetas se quedan a la derecha y los botones bajan. Los textos de los botones
se acortaron para eso ("Entrenar" en vez de "Ver entrenamiento", "Detalle" en
vez de "Ver detalle").

<img src="/img/forma-2026-08-16-training-mobile.webp" alt="La misma tarjeta de entrenamiento en un móvil de 390 px: ENTRENAMIENTO DE HOY, el título Fuerza · Pierna y core, el enfoque en columna estrecha a la izquierda con el anillo de progreso debajo, las dos siluetas anatómicas con los músculos de pierna y core en verde a la derecha, y los botones Saltar, Detalle y Entrenar apilados en la parte inferior" width="390">

### Máscara, no imagen

Y aquí va el único trozo técnico de verdad del post, porque es lo que hace que
todo lo anterior funcione.

La tentación evidente es pintar cada músculo como una imagen. Poner un `<img>`
del cuádriceps encima de la silueta y listo. **No sirve**: un `<img>` pinta el
fichero con el color con el que se dibujó. Si mañana la app cambia de acento, o
si el usuario está en tema claro, o si quieres distinguir el músculo principal
del secundario, tienes que generar otro fichero. Multiplicado por cuarenta y
seis SVG y dos niveles de énfasis y dos temas.

Lo que hacemos es usar cada SVG **como máscara sobre un bloque de color**:

> El dibujo no aporta color, aporta forma. El color lo pone la variable del tema.

Con eso, encender un músculo es aplicar la máscara y elegir una opacidad.
Primario y secundario dejan de ser dos assets para ser dos números. El acento
cambia y los cuarenta y seis músculos cambian con él, sin tocar un solo
fichero.

Para llegar ahí construimos una herramienta aparte: **Forma · Muscle Overlay
Lab**, una página HTML autocontenida que no forma parte de la aplicación. Sirve
para dos cosas: verificar que cada máscara encaja con su silueta a cualquier
tamaño —hay un slider que solo cambia el ancho del contenedor, y silueta y
overlays tienen que reescalar juntos, siempre al 100 % de la misma caja— y
documentar la técnica para el que venga detrás.

![Forma · Muscle Overlay Lab abierto en el navegador: panel lateral izquierdo con el perfil Hombre seleccionado, la vista "Ambas", presets de grupo muscular (Hombros, Pecho, Espalda, Brazos, Core, Pierna, Full body), un slider de ancho del contenedor a 320 px, la lista de músculos con botones P y S para marcar primario o secundario, y controles de color de acento y de opacidad; a la derecha, "Mapa muscular · 4 grupos activos" con las siluetas masculinas frontal y posterior y los deltoides iluminados en verde](/img/forma-2026-08-16-overlay-lab-hombre.webp)

El mismo laboratorio con el perfil de mujer y seis grupos encendidos, para
comprobar que el pack femenino cuadra igual de bien:

![El mismo laboratorio con el perfil Mujer seleccionado y el título "Mapa muscular · 6 grupos activos": las siluetas femeninas frontal y posterior con pectoral, deltoides, cuádriceps y aductores encendidos en verde en la vista frontal, y trapecio, lumbar y antebrazos en la posterior; en el panel izquierdo se ven los músculos Antebrazo posterior, Abdominales, Oblicuos, Trapecio, Espalda superior y Dorsales con sus botones P y S](/img/forma-2026-08-16-overlay-lab-mujer.webp)

Ese pack está en el repositorio **como documentación, no como assets de
producción**, con un README que lo dice en la primera línea para que nadie edite
ahí esperando ver el cambio en pantalla. Lo que sirve la app son las mismas
siluetas en WebP: los PNG originales pesaban 6,1 MB y quedaron en 700 KB, con
las dimensiones en píxeles intactas. Eso último no es negociable —las máscaras
se estiran a esa misma caja, y un píxel de desajuste descoloca el músculo.

### Los seis músculos que no encendemos

Y aquí está la decisión de la que más orgulloso estoy de la semana, que consiste
en **no hacer algo**.

El catálogo de ejercicios habla español ("cuádriceps", "dorsal", "core"). El
pack de siluetas habla en códigos (`QUADRICEPS`, `LATS`, `ABS`). Al cruzarlos,
seis códigos del pack se quedaron sin equivalente: antebrazos, aductores,
pierna anterior, lumbar, sóleo. Simplemente no hay ejercicios en el catálogo que
los nombren todavía.

Se podría haber aproximado. Si un ejercicio dice "pierna", encender el
cuádriceps y quedarse tan ancho. Habría quedado más completo, más lleno, más
bonito en la captura.

Decidimos que no:

> Iluminar el músculo equivocado es peor que no iluminar ninguno.

Un mapa que enseña de más deja de ser información y pasa a ser decoración. Los
dos únicos casos donde sí hubo traducción se acordaron explícitamente uno a uno
—"core" son abdominales y oblicuos, "romboides" es espalda superior—, no por una
regla de parecido. El resto se queda apagado hasta que exista el ejercicio que
lo justifique.

### Un test que mide la función, no el valor

Para el problema del contraste, lo que se arregló no fue solo el color.

El test que debía protegernos comparaba un hexadecimal literal contra otro
hexadecimal literal. Cuando cambiamos el verde, ese test falló diciendo, en
efecto, *"el valor esperado ya no coincide"*. Que es lo que menos importa. El
test no sabía **para qué servía** ese token.

Ahora calcula el ratio de contraste real —la fórmula de la WCAG 2.1, sin
dependencias nuevas— para los cuatro tokens de texto sobre las dos superficies
de la app. Si mañana alguien elige otro verde a propósito, el test sigue en
verde. Solo falla si el token deja de cumplir su trabajo, y lo dice con esas
palabras: `--color-accent-strong on --color-bg: 2.77:1 is below the AA 4.5:1
bar`. Lo comprobamos en negativo, reinyectando el color malo.

Los botones acabaron en **tres familias, separadas por lo que expresan y no por
cómo se ven**: `Button` para una acción con etiqueta, `IconButton` para una
acción sin ella, y `Chip` para una **selección**. `Chip` existe precisamente
porque un chip seleccionado y un botón de acento se parecen muchísimo y
significan lo contrario, y esa semejanza es la razón por la que alguien lo
copió tres veces con tres nombres distintos.

### El playground

Y la respuesta a "no tengo backend" ya estaba medio escrita en el repo. Los
tests de maquetación interceptan la API dentro del navegador con una tabla de
fixtures, y entre ellos está el endpoint que dice quién eres. Eso es
exactamente lo que hace real la sesión.

De ahí salió un modo *playground*: un Chromium de verdad con esos mismos
fixtures, que abre la app ya "logueada" y se queda esperando a que cierres la
ventana. Con recarga en caliente, porque detrás está el servidor de desarrollo
de siempre.

Las capturas de este post están hechas con eso.

## Lo que no salió

Se evaluaron los iconos de [morphicons](https://www.morphicons.com/) en los dos
repositorios, se analizó dónde encajarían, se eligió una opción, se miró en
local y la conclusión fue: *"no me gusta, déjalo como estaba"*. Cero líneas
mergeadas. Es parte del trabajo.

El domingo por la tarde se quedaron varias sesiones de agentes colgadas en
background, `tmux attach` devolvía caracteres basura, y al final hubo que
matarlas a mano. Y una de las sesiones se murió y se reinició sola en mitad de
la reorganización de la tarjeta en iPad.

También cambiamos la frase "NUEVA VERSIÓN 4.0 DISPONIBLE" de la portada, por un
motivo muy simple: **era mentira**. Ahora anuncia la lista de la compra de
Mercadona, que sí existe.

## Lo que aprendimos

1. **La herramienta auxiliar merece un commit.** Ni el laboratorio de overlays
   ni el playground son producción, y los dos están en el repositorio: uno
   documenta una técnica, el otro hace posible probar la app sin backend.
   Trabajar la interfaz con IA va mucho mejor cuando existe un sitio donde
   mirar el resultado aislado del resto del sistema.
2. **Un dato que solo aparece como texto está a medio enseñar.** El mapa
   muscular llevaba en producción desde julio. Esta semana no cambió el dato:
   cambió lo que hacemos con él.
3. **Máscara, no imagen.** Es la diferencia entre un asset que obedece al tema y
   uno que impone su color.
4. **Un test que compara un hexadecimal no protege nada.** Protege el valor, no
   la función. Medir el contraste convierte "el test está desfasado" en "esto no
   se lee".
5. **No aproximar.** Seis músculos se quedan apagados porque el catálogo aún no
   los nombra. Rellenar el hueco con el vecino habría quedado mejor y habría
   estado mal.

## Lo que viene

Mergear la PR que lleva todo esto, que al cerrar la semana sigue abierta. Un día
con dos sesiones de fuerza distintas todavía enseña solo el mapa de la primera.
Y la navegación por fechas sigue acotada al lunes-domingo de la semana actual,
porque la API de entrenamiento **no conoce fechas** —solo sabe de "la semana"—;
salir de ahí necesita un endpoint nuevo, y eso ya no es trabajo de frontend.

## La semana en cifras

| | |
|---|---|
| PRs mergeadas en Forma | **2** (#230, #231) |
| PRs abiertas al cierre | 1 (#232) |
| Acumulado del proyecto | 224 PRs mergeadas |
| Líneas (mergeadas) | **+5.890 / −2.287** |
| Líneas (PR abierta) | +3.703 / −254 |
| Migraciones de base de datos | **0** |
| Módulos CSS con botones propios, antes | 35 |
| Familias de control, después | 3 (`Button`, `IconButton`, `Chip`) |
| Contraste de `--color-accent-strong` | 2,77:1 → **4,70:1** |
| Siluetas del pack | 8 (2 sexos × frontal, posterior, carrera, descanso) |
| Máscaras SVG de músculo | 46 |
| Peso del pack | 6,1 MB → **700 KB** en WebP |
| PRs en este blog | 1 (#23) |
| Sesiones de trabajo con Claude Code | 11 |
| Ventanas de 5 h consumidas | 12 (lunes a domingo) |
| Ventana semanal | aguantó hasta el domingo por la noche |
| Prompts míos | 56 (48 en Forma, 8 en el blog) |
| Skills usadas | `work-unit-commits`, `branch-pr`, `update-config`, `recap` |

<blockquote><small>Nota sobre las capturas: están hechas contra la aplicación en
el último commit de la semana, en modo playground, con datos de ejemplo y sin
backend real. Nada de lo que se ve aquí son mis datos de salud. Las dos capturas
del Muscle Overlay Lab son de la herramienta abierta en local, que no forma
parte de la aplicación desplegada.</small></blockquote>
