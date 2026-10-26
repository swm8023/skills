# Class Diagrams

Class diagrams 为 object-oriented designs 和 domain models 建模。它们展示 entities（classes）、它们的 attributes/methods 以及 relationships。

## Basic Syntax

```mermaid
classDiagram
    ClassName
```

## Defining Classes with Members

```mermaid
classDiagram
    class BankAccount {
        +String owner
        +Decimal balance
        -String accountNumber
        +deposit(amount)
        +withdraw(amount)
        +getBalance() Decimal
    }
```

**Visibility modifiers:**
- `+` Public
- `-` Private
- `#` Protected
- `~` Package/Internal

**Member syntax:**
- `+type attribute` - 带 type 的 attribute
- `+method(params) ReturnType` - 带 parameters 和 return type 的 method

## Relationships

### Association (`--`)
一种松散的 relationship，其中 entities 相互使用，但独立存在。

```mermaid
classDiagram
    Title -- Genre
```

### Composition (`*--`)
强 ownership - child 不能脱离 parent 存在。删除 parent 时，children 也会被删除。

```mermaid
classDiagram
    Order *-- LineItem
    House *-- Room
```

### Aggregation (`o--`)
较弱的 ownership - child 可以独立存在。表示 "has-a" relationship。

```mermaid
classDiagram
    Department o-- Employee
    Playlist o-- Song
```

### Inheritance (`<|--`)
"Is-a" relationship。Child class 继承自 parent class。

```mermaid
classDiagram
    Animal <|-- Dog
    Animal <|-- Cat
    
    class Animal {
        +String name
        +makeSound()
    }
    
    class Dog {
        +bark()
    }
```

### Dependency (`<..`)
一个 class 依赖另一个 class，通常体现为 parameter 或 local variable。

```mermaid
classDiagram
    OrderProcessor <.. PaymentGateway
```

### Realization/Implementation (`<|..`)
Class 实现一个 interface。

```mermaid
classDiagram
    class Drawable {
        <<interface>>
        +draw()
    }
    Drawable <|.. Circle
    Drawable <|.. Rectangle
```

## Multiplicity

展示参与某个 relationship 的 instances 数量：

```mermaid
classDiagram
    Customer "1" --> "0..*" Order : places
    Order "1" *-- "1..*" LineItem : contains
    Author "1..*" -- "1..*" Book : writes
```

**常见 multiplicities：**
- `1` - 恰好一个
- `0..1` - 零个或一个
- `0..*` 或 `*` - 零个或多个
- `1..*` - 一个或多个
- `m..n` - m 到 n 个

## Relationship Labels

```mermaid
classDiagram
    Customer --> Order : places
    Order --> Product : contains
    Driver --> Vehicle : drives
```

## Class Stereotypes

标记特殊的 class types：

```mermaid
classDiagram
    class IRepository {
        <<interface>>
        +save(entity)
        +findById(id)
    }
    
    class UserService {
        <<service>>
        +createUser()
    }
    
    class UserDTO {
        <<dataclass>>
        +String name
        +String email
    }
```

## Abstract Classes and Methods

```mermaid
classDiagram
    class Shape {
        <<abstract>>
        +int x
        +int y
        +draw()* abstract
        +move(x, y)
    }
    
    Shape <|-- Circle
    Shape <|-- Rectangle
```

## Generic Classes

```mermaid
classDiagram
    class List~T~ {
        +add(item: T)
        +get(index: int) T
    }
    
    List~String~ <-- StringProcessor
```

## Comprehensive Example: E-Commerce Domain

```mermaid
classDiagram
    %% Core entities
    class Customer {
        +UUID id
        +String email
        +String name
        +Address shippingAddress
        +placeOrder(cart: Cart) Order
        +getOrderHistory() List~Order~
    }
    
    class Order {
        +UUID id
        +DateTime orderDate
        +OrderStatus status
        +Decimal total
        +calculateTotal() Decimal
        +ship()
        +cancel()
    }
    
    class LineItem {
        +int quantity
        +Decimal pricePerUnit
        +getSubtotal() Decimal
    }
    
    class Product {
        +UUID id
        +String name
        +String description
        +Decimal price
        +int stockQuantity
        +reduceStock(quantity: int)
        +isAvailable() bool
    }
    
    class Category {
        +String name
        +String description
    }
    
    class Cart {
        +addItem(product: Product, quantity: int)
        +removeItem(product: Product)
        +getTotal() Decimal
        +clear()
    }
    
    %% Relationships
    Customer "1" --> "0..*" Order : places
    Customer "1" --> "1" Cart : has
    Order "1" *-- "1..*" LineItem : contains
    LineItem "1" --> "1" Product : references
    Product "0..*" --> "1" Category : belongs to
    Cart "1" o-- "0..*" Product : contains
    
    %% Enums
    class OrderStatus {
        <<enumeration>>
        PENDING
        PAID
        SHIPPED
        DELIVERED
        CANCELLED
    }
    
    Order --> OrderStatus
```

## Domain-Driven Design Patterns

### Entities
```mermaid
classDiagram
    class User {
        <<entity>>
        -UUID id
        +String email
        +String name
    }
```

### Value Objects
```mermaid
classDiagram
    class Money {
        <<value object>>
        +Decimal amount
        +String currency
        +add(other: Money) Money
    }
    
    class Address {
        <<value object>>
        +String street
        +String city
        +String postalCode
    }
```

### Aggregates
```mermaid
classDiagram
    class Order {
        <<aggregate root>>
        -UUID id
        +addLineItem(item)
        +removeLineItem(item)
    }
    
    Order *-- LineItem
```

## Tips for Effective Class Diagrams

1. **从核心 entities 开始** - 逐步添加 attributes 和 methods
2. **只展示相关细节** - 除非重要，否则省略显而易见的 getters/setters
3. **使用适当的 relationships** - 谨慎选择 association、aggregation 和 composition
4. **添加 multiplicity** - 明确有多少 instances 参与
5. **为相关 classes 分组** - 使用 notes 或视觉上的邻近关系
6. **记录 invariants** - 使用 notes 解释 business rules

## Common Patterns

### Repository Pattern
```mermaid
classDiagram
    class IRepository~T~ {
        <<interface>>
        +save(entity: T)
        +findById(id: UUID) T
        +delete(entity: T)
    }
    
    class UserRepository {
        +findByEmail(email: String) User
    }
    
    IRepository~User~ <|.. UserRepository
```

### Factory Pattern
```mermaid
classDiagram
    class ShapeFactory {
        +createShape(type: String) Shape
    }
    
    class Shape {
        <<abstract>>
        +draw()*
    }
    
    ShapeFactory ..> Shape : creates
    Shape <|-- Circle
    Shape <|-- Rectangle
```

### Strategy Pattern
```mermaid
classDiagram
    class PaymentProcessor {
        -PaymentStrategy strategy
        +setStrategy(strategy: PaymentStrategy)
        +processPayment(amount: Decimal)
    }
    
    class PaymentStrategy {
        <<interface>>
        +pay(amount: Decimal)*
    }
    
    PaymentStrategy <|.. CreditCardPayment
    PaymentStrategy <|.. PayPalPayment
    PaymentProcessor --> PaymentStrategy
```
