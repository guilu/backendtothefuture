---
title: "Configurado no significa funcionando"
date: "2026-10-04"
description: "Semana del 28 de septiembre al 4 de octubre. Un router nuevo, un portátil que se quedó sin Wi‑Fi tras actualizar, un backup cifrado que había que poder restaurar y el nacimiento de Skynet: cuatro frentes con la misma lección, que un sistema no está listo cuando su configuración existe, sino cuando la ruta completa responde."
tags: ["weekly", "homelab", "ai-agents", "skynet", "backups", "networking", "event-sourcing", "observability"]
thumb: "/blog/configured-isnt-the-same-as-working-thumb.webp"
cover: "/blog/configured-isnt-the-same-as-working-cover.webp"
ogImage: "/blog/configured-isnt-the-same-as-working-og.jpg"
---

## Lo que nos propusimos

Esta semana el código de producto pasó a segundo plano. Forma descansó, y el
protagonismo se lo llevó la infraestructura de casa y una idea nueva.

Diego compró un router Wi‑Fi 7 para sustituir uno que llevaba años
funcionando. Cambiar un router suena a tarde de sábado: lo enchufas, copias la
contraseña de la Wi‑Fi y listo. Pero detrás de ese router viven la fibra con
su perfil de tres VLAN, las reservas DHCP de cada máquina, los puertos que
llegan a los servicios que se publican desde casa y el script que mantiene los
dominios apuntando a la IP pública. Si algo de eso se rompe, se caen a la vez
Forma, Akademia, TokenMeter y este blog.

Así que Hermes, el agente que opera la infraestructura de casa, lo trató como
una migración de verdad: inventario, entorno aislado y plan de vuelta atrás.

En paralelo nació **Skynet**. Los agentes de desarrollo ya escriben
especificaciones, tests, código y pull requests, pero todo eso pasa en
terminales y desaparece cuando las cierras. Faltaba un sitio donde ver qué
hace cada agente, con qué prompt, en qué estado está y qué ha producido. Un
panel de control para la fábrica.

## Los problemas que nos encontramos

### Dos caminos a Internet, ninguno funcionando

El router nuevo se configuró conectado por cable a un equipo Windows, mientras
la Wi‑Fi del mismo equipo seguía saliendo a Internet por la red de siempre. Un
montaje razonable. Y de repente el equipo dejó de navegar, aunque estaba
«conectado» por los dos lados.

El problema no estaba en el router: eran dos interfaces anunciando cada una su
ruta por defecto. El sistema elegía la que no llevaba a ninguna parte. La
tentación en ese momento es tocar opciones del router hasta que algo cambie;
lo que funcionó fue separar a propósito la ruta para administrar el router de
la ruta para salir a Internet.

Luego vino el asistente de ASUS, que guardó la configuración a medias. Tras un
reinicio ya no mostraba el asistente, pero pedía unas credenciales creadas
durante el intento fallido. Un estado intermedio que la interfaz no reconocía
como tal.

### Una actualización que convirtió el rollback en necesidad

Con la red ya migrada, se actualizó Omarchy, el portátil Linux que sirve las
aplicaciones. Al reiniciar, la tarjeta Wi‑Fi Broadcom dejó de existir. El
driver se compila contra el kernel, y el kernel había cambiado sin que el
driver lo acompañase. Hubo que tirar de un adaptador USB mientras se alineaban
de nuevo driver y cabeceras del kernel.

Volvió el escritorio, volvió la red… y ahí empezó el fallo más interesante de
la semana.

### Un proceso vivo no lee tu configuración

El usuario de Hermes ya pertenecía al grupo `docker`. Estaba en la
configuración, el comando que lo comprueba lo confirmaba. Y aun así el gateway
de Hermes y algunas tareas programadas no podían hablar con Docker: permiso
denegado.

La razón es sencilla una vez la ves. Los grupos de un proceso se fijan cuando
el proceso arranca. Añadir un usuario a un grupo cambia lo que tendrán los
procesos **futuros**; el que ya está corriendo sigue con los grupos que heredó.
Bastó con reiniciar el gateway. Pero la lección es más amplia que Docker: la
configuración persistente de una cuenta y las credenciales efectivas de un
proceso vivo son dos estados distintos, y solo uno de ellos es el que importa.

### Un backup que funciona no es un backup que se restaura

Antes de asumir más riesgo, Hermes montó un backup semanal y cifrado de todo
su estado hacia el NAS. Comprimir directorios es fácil. Lo difícil es saber que
podrás recuperarlo.

Así que el backup no se da por bueno al escribirse. Se descifra en streaming,
se recorre rechazando rutas peligrosas y enlaces, y cada base de datos SQLite
se copia de forma transaccional y pasa una comprobación de integridad. La
clave privada no vive en el NAS: se comprobó recuperándola desde el gestor de
contraseñas, que es exactamente lo que habría que hacer el día malo.

