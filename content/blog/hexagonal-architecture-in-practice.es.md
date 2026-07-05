---
title: "Arquitectura Hexagonal en Spring Boot: puertos y adaptadores"
date: "2024-03-14"
description: "Cómo aplico puertos y adaptadores en servicios Spring Boot reales — sin la ceremonia."
tags: ["arquitectura", "spring", "java"]
thumb: "/blog/hexagonal-architecture-in-practice-thumb.webp"
cover: "/blog/hexagonal-architecture-in-practice-cover.webp"
ogImage: "/blog/hexagonal-architecture-in-practice-og.jpg"
---

## El problema de la arquitectura en capas

Todos lo hemos visto: un `Controller` que llama a un `Service` que llama a un `Repository`. Limpio, predecible — hasta el día en que necesitas cambiar el ORM, exponer el mismo caso de uso a través de una cola de mensajes o testear la lógica de negocio sin levantar una base de datos.

La arquitectura en capas acopla tu dominio a la infraestructura. La hexagonal no.

## La idea central

Tu aplicación tiene un **dominio** (lógica de negocio) en el centro. Todo lo demás — HTTP, bases de datos, colas, APIs externas — es un **adaptador** que habla con el dominio a través de un **puerto** (una interfaz Java).

```
Adaptadores entrantes  →  [Puertos]  →  Dominio  →  [Puertos]  →  Adaptadores salientes
(REST, gRPC, CLI)                                                  (JPA, Kafka, HTTP)
```

El dominio no sabe nada de Spring, JPA ni HTTP. Solo ejecuta reglas de negocio.

## Un ejemplo concreto

Imagina un caso de uso `CreateOrder`:

```java
// Puerto (entrante)
public interface CreateOrderUseCase {
    OrderId execute(CreateOrderCommand command);
}

// Servicio de dominio (vive en el hexágono)
@Component
public class CreateOrderService implements CreateOrderUseCase {
    private final OrderRepository orders; // puerto saliente
    private final EventPublisher events;  // puerto saliente

    @Override
    public OrderId execute(CreateOrderCommand command) {
        var order = Order.create(command.customerId(), command.items());
        orders.save(order);
        events.publish(new OrderCreated(order.id()));
        return order.id();
    }
}

// Puerto saliente
public interface OrderRepository {
    void save(Order order);
}

// Adaptador (infraestructura)
@Repository
public class JpaOrderRepository implements OrderRepository {
    private final SpringDataOrderRepository jpa;
    // ...
}
```

## Qué ganas

- **Testabilidad**: testeas `CreateOrderService` con un `OrderRepository` falso — sin base de datos.
- **Intercambiabilidad**: sustituyes JPA por jOOQ, o añades un listener de Kafka como nuevo adaptador entrante, sin tocar el dominio.
- **Claridad**: el paquete del dominio es Java puro. Sin `@Entity`, sin `@RestController`, sin sorpresas.

## El coste

Más archivos al principio. Si estás construyendo un endpoint CRUD sin lógica de negocio real, esto es excesivo. Recurro a la arquitectura hexagonal cuando el dominio tiene **invariantes que merece la pena proteger** — no para cada microservicio.

## Dónde pongo el límite

En la práctica no impongo pureza hexagonal en cada frontera. La aplico de forma selectiva a las partes del sistema que cargan peso de negocio real. El objetivo es **aislar el núcleo**, no la ceremonia arquitectónica.

Empieza pequeño: identifica un caso de uso, extrae su puerto, escribe un test unitario. Notarás el beneficio de inmediato.
