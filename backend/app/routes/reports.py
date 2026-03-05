from fastapi import APIRouter, HTTPException, Query
from app.database import get_connection
from app.schemas import (
    AttendanceReportResponse, AttendanceStatisticsResponse, 
    DepartmentStatisticsResponse
)

router = APIRouter()


@router.get("/attendance/monthly", response_model=list[AttendanceReportResponse])
def get_monthly_attendance_report(month: int = Query(...), year: int = Query(...)):
    """Get monthly attendance report for all employees"""
    conn = get_connection()
    try:
        query = f"""
        SELECT 
            e.id as employee_id,
            e.full_name,
            SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as total_present,
            SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as total_absent,
            COUNT(a.id) as total_days,
            ROUND(CAST(SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS FLOAT) / 
                  NULLIF(COUNT(a.id), 0) * 100, 2) as percentage
        FROM employees e
        LEFT JOIN attendance a ON e.id = a.employee_id 
        AND strftime('%m', a.date) = '{month:02d}' 
        AND strftime('%Y', a.date) = '{year}'
        GROUP BY e.id
        ORDER BY e.full_name
        """
        rows = conn.execute(query).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/attendance/daily", response_model=AttendanceStatisticsResponse)
def get_daily_attendance_statistics(date: str = Query(...)):
    """Get attendance statistics for a specific date"""
    conn = get_connection()
    try:
        total_employees = conn.execute("SELECT COUNT(*) as count FROM employees").fetchone()['count']
        present = conn.execute(
            "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'Present'",
            (date,)
        ).fetchone()['count']
        absent = conn.execute(
            "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'Absent'",
            (date,)
        ).fetchone()['count']
        
        leave = conn.execute(
            """SELECT COUNT(DISTINCT e.id) as count FROM employees e
               JOIN leaves l ON e.id = l.employee_id
               WHERE l.status = 'approved' AND ? BETWEEN l.start_date AND l.end_date""",
            (date,)
        ).fetchone()['count']
        
        present_percentage = (present / total_employees * 100) if total_employees > 0 else 0
        absent_percentage = (absent / total_employees * 100) if total_employees > 0 else 0
        
        return {
            "total_employees": total_employees,
            "present_today": present,
            "absent_today": absent,
            "leave_today": leave,
            "present_percentage": round(present_percentage, 2),
            "absent_percentage": round(absent_percentage, 2)
        }
    finally:
        conn.close()


@router.get("/attendance/department", response_model=list[DepartmentStatisticsResponse])
def get_department_statistics(date: str = Query(...)):
    """Get attendance statistics by department for a specific date"""
    conn = get_connection()
    try:
        query = f"""
        SELECT 
            d.id as department_id,
            d.name as department_name,
            COUNT(DISTINCT e.id) as total_employees,
            SUM(CASE WHEN a.status = 'Present' AND a.date = '{date}' THEN 1 ELSE 0 END) as present_count,
            SUM(CASE WHEN a.status = 'Absent' AND a.date = '{date}' THEN 1 ELSE 0 END) as absent_count,
            ROUND(CAST(SUM(CASE WHEN a.status = 'Present' AND a.date = '{date}' THEN 1 ELSE 0 END) AS FLOAT) /
                  NULLIF(COUNT(DISTINCT e.id), 0) * 100, 2) as present_percentage
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id
        LEFT JOIN attendance a ON e.id = a.employee_id
        GROUP BY d.id
        ORDER BY d.name
        """
        rows = conn.execute(query).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/leaves/summary")
def get_leaves_summary(employee_id: int = Query(None)):
    """Get leave summary"""
    conn = get_connection()
    try:
        if employee_id:
            query = """
            SELECT 
                lt.name as leave_type,
                COUNT(l.id) FILTER (WHERE l.status = 'approved') as approved_count,
                COUNT(l.id) FILTER (WHERE l.status = 'pending') as pending_count,
                COUNT(l.id) FILTER (WHERE l.status = 'rejected') as rejected_count
            FROM leave_types lt
            LEFT JOIN leaves l ON lt.id = l.leave_type_id AND l.employee_id = ?
            GROUP BY lt.id
            """
            rows = conn.execute(query, (employee_id,)).fetchall()
        else:
            query = """
            SELECT 
                lt.name as leave_type,
                COUNT(l.id) FILTER (WHERE l.status = 'approved') as approved_count,
                COUNT(l.id) FILTER (WHERE l.status = 'pending') as pending_count,
                COUNT(l.id) FILTER (WHERE l.status = 'rejected') as rejected_count
            FROM leave_types lt
            LEFT JOIN leaves l ON lt.id = l.leave_type_id
            GROUP BY lt.id
            """
            rows = conn.execute(query).fetchall()
        
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/attendance/employee/{employee_id}")
def get_employee_attendance_report(employee_id: int, month: int = Query(None), year: int = Query(None)):
    """Get attendance report for a specific employee"""
    conn = get_connection()
    try:
        query = "SELECT * FROM attendance WHERE employee_id = ?"
        params = [employee_id]
        
        if month and year:
            query += f" AND strftime('%m', date) = '{month:02d}' AND strftime('%Y', date) = '{year}'"
        
        query += " ORDER BY date DESC"
        rows = conn.execute(query, params).fetchall()
        
        total_records = len(rows)
        present_count = sum(1 for row in rows if row['status'] == 'Present')
        absent_count = total_records - present_count
        
        return {
            "employee_id": employee_id,
            "total_records": total_records,
            "present_count": present_count,
            "absent_count": absent_count,
            "attendance_percentage": round(present_count / total_records * 100, 2) if total_records > 0 else 0,
            "records": [dict(row) for row in rows]
        }
    finally:
        conn.close()
