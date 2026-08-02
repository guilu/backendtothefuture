---
title: "Los catálogos que necesita un plan de nutrición con IA: la semana de fontanería antes de la magia"
date: "2026-08-02"
description: "Semana del 27 de julio al 2 de agosto: 19 PRs en Forma. Cerré la integración con Withings, pulí tarjetas y tablas de datos, y construí los catálogos globales de macros y de productos de tienda. Nada de eso se ve. Todo eso es lo que hace posible generar un plan la semana que viene."
tags: ["weekly", "forma", "claude-code", "ai-agents", "withings", "data-modeling", "playwright"]
thumb: "/blog/building-the-catalogs-an-ai-nutrition-plan-needs-thumb.webp"
cover: "/blog/building-the-catalogs-an-ai-nutrition-plan-needs-cover.webp"
ogImage: "/blog/building-the-catalogs-an-ai-nutrition-plan-needs-og.jpg"
---

## La semana en una frase

Esta semana no escribí ni una línea de la feature que le importa a nadie.

Escribí **el vocabulario con el que esa feature va a estar escrita**.

Forma tiene que generar planes de nutrición y de entrenamiento. Eso es lo
vistoso, es lo que va en la portada, y es lo que empiezo la semana que viene.
Pero un plan de nutrición necesita saber dos cosas que hasta el viernes no
existían como dato editable: **qué vale un alimento nutricionalmente** y
**dónde se compra, en qué formato y a qué precio**.

Las dos vivían en una hoja de cálculo y en constantes del bundle del frontend.
Cambiarle el emoji a una categoría exigía un despliegue.

Así que la semana fue eso: fontanería. Y creo que es el post más útil que he
escrito de esta serie, porque la fontanería es exactamente la parte que la
gente se salta cuando construye con IA — y luego se pregunta por qué el modelo
genera planes que no se sostienen.

## Los números

| | |
|---|---|
| PRs mergeadas | **19** (acumulado del proyecto: 183) |
| Líneas | **+16.128 / −3.571** |
| Migraciones de base de datos | **7** (V35 → V41) |
| Prompts míos | **112** |
| Mensajes de Claude | 2.721 |
| Ventanas de trabajo | **17**, repartidas en los 7 días |
| Tokens de contexto | **1.170 M** (de los cuales 1.140 M son lecturas de caché) |
| Tokens de salida | 1,87 M |

El dato que me interesa de ahí es el último bloque. La semana pasada
[agoté la cuota semanal el viernes por la tarde](/blog/spec-driven-ai-agents-with-gentle-ai-and-the-token-bill).
Esta ha entrado sin sustos con un volumen de trabajo parecido, y no es porque
haya optimizado nada: es porque **siete PRs de CRUD sobre un modelo de datos ya
pensado consumen muchísimo menos que siete historias con ciclo de specs
completo por delante**. El coste no lo marca cuánto código sale. Lo marca
cuánto hay que decidir.

## Withings: cerrado

La integración con Withings —OAuth, tokens cifrados, sincronización de
mediciones corporales— aterrizó la semana anterior. Esta semana **funciona**,
que no es lo mismo.

Fallaba en producción de la peor manera que se puede fallar. `buildAuthorizationUrl`
generaba una URL perfectamente bien formada con `client_id=` **vacío** cuando la
credencial no estaba configurada. Y esa URL la sigue el navegador, no el
backend. Así que no fallaba en ningún sitio que yo pudiera ver: el usuario iba
a Withings, se identificaba, elegía su cuenta, y solo entonces se encontraba
con esto, en un dominio que no es el mío:

```
Missing client_id or scope in the request parameters
```

Un callejón sin salida a tres pasos del fallo real, sin nada que apunte a la
configuración de mi aplicación.

La regla que saqué de aquí, y que me parece que vale para cualquier integración
OAuth: **una URL de redirección es una llamada que no puedes observar**. Todos
los demás puntos de entrada del adaptador (el intercambio de token, el refresh)
fallaban bien, porque hacen una petición HTTP y esa petición devuelve un error.
El único que no llama a nadie era el único que se rompía en silencio. El javadoc
de la clase afirmaba que esto ya estaba cubierto: era cierto para dos de los
tres métodos.

Ahora cada punto de entrada comprueba sus credenciales **antes** y lanza una
excepción nombrando la variable que falta, así que se lee dentro de la
aplicación: *"La conexión con Withings no está configurada en este entorno
(falta `WITHINGS_CLIENT_ID`)"*. El mensaje revela que una variable está sin
definir, **nunca ningún valor**.

