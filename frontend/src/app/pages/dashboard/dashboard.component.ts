import { Component, OnInit } from '@angular/core';
import { ApiService, SummaryRow } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  summaryRows: SummaryRow[] = [];
  summary: { totalEmployees: number; totalPresentDays: number } | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAttendanceSummary().subscribe({
      next: (rows) => {
        this.summaryRows = rows;
        this.summary = {
          totalEmployees: rows.length,
          totalPresentDays: rows.reduce((s, r) => s + (r.present_days ?? 0), 0),
        };
        this.loading = false;
      },
      error: (err: string) => {
        this.error = err;
        this.loading = false;
      },
    });
  }
}
