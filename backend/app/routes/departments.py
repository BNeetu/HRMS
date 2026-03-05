from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.schemas import DepartmentCreate, DepartmentResponse

router = APIRouter()


@router.get("", response_model=list[DepartmentResponse])
def get_departments():
    """Get all departments"""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM departments ORDER BY name").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(department_id: int):
    """Get a specific department"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM departments WHERE id = ?", (department_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Department not found")
        return dict(row)
    finally:
        conn.close()


@router.post("", response_model=DepartmentResponse)
def create_department(body: DepartmentCreate):
    """Create a new department"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO departments (name, description) VALUES (?, ?)",
            (body.name, body.description)
        )
        conn.commit()
        return {"id": cursor.lastrowid, **body.model_dump()}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(department_id: int, body: DepartmentCreate):
    """Update a department"""
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE departments SET name = ?, description = ? WHERE id = ?",
            (body.name, body.description, department_id)
        )
        conn.commit()
        row = conn.execute("SELECT * FROM departments WHERE id = ?", (department_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Department not found")
        return dict(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


@router.delete("/{department_id}")
def delete_department(department_id: int):
    """Delete a department"""
    conn = get_connection()
    try:
        conn.execute("DELETE FROM departments WHERE id = ?", (department_id,))
        conn.commit()
        return {"message": "Department deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
