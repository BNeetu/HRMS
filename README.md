# HRMS Lite – Quess Corp

A lightweight Human Resource Management System for managing employee records and daily attendance.

**Vendor:** Quess Corp

## Tech stack

- **Frontend:** Angular 19 (standalone components, reactive forms, Angular Router, HttpClient)
- **Backend:** Python 3.x, FastAPI
- **Database:** SQLite (file-based, no extra setup)

## Features

- **Employee management:** Add employees (Employee ID, Full Name, Email, Department), view list, delete
- **Attendance:** Mark attendance (date, Present/Absent) per employee, view records
- **Dashboard:** Summary of total employees and present days; per-employee attendance summary
- **Filters:** Filter attendance by employee and by date (bonus)

Validation: required fields, valid email (Pydantic `EmailStr`), duplicate Employee ID/Email handling. Proper HTTP status codes and error messages.

## Run locally

### Backend (FastAPI)

1. From project root:
   ```bash
   cd backend
   ```
2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate    # Windows
   # source venv/bin/activate   # macOS/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the API:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   API base: `http://localhost:8000`. Docs: `http://localhost:8000/docs`.

### Frontend (Angular)

1. From project root:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server (proxies `/api` to `http://localhost:8000`):
   ```bash
   npm start
   ```
   App: `http://localhost:4200`.

Ensure the backend is running on port 8000 when using the frontend.

### Troubleshooting: `npm install` fails with ENOTEMPTY / "directory not empty"

This often happens when the project is inside **OneDrive** (e.g. `OneDrive\Desktop\HRMS`). OneDrive can lock or sync files while npm runs.

**Option A – Recommended: move project out of OneDrive**

1. Move the entire `HRMS` folder to a local folder (e.g. `C:\HRMS` or `C:\Projects\HRMS`).
2. Open the new folder in VS Code.
3. In a terminal:
   ```powershell
   cd frontend
   # If node_modules exists, delete it (in Explorer or: cmd /c "rmdir /s /q node_modules")
   npm install
   npm start
   ```

**Option B – Stay in OneDrive**

1. Close VS Code and pause OneDrive sync (right‑click OneDrive in taskbar → Pause syncing).
2. In File Explorer, delete the `frontend\node_modules` folder (or run in Command Prompt: `rmdir /s /q node_modules` from the `frontend` folder).
3. Run `npm install` and then `npm start`.

**Option C – Use the clean script**

From the `frontend` folder, run:

```powershell
npm run clean
npm install
```

If `npm run clean` fails (e.g. due to OneDrive), use Option A or B.

## Project structure

```
HRMS/
├── backend/
│   ├── main.py              # FastAPI app, CORS, routes
│   ├── requirements.txt
│   ├── app/
│   │   ├── database.py      # SQLite connection, init
│   │   ├── schemas.py       # Pydantic models
│   │   └── routes/
│   │       ├── employees.py # CRUD employees
│   │       └── attendance.py# Mark/list attendance, summary
│   └── hrms.db              # Created on first run
├── frontend/                 # Angular app
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts, app.routes.ts
│   │   │   ├── services/api.service.ts
│   │   │   └── pages/
│   │   │       ├── dashboard/
│   │   │       ├── employees/
│   │   │       └── attendance/
│   │   ├── main.ts, index.html, styles.css
│   │   └── favicon.svg
│   ├── angular.json
│   ├── proxy.conf.json      # Dev: /api -> localhost:8000
│   └── package.json
└── README.md
```

## API overview

- `GET  /api/health` – Health check
- `GET  /api/employees` – List employees
- `POST /api/employees` – Add employee (body: employee_id, full_name, email, department)
- `GET  /api/employees/{id}` – Get one employee
- `DELETE /api/employees/{id}` – Delete employee
- `GET  /api/attendance` – List attendance (query: `employeeId`, `date` optional)
- `POST /api/attendance` – Mark attendance (body: employee_id, date, status: Present|Absent)
- `GET  /api/attendance/summary` – Per-employee present days / total records

## Assumptions / limitations

- Single admin user; no authentication.
- Leave, payroll, and advanced HR features are out of scope.
- SQLite is used for simplicity; for production you may switch to PostgreSQL and set the connection in `app/database.py`.
- For production deployment, set the frontend API base URL to the deployed backend (e.g. environment or build-time config) and ensure CORS allows the frontend origin.

## Deployment

- **Frontend:** Build with `ng build`, then deploy the `dist/hrms-lite` output to Vercel, Netlify, or any static host. Set the API URL to your backend.
- **Backend:** Deploy the FastAPI app (e.g. Render, Railway) with `uvicorn main:app --host 0.0.0.0 --port $PORT`. Use a persistent volume or external DB if you need data to persist across restarts.