Y aun así el viernes falló. `rsync` intentaba conservar grupos numéricos que
el destino no conocía. Se corrigió, se repitió, terminó bien. Pero el
vigilante de Telegram siguió avisando de error: buscaba cualquier mensaje
grave en la última hora, y el error del primer intento seguía ahí. Un monitor
que lee una ventana de logs sin mirar el estado final de la tarea te dice lo
que pasó, no lo que hay.

### Un webhook que debía funcionar y no llegaba

Para Skynet se quiso despliegue automático: cada vez que se abre o se fusiona
una pull request, se reconstruye. El webhook primero devolvió 405, porque el
nginx de entrada solo tenía una ruta exacta, la de Forma. Al arreglarlo, la
petición se quedó colgada: el cortafuegos de Omarchy bloqueaba ese puerto
desde la red local.

Lo incómodo fue lo que eso destapó. La ruta del webhook de **Forma** tenía el
mismo problema. Su configuración era válida, nadie la había visto fallar…
y no era operativa. La solución fue apuntar los webhooks a la IP de Tailscale
de Omarchy y comprobar con una petición firmada real que cruzaba nginx y
llegaba a Hermes.

### Lo que la CLI no te cuenta

Skynet tiene que entender lo que emite Claude Code mientras trabaja. Antes de
escribir una sola línea del parser, se grabaron nueve sesiones reales: con
herramientas, reanudadas, bifurcadas, canceladas, sin presupuesto, con
permisos denegados.

Las grabaciones contaron cosas que la documentación no. El límite de
presupuesto no es un límite duro. Una cancelación no emite la línea final de
resultado que todo parser espera. El coste es acumulado por sesión, así que al
reanudar arrastra el de antes. Y hay una opción que funciona pero no aparece
en la ayuda. Un parser escrito contra `--help` habría sido un parser escrito
contra una promesa.

## Cómo lo resolvimos

El router quedó en producción con su perfil de fibra, sus reservas, sus
puertos y un firmware Merlin. La configuración del modelo antiguo no se
restauró a ciegas: se reconstruyó lo necesario y se verificó capa a capa. El
script de DNS dinámico se recuperó de su copia privada, se ejecutó de verdad
reiniciando el servicio y no se dio por bueno hasta que los dominios
resolvieron a la IP nueva y sus páginas respondieron. El router viejo sigue
apagado en un cajón, por si acaso.

Omarchy volvió completo, y no se dio por recuperado al ver el escritorio: SSH,
Docker, el gateway, las tareas programadas, Tailscale, el NAS y cada
aplicación publicada, comprobada desde fuera.

Skynet tiene ya sus cimientos y su modelo de dominio en `main`: proyectos,
repositorios, trabajos, ejecuciones y un timeline de eventos que se ve en vivo.
Se despliega solo en la red privada de Tailscale; nada está expuesto a
Internet, y la base de datos ni siquiera publica puerto.

Esta es la primera vida de Skynet, registrándose a sí mismo como proyecto:

![Pantalla «Actividad (en vivo)» de Skynet en tema oscuro. Arriba, la barra con «Skynet», «Proyectos», «Actividad» y, a la derecha, «Control plane: disponible» en verde. Debajo, seis eventos con el más reciente arriba; en orden cronológico: 13:48:44 project.created «Proyecto SKY creado»; 13:49:45 repository.registered «Repositorio Skynet registrado»; 13:50:09 workitem.created «Trabajo SKY-1 creado: Nuevo bug»; 13:50:31 workflow.started «Ejecución iniciada (workflow adhoc)»; 13:50:31 stage.ready «Fase agent preparada (intento 1)»; y 13:50:31 agent.spawned «Agente claude-code en cola»](/img/skynet-2026-10-04-timeline.webp)

El agente se queda «en cola» porque el runner que lo ejecutará llega en el
siguiente hito. Pero todo lo de arriba ya es real, ya está en la base de datos
y ya se reproduce si recargas.

![Página del proyecto «SKY · Skynet» con la descripción «Mi red de agentes que van a destruir el mundo». A la izquierda, «Repositorios», con el propio repositorio de Skynet registrado en la rama main y el formulario para registrar otro (nombre, ruta local en la máquina del runner, rama por defecto). A la derecha, «Trabajos», con «SKY-1 Nuevo bug» en estado Abierto y el formulario para crear uno nuevo, con un selector de tipo: funcionalidad, bug, refactoring, dependencias, incidente o revisión de seguridad](/img/skynet-2026-10-04-proyecto.webp)

#### El único fragmento técnico de este post

Un timeline en vivo parece fácil: guardas eventos con un número creciente y
el cliente pide «dame lo que haya después del 41». El problema es que el
número se asigna cuando empieza la transacción y el evento se vuelve visible
cuando termina.

Si dos transacciones cogen el 42 y el 43, y la del 43 confirma primero, el
lector ve el 43, avanza su cursor hasta ahí… y cuando el 42 aparece un
instante después, el lector ya ha pasado. Se lo ha saltado para siempre, sin
error y sin aviso.

