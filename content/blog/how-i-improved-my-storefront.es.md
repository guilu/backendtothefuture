---
title: "Así mejoré mi escaparate: web, LinkedIn y blog"
date: "2026-09-13"
description: "Semana del 7 al 13 de septiembre: revisando el escaparate —mi web, mi LinkedIn y este blog— descubrí que casi todo lo roto eran promesas. Flechas que no llevaban a ningún sitio, un idioma que Google no podía leer, una tarjeta ilegible en el feed y una ficha de proyecto que exageraba."
tags: ["weekly", "ux", "seo", "accessibility", "i18n", "css", "linkedin", "claude-code"]
thumb: "/blog/how-i-improved-my-storefront-thumb.webp"
cover: "/blog/how-i-improved-my-storefront-cover.webp"
ogImage: "/blog/how-i-improved-my-storefront-og.jpg"
---

## De dónde partía la semana

Después de una semana de vacaciones tocaba volver a Forma. No volví.

Esta semana no se tocó ni un producto. Se tocó **el escaparate**: todo lo que ve
alguien que llega a mí sin conocerme. Mi web personal, que llevaba meses sin
revisar y no decía una palabra de lo que hago con IA. Mi perfil de LinkedIn, que
es lo primero que mira un reclutador. Y este blog, que es lo que enlazo en todas
partes.

El encargo parecía cosmético: poner al día el texto, añadir los proyectos,
ajustar un par de espacios. Lo que salió al mirarlo de cerca fue otra cosa.
Repasando la semana entera, casi todo lo que arreglé tenía la misma forma:
**algo que prometía una cosa y hacía otra**.

## Promesas que nadie cumplía

### La flecha que no llevaba a ningún sitio

El viernes por la mañana me llegó un detalle pequeño. En la sección de
experiencia de mi web, al pasar el ratón por un puesto de trabajo, una flechita
gris a la derecha se iluminaba en morado. Exactamente como se ilumina un enlace
antes de pinchar. Pero no era un enlace. No llevaba a ningún sitio.

Quitarla fue cambiar dos líneas. Lo interesante vino después, cuando pedí
buscar más detalles de ese tipo. Recorrí la interfaz con una sola pregunta:
**¿qué está prometiendo esto, y lo cumple?** Salieron seis.

Los selectores de tema y de idioma se dibujaban como un control de dos
posiciones, con un chip marcando el lado activo. Eso invita a pinchar en el lado
que quieres. Pero ninguno de los dos funcionaba así: eran interruptores ciegos.
Pinchar el sol estando ya en modo claro te mandaba a oscuro. Pinchar «ES» estando
en español te llevaba al inglés.

Las etiquetas de tecnología se iluminaban al pasar el ratón justo en los sitios
donde nunca se pueden pinchar, y **no** se iluminaban en las fichas que sí
navegan. El nodo del timeline se encendía al hover con el mismo halo que marca el
puesto actual, así que señalar cualquier fila con el ratón la disfrazaba de
trabajo vigente. El menú marcaba «Proyectos» estando en la página de proyectos,
pero esa entrada apuntaba a una sección de la portada. Y no había enlace para
saltar al contenido con el teclado.

Y hubo uno que creé yo mismo esa misma semana. Para que la ficha entera de un
proyecto fuese pinchable, estiré el enlace del título con una capa invisible por
encima de todo. Funcionaba para el clic. Pero una capa por encima del contenido
también se come el arrastre del ratón: **no se podía seleccionar ni copiar la
descripción de un proyecto**. Arreglar una promesa me había hecho romper otra.

### Media web que Google no podía leer

El problema más gordo no se veía en pantalla. Mi web es bilingüe, y la
traducción funcionaba en el navegador: cada página enviaba el español y el
inglés a la vez, en el mismo HTML, y ocultaba con CSS el idioma que no tocaba.

Para una persona, perfecto. Para Google, la mitad de la página era texto oculto,
que devalúa. Los dos idiomas competían por la misma URL. Y no había forma de
decirle al buscador «esta es la versión inglesa de aquella», porque no existía
una aquella.

Además, en una limpieza de hace semanas se habían sacado del índice el CV y los
proyectos para acallar errores de Search Console. El resultado: todo lo que
cuento de RAG, agentes o MCP vivía detrás de un `noindex`. El sitemap tenía dos
URLs.

### Una tarjeta nítida e ilegible

En este blog, el problema llegó desde LinkedIn. Pasé el índice por su Post
Inspector y la imagen de previsualización se veía «con poca resolución».

