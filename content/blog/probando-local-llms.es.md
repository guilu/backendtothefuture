---
title: "LLMs locales en una RTX 3060: qué cabe en 12 GB de VRAM"
date: "2026-06-08"
description: "Corriendo Gemma 4 y Qwen 3.5 Coder en local sobre una NVIDIA RTX 3060 de 12 GB — qué entra en esa VRAM y qué rinde de verdad."
tags: ["llm", "local-ai", "gpu"]
thumb: "/blog/probando-local-llms-thumb.webp"
cover: "/blog/probando-local-llms-cover.webp"
---

## Por qué local

Mandar cada prompt a una API en la nube está bien hasta que empiezas a contar latencia, privacidad y factura. Quería ver hasta dónde llega hoy un modelo corriendo **enteramente en local**, sin red, sin tokens de pago, sin que mi código salga de casa.

El detalle divertido: no lo probé en una bestia de laboratorio, sino en el **ordenador de mi hijo**, que monta una **NVIDIA RTX 3060 de 12 GB de VRAM**. Una gráfica de gama media, de las que hay en miles de casas. Justo por eso es el banco de pruebas honesto: si funciona aquí, funciona en cualquier sitio.

## El cuello de botella es la VRAM

Con LLMs locales la pregunta no es "¿cuántos FPS?", es **"¿entra en la VRAM?"**. Si el modelo no cabe entero en los 12 GB, se desborda a RAM del sistema y la velocidad se desploma.

La regla práctica con cuantización en 4 bits (Q4):

- Un modelo de **7–9B** en Q4 ocupa ~5–6 GB → entra cómodo, deja sitio para contexto largo.
- Un modelo de **13–14B** en Q4 ronda los ~9–10 GB → entra, pero justo; el contexto se queda corto.
- A partir de ~20B ya no es para esta tarjeta.

Con 12 GB el punto dulce está en modelos de **hasta ~9B en Q4/Q5**, que es exactamente donde juegan los dos que probé.

## El setup

Nada exótico: [Ollama](https://ollama.com) por encima de `llama.cpp`, drivers NVIDIA al día y CUDA. Descargar y arrancar un modelo es literalmente:

```bash
ollama run gemma:latest
```

Ollama detecta la GPU, descarga el peso cuantizado y deja el modelo escuchando. Sin malabares.

## Gemma 4 — el generalista

**Gemma 4** (la familia abierta de Google) es mi opción para todo lo que no sea código: redactar, resumir, explicar conceptos, responder en español sin sonar a traducción automática.

- **Cabe de sobra** en los 12 GB en Q4, con margen para ventanas de contexto generosas.
- Va **fluido** — la generación se siente interactiva, no como esperar a un fax.
- El razonamiento general es sólido para su tamaño; se nota maduro en instrucciones en varios idiomas.

Donde flojea, como todo modelo pequeño, es en cadenas de razonamiento largas y en datos muy específicos. Para eso no es la herramienta.

## Qwen 3.5 Coder — el especialista

Aquí estaba mi verdadero interés. **Qwen 3.5 Coder** (Alibaba) está afinado para programación, y se nota.

- Genera código **correcto y idiomático** en los lenguajes que toco a diario (Java, TypeScript, Python).
- Entiende bien el contexto de un archivo: completar funciones, explicar un fragmento, proponer un refactor.
- En Q4 entra en la 3060 y mantiene una velocidad **perfectamente usable** para autocompletado y consultas puntuales.

Como copiloto local para preguntas de "¿cómo hago X en este lenguaje?" o "revísame esta función", cumple. No sustituye a los modelos grandes en problemas de arquitectura complejos, pero para el 80% del trabajo diario de código, lo hace en tu máquina y gratis.

## Lo que aprendí

- **12 GB de VRAM dan para mucho más de lo que esperaba.** Una RTX 3060 corre modelos de ~9B con soltura.
- **La cuantización es la palanca clave.** Q4 es el equilibrio entre tamaño y calidad; bajar de ahí se nota en los resultados.
- **Dos modelos, dos trabajos.** Gemma para lenguaje natural, Qwen Coder para código. Tenerlos a un `ollama run` de distancia cambia el flujo de trabajo.
- **Privacidad por defecto.** Nada sale de la red local. Para experimentar con código propio, es un alivio.

¿La conclusión? No hace falta un datacenter para tener un asistente decente en casa. Hace falta una gráfica de gama media y un rato de curiosidad — y, en mi caso, pedirle prestado el PC a mi hijo.