De paso cayó otro clásico: la tarjeta de Withings del panel lateral decía
"Conectado" **siempre**. Era texto escrito a mano, de antes de que existiera un
backend de integraciones, y nadie la revisitó. Ahora lee el estado real — y
mientras el estado es desconocido, la tarjeta no se renderiza. Un indicador de
estado que no puede leer el estado es peor que ausente.

## La interfaz: tarjetas, tablas y un estado que nadie diseña

La primera mitad de la semana fue pulir lo que ya estaba entregado, y todo
salió de usar la app en el móvil de verdad.

Dos barras de scroll verticales. Tarjetas saliéndose de su columna. Un
breakpoint que aguantaba dos columnas hasta los 574 px cuando ya debía haber
colapsado. El menú "Más" de la barra inferior sin el efecto glass que sí tenían
los demás. Gráficas de dashboard con la grasa corporal pintada sobre el token
`warning`, que se lee como *"la grasa es una advertencia"*.

Nada de eso es interesante por separado. Lo interesante son dos cosas que
salieron por el camino.

### El estado vacío es el estado real

Los arreglos venían de una cuenta con mediciones corporales pero **sin plan de
nutrición ni de entrenamiento todavía** — es decir, el estado exacto de
cualquier persona que se registra. Y ese estado estaba sin diseñar.

La tarjeta "Calorías hoy" pintaba `2120 kcal / Objetivo: 0 kcal / 0%`: tres
números que no significan nada juntos. "Macronutrientes" hacía directamente
`return null`, con lo cual la tarjeta quedaba vacía **y su propio título se iba
al centro** — porque el contenedor da la altura sobrante a su último hijo, y sin
contenido ese hijo era la cabecera.

El estado vacío no es un caso borde. Es el primer estado que ve todo el mundo, y
es el único que se ve durante el 100% del tiempo antes de que el producto sirva
para algo.

### Los tests que no pueden ver

Los tres bugs de layout llegaron a mano, y uno de ellos dos veces. Tenía 674
tests de Vitest en verde mientras la app tenía dos barras de scroll.

No es un fallo de cobertura. **jsdom no hace layout**: todo elemento mide 0×0.
Una suite de jsdom no puede detectar que una tarjeta desborde su columna, que
aparezca un segundo scroller, ni que un relleno que debía ser translúcido se
pinte opaco. Está estructuralmente ciega a esa clase entera de bugs, y no importa
cuántos tests le añadas.

Así que monté cinco checks de layout con Playwright contra un navegador real:
sin desbordamiento horizontal, un solo scroller, glass activo, la rejilla móvil
alineada, y las tarjetas de una misma fila con la misma altura.

Y aquí está la parte que me importa: **cada check se verificó revirtiendo el bug
que debe cazar**. Restauré el frame de altura-viewport y el check de scroller
falló en seis rutas, nombrando al culpable. Moví el bloque `@supports` del glass
por encima del menú y el check falló con:

```
[role="menu"] is painted opaque (rgb(22, 27, 34))
```

Un test que nunca has visto fallar no es un test. Es una afirmación sin
comprobar, escrita con la sintaxis de un test.

Los anchos tampoco son redondos por capricho: 574 px es exactamente donde la
rejilla seguía a dos columnas cuando ya debía haber colapsado. El check está
anclado al bug, no a un número bonito.

## Los catálogos: el trabajo de verdad

Y llegamos a la segunda mitad, que es siete PRs y siete migraciones.

### El modelo, que es toda la decisión

| Tabla | Responde a | Ámbito |
|---|---|---|
| `food_catalog` | qué vale un alimento nutricionalmente | global |
| `store_product` | dónde se compra, en qué formato, a qué precio | global (**nuevo**) |
| `shopping_products` | qué compra *esta cuenta* esta semana | por usuario |

Tres decisiones que costaron mucho más pensarlas que escribirlas:

**Una tabla con columna `store`, no una tabla por cadena.** Las columnas de un
producto son idénticas en cualquier supermercado. Añadir Carrefour es un valor
de enum y una edición del `CHECK`; una tabla por cadena sería duplicar el
esquema y todas las consultas para siempre.

