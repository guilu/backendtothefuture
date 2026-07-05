---
title: "Un agente de IA operando mi homelab con Home Assistant"
date: "2026-06-28"
description: "Una semana usando Hermes como operador de casa: Home Assistant en armv7, integraciones rotas, Plex, Blink, estadísticas corruptas y pequeñas automatizaciones que ahorran sustos."
tags: ["ai-agents", "home-assistant", "homelab"]
thumb: "/blog/ai-agent-as-home-lab-operator-thumb.webp"
cover: "/blog/ai-agent-as-home-lab-operator-cover.webp"
ogImage: "/blog/ai-agent-as-home-lab-operator-og.jpg"
---

## La semana en una frase

Esta semana no fue de construir una feature bonita desde cero. Fue de esas semanas más reales: mantener vivo un homelab con piezas antiguas, integraciones que cambian por debajo, servicios que se actualizan a medias y una Raspberry de 32 bits que ya vive en el borde de lo soportado.

La diferencia es que esta vez no lo hice solo con terminales y memoria. Lo hice con Hermes como operador: mirando logs, comparando versiones, entrando por SSH, tocando ficheros con backup previo, validando después de cada cambio y convirtiendo lo repetible en skills.

## Home Assistant: vivir en 32 bits

El punto de partida era Home Assistant en una Raspberry armv7/32-bit. Funciona, pero ya no puede subir a cualquier versión que salga. En concreto estaba en `2025.11.3`, que es la última versión que permite esa plataforma.

Eso hizo que una actualización aparentemente normal de la integración Smart M-Air, para controlar los Mitsubishi WF-RAC, no se pudiera instalar desde HACS. La versión nueva anunciada era `2025.12-v2`, pero pedía Home Assistant 2025.12. HACS no estaba fallando: estaba protegiendo el sistema.

La solución fue la aburrida y correcta: no forzar. Instalar la versión compatible, dejar Smart M-Air en `2025.2` y verificar que la integración seguía funcionando sin errores relevantes en logs.

La lección aquí es bastante simple: cuando el host se queda limitado por arquitectura, el problema deja de ser "actualizar todo" y pasa a ser "saber exactamente qué no actualizar".

## Limpiar lo que ya no existe

También apareció un clásico del homelab: cosas que no existen, pero siguen apareciendo.

Node-RED seguía en el menú lateral de Home Assistant. No había contenedor, no había integración activa, no había servicio escuchando. Al final no era infraestructura real: era un dashboard Lovelace antiguo con `show_in_sidebar: true` apuntando a un iframe.

Portainer tenía una historia parecida, pero con más matices. El servicio estaba bien separado en su propio `docker-compose.yml`, con sus datos en su carpeta y acceso directo funcionando por `http://homeassistant.local:9000`. Lo que no era fiable era embeberlo dentro de Home Assistant como iframe: el login fallaba con errores de sesión y autorización.

La conclusión práctica fue quitarlo del lateral y usarlo fuera. No todo lo que se puede meter en Home Assistant debe vivir dentro de Home Assistant.

## Plex: automatizar lo que antes era manual

Plex corría en otro nodo, `black.local`, también sobre ARM. Home Assistant detectaba una actualización, pero la entidad `update.black_actualizar` no daba una URL de descarga útil. Además, desde dentro del contenedor de Home Assistant `black.local` no resolvía bien por mDNS, aunque `black` sí funcionaba.

Aquí el trabajo fue convertir una operación manual en una rutina reutilizable:

- detectar versión instalada y última versión;
- confirmar arquitectura `armv7l` / `armhf`;
- descargar el paquete `.deb` correcto para `linux-armv7neon`;
- validar paquete, versión y arquitectura antes de instalar;
- copiar por SSH al servidor;
- ejecutar `dpkg -i`;
- verificar servicio y endpoint `/identity` después.

Eso acabó como una skill de Hermes para actualizar Plex en `black.local`. No es una gran pieza de software. Es mejor: es una pequeña automatización que elimina una clase de errores futuros.

## Cuando un gráfico falla por una fila corrupta

El bug más curioso de la semana estaba en una tarjeta de coste energético del aire acondicionado del dormitorio. Home Assistant mostraba un error genérico, pero en logs aparecía un `TypeError` dentro de `recorder.statistics.statistic_during_period`.

La causa no era la tarjeta. Era la base de datos de estadísticas: había filas para `sensor.aire_dormitorio_energy_usage_cycle_cost` con `start_ts` a `NULL` en `statistics` y `statistics_short_term`.

La limpieza fue quirúrgica:

- identificar el `metadata_id` del sensor;
- exportar backup de las filas afectadas;
- borrar solo las filas con `start_ts IS NULL` de ese sensor;
- reiniciar Home Assistant;
- comprobar que no quedaban errores de recorder.

Después, en lugar de insistir con `utility_meter` para sensores de coste que no encajaban bien por `state_class`, acabé creando un sensor SQL: coste mensual total de los cuatro aires, calculado directamente desde estadísticas largas.

Es una solución menos vistosa que arrastrar bloques en la UI, pero mucho más honesta: si el dato bueno está en recorder, lee recorder.

## Blink y el coste de quedarse atrás

Blink fue otro ejemplo de dependencia rota por el paso del tiempo. Las credenciales eran correctas, pero la integración fallaba con `UnauthorizedError`. Probando fuera de Home Assistant apareció la pista: la versión de `blinkpy` incluida en HA 2025.11.3 era antigua para el flujo actual de login de Blink/Amazon.

Con `blinkpy 0.25.7` el login ya avanzaba hasta 2FA y la integración terminó cargando cámaras y alarma.

La parte fea es que el parche vive dentro del contenedor. Si se recrea la imagen, habrá que reaplicarlo. Pero también es una buena fotografía del estado real de muchos homelabs: a veces la solución no es perfecta, es explícita, documentada y reversible.

## Lo importante no fue arreglar cosas

Lo importante de la semana no fue que Smart M-Air funcionara, que Plex quedara actualizado o que Blink volviera a cargar.

Lo importante fue el patrón:

- mirar primero el estado real del sistema;
- no forzar versiones incompatibles;
- hacer backup antes de tocar almacenamiento interno;
- cambiar una cosa cada vez;
- validar con logs, HTTP, contenedores o SQL;
- convertir lo repetible en una skill.

Ese último punto es el que más cambia el flujo. Antes, cada operación de mantenimiento era una mezcla de notas, comandos recordados y algo de intuición. Ahora, cuando una operación se repite o tiene riesgo, la convierto en memoria operacional para el agente.

## Mi conclusión

Un agente de IA no sustituye saber cómo funciona tu infraestructura. De hecho, si no entiendes el sistema, probablemente solo te ayude a romperlo más rápido.

Pero usado bien, como operador asistido, sí cambia la experiencia. Reduce la fricción de investigar, obliga a dejar evidencia, recuerda procedimientos y convierte una tarde de mantenimiento en algo que se puede repetir con menos miedo.

Esta semana Hermes no escribió mucho código nuevo. Hizo algo más mundano y más útil: mantuvo la casa funcionando.
