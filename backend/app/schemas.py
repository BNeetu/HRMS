from pydantic import BaseModel, EmailStr, Field


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department: str = Field(..., min_length=1)


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: str | None = None


class AttendanceCreate(BaseModel):
    employee_id: int
    date: str = Field(..., min_length=1)
    status: str = Field(..., pattern="^(Present|Absent)$")


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: str
    status: str
    created_at: str | None = None