No tenía poca resolución. Salía a 2400 píxeles de ancho, perfectamente nítida.
Era una captura de la página del blog, maquetada para leerse a 1200 píxeles con
el ojo a medio metro. El feed de LinkedIn la pinta a unos 552. Todo llegaba al
45% de su tamaño: los títulos a unos 8 píxeles, las etiquetas a 4. **Píxeles
nítidos de texto ilegible.** Subir la resolución no habría cambiado nada.

### La ficha que exageraba

Y aquí viene la parte incómoda, porque la promesa falsa la escribí yo.

El objetivo de la web era posicionarme como backend senior con IA aplicada. No
como «AI Engineer»: mi experiencia con IA viene de proyectos personales en
preproducción, y venderla como otra cosa es la forma más rápida de que te
descarten en el primer filtro. Con esa regla clara, la primera versión de la
ficha de Forma que redactó Claude decía que el stack incluía «APIs de LLM y
diseño de prompts».

En el backend de Forma no hay una sola llamada a un LLM. Lo había deducido del
contexto en vez de leer el repositorio.

Lo mismo me pasó en LinkedIn con los textos del perfil: estaban bien escritos, y
se notaba demasiado que los había escrito una IA. Y un detalle más: el CV en PDF
que servía la web era un export de Google Docs de julio, en tamaño Carta, hecho
desde un documento que ni siquiera estaba en el repositorio.

## Cómo se arreglaron

En la interfaz, la regla fue simple: **cada efecto tiene que corresponder a algo
que pasa**. Los selectores de tema e idioma ahora son dos botones, y cada lado
fija su valor; el lado activo del idioma no es un enlace, es la página en la que
estás. El resaltado de las etiquetas sólo existe donde la ficha navega. El halo
del timeline sale del dato «puesto actual», no del ratón, así que ya no depende
ni del orden de la lista. El menú deja de marcar entradas que apuntan a otro
sitio y el scrollspy anuncia la sección también a los lectores de pantalla. Hay
enlace de salto al contenido.

La capa invisible de las fichas desapareció. Ahora la ficha navega con un
manejador de clic que se aparta en cuatro casos: si has pinchado un enlace de
dentro, si llevas una tecla modificadora, si hay texto seleccionado o si otro ya
canceló el evento. Puedes pinchar la ficha entera y también copiar su texto.

![La ficha de Forma en diegobarrioh.dev. Arriba a la derecha, los selectores de idioma y tema convertidos en dos mitades reales: cada lado es un botón que fija su valor.](/img/diegobarrioh-2026-09-13-proyecto-forma.webp)

La traducción pasó al servidor. Cada URL sirve un solo idioma: inglés sin
prefijo, porque el mercado es remoto en Europa, y español bajo `/es/`. Cada
página declara su alternativa en el otro idioma y su canonical. Todos los textos
salieron de las plantillas a dos ficheros tipados, con una comprobación que
rompe el build si falta una clave, porque antes una traducción olvidada se
pintaba como `undefined` sin que nadie se enterase. El CV y los proyectos
volvieron al índice, cada proyecto con su propia página. El sitemap pasó de dos
URLs a catorce.

Las fichas de Forma, Akademia y TokenMeter se reescribieron **leyendo los
repositorios**, no el contexto. Forma dice ahora lo que de verdad hace: acota al
modelo con un catálogo de alimentos medidos y rechaza al importar lo que se
invente. Los textos de LinkedIn los reescribí yo, con mis palabras. Y el CV en
PDF ya no es un fichero suelto: se imprime desde la propia página del CV, en A4 y
en los dos idiomas, así que no puede volver a quedarse viejo.

Este blog y mi web, que hasta ahora sólo se enlazaban a la portada del otro, se
enlazan ahora pieza a pieza: cada proyecto lista los artículos que lo cuentan, y
cada artículo enlaza la ficha del proyecto del que habla.

![La sección «Escrito en el laboratorio» de la ficha de Forma: los artículos de este blog que cuentan el proyecto, enlazados desde la propia ficha.](/img/diegobarrioh-2026-09-13-escrito-en-el-lab.webp)

En el blog, la tarjeta de LinkedIn dejó de ser una captura. Ahora es un cartel
propio, diseñado para el tamaño al que se lee de verdad.

## La tarjeta es otro medio

Ésta es la parte que creo que sirve a cualquiera que comparta enlaces.

Una imagen de previsualización no es una miniatura de tu página. Es **otro
medio**, con otra distancia de lectura, y hay que diseñarla para el tamaño final:

| Elemento | En la tarjeta (1200px) | En el feed (~552px) |
|---|---|---|
| «Blog» | 104px | ~48px |
| Título del último artículo | 46px | ~21px |
| Subtítulo | 30px | ~14px |
| Texto más pequeño | 22px | ~10px |

