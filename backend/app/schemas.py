from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date


# ========== User Schemas ==========
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1)
    role: str = Field(default="employee", pattern="^(admin|manager|employee)$")


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: str | None = None


class UserLogin(BaseModel):
    username: str
    password: str


# ========== Department Schemas ==========
class DepartmentCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: str | None = None


# ========== Employee Schemas ==========
class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department_id: int


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department_id: Optional[str]


class EmployeeDetailResponse(EmployeeResponse):
    department: Optional[DepartmentResponse] = None
    manager: Optional['EmployeeResponse'] = None


# ========== Attendance Schemas ==========
class AttendanceCreate(BaseModel):
    employee_id: int
    date: str = Field(..., min_length=1)
    status: str = Field(..., pattern="^(Present|Absent)$")
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: str
    status: str
    check_in_time: Optional[str]
    check_out_time: Optional[str]
    created_at: str | None = None


class SummaryRow(BaseModel):
    id: int
    employee_id: str
    full_name: str
    department: str
    present_days: int
    total_records: int


class AttendanceReportResponse(BaseModel):
    employee_id: int
    full_name: str
    total_present: int
    total_absent: int
    total_days: int
    percentage: float


# ========== Leave Type Schemas ==========
class LeaveTypeCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None


class LeaveTypeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: str | None = None


# ========== Leave Schemas ==========
class LeaveCreate(BaseModel):
    employee_id: int
    leave_type_id: int
    start_date: str = Field(..., min_length=1)
    end_date: str = Field(..., min_length=1)
    reason: Optional[str] = None


class LeaveUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|approved|rejected|cancelled)$")


class LeaveResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    start_date: str
    end_date: str
    reason: Optional[str]
    status: str
    approved_by: Optional[int]
    created_at: str | None = None


class LeaveDetailResponse(LeaveResponse):
    employee: Optional[EmployeeResponse] = None
    leave_type: Optional[LeaveTypeResponse] = None


# ========== Leave Balance Schemas ==========
class LeaveBalanceResponse(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    total_days: int
    used_days: int
    available_days: int
    year: int


# ========== Holiday Schemas ==========
class HolidayCreate(BaseModel):
    name: str = Field(..., min_length=1)
    date: str = Field(..., min_length=1)
    description: Optional[str] = None
    is_national: bool = True


class HolidayResponse(BaseModel):
    id: int
    name: str
    date: str
    description: Optional[str]
    is_national: bool
    created_at: str | None = None


# ========== Notification Schemas ==========
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: Optional[str]
    type: Optional[str]
    is_read: bool
    created_at: str | None = None


# ========== Activity Log Schemas ==========
class ActivityLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    entity_type: Optional[str]
    entity_id: Optional[int]
    description: Optional[str]
    timestamp: str


# ========== Report Schemas ==========
class AttendanceStatisticsResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    leave_today: int
    present_percentage: float
    absent_percentage: float


class DepartmentStatisticsResponse(BaseModel):
    department_id: int
    department_name: str
    total_employees: int
    present_count: int
    absent_count: int
    present_percentage: float
