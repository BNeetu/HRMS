import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AttendanceRecord, AttendanceReport, DailyStatistics, DepartmentStatistics, Employee } from '../../services/api.service';
import { Chart as ChartJS, BarController, LineController, PieController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarController, LineController, PieController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📈 Analytics & Reports</h1>
      </div>

      <div class="selectors-grid">
        <!-- Date Selector Card -->
        <div class="card selector-card">
          <label class="label">Daily View</label>
          <div class="selector-controls">
            <input type="date" class="input" [(ngModel)]="selectedDate" (change)="loadDailyStatistics()">
          </div>
        </div>

        <!-- Month/Year Selector Card -->
        <div class="card selector-card">
          <label class="label">Monthly View</label>
          <div class="selector-controls">
            <select class="select" [(ngModel)]="currentMonth" (change)="loadMonthlyReport()">
              @for (m of months; track m.value) {
                <option [value]="m.value">{{ m.label }}</option>
              }
            </select>
            <select class="select" [(ngModel)]="currentYear" (change)="loadMonthlyReport()">
              @for (y of years; track y) {
                <option [value]="y">{{ y }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Employee Selector Card -->
        <div class="card selector-card">
          <label class="label">Employee Focus</label>
          <div class="selector-controls">
            <select class="select" [(ngModel)]="selectedEmployeeId" (change)="loadEmployeeReport()">
              <option [ngValue]="null">All Employees</option>
              @for (e of employees; track e.id) {
                <option [value]="e.id">{{ e.full_name }} ({{ e.employee_id }})</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Daily Statistics -->
      <div class="card stats-card" *ngIf="!selectedEmployeeId">
        <h2>Daily Attendance Summary - {{ selectedDate }}</h2>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">{{ dailyStats?.total_employees || 0 }}</div>
            <div class="stat-label">Total Employees</div>
          </div>
          <div class="stat-box success">
            <div class="stat-value">{{ dailyStats?.present_today || 0 }}</div>
            <div class="stat-label">Present</div>
            <div class="stat-percent">{{ dailyStats?.present_percentage || 0 }}%</div>
          </div>
          <div class="stat-box danger">
            <div class="stat-value">{{ dailyStats?.absent_today || 0 }}</div>
            <div class="stat-label">Absent</div>
            <div class="stat-percent">{{ dailyStats?.absent_percentage || 0 }}%</div>
          </div>
          <div class="stat-box warning">
            <div class="stat-value">{{ dailyStats?.leave_today || 0 }}</div>
            <div class="stat-label">On Leave</div>
          </div>
        </div>
      </div>

      <!-- Daily Employee List -->
      <div class="card" *ngIf="!selectedEmployeeId">
        <h2>Daily Employee Attendance Detail - {{ selectedDate }}</h2>
        @if (employees.length === 0) {
          <div class="empty-state">No employee data found</div>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                @for (emp of getDailyEmployeeStatus(); track emp.id) {
                  <tr>
                    <td>{{ emp.employee_id }}</td>
                    <td>{{ emp.full_name }}</td>
                    <td>{{ emp.department }}</td>
                    <td>
                      <span class="status-badge" [class.present]="emp.status === 'Present'" [class.absent]="emp.status === 'Absent'">
                        {{ emp.status }}
                      </span>
                    </td>
                    <td>{{ emp.check_in }}</td>
                    <td>{{ emp.check_out }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Employee Specific Stats -->
      <div class="card stats-card" *ngIf="selectedEmployeeId && employeeReport">
        <h2>Employee Performance - {{ employeeReport.full_name }}</h2>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">{{ employeeReport.total_days }}</div>
            <div class="stat-label">Working Days</div>
          </div>
          <div class="stat-box success">
            <div class="stat-value">{{ employeeReport.total_present }}</div>
            <div class="stat-label">Days Present</div>
          </div>
          <div class="stat-box danger">
            <div class="stat-value">{{ employeeReport.total_absent }}</div>
            <div class="stat-label">Days Absent</div>
          </div>
          <div class="stat-box warning">
            <div class="stat-value">{{ employeeReport.percentage }}%</div>
            <div class="stat-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      <!-- Monthly Report Table -->
      <div class="card" *ngIf="!selectedEmployeeId">
        <h2>Monthly Attendance Report - {{ getMonthName(currentMonth) }} {{ currentYear }}</h2>
        @if (monthlyReports.length === 0) {
          <div class="empty-state">No attendance data available for this period</div>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total Days</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                @for (report of monthlyReports; track report.employee_id) {
                  <tr>
                    <td>{{ report.full_name }}</td>
                    <td class="success">{{ report.total_present }}</td>
                    <td class="danger">{{ report.total_absent }}</td>
                    <td>{{ report.total_days }}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress" [style.width.%]="report.percentage"></div>
                      </div>
                      <span class="percent-text">{{ report.percentage }}%</span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Department Statistics (Only shown for general view) -->
      <div class="card" *ngIf="!selectedEmployeeId">
        <h2>Department-wise Attendance - {{ selectedDate }}</h2>
        @if (deptStats.length === 0) {
          <div class="empty-state">No department data available</div>
        } @else {
          <div class="dept-stats-grid">
            @for (dept of deptStats; track dept.department_id) {
              <div class="dept-stat-card">
                <h3>{{ dept.department_name }}</h3>
                <div class="dept-numbers">
                  <div class="number">
                    <span class="value">{{ dept.total_employees }}</span>
                    <span class="label">Employees</span>
                  </div>
                  <div class="number success">
                    <span class="value">{{ dept.present_count }}</span>
                    <span class="label">Present</span>
                  </div>
                  <div class="number danger">
                    <span class="value">{{ dept.absent_count }}</span>
                    <span class="label">Absent</span>
                  </div>
                </div>
                <div class="dept-progress">
                  <div class="progress-bar">
                    <div class="progress success" [style.width.%]="dept.present_percentage"></div>
                  </div>
                  <span class="percent-text">{{ dept.present_percentage }}% Present</span>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Charts (Only shown for general view) -->
      <div class="charts-grid" *ngIf="!selectedEmployeeId">
        <div class="card chart-card">
          <h2>Daily Attendance Pie Chart</h2>
          <canvas #dailyChart></canvas>
        </div>
        <div class="card chart-card">
          <h2>Monthly Attendance Bar Chart</h2>
          <canvas #monthlyChart></canvas>
        </div>
      </div>

      <!-- Employee Specific Chart -->
      <div class="card chart-card" *ngIf="selectedEmployeeId && employeeReport">
        <h2>Attendance Trend - {{ employeeReport.full_name }}</h2>
        <canvas #employeeChart></canvas>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 0;
      min-height: 100vh;
      color: #eaf0ff;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: #f7faff;
      font-size: clamp(1.35rem, 1.2rem + 0.8vw, 1.95rem);
      font-weight: 800;
    }

    .selectors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .selector-card {
      padding: 1.25rem !important;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .selector-controls {
      display: flex;
      gap: 0.75rem;
    }

    .card {
      background: linear-gradient(160deg, rgba(16, 31, 61, 0.96), rgba(12, 24, 48, 0.96));
      padding: 2rem;
      border-radius: 14px;
      box-shadow: 0 14px 38px rgba(2, 8, 24, 0.45);
      border: 1px solid rgba(120, 150, 255, 0.2);
      backdrop-filter: blur(6px);
      margin-bottom: 1.5rem;
      animation: fade-up 0.3s ease;
    }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .card h2 {
      margin-top: 0;
      color: #f1f5f9;
      font-size: 1.2rem;
      border-bottom: 1px solid rgba(120, 150, 255, 0.1);
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }

    .label {
      display: block;
      font-size: 0.82rem;
      letter-spacing: 0.03em;
      font-weight: 700;
      color: #9fb0d4;
      text-transform: uppercase;
    }

    .input, .select {
      flex: 1;
      padding: 0.65rem 0.78rem;
      background: #112448;
      border: 1px solid rgba(120, 150, 255, 0.28);
      border-radius: 10px;
      color: #eef4ff;
      font-size: 0.95rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      outline: none;
      color-scheme: dark;
    }

    .input:focus, .select:focus {
      border-color: #85a0ff;
      box-shadow: 0 0 0 3px rgba(95, 124, 255, 0.22);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
    }

    .stat-box {
      background: rgba(95, 124, 255, 0.08);
      padding: 1.5rem;
      border-radius: 12px;
      border-left: 4px solid #5f7cff;
      text-align: center;
      transition: transform 0.2s ease;
    }

    .stat-box:hover {
      transform: translateY(-2px);
    }

    .stat-box.success { border-left-color: #33d09b; background: rgba(51, 208, 155, 0.08); }
    .stat-box.danger { border-left-color: #ff7d86; background: rgba(255, 125, 134, 0.08); }
    .stat-box.warning { border-left-color: #fbbf24; background: rgba(251, 191, 36, 0.08); }

    .stat-value {
      font-size: clamp(1.5rem, 1.2rem + 1vw, 2.2rem);
      font-weight: 800;
      color: #f7faff;
      line-height: 1.1;
    }

    .stat-label {
      color: #9fb0d4;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .stat-percent {
      color: #33d09b;
      font-size: 0.85rem;
      margin-top: 0.4rem;
      font-weight: 700;
    }

    .table-wrap {
      overflow: auto;
      border-radius: 12px;
      border: 1px solid rgba(120, 150, 255, 0.18);
      background: rgba(10, 20, 42, 0.4);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      color: #cbd5e1;
    }

    .table th {
      padding: 0.72rem 0.85rem;
      text-align: left;
      color: #a9b8da;
      font-size: 0.74rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
      background: rgba(16, 28, 58, 0.95);
      border-bottom: 1px solid rgba(120, 150, 255, 0.18);
    }

    .table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(120, 150, 255, 0.1);
      font-size: 0.9rem;
    }

    .table tbody tr:hover {
      background: rgba(95, 124, 255, 0.05);
    }

    .table td.success { color: #33d09b; font-weight: 600; }
    .table td.danger { color: #ff7d86; font-weight: 600; }

    .status-badge {
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .status-badge.present {
      background: rgba(51, 208, 155, 0.15);
      color: #33d09b;
    }

    .status-badge.absent {
      background: rgba(255, 125, 134, 0.15);
      color: #ff7d86;
    }

    .progress-bar {
      background: rgba(148, 163, 184, 0.15);
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
      margin: 0.5rem 0;
      width: 120px;
      display: inline-block;
      vertical-align: middle;
    }

    .progress {
      background: linear-gradient(90deg, #33d09b, #6ee7b7);
      height: 100%;
      transition: width 0.3s;
    }

    .percent-text {
      display: inline-block;
      color: #9fb0d4;
      font-size: 0.8rem;
      margin-left: 0.8rem;
      font-weight: 600;
    }

    .dept-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .dept-stat-card {
      background: rgba(95, 124, 255, 0.05);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(120, 150, 255, 0.15);
    }

    .dept-stat-card h3 {
      margin: 0 0 1.25rem 0;
      color: #85a0ff;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .dept-numbers {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .number {
      flex: 1;
      text-align: center;
      padding: 0.75rem;
      background: rgba(16, 31, 61, 0.6);
      border-radius: 10px;
      border: 1px solid rgba(120, 150, 255, 0.1);
    }

    .number.success { background: rgba(51, 208, 155, 0.08); border-color: rgba(51, 208, 155, 0.2); }
    .number.danger { background: rgba(255, 125, 134, 0.08); border-color: rgba(255, 125, 134, 0.2); }

    .number .value {
      display: block;
      font-size: 1.4rem;
      font-weight: 700;
      color: #f7faff;
    }

    .number .label {
      display: block;
      color: #9fb0d4;
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .chart-card {
      height: 450px;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #9fb0d4;
      font-style: italic;
    }

    @media (max-width: 1024px) {
      .page-container {
        margin-left: 0;
        padding: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-grid { grid-template-columns: 1fr; }
      .chart-card { height: 350px; }
      .selectors-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('dailyChart') dailyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('employeeChart') employeeChartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedDate = '2026-03-05';
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  selectedEmployeeId: number | null = null;

  loadingDaily = false;
  dailyStats: DailyStatistics | null = null;
  dailyAttendanceRecords: AttendanceRecord[] = [];
  monthlyReports: AttendanceReport[] = [];
  deptStats: DepartmentStatistics[] = [];
  employees: Employee[] = [];
  employeeReport: AttendanceReport | null = null;

  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  years = [2024, 2025, 2026];

  dailyChart: ChartJS | null = null;
  monthlyChart: ChartJS | null = null;
  employeeChart: ChartJS | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadMonthlyReport();
    this.loadDepartmentStatistics();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateCharts();
    }, 300);
  }

  loadEmployees() {
    this.api.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loadDailyStatistics();
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  loadDailyStatistics() {
    this.loadingDaily = true;
    this.api.getDailyStatistics(this.selectedDate).subscribe({
      next: (data) => {
        this.dailyStats = data;
        this.createDailyChart();
      },
      error: (err) => console.error('Error loading daily statistics:', err)
    });

    this.api.getAttendance({ date: this.selectedDate }).subscribe({
      next: (data) => {
        this.dailyAttendanceRecords = data;
        this.loadingDaily = false;
      },
      error: (err) => {
        console.error('Error loading daily attendance:', err);
        this.loadingDaily = false;
      }
    });
  }

  getDailyEmployeeStatus() {
    if (!this.employees.length) return [];
    return this.employees.map(emp => {
      const record = this.dailyAttendanceRecords.find(r => 
        String(r.employee_id) === String(emp.id) || 
        String(r.employee) === String(emp.id)
      );
      return {
        id: emp.id,
        employee_id: emp.employee_id,
        full_name: emp.full_name,
        department: emp.department,
        status: record ? record.status : 'Absent',
        check_in: record?.check_in_time || '-',
        check_out: record?.check_out_time || '-'
      };
    });
  }

  loadMonthlyReport() {
    this.api.getMonthlyAttendanceReport(this.currentMonth, this.currentYear).subscribe({
      next: (data) => {
        this.monthlyReports = data;
        this.createMonthlyChart();
        if (this.selectedEmployeeId) this.loadEmployeeReport();
      },
      error: (err) => console.error('Error loading monthly report:', err)
    });
  }

  loadDepartmentStatistics() {
    this.api.getDepartmentStatistics(this.selectedDate).subscribe({
      next: (data) => this.deptStats = data,
      error: (err) => console.error('Error loading department statistics:', err)
    });
  }

  loadEmployeeReport() {
    if (!this.selectedEmployeeId) {
      this.employeeReport = null;
      setTimeout(() => this.updateCharts(), 0);
      return;
    }

    // Find the report for this employee in the monthly reports
    const report = this.monthlyReports.find(r => r.employee_id == this.selectedEmployeeId);
    if (report) {
      this.employeeReport = report;
      setTimeout(() => this.createEmployeeChart(), 100);
    } else {
      // If not in current month list, we might need a direct call or it's just 0
      this.employeeReport = {
        employee_id: Number(this.selectedEmployeeId),
        full_name: this.employees.find(e => e.id == this.selectedEmployeeId)?.full_name || 'Employee',
        total_present: 0,
        total_absent: 0,
        total_days: 0,
        percentage: 0
      };
      setTimeout(() => this.createEmployeeChart(), 100);
    }
  }

  getMonthName(m: number): string {
    return this.months.find(month => month.value == m)?.label || '';
  }

  private updateCharts() {
    if (!this.selectedEmployeeId) {
      this.createDailyChart();
      this.createMonthlyChart();
    } else {
      this.createEmployeeChart();
    }
  }

  private createDailyChart() {
    if (!this.dailyChartCanvas || !this.dailyStats || this.selectedEmployeeId) return;

    const ctx = this.dailyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.dailyChart) this.dailyChart.destroy();

    this.dailyChart = new ChartJS(ctx, {
      type: 'pie',
      data: {
        labels: ['Present', 'Absent', 'On Leave'],
        datasets: [{
          data: [this.dailyStats.present_today, this.dailyStats.absent_today, this.dailyStats.leave_today],
          backgroundColor: ['#33d09b', '#ff7d86', '#fbbf24'],
          borderColor: ['rgba(255,255,255,0.1)'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9fb0d4', font: { weight: 'bold' } } }
        }
      }
    });
  }

  private createMonthlyChart() {
    if (!this.monthlyChartCanvas || this.monthlyReports.length === 0 || this.selectedEmployeeId) return;

    const ctx = this.monthlyChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.monthlyChart) this.monthlyChart.destroy();

    this.monthlyChart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: this.monthlyReports.slice(0, 10).map(r => r.full_name),
        datasets: [
          { label: 'Present', data: this.monthlyReports.slice(0, 10).map(r => r.total_present), backgroundColor: '#33d09b', borderRadius: 4 },
          { label: 'Absent', data: this.monthlyReports.slice(0, 10).map(r => r.total_absent), backgroundColor: '#ff7d86', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#9fb0d4' } }
        },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9fb0d4' } },
          x: { grid: { display: false }, ticks: { color: '#9fb0d4' } }
        }
      }
    });
  }

  private createEmployeeChart() {
    if (!this.employeeChartCanvas || !this.employeeReport) return;

    const ctx = this.employeeChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.employeeChart) this.employeeChart.destroy();

    this.employeeChart = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent'],
        datasets: [{
          data: [this.employeeReport.total_present, this.employeeReport.total_absent],
          backgroundColor: ['#33d09b', '#ff7d86'],
          borderWidth: 0,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#9fb0d4', font: { size: 14 } } }
        },
        cutout: '70%'
      }
    });
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
