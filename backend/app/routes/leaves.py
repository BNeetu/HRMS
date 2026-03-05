from fastapi import APIRouter, HTTPException, Query
from app.database import get_connection
from app.schemas import (
    LeaveCreate, LeaveUpdate, LeaveResponse, LeaveDetailResponse,
    LeaveTypeCreate, LeaveTypeResponse, LeaveBalanceResponse
)

router = APIRouter()

# ========== Leave Types ==========

@router.get("/types", response_model=list[LeaveTypeResponse])
def get_leave_types():
    """Get all leave types"""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM leave_types").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.post("/types", response_model=LeaveTypeResponse)
def create_leave_type(body: LeaveTypeCreate):
    """Create a new leave type"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO leave_types (name, description) VALUES (?, ?)",
            (body.name, body.description)
        )
        conn.commit()
        return {"id": cursor.lastrowid, **body.model_dump()}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


# ========== Leaves ==========

@router.get("", response_model=list[LeaveResponse])
def get_leaves(employee_id: int = Query(None), status: str = Query(None)):
    """Get leaves with optional filters"""
    conn = get_connection()
    try:
        query = "SELECT * FROM leaves WHERE 1=1"
        params = []
        
        if employee_id:
            query += " AND employee_id = ?"
            params.append(employee_id)
        
        if status:
            query += " AND status = ?"
            params.append(status)
        
        query += " ORDER BY start_date DESC"
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/{leave_id}", response_model=LeaveDetailResponse)
def get_leave(leave_id: int):
    """Get specific leave details"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM leaves WHERE id = ?", (leave_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Leave not found")
        
        leave_dict = dict(row)
        
        # Get employee details
        emp = conn.execute("SELECT * FROM employees WHERE id = ?", (leave_dict['employee_id'],)).fetchone()
        if emp:
            leave_dict['employee'] = dict(emp)
        
        # Get leave type details
        lt = conn.execute("SELECT * FROM leave_types WHERE id = ?", (leave_dict['leave_type_id'],)).fetchone()
        if lt:
            leave_dict['leave_type'] = dict(lt)
        
        return leave_dict
    finally:
        conn.close()


@router.post("", response_model=LeaveResponse)
def create_leave(body: LeaveCreate):
    """Create a leave request"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """INSERT INTO leaves (employee_id, leave_type_id, start_date, end_date, reason, status)
               VALUES (?, ?, ?, ?, ?, 'pending')""",
            (body.employee_id, body.leave_type_id, body.start_date, body.end_date, body.reason)
        )
        conn.commit()
        
        leave_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM leaves WHERE id = ?", (leave_id,)).fetchone()
        return dict(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


@router.put("/{leave_id}", response_model=LeaveResponse)
def update_leave(leave_id: int, body: LeaveUpdate):
    """Approve/reject/cancel a leave request"""
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE leaves SET status = ? WHERE id = ?",
            (body.status, leave_id)
        )
        conn.commit()
        
        row = conn.execute("SELECT * FROM leaves WHERE id = ?", (leave_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Leave not found")
        return dict(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


# ========== Leave Balances ==========

@router.get("/balance/{employee_id}", response_model=list[LeaveBalanceResponse])
def get_leave_balance(employee_id: int):
    """Get leave balance for an employee"""
    conn = get_connection()
    try:
        rows = conn.execute(
            """SELECT id, employee_id, leave_type_id, total_days, used_days, 
                      (total_days - used_days) as available_days, year 
               FROM leave_balances WHERE employee_id = ?""",
            (employee_id,)
        ).fetchall()
        
        if not rows:
            raise HTTPException(status_code=404, detail="No leave balances found")
        
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.post("/balance/initialize/{employee_id}")
def initialize_leave_balance(employee_id: int):
    """Initialize leave balance for an employee"""
    conn = get_connection()
    try:
        # Get all leave types
        types = conn.execute("SELECT id FROM leave_types").fetchall()
        
        for lt in types:
            # Check if balance already exists
            existing = conn.execute(
                "SELECT id FROM leave_balances WHERE employee_id = ? AND leave_type_id = ?",
                (employee_id, lt['id'])
            ).fetchone()
            
            if not existing:
                conn.execute(
                    """INSERT INTO leave_balances (employee_id, leave_type_id, total_days, year)
                       VALUES (?, ?, 20, 2024)""",
                    (employee_id, lt['id'])
                )
        
        conn.commit()
        return {"message": "Leave balance initialized successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
