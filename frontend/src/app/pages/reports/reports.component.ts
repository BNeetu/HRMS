import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AttendanceReport, DailyStatistics, DepartmentStatistics } from '../../services/api.service';
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

      <!-- Daily Statistics Card -->
      <div class="card stats-card">
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
        <div class="date-selector">
          <label>Select Date:</label>
          <input type="date" [(ngModel)]="selectedDate" (change)="loadDailyStatistics()">
        </div>
      </div>

      <!-- Monthly Report -->
      <div class="card">
        <h2>Monthly Attendance Report - {{ currentMonth }}/{{ currentYear }}</h2>
        <div class="month-selector">
          <select [(ngModel)]="currentMonth" (change)="loadMonthlyReport()">
            @for (m of months; track m.value) {
              <option [value]="m.value">{{ m.label }}</option>
            }
          </select>
          <select [(ngModel)]="currentYear" (change)="loadMonthlyReport()">
            @for (y of years; track y) {
              <option [value]="y">{{ y }}</option>
            }
          </select>
        </div>
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

      <!-- Department Statistics -->
      <div class="card">
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

      <!-- Charts -->
      <div class="charts-grid">
        <div class="card chart-card">
          <h2>Daily Attendance Pie Chart</h2>
          <canvas #dailyChart></canvas>
        </div>
        <div class="card chart-card">
          <h2>Monthly Attendance Bar Chart</h2>
          <canvas #monthlyChart></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      margin-left: 250px;
      padding: 2rem;
      background: #0f172a;
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: #f1f5f9;
      font-size: 2rem;
    }

    .card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      border: 1px solid rgba(56, 189, 248, 0.2);
      margin-bottom: 2rem;
    }

    .card h2 {
      margin-top: 0;
      color: #f1f5f9;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
      padding-bottom: 1rem;
    }

    .stats-card {
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .stat-box {
      background: rgba(56, 189, 248, 0.1);
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid #38bdf8;
      text-align: center;
    }

    .stat-box.success {
      border-left-color: #34d399;
      background: rgba(52, 211, 153, 0.1);
    }

    .stat-box.danger {
      border-left-color: #f87171;
      background: rgba(248, 113, 113, 0.1);
    }

    .stat-box.warning {
      border-left-color: #fbbf24;
      background: rgba(251, 191, 36, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .stat-label {
      color: #cbd5e1;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .stat-percent {
      color: #34d399;
      font-size: 0.85rem;
      margin-top: 0.5rem;
    }

    .date-selector,
    .month-selector {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(56, 189, 248, 0.2);
    }

    .date-selector label,
    .month-selector label {
      color: #cbd5e1;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }

    .date-selector input,
    .month-selector select {
      padding: 0.5rem;
      background: #334155;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      color: #f1f5f9;
      margin-right: 1rem;
      margin-bottom: 0.5rem;
    }

    .month-selector {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .month-selector select {
      margin: 0;
      padding: 0.6rem;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      color: #cbd5e1;
    }

    .table thead {
      background: rgba(56, 189, 248, 0.1);
    }

    .table th,
    .table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .table td.success {
      color: #34d399;
      font-weight: 600;
    }

    .table td.danger {
      color: #f87171;
      font-weight: 600;
    }

    .progress-bar {
      background: rgba(148, 163, 184, 0.2);
      border-radius: 4px;
      height: 6px;
      overflow: hidden;
      margin: 0.5rem 0;
    }

    .progress {
      background: linear-gradient(90deg, #34d399, #6ee7b7);
      height: 100%;
      transition: width 0.3s;
    }

    .percent-text {
      display: inline-block;
      color: #94a3b8;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .dept-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .dept-stat-card {
      background: rgba(56, 189, 248, 0.1);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .dept-stat-card h3 {
      margin: 0 0 1rem 0;
      color: #38bdf8;
      font-size: 1.1rem;
    }

    .dept-numbers {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .number {
      flex: 1;
      text-align: center;
      padding: 0.75rem;
      background: rgba(148, 163, 184, 0.1);
      border-radius: 6px;
    }

    .number.success {
      background: rgba(52, 211, 153, 0.1);
    }

    .number.danger {
      background: rgba(248, 113, 113, 0.1);
    }

    .number .value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .number .label {
      display: block;
      color: #94a3b8;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .dept-progress {
      margin-top: 1rem;
    }

    .dept-progress .progress {
      background: linear-gradient(90deg, #34d399, #6ee7b7);
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }

    .chart-card {
      position: relative;
      height: 500px;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .page-container {
        margin-left: 0;
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }

      .chart-card {
        height: 350px;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  @ViewChild('dailyChart') dailyChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyChart') monthlyChartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedDate = this.getTodayDate();
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  dailyStats: DailyStatistics | null = null;
  monthlyReports: AttendanceReport[] = [];
  deptStats: DepartmentStatistics[] = [];

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  years = [2023, 2024, 2025, 2026];

  dailyChart: ChartJS | null = null;
  monthlyChart: ChartJS | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDailyStatistics();
    this.loadMonthlyReport();
    this.loadDepartmentStatistics();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.dailyStats) this.createDailyChart();
      if (this.monthlyReports.length > 0) this.createMonthlyChart();
    }, 100);
  }

  loadDailyStatistics() {
    this.api.getDailyStatistics(this.selectedDate).subscribe({
      next: (data) => {
        this.dailyStats = data;
        this.createDailyChart();
      },
      error: (err) => console.error('Error loading daily statistics:', err)
    });

    this.loadDepartmentStatistics();
  }

  loadMonthlyReport() {
    this.api.getMonthlyAttendanceReport(this.currentMonth, this.currentYear).subscribe({
      next: (data) => {
        this.monthlyReports = data;
        this.createMonthlyChart();
      },
      error: (err) => console.error('Error loading monthly report:', err)
    });
  }

  loadDepartmentStatistics() {
    this.api.getDepartmentStatistics(this.selectedDate).subscribe({
      next: (data) => {
        this.deptStats = data;
      },
      error: (err) => console.error('Error loading department statistics:', err)
    });
  }

  private createDailyChart() {
    if (!this.dailyChartCanvas || !this.dailyStats) return;

    const canvas = this.dailyChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.dailyChart) this.dailyChart.destroy();

    this.dailyChart = new ChartJS(ctx, {
      type: 'pie',
      data: {
        labels: ['Present', 'Absent', 'On Leave'],
        datasets: [{
          data: [
            this.dailyStats.present_today,
            this.dailyStats.absent_today,
            this.dailyStats.leave_today
          ],
          backgroundColor: ['#34d399', '#f87171', '#fbbf24'],
          borderColor: ['#6ee7b7', '#fca5a5', '#fcd34d'],
          borderWidth: 2,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: '#f1f5f9', font: { size: 12, weight: 'bold' } }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(56, 189, 248, 0.5)',
            borderWidth: 1,
            callbacks: {
              label: (context: any) => {
                const percentage = ((context.parsed / this.dailyStats!.total_employees) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private createMonthlyChart() {
    if (!this.monthlyChartCanvas || this.monthlyReports.length === 0) return;

    const canvas = this.monthlyChartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.monthlyChart) this.monthlyChart.destroy();

    this.monthlyChart = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: this.monthlyReports.map(r => r.full_name),
        datasets: [
          {
            label: 'Present',
            data: this.monthlyReports.map(r => r.total_present),
            backgroundColor: '#34d399',
            borderColor: '#6ee7b7',
            borderWidth: 0,
            borderRadius: 6
          },
          {
            label: 'Absent',
            data: this.monthlyReports.map(r => r.total_absent),
            backgroundColor: '#f87171',
            borderColor: '#fca5a5',
            borderWidth: 0,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: { color: '#f1f5f9', font: { size: 12, weight: 'bold' } }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderColor: 'rgba(56, 189, 248, 0.5)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          x: {
            ticks: { color: '#cbd5e1', font: { size: 10 } },
            grid: { display: false }
          }
        }
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