La regla que salió: nada que haya que leer baja de 22 píxeles a 1200, porque así
sobrevive por encima de 10 en el feed. Ese presupuesto es también por qué cabe
tan poco: un titular, un artículo, una frase. Si no cabe en la tarjeta, no
estaba hecho para la tarjeta.

La tarjeta vive en una ruta propia que nadie enlaza y que los buscadores no
indexan. Existe para poder abrirla en el navegador y editarla como cualquier otro
componente, en vez de dibujarla a ciegas. Y su nombre de fichero se calcula desde
el mismo modelo que la dibuja, así que cuando cambia lo que se pinta cambia la
URL, y LinkedIn no puede quedarse con la versión vieja.

![La tarjeta social del índice del blog, dibujada para leerse a 552 píxeles: la marca, «Blog», el último artículo y poco más.](/img/backendtothefuture-2026-09-13-og-card-blog.webp)

De paso, el propio blog tenía las palabras pegadas. No era una regla mal
escrita: es la fuente. Plus Jakarta Sans tiene un espacio un 35% más estrecho
que una sans de interfaz normal, y el tracking negativo de los titulares lo
estrechaba todavía más, porque `letter-spacing` también encoge el espacio. La
herramienta correcta resultó ser `word-spacing`, que sólo toca ese glifo y deja
intacta la densidad de los titulares.

![La portada de backendtothefuture.com con el nuevo espaciado entre palabras y el hueco entre el texto y la ilustración cerrado.](/img/backendtothefuture-2026-09-13-hero.webp)

## Lo que me llevo

**Un hover es una promesa.** Si algo se ilumina al pasar el ratón, el usuario
espera que pase algo al pinchar. Si no pasa nada, no es un detalle visual: es un
bug de comportamiento que ningún test va a cazar.

**Arreglar una promesa puede romper otra.** La capa que hacía clicable la ficha
entera impedía copiar su texto. Cada cambio de interacción merece la misma
pregunta que el bug original.

**Lo que ocultas con CSS no existe para un buscador.** Si tu web es bilingüe,
cada idioma necesita su propia URL.

**Una tarjeta social se diseña para 552 píxeles**, no se captura a 1200.

**Un agente que escribe sobre tu trabajo tiene que leer tu trabajo.** La ficha
que exageraba no era mala fe: era inferencia. Y en un texto que va a leer un
reclutador, inferir es inventar.

**Un artefacto mantenido a mano caduca.** El CV en PDF llevaba dos meses
contando una historia que la web ya no contaba.

Y una nota que no es técnica: el jueves, minutos después de terminar de
actualizar LinkedIn, llegó una oferta de trabajo. Por la tarde, otra.
Correlación, no causalidad. Pero el escaparate se mira.

## Qué viene

Hermes, el agente que opera mi infraestructura, propuso esta semana una
convención para etiquetar con UTMs cada enlace que comparto del blog. Hoy
LinkedIn y X ya aparecen como origen de visitas, pero no sé qué publicación trajo
cada lectura. Con las etiquetas podré cruzar cada post con los artículos que se
leen de verdad. Queda también apuntar el `robots.txt` de mi web al sitemap
correcto.

Y ahora sí: volver a Forma.

## La semana en cifras

| Métrica | Valor |
|---|---|
| PRs fusionadas | 13 (blog #38–#41 · portfolio #13–#21) |
| Líneas | +4.341 / −1.433 |
| Despliegues a producción | al menos 7 |
| Migraciones Flyway | 0 |
| Mis sesiones | 6 sesiones · 9 ventanas de 5 horas · 66 prompts |
| Ventana semanal de Claude Code | Sin agotar; todo el trabajo entre martes y viernes por la mañana |
| Promesas falsas encontradas en la interfaz | 6, más una creada y deshecha la misma semana |
| URLs en el sitemap del portfolio | 2 → 14 |
| Artículos enlazados a su proyecto | 14, en los dos idiomas |
| Tamaño mínimo de texto en la tarjeta social | 22px (≈10px en el feed) |
| Tests | blog 10/10 · portfolio 12 |
| Sesiones de Hermes | 4 sesiones · 22 prompts · 149 llamadas a herramientas · 51 crons |
| Tokens de Hermes | ~2,38 M de entrada · 91.717 de salida |
| Ofertas recibidas tras actualizar LinkedIn | 2 |
| Skills usadas | `branch-pr`, `recap` |

> <small>Las capturas son de los sitios en producción el 13 de septiembre, con el
> banner de analítica rechazado. La tarjeta social es la que se sirve hoy; cambiará
> en cuanto se publique este artículo, porque muestra siempre el último.</small>
