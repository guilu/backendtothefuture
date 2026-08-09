---
title: "La semana en que la aplicación dejó de inventarse los números"
date: "2026-08-09"
description: "Semana del 3 al 7 de agosto en Forma: construimos el generador público de plan nutricional, montamos el embudo desde la portada, y conseguimos que las pantallas dejaran de enseñar cifras de relleno para leer el plan de verdad. Estos son los problemas que nos encontramos por el camino."
tags: ["weekly", "forma", "claude-code", "ai-agents", "product", "data-modeling"]
thumb: "/blog/the-week-the-app-stopped-inventing-numbers-thumb.webp"
cover: "/blog/the-week-the-app-stopped-inventing-numbers-cover.webp"
ogImage: "/blog/the-week-the-app-stopped-inventing-numbers-og.jpg"
---

## Lo que nos propusimos

Forma es la aplicación de nutrición y entrenamiento que estoy construyendo con
agentes de IA. La semana anterior habíamos terminado los catálogos: alimentos,
macros, raciones, productos de tienda. Toda la fontanería, y nada que se
viera.

Esta semana tocaba lo contrario. Tres cosas, y ninguna de ellas era pequeña:

1. **Que el plan de nutrición existiera de verdad.** Hasta el lunes, el plan
   entero eran tres constantes escritas a mano en el código. Nadie podía
   editarlo, no cambiaba de una semana a otra, y era el mismo para cualquier
   persona que se registrara. Un plan que no se puede cambiar no es un plan: es
   una decoración.
2. **Construir el embudo.** Un generador público en la portada donde alguien que
   no conoce la aplicación responde cuatro preguntas y recibe un plan, sin crear
   cuenta antes. Pedirle registro a alguien antes de enseñarle nada es la forma
   más eficiente de que no empiece.
3. **Que las pantallas dejaran de mentir.** Esta es la incómoda. Varias
   pantallas de la aplicación mostraban números de relleno —cifras puestas "de
   momento", meses atrás, para que la maqueta no saliera vacía— y seguían ahí,
   al lado de datos reales, indistinguibles de ellos.

Lo tercero acabó siendo el hilo de toda la semana, y por un motivo que no
esperaba.

## Los problemas que nos encontramos

### El catálogo no sabía si el arroz estaba crudo o cocido

El primero apareció el lunes, cerrando el modelo de datos, y fue de esos que te
obligan a parar.

El documento de nutrición del que salió todo el diseño dice, tal cual:

> 100 g de arroz = 250 g de patata

Cuando la aplicación lo calculó con su propio catálogo, la respuesta fue **465
gramos**. Casi el doble.

No era un bug de cálculo. El documento estaba pensando en arroz **cocido** y el
catálogo guardaba arroz **seco** —360 kcal por cada 100 g frente a unas 130— y
en ninguna parte del sistema había un dato que dijera cuál de las dos cosas eran
esos números. Ninguna. El catálogo llevaba semanas siendo ambiguo y nadie podía
darse cuenta, porque la ambigüedad no se ve: se ve un número.

### La pantalla de nutrición se contradecía consigo misma

El miércoles, Diego abrió la aplicación con su cuenta y la pantalla de nutrición
le enseñó dos cosas incompatibles a la vez: arriba, el objetivo del día, 2350
kcal. Abajo, en la misma pantalla, «No hay un plan de comidas para este tipo de
día».

Las dos afirmaciones venían de dos sitios distintos del backend que estaban
leyendo el mismo plan con reglas diferentes. Y detrás de eso había algo peor.

Durante meses, todos los datos de prueba de la aplicación colgaban de una cuenta
marcador —un usuario interno, inactivo, creado para tener dónde poner las cosas
antes de que existiera el login—. Cuando por fin alguien se registraba de
verdad, la aplicación le creaba una cuenta nueva, vacía, y **el círculo nunca se
cerraba**: dieciocho tablas de datos colgando de un fantasma, y la persona real
mirando pantallas en blanco.

### Y el hallazgo que se repitió tres veces

Este es el que da título al post.

Al empezar a conectar las pantallas con datos reales, fue apareciendo el mismo
patrón una y otra vez. La pantalla mostraba una cifra inventada. Al lado, un
comentario en el código explicando por qué: *"el endpoint todavía no existe"*.

Y el endpoint existía.

Los macros por comida los enviaba el servidor desde hacía semanas; a la pantalla
le faltaba una línea para leerlos. Los datos de hidratación tenían endpoint para
consultar y para registrar desde hacía más aún, bajo un comentario que decía
literalmente, con la palabra *verificado* incluida, que no existía ninguno.
Nadie lo había vuelto a comprobar.

