# Go-Epic Backend API

A production-grade, high-performance RESTful Backend API built using Node.js, Express.js, MongoDB, and Mongoose for managing programming problems, solutions, topics, and datasets from the Go-Epic dataset.

---

## Technical Stack

* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Database:** MongoDB (using Mongoose ODM)
* **Security & Auth:** bcryptjs (password hashing), jsonwebtoken (JWT validation)
* **Rate Limiting:** express-rate-limit
* **Logging & CORS:** morgan, cors

---

## Directory Structure

```bash
go_epic_tulya_jain/
├── src/
│   ├── config/              # Database connection setups
│   ├── controllers/         # Request handling & HTTP status mappings
│   ├── middlewares/         # JWT parsing, permissions, error handling & rate limiters
│   ├── models/              # Schema designs & soft delete plugins
│   ├── routes/              # Endpoints grouping & routing tables
│   ├── services/            # Pure business logic, query builds & aggregations
│   └── utils/               # Pagination & Standard Response helpers
├── seed.js                  # Database seeder script
└── server.js                # Entry point
```

---

## Features Implemented

1. **MVC Architecture & Clean Code:** Complete separation of concerns: routes specify paths, controllers handle HTTP responses, services contain the core logic, and models define schemas.
2. **Normalized Data Modeling:** The raw `go-epic.json` dataset is mapped across four Mongoose models:
   - `Problem` (instruction text and references)
   - `Solution` (Go code solutions)
   - `Dataset` (metadata grouping)
   - `Topic` (categorizations and popularity tracking)
3. **Database Seeding (`seed.js`):** Parses the 17MB JSON, extracts metadata, auto-categorizes topics, calculates popularity, and batch-inserts 3,200+ records in seconds.
4. **JWT Authentication & RBAC:** Includes registering, logging in, session refreshes, OTP email flows, password resets, and role checks (`user`/`admin` permissions).
5. **Advanced Aggregation Pipelines:** Aggregation stats grouped by difficulty, source, category, count of advanced items, and topic lists.
6. **Soft Deletions:** Custom schema query hook plugin prevents deleted items from appearing in standard searches while keeping them in the DB.
7. **Rate Limiting & Spam Prevention:** Independent rate limiters configured for public GET routes, auth pages, search calls, and admin panels.
8. **Regex Searches & Case-Insensitive Slices:** Case-insensitive search on instructions, code outputs, topics, and categories.
9. **HEAD Support:** Standard GET routes natively support HEAD requests which return only response headers.

---

## Database Seeding

To clear collections and populate database documents:

```bash
node seed.js
```

Seeding inserts:
- **Default Admin:** `admin@goepic.com` | `Admin@123` (Role: `admin`)
- **Default User:** `user@goepic.com` | `User@123` (Role: `user`)
- **Normalized Data:** 3,202 Problems, 3,202 Solutions, 3,202 Datasets, and 285 Topics.

---

## API Endpoints List

### Basic CRUD Routes

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/problems` | Fetch all coding problems (paginated & filterable) |
| **GET** | `/problems/:problemId` | Fetch single problem using ID |
| **POST** | `/problems` | Create new problem (auto-creates solution & dataset) |
| **PUT** | `/problems/:problemId` | Replace complete problem details |
| **PATCH** | `/problems/:problemId` | Update specific problem fields |
| **DELETE** | `/problems/:problemId` | Soft delete problem and referenced children |
| **GET** | `/topics` | Fetch all topics (paginated) |
| **GET** | `/topics/:topicName` | Fetch single topic by name |
| **POST** | `/topics` | Create new topic |
| **PUT** | `/topics/:topicName` | Replace topic |
| **PATCH** | `/topics/:topicName` | Update topic |
| **DELETE** | `/topics/:topicName` | Delete topic |
| **GET** | `/solutions` | Fetch all solutions |
| **GET** | `/solutions/:solutionId` | Fetch single solution |
| **GET** | `/datasets` | Fetch all datasets |
| **GET** | `/datasets/:datasetId` | Fetch single dataset |

### Route Parameter Filters

- `/problems/topic/:topic`
- `/problems/difficulty/:difficulty`
- `/problems/source/:source`
- `/problems/instruction/:keyword`
- `/topics/name/:name`
- `/topics/category/:category`
- `/solutions/topic/:topic`
- `/solutions/difficulty/:difficulty`
- `/solutions/source/:source`
- `/datasets/source/:source`
- `/datasets/topic/:topic`
- `/datasets/difficulty/:difficulty`

### Query Parameter Operations

- **Search:** `/search/problems?q=worker` (supports problems, topics, solutions, datasets)
- **Sorting:** `/problems?sort=topic` | `/solutions?sort=-difficulty` (descending)
- **Combined:** `/problems?difficulty=advanced&page=1&limit=10&sort=topic`

### Authentication & JWT Endpoints

- **Auth System:**
  - `POST /auth/register` (Validate email & password constraints)
  - `POST /auth/login` (Returns access & refresh tokens)
  - `POST /auth/logout` (Clears token registry)
  - `GET /auth/profile` & `PATCH /auth/profile`
  - `POST /auth/send-otp` & `POST /auth/verify-otp`
  - `POST /auth/forgot-password` & `POST /auth/reset-password`
  - `POST /auth/refresh-token`
- **Protected Paths Check:**
  - `/protected/problems` (Requires user or admin JWT)
  - `/admin/problems` (Requires admin role check)
  - `/jwt/admin` (Requires admin role verification)

### Aggregation Stats

- `GET /stats/problems`
- `GET /stats/topics`
- `GET /stats/difficulties`
- `GET /stats/advanced-problems`
- `GET /stats/topic/:topic`
- `GET /stats/source/:source`
- `GET /stats/total-solutions`

---

## Postman Collection Import

1. Open Postman.
2. Click **Import** in the top left.
3. Select `go-epic-postman-collection.json` located in the root directory.
4. Set variables under the collection properties (e.g. `baseUrl`, `userToken` and `adminToken`) to easily test routes.

---

## Author
**Tulya Jain**
