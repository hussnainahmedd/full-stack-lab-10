# Lab 10 — PostgreSQL and TypeORM with NestJS

A NestJS API backed by a real PostgreSQL database through TypeORM.
Users have a one-to-one Profile and write Notes; notes have Tags
(many-to-many) and, from Task 2 on, an optional Category (many-to-one).

## Setup

1. Install and start PostgreSQL, then create the database:
   `CREATE DATABASE lab10_db;`
2. Copy `.env.example` to `.env` and fill in your own credentials
   (this project was developed against PostgreSQL on port 5433).
3. Install and run:

```bash
npm install
npm run start:dev
```

The API listens on http://localhost:3000. TypeORM `synchronize: true`
creates/updates the tables from the entities on startup (development only).

## Endpoints

| Area       | Routes                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Users      | POST/GET /users, GET/PATCH/DELETE /users/:id, GET /users/:id/stats     |
| Notes      | POST/GET /notes (page, limit, search, tag, categoryId), GET/PATCH/DELETE /notes/:id |
| Categories | POST/GET /categories, GET/PATCH/DELETE /categories/:id                 |

Task 1 (plain SQL against a `courses` table) lives in `task1.sql`.
Evidence for every task is in the `screenshots/` folder.

## Reflection Questions

**1. What problem does an ORM solve, and what is one disadvantage of using it?**
An ORM maps database tables to classes in the programming language, so instead
of writing SQL strings everywhere you work with objects and repositories, and
the ORM generates the SQL, handles relations and keeps types consistent.
A disadvantage is that the generated SQL is hidden and can be inefficient
(for example N+1 queries), and very complex queries can be harder to express
through an ORM than in raw SQL.

**2. What is the difference between repository.create() and repository.save()?**
`create()` only builds an entity instance in memory from a plain object — it
runs no query and nothing is stored. `save()` actually writes to the database:
it inserts the entity, or updates it if it already has an id, and returns the
persisted entity. So `create()` is normally followed by `save()`.

**3. In a one-to-many relationship, which table holds the foreign key? Which decorator creates the junction table in a many-to-many relationship?**
The foreign key lives on the "many" side: the notes table holds `authorId`
(and `categoryId`), because many notes point back to one user/category.
In a many-to-many relationship the junction table (here `notes_tags_tags`) is
created by the `@JoinTable()` decorator, placed on the owning side of the
relation.

**4. Why is synchronize: true dangerous in production, and what should you use instead?**
With `synchronize: true` TypeORM silently alters the real schema to match the
entities on every startup — renaming or removing a property can drop columns
or tables and destroy production data, with no review and no way back.
In production you use migrations instead: schema changes are generated as
versioned, reviewable scripts that are applied deliberately and can be
reverted.

**5. Why should database credentials be stored in .env instead of in the source code?**
Source code gets committed to git, where secrets stay in the history forever
and are exposed to anyone who can see the repository. A `.env` file is kept
out of version control (only `.env.example` with placeholders is committed),
and each environment — a developer laptop, a server — can use its own
credentials without any code change.
