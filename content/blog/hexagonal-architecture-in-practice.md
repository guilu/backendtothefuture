---
title: "Hexagonal Architecture in practice"
date: "2026-03-14"
description: "How I apply ports & adapters in real Spring Boot services — without the ceremony."
tags: ["architecture", "spring", "java"]
---

## The problem with layered architecture

We've all seen it: a `Controller` that calls a `Service` that calls a `Repository`. Clean, predictable — until the day you need to replace your ORM, expose the same use case via a message queue, or test business logic without spinning up a database.

Layered architecture couples your domain to infrastructure. Hexagonal architecture doesn't.

## The core idea

Your application has a **domain** (business logic) at the centre. Everything else — HTTP, databases, queues, external APIs — is an **adapter** that speaks to the domain through a **port** (a Java interface).

```
Inbound adapters  →  [Ports]  →  Domain  →  [Ports]  →  Outbound adapters
(REST, gRPC, CLI)                                         (JPA, Kafka, HTTP)
```

The domain knows nothing about Spring, JPA, or HTTP. It just executes business rules.

## A concrete example

Imagine a `CreateOrder` use case:

```java
// Port (inbound)
public interface CreateOrderUseCase {
    OrderId execute(CreateOrderCommand command);
}

// Domain service (lives in the hexagon)
@Component
public class CreateOrderService implements CreateOrderUseCase {
    private final OrderRepository orders; // outbound port
    private final EventPublisher events;  // outbound port

    @Override
    public OrderId execute(CreateOrderCommand command) {
        var order = Order.create(command.customerId(), command.items());
        orders.save(order);
        events.publish(new OrderCreated(order.id()));
        return order.id();
    }
}

// Outbound port
public interface OrderRepository {
    void save(Order order);
}

// Adapter (infrastructure)
@Repository
public class JpaOrderRepository implements OrderRepository {
    private final SpringDataOrderRepository jpa;
    // ...
}
```

## What you gain

- **Testability**: test `CreateOrderService` with a fake `OrderRepository` — no DB needed.
- **Swappability**: replace JPA with jOOQ, or add a Kafka listener as a new inbound adapter, without touching the domain.
- **Clarity**: the domain package is pure Java. No `@Entity`, no `@RestController`, no surprises.

## The trade-off

More files upfront. If you're building a CRUD endpoint with no real business logic, this is overkill. I reach for hexagonal architecture when the domain has **invariants worth protecting** — not for every microservice.

## Where I draw the line

In practice, I don't enforce hexagonal purity at every boundary. I apply it selectively to the parts of the system that carry real business weight. The goal is **isolation of the core**, not architectural ceremony.

Start small: identify one use case, extract its port, write a unit test. You'll feel the benefit immediately.
