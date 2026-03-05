import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

const API_BASE = '';

// ========== Employee Interfaces ==========
export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department_id?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  joining_date?: string;
  position?: string;
  manager_id?: number;
  created_at?: string;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department_id: number;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  joining_date?: string;
  position?: string;
  manager_id?: number;
}

// ========== Attendance Interfaces ==========
export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  emp_code?: string;
  full_name?: string;
  created_at?: string;
}

export interface AttendanceCreate {
  employee_id: number;
  date: string;
  status: 'Present' | 'Absent';
  check_in_time?: string;
  check_out_time?: string;
}

export interface SummaryRow {
  id: number;
  employee_id: string;
  full_name: string;
  department: string;
  present_days: number;
  total_records: number;
}

// ========== Department Interfaces ==========
export interface Department {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface DepartmentCreate {
  name: string;
  description?: string;
}

// ========== Leave Interfaces ==========
export interface Leave {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  approved_by?: number;
  created_at?: string;
}

export interface LeaveCreate {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export interface LeaveTypeCreate {
  name: string;
  description?: string;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  total_days: number;
  used_days: number;
  available_days: number;
  year: number;
}

// ========== Holiday Interfaces ==========
export interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
  is_national: boolean;
  created_at?: string;
}

export interface HolidayCreate {
  name: string;
  date: string;
  description?: string;
  is_national: boolean;
}

// ========== Report Interfaces ==========
export interface AttendanceReport {
  employee_id: number;
  full_name: string;
  total_present: number;
  total_absent: number;
  total_days: number;
  percentage: number;
}

export interface DailyStatistics {
  total_employees: number;
  present_today: number;
  absent_today: number;
  leave_today: number;
  present_percentage: number;
  absent_percentage: number;
}

export interface DepartmentStatistics {
  department_id: number;
  department_name: string;
  total_employees: number;
  present_count: number;
  absent_count: number;
  present_percentage: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ========== Employees ==========
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(API_BASE + '/api/employees').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(API_BASE + '/api/employees/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  addEmployee(body: EmployeeCreate): Observable<Employee> {
    return this.http.post<Employee>(API_BASE + '/api/employees', body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  updateEmployee(id: number, body: Partial<EmployeeCreate>): Observable<Employee> {
    return this.http.put<Employee>(API_BASE + '/api/employees/' + id, body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(API_BASE + '/api/employees/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  // ========== Attendance ==========
  getAttendance(params?: { employeeId?: number; date?: string }): Observable<AttendanceRecord[]> {
    let httpParams = new HttpParams();
    if (params?.employeeId != null) httpParams = httpParams.set('employeeId', params.employeeId);
    if (params?.date) httpParams = httpParams.set('date', params.date);
    return this.http.get<AttendanceRecord[]>(API_BASE + '/api/attendance', { params: httpParams }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  markAttendance(body: AttendanceCreate): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(API_BASE + '/api/attendance', body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getAttendanceSummary(): Observable<SummaryRow[]> {
    return this.http.get<SummaryRow[]>(API_BASE + '/api/attendance/summary').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  // ========== Departments ==========
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(API_BASE + '/api/departments').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(API_BASE + '/api/departments/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  addDepartment(body: DepartmentCreate): Observable<Department> {
    return this.http.post<Department>(API_BASE + '/api/departments', body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  updateDepartment(id: number, body: DepartmentCreate): Observable<Department> {
    return this.http.put<Department>(API_BASE + '/api/departments/' + id, body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(API_BASE + '/api/departments/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  // ========== Leaves ==========
  getLeaves(params?: { employeeId?: number; status?: string }): Observable<Leave[]> {
    let httpParams = new HttpParams();
    if (params?.employeeId) httpParams = httpParams.set('employee_id', params.employeeId);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<Leave[]>(API_BASE + '/api/leaves', { params: httpParams }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getLeave(id: number): Observable<Leave> {
    return this.http.get<Leave>(API_BASE + '/api/leaves/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  requestLeave(body: LeaveCreate): Observable<Leave> {
    return this.http.post<Leave>(API_BASE + '/api/leaves', body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  updateLeave(id: number, body: { status: string }): Observable<Leave> {
    return this.http.put<Leave>(API_BASE + '/api/leaves/' + id, body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(API_BASE + '/api/leaves/types').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  addLeaveType(body: LeaveTypeCreate): Observable<LeaveType> {
    return this.http.post<LeaveType>(API_BASE + '/api/leaves/types', body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getLeaveBalance(employeeId: number): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(API_BASE + '/api/leaves/balance/' + employeeId).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  // ========== Holidays ==========
  getHolidays(): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(API_BASE + '/api/holidays').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getHoliday(id: number): Observable<Holiday> {
    return this.http.get<Holiday>(API_BASE + '/api/holidays/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  addHoliday(body: HolidayCreate): Observable<Holiday> {
    return this.http.post<Holiday>(API_BASE + '/api/holidays', body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  updateHoliday(id: number, body: HolidayCreate): Observable<Holiday> {
    return this.http.put<Holiday>(API_BASE + '/api/holidays/' + id, body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  deleteHoliday(id: number): Observable<void> {
    return this.http.delete<void>(API_BASE + '/api/holidays/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  // ========== Reports ==========
  getMonthlyAttendanceReport(month: number, year: number): Observable<AttendanceReport[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<AttendanceReport[]>(API_BASE + '/api/reports/attendance/monthly', { params }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getDailyStatistics(date: string): Observable<DailyStatistics> {
    const params = new HttpParams().set('date', date);
    return this.http.get<DailyStatistics>(API_BASE + '/api/reports/attendance/daily', { params }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getDepartmentStatistics(date: string): Observable<DepartmentStatistics[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<DepartmentStatistics[]>(API_BASE + '/api/reports/attendance/department', { params }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getLeavesSummary(employeeId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (employeeId) params = params.set('employee_id', employeeId);
    return this.http.get<any[]>(API_BASE + '/api/reports/leaves/summary', { params }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  getEmployeeAttendanceReport(employeeId: number, month?: number, year?: number): Observable<any> {
    let params = new HttpParams();
    if (month) params = params.set('month', month);
    if (year) params = params.set('year', year);
    return this.http.get<any>(API_BASE + '/api/reports/attendance/employee/' + employeeId, { params }).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  private getErrorMessage(err: { error?: { detail?: string | unknown }; status?: number }): string {
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const msg = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ');
      return msg || 'Validation failed';
    }
    if (detail && typeof detail === 'object' && 'message' in detail) return (detail as { message: string }).message;
    return (err.error?.detail?.toString()) || ('Request failed (' + (err.status || 'error') + ')');
  }
}
