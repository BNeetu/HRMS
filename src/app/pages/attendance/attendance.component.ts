import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Employee, AttendanceRecord, AttendanceCreate } from '../../services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title">Attendance</h1>

    <div class="card">
      <h2 style="margin-bottom: 1rem; font-size: 1.1rem;">Mark attendance</h2>
      @if (markSuccess) {
        <div class="alert alert-success">{{ markSuccess }}</div>
      }
      @if (markError) {
        <div class="alert alert-error">{{ markError }}</div>
      }
      <form (ngSubmit)="onMarkAttendance()" style="max-width: 400px;">
        <div class="form-group">
          <label class="label">Employee</label>
          <select class="select" [(ngModel)]="markForm.employee" name="employee" required>
            <option [ngValue]="null" disabled>Select employee</option>
            @for (e of employees; track e.id) {
              <option [ngValue]="e.id">{{ e.employee_id }} – {{ e.full_name }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label class="label">Date</label>
          <input type="date" class="input" [(ngModel)]="markForm.date" name="date" required (change)="onDateChange()" />
          @if (isSundaySelected) {
            <small style="color: #ff7d86; display: block; margin-top: 4px;">ℹ️ Selected date is a Sunday (Holiday)</small>
          }
        </div>
        <div class="form-group">
          <label class="label">Status</label>
          <select class="select" [(ngModel)]="markForm.status" name="status" required>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">Mark attendance</button>
      </form>
    </div>

    <div class="card">
      <h2 style="margin-bottom: 1rem; font-size: 1.1rem;">Attendance records</h2>
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0;">
          <label class="label">Filter by employee</label>
          <select class="select" style="width: auto; min-width: 200px;" [(ngModel)]="filterEmployeeId" (ngModelChange)="loadAttendance()">
            <option [ngValue]="null">All employees</option>
            @for (e of employees; track e.id) {
              <option [ngValue]="e.id">{{ e.employee_id }} – {{ e.full_name }}</option>
            }
          </select>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="label">Filter by date</label>
          <input type="date" class="input" style="width: auto;" [(ngModel)]="filterDate" (ngModelChange)="loadAttendance()" />
        </div>
      </div>
      @if (loadingAttendance) {
        <div class="loading-spinner"></div>
      } @else if (attendanceError) {
        <div class="error-state">{{ attendanceError }}</div>
      } @else if (attendance.length === 0) {
        <div class="empty-state">No attendance records. Mark attendance above.</div>
      } @else {
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (a of attendance; track a.id) {
                <tr>
                  <td>{{ a.full_name || a.emp_code }} ({{ a.emp_code || a.employee_id }})</td>
                  <td>{{ a.date }}</td>
                  <td><span class="badge" [class.badge-present]="a.status === 'Present'" [class.badge-absent]="a.status === 'Absent'">{{ a.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AttendanceComponent implements OnInit {
  employees: Employee[] = [];
  attendance: AttendanceRecord[] = [];
  loadingAttendance = false;
  attendanceError: string | null = null;
  markSuccess: string | null = null;
  markError: string | null = null;
  filterEmployeeId: number | null = null;
  filterDate: string | null = null;
  isSundaySelected = false;
  markForm: AttendanceCreate = {
    employee: 0 as unknown as number,
    employee_id: 0 as unknown as number,
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
  };

  constructor(private api: ApiService) {
    this.onDateChange(); // Initial check
  }

  ngOnInit(): void {
    this.api.getEmployees().subscribe({
      next: (list) => {
        this.employees = list;
        if (list.length && !this.markForm.employee) {
          this.markForm.employee = list[0].id;
        }
      },
    });
    this.loadAttendance();
  }

  onDateChange(): void {
    if (this.markForm.date) {
      const selected = new Date(this.markForm.date);
      this.isSundaySelected = selected.getDay() === 0;
    }
  }

  loadAttendance(): void {
    this.loadingAttendance = true;
    this.attendanceError = null;
    const params: { employeeId?: number; date?: string } = {};
    if (this.filterEmployeeId != null) params.employeeId = this.filterEmployeeId;
    if (this.filterDate) params.date = this.filterDate;
    this.api.getAttendance(params).subscribe({
      next: (list) => {
        this.attendance = list;
        this.loadingAttendance = false;
      },
      error: (err: string) => {
        this.attendanceError = err;
        this.loadingAttendance = false;
      },
    });
  }

  onMarkAttendance(): void {
    this.markError = null;
    this.markSuccess = null;
    const payload: AttendanceCreate = {
      employee: Number(this.markForm.employee),
      employee_id: Number(this.markForm.employee),
      date: String(this.markForm.date),
      status: this.markForm.status,
    };
    if (!payload.employee || !payload.date) {
      this.markError = 'Employee and date are required.';
      return;
    }
    this.api.markAttendance(payload).subscribe({
      next: () => {
        this.markSuccess = 'Attendance marked successfully.';
        this.loadAttendance();
      },
      error: (err: string) => {
        this.markError = err;
      },
    });
  }
}
