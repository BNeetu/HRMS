import sqlite3
from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.schemas import EmployeeCreate

router = APIRouter()


def row_to_employee(row) -> dict:
    return {
        "id": row["id"],
        "employee_id": row["employee_id"],
        "full_name": row["full_name"],
        "email": row["email"],
        "department": row["department"],
        "created_at": row["created_at"],
    }


@router.get("", response_model=list)
def list_employees():
    conn = get_connection()
    try:
        cur = conn.execute(
            "SELECT id, employee_id, full_name, email, department, created_at FROM employees ORDER BY created_at DESC"
        )
        return [row_to_employee(dict(r)) for r in cur.fetchall()]
    finally:
        conn.close()


@router.get("/{id}")
def get_employee(id: int):
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, employee_id, full_name, email, department, created_at FROM employees WHERE id = ?",
            (id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Employee not found")
        return row_to_employee(dict(row))
    finally:
        conn.close()


@router.post("", status_code=201)
def add_employee(body: EmployeeCreate):
    conn = get_connection()
    try:
        emp_id = body.employee_id.strip()
        full_name = body.full_name.strip()
        email = body.email.strip().lower()
        department = body.department.strip()

        try:
            conn.execute(
                "INSERT INTO employees (employee_id, full_name, email, department) VALUES (?, ?, ?, ?)",
                (emp_id, full_name, email, department),
            )
            conn.commit()
        except sqlite3.IntegrityError as e:
            if "employee_id" in str(e) or "UNIQUE" in str(e):
                if "email" in str(e).lower():
                    raise HTTPException(status_code=409, detail="Email already registered")
                raise HTTPException(status_code=409, detail="Employee ID already exists")
            raise

        row = conn.execute(
            "SELECT id, employee_id, full_name, email, department, created_at FROM employees WHERE employee_id = ?",
            (emp_id,),
        ).fetchone()
        return row_to_employee(dict(row))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to add employee")
    finally:
        conn.close()


@router.delete("/{id}", status_code=204)
def delete_employee(id: int):
    conn = get_connection()
    try:
        cur = conn.execute("DELETE FROM employees WHERE id = ?", (id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return None
    except HTTPException:
        raise
    finally:
        conn.close()
