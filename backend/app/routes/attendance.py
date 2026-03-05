import sqlite3
from fastapi import APIRouter, HTTPException, Query
from app.database import get_connection
from app.schemas import AttendanceCreate, AttendanceResponse, SummaryRow

router = APIRouter()


@router.get("", response_model=list[AttendanceResponse])
def list_attendance(
    employeeId: int | None = Query(None, alias="employeeId"),
    date: str | None = Query(None),
):
    """Get attendance records with optional filters"""
    conn = get_connection()
    try:
        sql = """
            SELECT a.id, a.employee_id, a.date, a.status, a.check_in_time, a.check_out_time, a.created_at
            FROM attendance a
            WHERE 1=1
        """
        params = []
        if employeeId is not None:
            sql += " AND a.employee_id = ?"
            params.append(employeeId)
        if date:
            sql += " AND a.date = ?"
            params.append(date.strip())
        sql += " ORDER BY a.date DESC, a.created_at DESC"

        rows = conn.execute(sql, params).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.post("", response_model=AttendanceResponse, status_code=201)
def mark_attendance(body: AttendanceCreate):
    """Mark attendance for an employee"""
    conn = get_connection()
    try:
        # Check if employee exists
        emp = conn.execute("SELECT id FROM employees WHERE id = ?", (body.employee_id,)).fetchone()
        if not emp:
            raise HTTPException(status_code=404, detail="Employee not found")

        try:
            conn.execute(
                """INSERT INTO attendance (employee_id, date, status, check_in_time, check_out_time) 
                   VALUES (?, ?, ?, ?, ?)""",
                (body.employee_id, body.date.strip(), body.status.strip(), body.check_in_time, body.check_out_time),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            conn.rollback()
            raise HTTPException(
                status_code=409,
                detail="Attendance already marked for this employee on this date",
            )

        row = conn.execute(
            "SELECT id, employee_id, date, status, check_in_time, check_out_time, created_at FROM attendance WHERE employee_id = ? AND date = ?",
            (body.employee_id, body.date.strip()),
        ).fetchone()
        return dict(row)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to mark attendance: {str(e)}")
    finally:
        conn.close()


@router.get("/summary", response_model=list[SummaryRow])
def attendance_summary():
    """Get attendance summary for all employees"""
    conn = get_connection()
    try:
        rows = conn.execute("""
            SELECT e.id, e.employee_id, e.full_name, COALESCE(d.name, 'N/A') as department,
                   COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present_days,
                   COUNT(a.id) AS total_records
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN attendance a ON a.employee_id = e.id
            GROUP BY e.id
            ORDER BY e.full_name
        """).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
