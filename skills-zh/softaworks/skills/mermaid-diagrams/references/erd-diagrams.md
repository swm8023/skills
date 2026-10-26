# Entity Relationship Diagrams (ERD)

ERDs 为 database schemas 建模，展示 tables（entities）、各表的 columns（attributes）以及 tables 之间的 relationships。它们对 database design 和 documentation 必不可少。

## Basic Syntax

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
```

## Defining Entities

```mermaid
erDiagram
    CUSTOMER
    ORDER
    PRODUCT
```

## Entity Attributes

定义 columns 的 type 和 constraints：

```mermaid
erDiagram
    CUSTOMER {
        int id PK
        string email UK
        string name
        string phone
        datetime created_at
    }
```

**Attribute 格式：** `type name constraints`

**常见 constraints：**
- `PK` - Primary Key
- `FK` - Foreign Key
- `UK` - Unique Key
- `NN` - Not Null

## Relationships

### Relationship Symbols

**Cardinality indicators：**
- `||` - 恰好一个
- `|o` - 零个或一个
- `}{` - 一个或多个
- `}o` - 零个或多个

**Relationship line：**
- `--` - Non-identifying relationship
- `..` - Identifying relationship（实践中少见）

### Common Relationships

```mermaid
erDiagram
    %% One-to-One
    USER ||--|| PROFILE : has
    
    %% One-to-Many
    CUSTOMER ||--o{ ORDER : places
    
    %% Many-to-Many (with junction table)
    STUDENT }o--o{ COURSE : enrolls
    STUDENT ||--o{ ENROLLMENT : has
    COURSE ||--o{ ENROLLMENT : includes
    
    %% Optional Relationships
    EMPLOYEE |o--o{ DEPARTMENT : manages
```

### Relationship with Labels

```mermaid
erDiagram
    AUTHOR ||--o{ BOOK : writes
    BOOK }o--|| PUBLISHER : "published by"
    READER }o--o{ BOOK : reads
```

## Data Types

使用标准 database types：
- `int`, `bigint`, `smallint`
- `varchar`, `text`, `char`
- `decimal`, `float`, `double`
- `boolean`, `bool`
- `date`, `datetime`, `timestamp`
- `json`, `jsonb`
- `uuid`
- `blob`, `bytea`

## Comprehensive Example: E-Commerce Database

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    CUSTOMER ||--o{ REVIEW : writes
    CUSTOMER ||--o{ ADDRESS : has
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "ordered in"
    PRODUCT }o--|| CATEGORY : "belongs to"
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ INVENTORY : tracks
    ORDER ||--|| PAYMENT : "paid by"
    ORDER ||--o| SHIPMENT : "shipped via"
    
    CUSTOMER {
        uuid id PK
        varchar email UK "NOT NULL"
        varchar name "NOT NULL"
        varchar phone
        timestamp created_at "DEFAULT NOW()"
        timestamp updated_at
    }
    
    ADDRESS {
        uuid id PK
        uuid customer_id FK
        varchar street "NOT NULL"
        varchar city "NOT NULL"
        varchar state
        varchar postal_code
        varchar country "NOT NULL"
        boolean is_default
    }
    
    ORDER {
        uuid id PK
        uuid customer_id FK "NOT NULL"
        decimal total "NOT NULL"
        varchar status "NOT NULL"
        timestamp order_date "DEFAULT NOW()"
        timestamp shipped_date
        timestamp delivered_date
    }
    
    LINE_ITEM {
        uuid id PK
        uuid order_id FK "NOT NULL"
        uuid product_id FK "NOT NULL"
        int quantity "NOT NULL"
        decimal price_per_unit "NOT NULL"
        decimal subtotal "COMPUTED"
    }
    
    PRODUCT {
        uuid id PK
        varchar sku UK "NOT NULL"
        varchar name "NOT NULL"
        text description
        decimal price "NOT NULL"
        uuid category_id FK
        boolean is_active "DEFAULT TRUE"
        timestamp created_at "DEFAULT NOW()"
    }
    
    CATEGORY {
        uuid id PK
        varchar name UK "NOT NULL"
        text description
        uuid parent_category_id FK
    }
    
    INVENTORY {
        uuid id PK
        uuid product_id FK "NOT NULL"
        int quantity "DEFAULT 0"
        varchar warehouse_location
        timestamp last_updated
    }
    
    REVIEW {
        uuid id PK
        uuid customer_id FK "NOT NULL"
        uuid product_id FK "NOT NULL"
        int rating "CHECK 1-5"
        text comment
        timestamp created_at "DEFAULT NOW()"
    }
    
    PAYMENT {
        uuid id PK
        uuid order_id FK "NOT NULL"
        varchar payment_method "NOT NULL"
        decimal amount "NOT NULL"
        varchar status "NOT NULL"
        varchar transaction_id UK
        timestamp processed_at
    }
    
    SHIPMENT {
        uuid id PK
        uuid order_id FK "NOT NULL"
        varchar carrier
        varchar tracking_number
        timestamp shipped_date
        timestamp estimated_delivery
        timestamp actual_delivery
    }
```

## Blog Platform Schema

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ COMMENT : writes
    POST ||--o{ COMMENT : receives
    POST }o--o{ TAG : tagged_with
    POST ||--o{ POST_TAG : has
    TAG ||--o{ POST_TAG : applied_to
    POST }o--|| CATEGORY : "belongs to"
    USER ||--o{ LIKE : gives
    POST ||--o{ LIKE : receives
    COMMENT ||--o{ LIKE : receives
    
    USER {
        bigint id PK "AUTO_INCREMENT"
        varchar email UK "NOT NULL"
        varchar username UK "NOT NULL"
        varchar password_hash "NOT NULL"
        varchar display_name
        text bio
        varchar avatar_url
        timestamp created_at "DEFAULT NOW()"
        timestamp last_login
    }
    
    POST {
        bigint id PK "AUTO_INCREMENT"
        bigint user_id FK "NOT NULL"
        bigint category_id FK
        varchar title "NOT NULL"
        varchar slug UK "NOT NULL"
        text content "NOT NULL"
        text excerpt
        varchar featured_image_url
        varchar status "NOT NULL DEFAULT 'draft'"
        int view_count "DEFAULT 0"
        timestamp published_at
        timestamp created_at "DEFAULT NOW()"
        timestamp updated_at
    }
    
    COMMENT {
        bigint id PK "AUTO_INCREMENT"
        bigint user_id FK "NOT NULL"
        bigint post_id FK "NOT NULL"
        bigint parent_comment_id FK "NULL"
        text content "NOT NULL"
        varchar status "DEFAULT 'pending'"
        timestamp created_at "DEFAULT NOW()"
    }
    
    CATEGORY {
        bigint id PK "AUTO_INCREMENT"
        varchar name UK "NOT NULL"
        varchar slug UK "NOT NULL"
        text description
        bigint parent_id FK
    }
    
    TAG {
        bigint id PK "AUTO_INCREMENT"
        varchar name UK "NOT NULL"
        varchar slug UK "NOT NULL"
    }
    
    POST_TAG {
        bigint post_id FK "NOT NULL"
        bigint tag_id FK "NOT NULL"
    }
    
    LIKE {
        bigint id PK "AUTO_INCREMENT"
        bigint user_id FK "NOT NULL"
        varchar likeable_type "NOT NULL"
        bigint likeable_id "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }
```

## Social Media Schema

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER ||--o{ FOLLOW : follows
    USER ||--o{ FOLLOW : "followed by"
    POST ||--o{ LIKE : receives
    POST ||--o{ COMMENT : has
    USER ||--o{ LIKE : gives
    USER ||--o{ COMMENT : makes
    USER ||--o{ NOTIFICATION : receives
    POST ||--o{ POST_MEDIA : contains
    USER }o--o{ GROUP : "member of"
    USER ||--o{ MESSAGE : sends
    USER ||--o{ MESSAGE : receives
    
    USER {
        uuid id PK
        varchar username UK "NOT NULL"
        varchar email UK "NOT NULL"
        varchar password_hash "NOT NULL"
        varchar full_name
        text bio
        varchar profile_picture_url
        varchar cover_photo_url
        boolean is_verified "DEFAULT FALSE"
        boolean is_private "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
    }
    
    POST {
        uuid id PK
        uuid user_id FK "NOT NULL"
        text content
        varchar visibility "DEFAULT 'public'"
        int likes_count "DEFAULT 0"
        int comments_count "DEFAULT 0"
        int shares_count "DEFAULT 0"
        timestamp created_at "DEFAULT NOW()"
        timestamp edited_at
    }
    
    POST_MEDIA {
        uuid id PK
        uuid post_id FK "NOT NULL"
        varchar media_type "NOT NULL"
        varchar media_url "NOT NULL"
        int display_order
    }
    
    FOLLOW {
        uuid id PK
        uuid follower_id FK "NOT NULL"
        uuid following_id FK "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }
    
    LIKE {
        uuid id PK
        uuid user_id FK "NOT NULL"
        uuid post_id FK "NOT NULL"
        timestamp created_at "DEFAULT NOW()"
    }
    
    COMMENT {
        uuid id PK
        uuid user_id FK "NOT NULL"
        uuid post_id FK "NOT NULL"
        uuid parent_comment_id FK
        text content "NOT NULL"
        int likes_count "DEFAULT 0"
        timestamp created_at "DEFAULT NOW()"
    }
    
    MESSAGE {
        uuid id PK
        uuid sender_id FK "NOT NULL"
        uuid receiver_id FK "NOT NULL"
        text content "NOT NULL"
        boolean is_read "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
        timestamp read_at
    }
    
    NOTIFICATION {
        uuid id PK
        uuid user_id FK "NOT NULL"
        varchar notification_type "NOT NULL"
        text content "NOT NULL"
        boolean is_read "DEFAULT FALSE"
        varchar related_entity_type
        uuid related_entity_id
        timestamp created_at "DEFAULT NOW()"
    }
    
    GROUP {
        uuid id PK
        varchar name "NOT NULL"
        text description
        uuid created_by FK "NOT NULL"
        boolean is_private "DEFAULT FALSE"
        timestamp created_at "DEFAULT NOW()"
    }
```

## Best Practices

1. **Entities 名称使用 UPPERCASE** - 使表达清晰的惯例
2. **使用 singular names** - `USER` 而非 `USERS`，`ORDER` 而非 `ORDERS`
3. **定义所有 constraints** - 记录 PKs、FKs、UKs、NOT NULL
4. **准确展示 cardinality** - 精确区分 one-to-many 和 many-to-many
5. **包含 timestamps** - created_at、updated_at 用于 auditing
6. **记录 computed columns** - 标记 calculated/derived values
7. **添加有意义的 comments** - 为 constraints 和 descriptions 使用引号
8. **考虑 junction tables** - 显式建模 many-to-many relationships
9. **使用适当的 types** - 匹配 database-specific types
10. **展示 indexes** - 除 PKs 外，也记录 UK（unique keys）

## Common Patterns

### Self-Referencing (Hierarchical)
```mermaid
erDiagram
    CATEGORY ||--o{ CATEGORY : "parent of"
    
    CATEGORY {
        uuid id PK
        varchar name "NOT NULL"
        uuid parent_id FK "NULLABLE"
    }
```

### Junction Table (Many-to-Many)
```mermaid
erDiagram
    STUDENT }o--o{ COURSE : enrolls
    STUDENT ||--o{ ENROLLMENT : has
    COURSE ||--o{ ENROLLMENT : includes
    
    STUDENT {
        uuid id PK
        varchar name "NOT NULL"
    }
    
    ENROLLMENT {
        uuid student_id FK PK
        uuid course_id FK PK
        date enrolled_date
        varchar grade
    }
    
    COURSE {
        uuid id PK
        varchar title "NOT NULL"
    }
```

### Polymorphic Relationship
```mermaid
erDiagram
    COMMENT {
        uuid id PK
        uuid user_id FK
        varchar commentable_type "NOT NULL"
        uuid commentable_id "NOT NULL"
        text content
    }
    
    POST {
        uuid id PK
        varchar title
    }
    
    VIDEO {
        uuid id PK
        varchar title
    }
```

### Soft Deletes
```mermaid
erDiagram
    USER {
        uuid id PK
        varchar email UK
        varchar name
        timestamp deleted_at "NULLABLE"
    }
```

### Audit Trail
```mermaid
erDiagram
    DOCUMENT ||--o{ DOCUMENT_VERSION : has
    
    DOCUMENT {
        uuid id PK
        varchar title "NOT NULL"
        int current_version "DEFAULT 1"
    }
    
    DOCUMENT_VERSION {
        uuid id PK
        uuid document_id FK "NOT NULL"
        int version_number "NOT NULL"
        text content "NOT NULL"
        uuid modified_by FK
        timestamp created_at "DEFAULT NOW()"
    }
```

## Tips for Database Design

1. **适度 normalize** - 平衡 normalization 与 query performance
2. **使用 surrogate keys** - 将 UUID 或 auto-increment integers 作为 PKs
3. **为 foreign keys 建立 index** - 对 join performance 至关重要
4. **规划 soft deletes** - 添加 deleted_at columns，而不是进行 hard deletes
5. **为关键 data 保留 version** - 维护重要 entities 的 history
6. **设置适当的 defaults** - created_at、status、boolean flags
7. **考虑 denormalization** - 为提高 performance 保存 counts 和 cached values
8. **使用 enum/check constraints** - 在 database 层确保 values 有效