**El precio del formato no es el coste semanal.** Una migración vieja guardaba
el coste prorrateado —0,15 botellas de aceite— en el campo de precio. Eso es una
propiedad **del plan de una persona**, no del producto, así que no viaja al
catálogo compartido. Los dos números son euros y por eso el error es fácil; son
euros que responden a preguntas distintas.

**La tabla de categorías no es una lista de categorías.** El conjunto sigue
cerrado, en los enums del dominio y en los `CHECK` de tres migraciones. La tabla
nueva solo dice **cómo se lee** cada miembro: su etiqueta y su glifo. La
consecuencia es que esa pestaña edita, pero no crea ni borra — una categoría
creada ahí no podría archivarse en nada, porque el `CHECK` la rechazaría, y una
borrada dejaría sin nada que pintar a las filas que la usan.

Una acción que siempre falla es peor que no ofrecer la acción.

Y el rol de administrador: **no hay magia de "el primer usuario es admin"**.
Promocionar una cuenta es un `UPDATE` deliberado en base de datos. Es menos
cómodo y evita crear un administrador por accidente en el primer despliegue. Lo
que protege el catálogo es la anotación de seguridad en el backend; el guardián
de la ruta en el frontend es cortesía para quien teclee la URL, no una barrera.

### Sondear una API que no quiere que la sondees

Rellenar el catálogo a mano son 23 productos transcritos de una hoja de cálculo.
Rellenarlo de verdad es leer la tienda. Así que fui a la API de Mercadona, y lo
que encontré cambió el diseño entero:

| Hallazgo | Consecuencia en el código |
|---|---|
| **No hay endpoint de búsqueda.** `/api/products/?q=`, `/api/search/` y `/api/products/search/` devuelven 404. Su buscador va por Algolia, con claves incrustadas en su frontend | Hay que rastrear entero: 26 categorías → 151 subcategorías → **4.620 productos**. Snapshot cacheado 24 h, una vez al día y no una vez por pregunta |
| **La información nutricional no trae macros**, solo alérgenos e ingredientes en texto libre | Esto rellena el catálogo de tienda. El de macros sigue siendo curación manual, y el enlace producto ↔ alimento sigue siendo criterio humano |
| Sí trae EAN, marca, origen y formato de envase | El formato se compone como "Garrafa 5 l": el envase solo no dice cuánto lleva |

Lo importante es que **no es una API pública**. Es la de su tienda: sin
documentar, sin versionar y libre de cambiar o negarse cuando le apetezca. El
adaptador está escrito a esa realidad, y las tres reglas se explican solas:

- **Una subcategoría que falla se salta.** Un estante de 151 no vale tumbar el
  rastreo entero; lo contrario haría que cada importación dependiese del rincón
  menos fiable de su API.
- **El índice fallando sí es fatal.** Sin categorías no hay nada que rastrear, y
  contestar con lista vacía diría "Mercadona no vende nada", que es una mentira
  con cara de respuesta.
- **Los fallos salen como error del proveedor**, el mismo trato que ya tenía
  Withings, para que la pantalla ofrezca "reintentar" en vez de afirmar que el
  alimento no existe.

Es una comodidad para rellenar mi catálogo, **nunca una dependencia**. Si
Mercadona deja de responder mañana, el catálogo y la lista de la compra siguen
funcionando exactamente igual.

Un detalle que casi se me pasa: el endpoint de importación es **solo para
administradores aunque solo lea**. Sin eso, cualquiera con una cuenta podría
hacer que mi servidor rastree la web de un tercero. Un endpoint de solo lectura
que sale a internet no es un endpoint de solo lectura.

### Sugiere, nunca importa solo

Mercadona sabe cómo se llama un producto, qué formato tiene y cuánto cuesta. No
sabe **qué alimento es** ni **en cuál de mis seis secciones va**, y esos dos
campos son justo los que hacen útil una fila. Así que la pantalla propone
candidatos y el administrador elige. Un producto importado acaba siendo
indistinguible de uno tecleado a mano, porque debe serlo.

El emparejamiento es deliberadamente tosco: normalizar, descartar las palabras
que lleva toda etiqueta española (`de`, `con`, `sin`…) y quedarse con lo que
comparte alguna palabra con sentido. Sin el filtro de palabras vacías, "Aceite
**de** oliva" casa con media tienda. Es un filtro sobre miles de referencias, no
una decisión: una sugerencia equivocada cuesta un vistazo, y una que falta
cuesta el alta manual que ibas a hacer igualmente.

