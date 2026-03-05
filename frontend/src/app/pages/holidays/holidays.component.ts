import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Holiday } from '../../services/api.service';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>🎉 Holiday Management</h1>
        <button (click)="toggleNewHolidayForm()" class="btn btn-primary">+ Add Holiday</button>
      </div>

      @if (showNewHolidayForm) {
        <div class="card form-card">
          <h2>Add New Holiday</h2>
          <form (ngSubmit)="submitNewHoliday()" class="form-grid">
            <div class="form-group">
              <label>Holiday Name</label>
              <input type="text" [(ngModel)]="newHoliday.name" name="name" required>
            </div>
            <div class="form-group">
              <label>Date</label>
              <input type="date" [(ngModel)]="newHoliday.date" name="date" required>
            </div>
            <div class="form-group">
              <label>Type</label>
              <select [(ngModel)]="newHoliday.is_national" name="is_national">
                <option [value]="true">National</option>
                <option [value]="false">Company</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea [(ngModel)]="newHoliday.description" name="description" rows="2"></textarea>
            </div>
            <div class="form-actions full-width">
              <button type="submit" class="btn btn-success">Add Holiday</button>
              <button type="button" (click)="toggleNewHolidayForm()" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="card">
        <h2>Holiday Calendar</h2>
        @if (holidays.length === 0) {
          <div class="empty-state">No holidays found</div>
        } @else {
          <div class="holidays-list">
            @for (holiday of holidays; track holiday.id) {
              <div class="holiday-item">
                <div class="holiday-left">
                  <div class="holiday-date">
                    <div class="date-day">{{ getDay(holiday.date) }}</div>
                    <div class="date-month">{{ getMonth(holiday.date) }}</div>
                  </div>
                </div>
                <div class="holiday-middle">
                  <h3>{{ holiday.name }}</h3>
                  <p>{{ holiday.description || 'No description' }}</p>
                  <span class="badge" [class.national]="holiday.is_national">
                    {{ holiday.is_national ? '🇮🇳 National' : '🏢 Company' }}
                  </span>
                </div>
                <div class="holiday-right">
                  <button (click)="deleteHoliday(holiday.id)" class="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            }
          </div>
        }
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
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

    .form-card {
      margin-bottom: 2rem;
    }

    .card h2 {
      margin-top: 0;
      color: #f1f5f9;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
      padding-bottom: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      color: #cbd5e1;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      padding: 0.6rem;
      background: #334155;
      border: 1px solid rgba(148, 163, 184, 0.3);
      border-radius: 6px;
      color: #f1f5f9;
      font-family: inherit;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    .holidays-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .holiday-item {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
      background: rgba(56, 189, 248, 0.05);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 8px;
      transition: all 0.3s;
      align-items: center;
    }

    .holiday-item:hover {
      background: rgba(56, 189, 248, 0.1);
      border-color: rgba(56, 189, 248, 0.4);
    }

    .holiday-left {
      flex-shrink: 0;
    }

    .holiday-date {
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      color: #fff;
      min-width: 70px;
    }

    .date-day {
      font-size: 1.8rem;
      font-weight: 700;
    }

    .date-month {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.8);
    }

    .holiday-middle {
      flex: 1;
    }

    .holiday-middle h3 {
      margin: 0 0 0.5rem 0;
      color: #f1f5f9;
      font-size: 1.1rem;
    }

    .holiday-middle p {
      margin: 0 0 0.75rem 0;
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      background: rgba(52, 211, 153, 0.2);
      color: #6ee7b7;
    }

    .badge.national {
      background: rgba(248, 113, 113, 0.2);
      color: #fca5a5;
    }

    .holiday-right {
      flex-shrink: 0;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: #38bdf8;
      color: #0f172a;
    }

    .btn-primary:hover {
      background: #0ea5e9;
    }

    .btn-success {
      background: #34d399;
      color: #0f172a;
    }

    .btn-danger {
      background: #f87171;
      color: #fff;
    }

    .btn-secondary {
      background: #64748b;
      color: #fff;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
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

      .holiday-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class HolidaysComponent implements OnInit {
  holidays: Holiday[] = [];
  showNewHolidayForm = false;

  newHoliday = {
    name: '',
    date: '',
    description: '',
    is_national: true
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadHolidays();
  }

  loadHolidays() {
    this.api.getHolidays().subscribe({
      next: (data) => {
        this.holidays = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
      error: (err) => console.error('Error loading holidays:', err)
    });
  }

  toggleNewHolidayForm() {
    this.showNewHolidayForm = !this.showNewHolidayForm;
  }

  submitNewHoliday() {
    this.api.addHoliday(this.newHoliday).subscribe({
      next: () => {
        this.loadHolidays();
        this.showNewHolidayForm = false;
        this.newHoliday = { name: '', date: '', description: '', is_national: true };
      },
      error: (err) => console.error('Error adding holiday:', err)
    });
  }

  deleteHoliday(id: number) {
    if (confirm('Are you sure you want to delete this holiday?')) {
      this.api.deleteHoliday(id).subscribe({
        next: () => this.loadHolidays(),
        error: (err) => console.error('Error deleting holiday:', err)
      });
    }
  }

  getDay(dateString: string): string {
    return new Date(dateString).getDate().toString().padStart(2, '0');
  }

  getMonth(dateString: string): string {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[new Date(dateString).getMonth()];
  }
}