Tres veces, en dos proyectos distintos, la misma historia: **el trabajo ya
estaba hecho, y lo que faltaba era el camino para llegar a él**. En este mismo
blog pasó exactamente igual el lunes: la versión en inglés existía, completa y
traducida, pero no tenía dirección propia. Para Google, sencillamente no
existía.

La lección no es "revisa los comentarios del código". Es más incómoda: **un dato
de relleno dura más que la excusa que lo justificaba**. La excusa caduca en
silencio y el relleno se sigue pintando en cada pantalla, cada día, con la misma
pinta que un dato de verdad.

## Cómo lo resolvimos

### El plan pasó a la base de datos

Cuatro entregas encadenadas movieron el plan de nutrición del código a cuatro
tablas: el plan, sus días, las comidas de cada día y los alimentos de cada
comida. Después, una pantalla para crear y editar planes. Y por último, una
conexión entre lo que comes y la comida que el plan pedía, para poder responder
*"¿me he comido lo que tocaba?"*.

El criterio que mantuvimos en todo el modelo fue **no guardar nunca lo que se
puede calcular**. Las calorías de un día son la suma de sus comidas: guardarlas
aparte sería congelar un número que debería moverse solo. El estado de una
comida —comida, pendiente o saltada— tampoco se guarda, porque *pendiente* se
convierte en *saltada* sin que nadie toque nada, simplemente porque el día se
acaba.

Para el arroz añadimos al catálogo el estado de preparación: crudo, cocinado o
tal cual. Y aquí hicimos algo que merece la pena contar: de los 23 alimentos del
catálogo, **solo rellenamos dos**. Los únicos que se podían deducir sin
adivinar. Los otros 21 se quedaron vacíos, a propósito, porque "nadie lo ha
decidido todavía" es una respuesta distinta de "no aplica", y rellenarlos por
comodidad habría metido 21 suposiciones en el catálogo con aspecto de datos
comprobados.

### El embudo, cuatro pasos desde la portada

El generador público quedó así. Primer paso: los datos básicos, y el cálculo del
gasto energético apareciendo en el panel de la derecha según escribes.

![Generador de plan nutricional de Forma, paso 1: tarjetas de sexo Hombre y Mujer, campos de edad 45 años, peso 75 kg y altura 182 cm, cinco niveles de actividad de Sedentario a Atleta con Moderado seleccionado, y a la derecha el panel de requerimiento energético mostrando GEB basal 1668 kcal, factor de actividad ×1,55 y GET total 2585 kcal](/img/forma-2026-08-07-generador-paso1.webp)

Segundo paso: el objetivo, y el panel se actualiza para explicar la cuenta
entera —el gasto total, el ajuste por objetivo y las calorías que tendrá el
plan—.

![Paso 2 del generador: cuatro objetivos (pérdida de peso, ganancia muscular, mantenimiento y comer sano), dos bloques con candado para objetivos clínicos y restricciones alimentarias, y el panel derecho mostrando GET 2585 kcal, ajuste por objetivo ×0,8 y requerimiento del plan 2068 kcal](/img/forma-2026-08-07-generador-paso2.webp)

Ese panel es la decisión de diseño más importante de la semana, y no se ve.
**La fórmula que calcula esos números vive en el servidor, no en el navegador.**
Podríamos haberla escrito también en el frontend —habría ido más rápido y sin
esperas— pero entonces existirían dos copias, y en cuanto una se moviera, el
número que convence a alguien en la portada dejaría de ser el número con el que
se construye su plan.

Los dos bloques con candado del segundo paso también son deliberados: patologías
y restricciones alimentarias se enseñan y no se piden. Son datos de salud, y
recogerlos en un formulario público para no usarlos todavía sería lo peor de las
dos opciones.

### Un plan que se ofrece antes de darse por hecho

El arreglo de la contradicción salió mejor que el problema. En vez de parchear
las dos reglas para que coincidieran, cambiamos el planteamiento: **el plan se
ofrece, no se impone**. Se prepara desactivado, y la primera vez que entras la
aplicación pregunta.

![Modal de activación sobre el dashboard de Forma: título "Tu plan está listo", texto explicando que se ha preparado el plan Recomposición y se verá en entrenamiento, nutrición y lista de compra, con un botón verde "Sí, activa mi plan" y otro rojo "No, lo haré en otro momento"](/img/forma-2026-08-07-modal-activacion.webp)

Con eso la contradicción desapareció sola: mientras el plan está sin activar,
sencillamente no aparece en ningún sitio, así que las dos pantallas dicen lo
mismo por construcción y no porque alguien las haya sincronizado a mano.

