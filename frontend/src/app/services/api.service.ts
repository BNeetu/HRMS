import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

const API_BASE = '';

export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at?: string;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  status: string;
  emp_code?: string;
  full_name?: string;
  created_at?: string;
}

export interface AttendanceCreate {
  employee_id: number;
  date: string;
  status: 'Present' | 'Absent';
}

export interface SummaryRow {
  id: number;
  employee_id: string;
  full_name: string;
  department: string;
  present_days: number;
  total_records: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(API_BASE + '/api/employees').pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  addEmployee(body: EmployeeCreate): Observable<Employee> {
    return this.http.post<Employee>(API_BASE + '/api/employees', body).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(API_BASE + '/api/employees/' + id).pipe(
      catchError((err) => throwError(() => this.getErrorMessage(err)))
    );
  }

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
