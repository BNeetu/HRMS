import sqlite3
from fastapi import APIRouter, HTTPException, Query
from app.database import get_connection
from app.schemas import AttendanceCreate

router = APIRouter()


def row_to_attendance(row) -> dict:
    d = dict(row)
    return {k: d[k] for k in d.keys()}


@router.get("")
def list_attendance(
    employeeId: int | None = Query(None, alias="employeeId"),
    date: str | None = Query(None),
):
    conn = get_connection()
    try:
        sql = """
            SELECT a.id, a.employee_id, a.date, a.status, a.created_at,
                   e.employee_id AS emp_code, e.full_name
            FROM attendance a
            JOIN employees e ON e.id = a.employee_id
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

        cur = conn.execute(sql, params)
        return [row_to_attendance(dict(r)) for r in cur.fetchall()]
    finally:
        conn.close()


@router.post("", status_code=201)
def mark_attendance(body: AttendanceCreate):
    conn = get_connection()
    try:
        cur = conn.execute("SELECT id FROM employees WHERE id = ?", (body.employee_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Employee not found")

        try:
            conn.execute(
                "INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)",
                (body.employee_id, body.date.strip(), body.status.strip()),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(
                status_code=409,
                detail="Attendance already marked for this employee on this date",
            )

        row = conn.execute(
            """SELECT a.id, a.employee_id, a.date, a.status, a.created_at,
                      e.employee_id AS emp_code, e.full_name
               FROM attendance a
               JOIN employees e ON e.id = a.employee_id
               WHERE a.employee_id = ? AND a.date = ?""",
            (body.employee_id, body.date.strip()),
        ).fetchone()
        return row_to_attendance(dict(row))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to mark attendance")
    finally:
        conn.close()


@router.get("/summary")
def attendance_summary():
    conn = get_connection()
    try:
        cur = conn.execute("""
            SELECT e.id, e.employee_id, e.full_name, e.department,
                   COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS present_days,
                   COUNT(a.id) AS total_records
            FROM employees e
            LEFT JOIN attendance a ON a.employee_id = e.id
            GROUP BY e.id
            ORDER BY e.full_name
        """)
        return [dict(r) for r in cur.fetchall()]
    finally:
        conn.close()