Y sí, ese botón rojo lo dejamos marcado para revisar. El rojo suele avisar de
algo irreversible, y declinar aquí no destruye nada.

### La pantalla de nutrición, contando un solo día

Lo último de la semana fue rehacer la pantalla de nutrición. Antes hacía dos
preguntas a la vez y dejaba que las respuestas convivieran; ahora hace una
sola —**hoy**— y todo lo que enseña sale del plan y de lo que se ha registrado.

![Pantalla de nutrición de Forma: título "Tu Nutrición de Hoy" con la fecha, botón "+ Registrar", tarjeta de calorías con un anillo de progreso mostrando 1550 de 2350 kcal y el desglose de consumidas y restantes, tarjeta de macronutrientes con barras de proteína, carbohidratos y grasas, tarjeta de agua con 1,5 de 2,5 L y botones para añadir vaso o botella, y abajo la lista "Comidas de Hoy" con 3 de 5 completadas y cada comida con su receta y sus macros en etiquetas de colores](/img/forma-2026-08-07-nutricion.webp)

Ni un número de esa pantalla está inventado. El anillo de calorías, las barras
de macros, el vaso de agua y las cinco comidas del día salen todos de datos
reales. Cada comida enseña la receta que toca —"Huevos, pan integral y fruta",
no un genérico "Desayuno"— con sus macros en etiquetas de color, y el contador
de arriba dice cuántas llevas.

Lo que **no** hay son fotos de comida. La maqueta pedía una por plato y ningún
sitio del sistema guarda imágenes de comida. Antes que poner una foto de stock
de un plato que nadie ha cocinado, el hueco se queda con el icono.

Y en móvil:

<img src="/img/forma-2026-08-07-nutricion-movil.webp" alt="Forma en móvil a 390 px: la pantalla de nutrición con el botón + Registrar a ancho completo, el anillo de calorías centrado con 1550 de 2350 kcal, las barras de macronutrientes debajo y la barra de navegación flotante translúcida abajo" width="390">

## Lo que me llevo

**Un dato de relleno dura más que su excusa.** Es la más útil de la semana y la
que voy a aplicar a partir de ahora como revisión periódica: ¿qué tiene ya el
backend que ninguna pantalla está pidiendo? La respuesta, tres veces seguidas,
fue "más de lo que pensaba".

**Vacío es una respuesta.** Los 21 alimentos sin estado de preparación dicen
algo verdadero: que nadie lo ha decidido. Rellenarlos habría sido más cómodo y
habría convertido suposiciones en datos, que es la forma más rápida de envenenar
un catálogo.

**Una fórmula de negocio vive en un solo sitio.** Si el número que enseñas para
convencer y el número con el que construyes salen de dos implementaciones,
tarde o temprano dejan de coincidir. Y te enterarás por un usuario.

**Arreglar el planteamiento gana a parchear el síntoma.** La contradicción de la
pantalla de nutrición se podía haber tapado igualando dos condiciones. Cambiar
la pregunta —ofrecer el plan en vez de darlo por hecho— la eliminó de raíz y de
paso resolvió qué hacer con una cuenta recién creada.

## Lo que viene

El embudo hoy calcula el requerimiento y recoge los datos, pero todavía no
genera el plan. El siguiente paso es cerrarlo entero: generar el plan al
terminar los cuatro pasos, mandarlo en PDF por correo y dejarlo guardado
esperando a que la persona decida activarlo. Con eso, las pantallas de
onboarding —que hoy no existen y que el modal de activación está supliendo—
dejan de hacer falta en su forma actual.

Después, expandir las recetas en la lista de la compra y darle a esa lista
preferencia de tienda y aviso de presupuesto incompleto.

## La semana en cifras

| | |
|---|---|
| PRs mergeadas en Forma | **36** (#191 → #226) |
| Acumulado del proyecto | 219 PRs |
| Líneas | **+32.886 / −3.743** |
| Migraciones de base de datos | 17 (Flyway V42 → V58) |
| PRs en este blog | 2 |
| Sesiones de trabajo con Claude Code | 7 |
| Ventanas de 5 h consumidas | 13 (lunes a viernes) |
| Prompts míos | 103 |
| Mensajes totales en las sesiones | ~8.300 |
| Skills usadas | `branch-pr`, `chained-pr` |

<blockquote><small>Nota sobre las capturas: están hechas contra la aplicación en
el último commit de la semana, con datos de ejemplo y sin backend real. Nada de
lo que se ve aquí son mis datos de salud.</small></blockquote>