Skynet lo resuelve asignando la secuencia bajo un bloqueo que se mantiene
hasta el commit. El coste es serializar las escrituras de eventos; la
ganancia es una garantía que vale oro: si lees «todo lo posterior a N», no te
dejas nada. Con eso, la misma tabla de eventos sirve de outbox para difundir
en vivo, el cliente puede reconectarse con el último identificador que vio sin
huecos ni duplicados, y un trigger impide que nadie modifique o borre la
historia.

Es la versión en base de datos de la lección de la semana: el orden en que
algo se *declara* no es el orden en que *existe*.

## Lo que no salió bien

- **El primer despliegue de Skynet chocó con puertos ocupados** y tuvo que
  moverse. Nada grave, pero fue otra cosa que «debía» funcionar.
- **El vigilante del backup avisó de un error ya corregido.** Hay que
  reconciliarlo con el estado final de la tarea.
- **M2 no se cerró.** El contrato del runner y el parser de Claude Code están
  en una pull request abierta, con la CI en verde, pero sin fusionar. No cuenta
  como entregado.
- **Los dispositivos de casa sin Tailscale no llegan a Skynet.** Es a
  propósito, pero queda pendiente decidir un acceso local con autenticación.

## Lo que me llevo

**Un servicio no está listo porque su configuración exista. Está listo cuando
la ruta completa responde, comprobada desde el cliente correcto.** El webhook
de Forma era válido y no funcionaba. El usuario estaba en el grupo y el
proceso no. El backup se escribía y había que demostrar que se leía.

Y esa misma idea es la que da forma a Skynet: el sistema no se cree lo que el
agente cuenta que ha hecho. Comprueba el commit, el diff y los tests por su
cuenta. La narración del modelo es una afirmación más.

La semana que viene: fusionar M2 y que el primer agente salga de la cola de
verdad, decidir el acceso local a Skynet y ver pasar una segunda ejecución
semanal del backup sin sustos.

## La semana en cifras

<div class="week-stats">

<div class="ws-pulse">
  <span class="ws-pulse-title">Commits en Skynet por día</span>
  <div class="ws-days">
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>L</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>M</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>X</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>J</b></div>
    <div class="ws-day" data-on="0"><span class="ws-bar" style="--v:0;--max:4"></span><b>V</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:4;--max:4"></span><b>S</b></div>
    <div class="ws-day" data-on="1"><span class="ws-bar" style="--v:3;--max:4"></span><b>D</b></div>
  </div>
  <span class="ws-pulse-foot">7 commits · sábado 09:00 → domingo 11:15 · de lunes a viernes el trabajo fue de infraestructura, en manos de Hermes</span>
</div>

<div class="ws-row">
  <span class="ws-i">🔀</span>
  <span class="ws-k">PRs mergeadas</span>
  <span class="ws-v">3</span>
  <span class="ws-note">Todas en Skynet: plan, M0 y M1 · M2 abierta con la CI en verde</span>
</div>

<div class="ws-row">
  <span class="ws-i">📊</span>
  <span class="ws-k">Líneas a <code>main</code></span>
  <span class="ws-v">+9.261 / −84</span>
  <span class="ws-meter"><i class="ws-add" style="width:99%"></i><i class="ws-del" style="width:1%"></i></span>
  <span class="ws-note">Un proyecto que nace: casi todo son líneas nuevas</span>
</div>

<div class="ws-row">
  <span class="ws-i">🐘</span>
  <span class="ws-k">Migraciones Flyway</span>
  <span class="ws-v">V1 → V2</span>
  <span class="ws-note">Línea base y modelo central de Skynet · verificadas con Testcontainers y PostgreSQL 16</span>
</div>

<div class="ws-row">
  <span class="ws-i">🎞️</span>
  <span class="ws-k">Sesiones de Claude Code grabadas</span>
  <span class="ws-v">9</span>
  <span class="ws-note">Fixtures reales para el parser: cancelación, fork, presupuesto agotado, permisos denegados…</span>
</div>

<div class="ws-row">
  <span class="ws-i">💾</span>
  <span class="ws-k">Backup cifrado de Hermes</span>
  <span class="ws-v">1,63 GB</span>
  <span class="ws-note">8 bases SQLite íntegras · retención de 3 generaciones · el viernes, 1,59 GB tras el reintento</span>
</div>

<div class="ws-row">
  <span class="ws-i">🌐</span>
  <span class="ws-k">Router migrado</span>
  <span class="ws-v">1</span>
  <span class="ws-note">PPPoE, triple VLAN, reservas DHCP, puertos y DNS dinámico verificados · el viejo, apagado como rollback</span>
</div>

<div class="ws-row">
  <span class="ws-i">💬</span>
  <span class="ws-k">Prompts a Hermes</span>
  <span class="ws-v">193</span>
  <span class="ws-note">En 16 sesiones, con 621 llamadas a herramientas</span>
</div>

</div>

<blockquote><small>Las capturas son del despliegue privado de Skynet el
domingo, con los datos reales que tenía en ese momento.</small></blockquote>
