# Go Epic Backend

A backend API project built using Node.js, Express.js, MongoDB, and Mongoose for managing coding problems from the Go Epic dataset.

## Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* dotenv
* cors
* morgan

---

## Project Structure

```bash
src/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
└── utils/
```

---

## Database

Database Name:

```text
go-epic
```

Collection Name:

```text
banckendassign
```

Dataset Fields:

```json
{
  "instruction": "Problem statement",
  "output": "Solution",
  "topic": "Problem category",
  "difficulty": "easy | medium | advanced",
  "dataset_source": "Source dataset"
}
```

---

## Features Implemented

* Express server setup
* MongoDB Atlas connection
* Environment variable configuration
* MVC architecture setup
* Mongoose schema creation
* Logging using Morgan
* CORS configuration

---

## API Endpoints

### Problems

| Method | Endpoint          | Description            |
| ------ | ----------------- | ---------------------- |
| GET    | /api/problems     | Fetch all problems     |
| GET    | /api/problems/:id | Fetch a single problem |

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into project folder:

```bash
cd gopic-tulyajain
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start development server:

```bash
npm run dev
```

---

## Environment Variables

Required variables:

```env
PORT=
MONGO_URI=
```

---

## Current Status

Completed:

* Project setup
* MongoDB connection
* Mongoose model
* MVC structure

In Progress:

* GET APIs

Planned:

* Full CRUD APIs
* Filtering
* Search
* Pagination
* Sorting
* JWT Authentication
* Protected Routes
* Aggregation APIs
* Rate Limiting
* Postman Documentation

---

## Author

Tulya Jain