De los 23 productos sembrados, **21 emparejados a mano** contra el catálogo real
—los copos de avena costaban 1,30 € y la hoja decía 1,55 €—. Los dos que
quedaron sueltos, whey protein y boniato, es porque Mercadona no los vende. Para
ellos entró una tienda **OTRAS**: un valor del conjunto, no una columna
nullable. Con `NULL` significando "sin tienda", *"Todas"* y *"Sin tienda"*
serían dos preguntas distintas respondidas por la misma ausencia.

## Lowlights

**Un formulario que perdía datos en silencio.** El formulario de producto
construía el objeto a guardar campo a campo desde su propio estado — y el id de
tienda y la URL de la imagen **no son campos suyos**, porque el formulario no
los muestra. Así que los descartaba. Todo producto importado se guardaba sin
origen y sin foto: es decir, sin poder refrescarse nunca. Un formulario que
*construye* el objeto en vez de partir del borrador pierde todo lo que no pinta.
Son **procedencia, no edición**.

**Perdí una PR por mergear con `--delete-branch`.** Iba apilada sobre otra; al
borrar la rama base, GitHub la cerró en vez de reapuntarla a `main`. Hubo que
rehacerla rebasada, con el mismo contenido y un número nuevo. Las dos PRs
apiladas que vinieron después llevan el aviso escrito en el cuerpo. Las PRs
encadenadas son la forma correcta de mantener las revisiones pequeñas, pero
tienen su propia ergonomía y hay que aprenderla pagando.

**Un token CSS que nadie había declarado.** Recoloreando las series del
dashboard salió que `--color-info` **no existía**. Dos hojas de estilo escribían
`var(--color-info, #3b82f6)`: una referencia a un token inexistente, así que
ambas usaban el fallback en silencio y el tema claro se quedaba con un azul
elegido para fondo oscuro, con contraste por debajo del mínimo que necesita una
línea de gráfica. El fallback de `var()` es cómodo y por eso es peligroso:
convierte un token que falta en un valor plausible en lugar de en un error.

**Botones que llevaban tres meses siendo atrezzo.** Los selectores 7D / 30D /
Todos del widget de evolución eran `<span>`s inertes bajo `aria-hidden`,
justificados con "ningún endpoint acepta rango de fechas". El rango **nunca
necesitó endpoint**: el histórico completo ya estaba en memoria, y otra pantalla
del mismo proyecto lo filtraba en cliente desde hacía semanas. Una suposición
que nadie verificó se convirtió en un comentario, y el comentario en una
justificación.

## El hilo

Retiré una feature esta semana. Los Objetivos salieron de la aplicación: −1.728
líneas de frontend, conservando backend, tablas y datos guardados, de forma que
revertir es restaurar una entrada de menú y una ruta.

Pero antes de borrar rastreé quién consumía aquello, y ahí apareció que dos
logros del catálogo —"primer objetivo creado", "primer objetivo conseguido"—
**no son visibles**: el endpoint existe, y ningún fichero del frontend lo llama.
Código de backend en producción, con tests, que nadie ha ejecutado nunca desde
la aplicación.

Ese es el hilo de la semana, y conecta las tres mitades. La integración que
parecía terminada fallaba en el único camino que nadie observaba. Los tests
verdes eran ciegos a una clase entera de bugs. Los botones del gráfico eran
decorativos. Los logros no tienen pantalla. El catálogo vivía en una hoja de
cálculo.

**Nada de eso se ve, y todo eso decide si lo que se ve sirve.**

Y por eso la semana de fontanería importa más de lo que parece cuando se
construye con agentes: un agente escribe la feature vistosa a la velocidad a la
que se la pidas. Lo que no puede hacer por ti es decidir que el precio del
formato y el coste semanal son dos números distintos, o que la tabla de
categorías no debe permitir crear categorías. Esas decisiones son el producto.
El código es la consecuencia.

## La semana que viene

Generación del **plan de nutrición** y del **plan de entrenamiento**. Por fin la
parte vistosa.

Con una diferencia respecto a como habría empezado hace un mes: ahora el plan se
va a escribir sobre un vocabulario que existe, que es editable sin desplegar y
que está emparejado con productos reales de una tienda real a precios reales.

Si el catálogo miente sobre lo que vale un alimento o sobre dónde se compra, el
plan generado hereda la mentira **y la presenta con toda la confianza del
mundo**. Ese es el fallo que quería hacer imposible antes de escribir la primera
línea del generador.
