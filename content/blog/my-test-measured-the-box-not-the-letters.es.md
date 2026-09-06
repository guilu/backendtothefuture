---
title: "Mi test medía la caja, no las letras"
date: "2026-09-06"
description: "Semana del 31 de agosto al 6 de septiembre: una semana de vacaciones en la que sólo hubo tiempo de mirar. Y mirando aparecieron tres bugs que tenían el CI en verde: un titular recortado, un consentimiento que no consentía y un botón encima de otros tres."
tags: ["weekly", "forma", "testing", "playwright", "css", "analytics", "claude-code", "ai-agents"]
thumb: "/blog/my-test-measured-the-box-not-the-letters-thumb.webp"
cover: "/blog/my-test-measured-the-box-not-the-letters-cover.webp"
ogImage: "/blog/my-test-measured-the-box-not-the-letters-og.jpg"
---

## De dónde partía la semana

De ningún sitio, sinceramente. Esta semana he estado de vacaciones con la
familia en Disneyland Paris, y el plan era exactamente ése: no tocar un
teclado. Nueve prompts en toda la semana, cuatro sesiones, tres ventanas de
trabajo, todas apretadas en el fin de semana. Comparado con las semanas de
veinte PRs, esto es ruido de fondo.

Y sin embargo ha sido una de las semanas que más me ha enseñado del año.
Precisamente porque no hubo tiempo para construir nada. Sólo hubo tiempo para
**mirar**.

Lo que pasó fue esto: abrí una de mis webs en un monitor que no suelo usar, y
estaba rota. Mientras tanto, Hermes —el agente que opera mi infraestructura—
había pasado el fin de semana instrumentando analítica en los cuatro productos,
y se había encontrado dos cosas rotas más. Tres bugs, tres proyectos distintos,
tres días distintos.

Los tres tenían el CI en verde.

## El titular decía «Entrenam»

El domingo por la mañana abrí la landing de Forma en un monitor de 1080x1920
puesto de pie. Es un monitor perfectamente normal —cualquiera que programe
tiene uno en vertical al lado del principal— y la página estaba destrozada. El
titular, que dice «Entrenamiento y nutrición con la compra ya hecha», se leía
**«Entrenam»**.

Sin barra de scroll. Sin warning en consola. Sin un solo error en ningún log.
La palabra simplemente se acababa.

El diagnóstico es una cadena de decisiones razonables que terminan en desastre.
El hero se monta a dos columnas a partir de un breakpoint de 1025px. Un monitor
de 1080px de ancho **supera** ese breakpoint, así que para el CSS eso es
«escritorio». La columna derecha está dimensionada para el dibujo del mapa
muscular —dos siluetas una al lado de otra necesitan unos 32rem antes de dejar
de ser figuras y pasar a ser miniaturas—, y la copy se queda con lo que sobre.
Lo que sobra a 1080px son unos 440px. Y «Entrenamiento» a ese tamaño son unos
512px de Montserrat 900 sin un solo punto por donde partir la palabra.

El contenedor recorta el desbordamiento horizontal. Así que no desbordaba: se
cortaba.

Y aquí viene la parte incómoda. Forma tiene una suite de end-to-end con un
helper que se llama `expectNoHorizontalOverflow`, que existe **exactamente para
cazar esto**. Estaba en verde. Y no es que estuviera mal escrito: es que no
podía verlo, y no podrá verlo nunca.

La caja de bloque del `h1` se detiene obedientemente donde termina su columna.
Son los glifos de dentro los que siguen. Si mides el bloque contra el viewport,
todo cuadra perfectamente, porque el bloque **sí** cabe. El fallo vive en un
nivel al que esa medida no llega.

## Los otros dos

Mientras yo estaba en la cola de una atracción, Hermes estaba convirtiendo la
analítica de los cuatro productos en algo que distinguiera **interés de
resultado**: dejar de contar páginas vistas y empezar a saber si una visita
había producido algo. Un CTA pulsado, un artículo leído de verdad o un click
saliente son señales de interés; un registro completado o un análisis terminado
son resultados. La taxonomía tiene que conservar esa diferencia.

En ese trabajo aparecieron los otros dos bugs, y son el mismo bug.

