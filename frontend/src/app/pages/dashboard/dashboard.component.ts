import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ApiService, SummaryRow } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import {
  Chart as ChartJS,
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  DoughnutController,
  BarController,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  loading = true;
  error: string | null = null;
  summaryRows: SummaryRow[] = [];
  summary: { totalEmployees: number; totalPresentDays: number } | null = null;
  doughnutChart: ChartJS | null = null;
  barChart: ChartJS | null = null;
  dataLoaded = false;
  viewInitialized = false;
  selectedDate: string = '';

  @ViewChild('doughnutChartCanvas', { static: false }) doughnutChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {
    this.selectedDate = this.getTodayDate();
  }

  ngOnInit(): void {
    console.log('Dashboard OnInit - starting data load');
    this.api.getAttendanceSummary().subscribe({
      next: (rows) => {
        console.log('Dashboard - data loaded:', rows);
        this.summaryRows = rows;
        this.summary = {
          totalEmployees: rows.length,
          totalPresentDays: rows.reduce((s, r) => s + (r.present_days ?? 0), 0),
        };
        this.dataLoaded = true;
        this.loading = false;
        this.cdr.detectChanges();
        
        // If view is already initialized, create charts now
        if (this.viewInitialized) {
          console.log('Dashboard - view already initialized, creating charts');
          setTimeout(() => {
            this.createDoughnutChart();
            this.createBarChart();
          }, 0);
        }
      },
      error: (err: string) => {
        console.error('Dashboard - data load error:', err);
        this.error = err;
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    console.log('Dashboard AfterViewInit');
    this.viewInitialized = true;
    
    // If data is already loaded, create charts now
    if (this.dataLoaded) {
      console.log('Dashboard - data already loaded, creating charts');
      this.createDoughnutChart();
      this.createBarChart();
    }
  }

  private createDoughnutChart(): void {
    try {
      console.log('createDoughnutChart - starting');
      
      if (!this.doughnutChartCanvas) {
        console.error('createDoughnutChart ERROR: doughnutChartCanvas reference not found');
        return;
      }
      
      const canvas = this.doughnutChartCanvas.nativeElement;
      if (!canvas) {
        console.error('createDoughnutChart ERROR: Canvas element not found');
        return;
      }

      if (!this.summaryRows || this.summaryRows.length === 0) {
        console.warn('createDoughnutChart WARNING: No summary rows available');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('createDoughnutChart ERROR: Could not get 2D context from canvas');
        return;
      }

      if (this.doughnutChart) {
        console.log('createDoughnutChart - destroying existing chart');
        this.doughnutChart.destroy();
        this.doughnutChart = null;
      }

      const totalPresent = this.summaryRows.reduce((s, r) => s + (r.present_days ?? 0), 0);
      const totalAbsent = this.summaryRows.reduce((s, r) => s + ((r.total_records ?? 0) - (r.present_days ?? 0)), 0);

      console.log('Doughnut chart data - Present:', totalPresent, 'Absent:', totalAbsent);

      const doughnutConfig: any = {
        type: 'doughnut',
        data: {
          labels: ['Present Days', 'Absent Days'],
          datasets: [{
            data: [totalPresent, totalAbsent],
            backgroundColor: [
              'rgba(52, 211, 153, 0.85)',
              'rgba(248, 113, 113, 0.85)'
            ],
            borderColor: [
              'rgba(52, 211, 153, 1)',
              'rgba(248, 113, 113, 1)'
            ],
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom' as const,
              labels: {
                padding: 20,
                font: {
                  size: 12,
                  weight: 'bold' as const
                },
                color: '#f1f5f9',
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: 12,
              displayColors: true,
              borderColor: 'rgba(56, 189, 248, 0.5)',
              borderWidth: 1,
              callbacks: {
                label: (context: any) => {
                  const value = context.parsed;
                  const total = totalPresent + totalAbsent;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${value} days (${percentage}%)`;
                }
              }
            }
          }
        }
      };

      this.doughnutChart = new ChartJS(ctx, doughnutConfig);
      console.log('createDoughnutChart - Chart created successfully');
    } catch (error) {
      console.error('createDoughnutChart ERROR:', error);
    }
  }

  private createBarChart(): void {
    try {
      console.log('createBarChart - starting');
      
      if (!this.barChartCanvas) {
        console.error('createBarChart ERROR: barChartCanvas reference not found');
        return;
      }
      
      const canvas = this.barChartCanvas.nativeElement;
      if (!canvas) {
        console.error('createBarChart ERROR: Canvas element not found');
        return;
      }

      if (!this.summaryRows || this.summaryRows.length === 0) {
        console.warn('createBarChart WARNING: No summary rows available');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('createBarChart ERROR: Could not get 2D context from canvas');
        return;
      }

      if (this.barChart) {
        console.log('createBarChart - destroying existing chart');
        this.barChart.destroy();
        this.barChart = null;
      }

      console.log('Creating bar chart with data:', this.summaryRows);

      const barConfig: any = {
        type: 'bar',
        data: {
          labels: this.summaryRows.map(row => row.full_name),
          datasets: [
            {
              label: 'Present Days',
              data: this.summaryRows.map(row => row.present_days),
              backgroundColor: 'rgba(52, 211, 153, 0.8)',
              borderColor: 'rgba(52, 211, 153, 1)',
              borderWidth: 0,
              borderRadius: 6
            },
            {
              label: 'Absent Days',
              data: this.summaryRows.map(row => (row.total_records ?? 0) - (row.present_days ?? 0)),
              backgroundColor: 'rgba(248, 113, 113, 0.8)',
              borderColor: 'rgba(248, 113, 113, 1)',
              borderWidth: 0,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'x',
          plugins: {
            legend: {
              display: true,
              position: 'top' as const,
              labels: {
                padding: 15,
                font: {
                  size: 12,
                  weight: 'bold' as const
                },
                color: '#f1f5f9',
                usePointStyle: true,
                pointStyle: 'rect'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: 12,
              displayColors: true,
              borderColor: 'rgba(56, 189, 248, 0.5)',
              borderWidth: 1,
              callbacks: {
                label: (context: any) => `${context.dataset.label}: ${context.parsed.y} days`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                font: {
                  size: 11,
                  weight: 500
                },
                color: '#94a3b8',
                padding: 5
              },
              grid: {
                drawBorder: false,
                color: 'rgba(148, 163, 184, 0.1)',
                drawTicks: false
              }
            },
            x: {
              ticks: {
                font: {
                  size: 11,
                  weight: 500
                },
                color: '#cbd5e1',
                padding: 5
              },
              grid: {
                display: false
              }
            }
          }
        }
      };

      this.barChart = new ChartJS(ctx, barConfig);
      console.log('createBarChart - Chart created successfully');
    } catch (error) {
      console.error('createBarChart ERROR:', error);
    }
  }

  refreshData(): void {
    console.log('Dashboard - refreshing data');
    this.loading = true;
    this.error = null;
    this.api.getAttendanceSummary().subscribe({
      next: (rows) => {
        console.log('Dashboard - refreshed data:', rows);
        this.summaryRows = rows;
        this.summary = {
          totalEmployees: rows.length,
          totalPresentDays: rows.reduce((s, r) => s + (r.present_days ?? 0), 0),
        };
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.createDoughnutChart();
          this.createBarChart();
        }, 100);
      },
      error: (err: string) => {
        console.error('Dashboard - refresh error:', err);
        this.error = err;
        this.loading = false;
      },
    });
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateChange(dateString: string): void {
    console.log('Dashboard - date changed to:', dateString);
    this.selectedDate = dateString;
    this.loading = true;
    this.error = null;

    // Fetch attendance records for the selected date
    this.api.getAttendance({ date: dateString }).subscribe({
      next: (records) => {
        console.log('Dashboard - attendance records for date:', records);
        this.loading = false;
        this.cdr.detectChanges();
        
        // Create charts with date-filtered data
        setTimeout(() => {
          this.createDateWiseDoughnutChart(records);
          this.createDateWiseBarChart(records);
        }, 0);
      },
      error: (err: string) => {
        console.error('Dashboard - date filter error:', err);
        this.error = err;
        this.loading = false;
      },
    });
  }

  private createDateWiseDoughnutChart(attendanceRecords: any[]): void {
    try {
      console.log('createDateWiseDoughnutChart - starting with records:', attendanceRecords);
      
      if (!this.doughnutChartCanvas) {
        console.error('createDateWiseDoughnutChart ERROR: doughnutChartCanvas reference not found');
        return;
      }
      
      const canvas = this.doughnutChartCanvas.nativeElement;
      if (!canvas) {
        console.error('createDateWiseDoughnutChart ERROR: Canvas element not found');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('createDateWiseDoughnutChart ERROR: Could not get 2D context from canvas');
        return;
      }

      if (this.doughnutChart) {
        console.log('createDateWiseDoughnutChart - destroying existing chart');
        this.doughnutChart.destroy();
        this.doughnutChart = null;
      }

      // Count present and absent employees for the selected date
      const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
      const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;
      const totalEmployees = this.summaryRows.length;
      const notMarked = totalEmployees - (presentCount + absentCount);

      console.log(`Date-wise - Present: ${presentCount}, Absent: ${absentCount}, Not Marked: ${notMarked} (Total: ${totalEmployees})`);

      const doughnutConfig: any = {
        type: 'doughnut',
        data: {
          labels: ['Present', 'Absent', 'Not Marked'],
          datasets: [{
            data: [presentCount, absentCount, notMarked],
            backgroundColor: [
              'rgba(52, 211, 153, 0.85)',
              'rgba(248, 113, 113, 0.85)',
              'rgba(107, 114, 128, 0.85)'
            ],
            borderColor: [
              'rgba(52, 211, 153, 1)',
              'rgba(248, 113, 113, 1)',
              'rgba(107, 114, 128, 1)'
            ],
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom' as const,
              labels: {
                padding: 20,
                font: {
                  size: 12,
                  weight: 'bold' as const
                },
                color: '#f1f5f9',
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            title: {
              display: true,
              text: `Attendance Distribution - ${this.selectedDate}`,
              color: '#f1f5f9',
              font: {
                size: 14,
                weight: 'bold' as const
              },
              padding: {
                bottom: 20
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: 12,
              displayColors: true,
              borderColor: 'rgba(56, 189, 248, 0.5)',
              borderWidth: 1,
              callbacks: {
                label: (context: any) => {
                  const value = context.parsed;
                  const total = presentCount + absentCount + notMarked;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                  return `${value} employees (${percentage}%)`;
                }
              }
            }
          }
        }
      };

      this.doughnutChart = new ChartJS(ctx, doughnutConfig);
      console.log('createDateWiseDoughnutChart - Chart created successfully');
    } catch (error) {
      console.error('createDateWiseDoughnutChart ERROR:', error);
    }
  }

  private createDateWiseBarChart(attendanceRecords: any[]): void {
    try {
      console.log('createDateWiseBarChart - starting with records:', attendanceRecords);
      
      if (!this.barChartCanvas) {
        console.error('createDateWiseBarChart ERROR: barChartCanvas reference not found');
        return;
      }
      
      const canvas = this.barChartCanvas.nativeElement;
      if (!canvas) {
        console.error('createDateWiseBarChart ERROR: Canvas element not found');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('createDateWiseBarChart ERROR: Could not get 2D context from canvas');
        return;
      }

      if (this.barChart) {
        console.log('createDateWiseBarChart - destroying existing chart');
        this.barChart.destroy();
        this.barChart = null;
      }

      // Create a map of employee attendance for the selected date
      const attendanceMap = new Map<string, string>();
      attendanceRecords.forEach(record => {
        if (record.full_name) {
          attendanceMap.set(record.full_name, record.status);
        }
      });

      // Get all employees from summary rows
      const employeeNames = this.summaryRows.map(row => row.full_name);
      const attendanceData = employeeNames.map(name => {
        const status = attendanceMap.get(name);
        return status === 'Present' ? 1 : (status === 'Absent' ? -1 : 0);
      });

      // Prepare data for chart
      const presentData = employeeNames.map((name, idx) => attendanceData[idx] === 1 ? 1 : 0);
      const absentData = employeeNames.map((name, idx) => attendanceData[idx] === -1 ? 1 : 0);
      const notMarkedData = employeeNames.map((name, idx) => attendanceData[idx] === 0 ? 1 : 0);

      console.log('Date-wise bar chart - Present:', presentData, 'Absent:', absentData, 'Not Marked:', notMarkedData);

      const barConfig: any = {
        type: 'bar',
        data: {
          labels: employeeNames,
          datasets: [
            {
              label: 'Present',
              data: presentData,
              backgroundColor: 'rgba(52, 211, 153, 0.8)',
              borderColor: 'rgba(52, 211, 153, 1)',
              borderWidth: 0,
              borderRadius: 6
            },
            {
              label: 'Absent',
              data: absentData,
              backgroundColor: 'rgba(248, 113, 113, 0.8)',
              borderColor: 'rgba(248, 113, 113, 1)',
              borderWidth: 0,
              borderRadius: 6
            },
            {
              label: 'Not Marked',
              data: notMarkedData,
              backgroundColor: 'rgba(107, 114, 128, 0.8)',
              borderColor: 'rgba(107, 114, 128, 1)',
              borderWidth: 0,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'x',
          plugins: {
            legend: {
              display: true,
              position: 'top' as const,
              labels: {
                padding: 15,
                font: {
                  size: 12,
                  weight: 'bold' as const
                },
                color: '#f1f5f9',
                usePointStyle: true,
                pointStyle: 'rect'
              }
            },
            title: {
              display: true,
              text: `Employee Attendance - ${this.selectedDate}`,
              color: '#f1f5f9',
              font: {
                size: 14,
                weight: 'bold' as const
              },
              padding: {
                bottom: 20
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              padding: 12,
              displayColors: true,
              borderColor: 'rgba(56, 189, 248, 0.5)',
              borderWidth: 1,
              callbacks: {
                label: (context: any) => {
                  const status = context.dataset.label;
                  return context.parsed.y === 1 ? status : '';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 1,
              ticks: {
                stepSize: 1,
                font: {
                  size: 11,
                  weight: 500
                },
                color: '#94a3b8',
                padding: 5,
                callback: (value: any) => value === 1 ? '✓' : ''
              },
              grid: {
                drawBorder: false,
                color: 'rgba(148, 163, 184, 0.1)',
                drawTicks: false
              }
            },
            x: {
              ticks: {
                font: {
                  size: 11,
                  weight: 500
                },
                color: '#cbd5e1',
                padding: 5
              },
              grid: {
                display: false
              }
            }
          }
        }
      };

      this.barChart = new ChartJS(ctx, barConfig);
      console.log('createDateWiseBarChart - Chart created successfully');
    } catch (error) {
      console.error('createDateWiseBarChart ERROR:', error);
    }
  }
}
