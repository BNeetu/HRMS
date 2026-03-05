from fastapi import APIRouter, HTTPException
from app.database import get_connection
from app.schemas import HolidayCreate, HolidayResponse

router = APIRouter()


@router.get("", response_model=list[HolidayResponse])
def get_holidays():
    """Get all holidays"""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM holidays ORDER BY date").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@router.get("/{holiday_id}", response_model=HolidayResponse)
def get_holiday(holiday_id: int):
    """Get a specific holiday"""
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM holidays WHERE id = ?", (holiday_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Holiday not found")
        return dict(row)
    finally:
        conn.close()


@router.post("", response_model=HolidayResponse)
def create_holiday(body: HolidayCreate):
    """Create a new holiday"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            "INSERT INTO holidays (name, date, description, is_national) VALUES (?, ?, ?, ?)",
            (body.name, body.date, body.description, body.is_national)
        )
        conn.commit()
        return {"id": cursor.lastrowid, **body.model_dump()}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


@router.put("/{holiday_id}", response_model=HolidayResponse)
def update_holiday(holiday_id: int, body: HolidayCreate):
    """Update a holiday"""
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE holidays SET name = ?, date = ?, description = ?, is_national = ? WHERE id = ?",
            (body.name, body.date, body.description, body.is_national, holiday_id)
        )
        conn.commit()
        row = conn.execute("SELECT * FROM holidays WHERE id = ?", (holiday_id,)).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Holiday not found")
        return dict(row)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


@router.delete("/{holiday_id}")
def delete_holiday(holiday_id: int):
    """Delete a holiday"""
    conn = get_connection()
    try:
        conn.execute("DELETE FROM holidays WHERE id = ?", (holiday_id,))
        conn.commit()
        return {"message": "Holiday deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()