En mi portfolio, la implementación pasó siete pruebas y compiló las cuatro
páginas. Pero al validar en el navegador desplegado resultó que **Google Tag
Manager se cargaba antes de que el visitante hubiera decidido nada**. Los
handlers de eventos consultaban el consentimiento correctamente —eso era lo que
verificaban los tests— pero el SDK ya estaba dentro de la página, y Google
exponía `analytics_storage` como consentimiento implícito. La suite comprobaba
que los eventos respetaban la decisión del usuario. Nadie comprobaba qué
scripts se habían cargado antes de que hubiera decisión.

En TokenMeter, la suite pasó **258 pruebas**. Y después del despliegue, una
captura de pantalla mostró que el botón flotante de «Analytics settings» estaba
encima de los botones de Sponsor, Buy me a coffee y GitHub. Los 258 tests
verificaban que el diálogo se abría, se cerraba, persistía la decisión y no
enviaba datos personales. Ninguno sabía dónde acababa el botón en el layout
final.

Tres bugs. La misma forma exacta: **verde en CI, roto en pantalla, encontrado
por alguien mirando.**

## Cómo se arreglaron

En Forma, dos decisiones. El breakpoint de dos columnas sube de 1025 a 1280,
que es el primer ancho donde la columna de la copy despeja «Entrenamiento» con
holgura de verdad —un 22% de margen, no los tres píxeles que sobrevivían a
1200—. Por debajo, el hero se apila, que es exactamente lo que ya hacía un iPad
y es mucho mejor trato que dos columnas en las que no cabe ninguna de las dos.

Importante: **no subí el bloque `@media` entero**. Dentro de ese bloque de
1025px había reglas de tipografía de sección que no dependen del reparto en
columnas y que estaban perfectas donde estaban. Sólo se movieron las tres
reglas que sí dependían del grid. Mover un bloque completo porque una regla de
dentro está mal es la forma más rápida de arreglar un bug creando tres.

La segunda decisión: al apilar, la tarjeta del mapa muscular recibe todo el
ancho de la página, y la silueta es 854x1840. Cada píxel de ancho compra más de
dos de alto. Sin tope, a 1080px salía una ilustración de casi 1200px debajo de
450px de copy —dos veces y media la copy— y el dibujo dejaba de ilustrar el
argumento para convertirse en la página. Tope de 34rem y centrada.

![La landing de Forma en un monitor de 1080x1920 en vertical, ya corregida: el hero se apila, el titular se lee entero y la tarjeta del mapa muscular queda debajo con su ancho limitado.](/img/forma-2026-09-06-hero-vertical.webp)

En el portfolio, la corrección no fue añadir una comprobación más: fue **mover
el bloqueo al punto de carga**. Se eliminó el iframe `noscript`, se impidió
cargar GTM antes de una aceptación explícita, se añadió un banner bilingüe y un
control de privacidad permanente en el footer, y se borran las cookies `_ga` al
retirar el permiso. La suite acabó en 12 de 12.

![El banner de consentimiento del portfolio, que dice explícitamente que Google Tag Manager no se carga hasta que el visitante acepta.](/img/diegobarrioh-2026-09-06-consentimiento.webp)

En TokenMeter, el estado del diálogo subió hasta el `AppShell` y el control
flotante se convirtió en un botón `Privacy` dentro de la fila de Support del
footer, alineado con los otros tres. Y se añadió una prueba que impide volver a
introducir posicionamiento `fixed` ahí, porque un bug que ya te ha mordido una
vez merece un guardarraíl.

![La fila de Support del footer de TokenMeter, con Sponsor, Buy me a coffee, GitHub y Privacy alineados sin solaparse.](/img/tokenmeter-2026-09-06-privacy-footer.webp)

## La prueba que sí lo ve

Ésta es la parte que me llevo y que creo que sirve a cualquiera que escriba
tests de layout.

La prueba nueva no mide el titular contra el viewport. Mide dónde llegan
**realmente los glifos**, con `Range.getClientRects()`, y lo compara contra la
caja de contenido del propio titular:

```ts
const measured = await title.evaluate((heading) => {
  const range = document.createRange();
  range.selectNodeContents(heading);
  const widest = Math.max(...[...range.getClientRects()].map((line) => line.right));
  const style = getComputedStyle(heading);
  const box = heading.getBoundingClientRect();
  return { widest, columnRight: box.right - parseFloat(style.paddingRight) };
});
```

