import sqlite3
from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.schemas import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter()


@router.get("", response_model=list[EmployeeResponse])
def list_employees():
    """Get all employees"""
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT e.id, e.employee_id, e.full_name, e.email, d.name as department_id
               FROM employees e
               LEFT JOIN departments d ON e.department_id = d.id
               ORDER BY e.full_name"""
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(id: int):
    """Get a specific employee"""
    conn = get_connection()
    try:
        row = conn.execute(
            """SELECT e.id, e.employee_id, e.full_name, e.email, d.name as department_id
               FROM employees e
               LEFT JOIN departments d ON e.department_id = d.id
               WHERE e.id = ?""",
            (id,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Employee not found")
        return dict(row)
    finally:
        conn.close()


@router.post("", response_model=EmployeeResponse, status_code=201)
def add_employee(body: EmployeeCreate):
    """Add a new employee"""
    conn = get_connection()
    try:
        emp_id = body.employee_id.strip()
        full_name = body.full_name.strip()
        email = body.email.strip().lower()
        dept_id = body.department_id

        try:
            cursor = conn.execute(
                """INSERT INTO employees 
                   (employee_id, full_name, email, department_id) 
                   VALUES (?, ?, ?, ?)""",
                (emp_id, full_name, email, dept_id),
            )
            conn.commit()
            emp_id_num = cursor.lastrowid

            row = conn.execute(
                """SELECT e.id, e.employee_id, e.full_name, e.email, d.name as department_id
                   FROM employees e
                   LEFT JOIN departments d ON e.department_id = d.id
                   WHERE e.id = ?""",
                (emp_id_num,),
            ).fetchone()
            return dict(row)
        except sqlite3.IntegrityError as e:
            conn.rollback()
            if "email" in str(e).lower():
                raise HTTPException(status_code=409, detail="Email already registered")
            if "employee_id" in str(e).lower():
                raise HTTPException(status_code=409, detail="Employee ID already exists")
            raise HTTPException(status_code=409, detail="Conflict: " + str(e))
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add employee: {str(e)}")
    finally:
        conn.close()


@router.put("/{id}", response_model=EmployeeResponse)
def update_employee(id: int, body: EmployeeUpdate):
    """Update employee details"""
    conn = get_connection()
    try:
        # First check if employee exists
        existing = conn.execute("SELECT id FROM employees WHERE id = ?", (id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Build update query dynamically
        update_fields = []
        params = []

        if body.full_name:
            update_fields.append("full_name = ?")
            params.append(body.full_name)
        if body.email:
            update_fields.append("email = ?")
            params.append(body.email.lower())
        if body.department_id:
            update_fields.append("department_id = ?")
            params.append(body.department_id)
        if body.phone:
            update_fields.append("phone = ?")
            params.append(body.phone)
        if body.address:
            update_fields.append("address = ?")
            params.append(body.address)
        if body.date_of_birth:
            update_fields.append("date_of_birth = ?")
            params.append(body.date_of_birth)
        if body.position:
            update_fields.append("position = ?")
            params.append(body.position)

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        params.append(id)
        query = f"UPDATE employees SET {', '.join(update_fields)} WHERE id = ?"

        try:
            conn.execute(query, params)
            conn.commit()
        except sqlite3.IntegrityError as e:
            conn.rollback()
            if "email" in str(e).lower():
                raise HTTPException(status_code=409, detail="Email already in use")
            raise HTTPException(status_code=409, detail="Conflict: " + str(e))

        row = conn.execute(
            """SELECT e.id, e.employee_id, e.full_name, e.email, d.name as department_id
               FROM employees e
               LEFT JOIN departments d ON e.department_id = d.id
               WHERE e.id = ?""",
            (id,),
        ).fetchone()
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update employee: {str(e)}")
    finally:
        conn.close()


@router.delete("/{id}", status_code=204)
def delete_employee(id: int):
    """Delete an employee"""
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM employees WHERE id = ?", (id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return None
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete employee: {str(e)}")
    finally:
        conn.close()