Dos detalles que importan más que el código.

El primero: se mide **contra la columna, no contra el viewport**. A este ancho
la columna es la restricción que aprieta, y medir contra el viewport es
responder correctamente a la pregunta equivocada.

El segundo: el mensaje de fallo dice literalmente cuántos píxeles alcanza el
titular y dónde termina la columna. Un `expect(true).toBe(false)` no le sirve a
nadie a las once de la noche.

Y el viewport tiene nombre y comentario en el fichero, porque dentro de seis
meses nadie va a recordar por qué existe un tamaño tan raro:

```ts
const PORTRAIT = { width: 1080, height: 1920 };
```

Es el ancho donde «layout de escritorio» y «espacio de escritorio» dejan de ser
lo mismo.

## Lo que me llevo

**Un test verde demuestra el contrato del módulo, no el resultado en pantalla.**
No es un argumento contra los tests: es un argumento sobre qué mide cada uno.
`expectNoHorizontalOverflow` medía bloques contra el viewport, y eso es una
pregunta correcta con una respuesta correcta. Sólo que no era la pregunta que
hacía falta.

**Los breakpoints son una hipótesis sobre el hardware de la gente, no una
verdad.** 1025px asumía que «más ancho que una tablet» significa «espacio de
escritorio». Un monitor puesto de pie rompe esa suposición sin ser nada
exótico.

**Cuando corrijas un breakpoint, mueve las reglas que dependen de él, no el
bloque entero.** Es la diferencia entre arreglar un bug y crear tres.

**El consentimiento no puede ser una condición dentro de la función que envía
el evento** mientras el SDK ya está cargado. El bloqueo tiene que ocurrir en el
punto de carga, y sólo se verifica en un navegador real.

**No inventes capacidades que el backend no tiene.** TokenMeter todavía no
distingue si un análisis sale de caché o se une a uno existente, así que ese
parámetro sólo puede valer `new`. La taxonomía admite los otros valores, pero
primero se amplía el contrato y después se mide. Lo mismo con la suscripción de
este blog: no se creó un evento de registro ficticio porque todavía no hay
formulario que registrar.

## Qué viene

Los eventos nuevos necesitan tráfico real y varios días de procesamiento antes
de que los informes sean representativos, así que la semana que viene toca
observar la secuencia interés → inicio → resultado y ajustar el análisis diario
para usar conversiones y no páginas vistas. Queda también ampliar el contrato
del backend de TokenMeter, y actualizar las dependencias vulnerables de este
blog en su propia PR, sin mezclarlo con nada editorial.

Y volver al ritmo normal. Esta semana Forma no avanzó más allá de un hero.

## La semana en cifras

| Métrica | Valor |
|---|---|
| PRs fusionadas | 8 (Forma #268 · blog #35 · portfolio #11, #12 · TokenMeter #73, #74, #75 · akadem.ia #146) |
| Líneas | +1.601 / −113 |
| Despliegues a producción | 5 (los cuatro productos instrumentados + convergencia autónoma de Forma) |
| Migraciones Flyway | 0 |
| Mis sesiones | 4 sesiones · 3 ventanas de 5 horas · 9 prompts |
| Ventana semanal de Claude Code | Sin agotar (vacaciones) |
| Sesiones de Hermes | 9 sesiones · 29 prompts · 601 llamadas a herramientas |
| Tokens de Hermes | ~1,97 M de entrada · 108.613 de salida |
| Suites verificadas | 406 akadem.ia · 258 TokenMeter · 12 portfolio · 4 blog · +2 e2e en Forma |
| Propiedades GA4 instrumentadas | 4, con eventos clave y dimensiones personalizadas |
| Sustos | 1 (`npm run format` accidental en TokenMeter: 57 ficheros restaurados antes del commit) |
| Skills usadas | `branch-pr`, `work-unit-commits`, `recap` |

> <small>Las capturas están tomadas de los despliegues de preproducción, de ahí
> el distintivo PREPRO en las cabeceras. Son el estado real de cada sitio tras
> los merges de esta semana, no maquetas.</small>
