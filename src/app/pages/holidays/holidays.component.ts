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
        <div class="header-actions">
          <button (click)="seedIndianHolidays()" class="btn btn-secondary" *ngIf="holidays.length === 0">🇮🇳 Seed Indian Holidays</button>
          <button (click)="toggleNewHolidayForm()" class="btn btn-primary">+ Add Holiday</button>
        </div>
      </div>

      <div class="grid-layout">
        <!-- Calendar View -->
        <div class="card calendar-card">
          <div class="calendar-header">
            <button (click)="prevMonth()" class="nav-btn">&lt;</button>
            <h2>{{ getMonthName(viewDate) }} {{ viewDate.getFullYear() }}</h2>
            <button (click)="nextMonth()" class="nav-btn">&gt;</button>
          </div>
          
          <div class="calendar-grid">
            <div class="weekday">Sun</div>
            <div class="weekday">Mon</div>
            <div class="weekday">Tue</div>
            <div class="weekday">Wed</div>
            <div class="weekday">Thu</div>
            <div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
            
            @for (day of calendarDays; track day.date) {
              <div class="calendar-day" 
                   [class.other-month]="!day.isCurrentMonth"
                   [class.today]="isToday(day.date)"
                   [class.is-sunday]="day.date.getDay() === 0"
                   [class.has-holiday]="day.holidays.length > 0"
                   [class.national]="hasNationalHoliday(day.holidays)">
                <span class="day-number">{{ day.date.getDate() }}</span>
                <div class="day-content">
                  @for (h of day.holidays; track h.id) {
                    <div class="holiday-pill" [class.national]="h.is_national" [class.weekly-off]="h.id === -1" [title]="h.name">
                      {{ h.name }}
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="side-panel">
          @if (showNewHolidayForm) {
            <div class="card form-card">
              <h2>Add New Holiday</h2>
              <form (ngSubmit)="submitNewHoliday()" class="form-grid">
                <div class="form-group">
                  <label>Holiday Name</label>
                  <input type="text" [(ngModel)]="newHoliday.name" name="name" required placeholder="e.g. Diwali">
                </div>
                <div class="form-group">
                  <label>Date</label>
                  <input type="date" [(ngModel)]="newHoliday.date" name="date" required>
                </div>
                <div class="form-group">
                  <label>Type</label>
                  <select [(ngModel)]="newHoliday.is_national" name="is_national" class="select">
                    <option [ngValue]="true">National</option>
                    <option [ngValue]="false">Company</option>
                  </select>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-success">Save</button>
                  <button type="button" (click)="toggleNewHolidayForm()" class="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          }

          <div class="card upcoming-card">
            <h2>Upcoming Holidays</h2>
            <div class="upcoming-list">
              @if (upcomingHolidays.length === 0) {
                <div class="empty-state">No upcoming holidays</div>
              }
              @for (h of upcomingHolidays; track h.id) {
                <div class="upcoming-item" *ngIf="h.id !== -1">
                  <div class="u-date">
                    <span class="u-day">{{ getDay(h.date) }}</span>
                    <span class="u-month">{{ getMonth(h.date) }}</span>
                  </div>
                  <div class="u-info">
                    <h4>{{ h.name }}</h4>
                    <span class="u-type" [class.national]="h.is_national">
                      {{ h.is_national ? 'National' : 'Company' }}
                    </span>
                  </div>
                  <button (click)="deleteHoliday(h.id)" class="delete-btn">×</button>
                </div>
              }
            </div>
          </div>
        </div>
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: #f7faff;
      font-size: 1.8rem;
      font-weight: 800;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 1.5rem;
    }

    .card {
      background: linear-gradient(160deg, rgba(16, 31, 61, 0.96), rgba(12, 24, 48, 0.96));
      padding: 1.5rem;
      border-radius: 14px;
      box-shadow: 0 14px 38px rgba(2, 8, 24, 0.45);
      border: 1px solid rgba(120, 150, 255, 0.2);
    }

    /* Calendar Styles */
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .calendar-header h2 {
      margin: 0;
      color: #85a0ff;
      font-size: 1.4rem;
    }

    .nav-btn {
      background: rgba(95, 124, 255, 0.1);
      border: 1px solid rgba(120, 150, 255, 0.2);
      color: #eaf0ff;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      background: rgba(120, 150, 255, 0.1);
      border: 1px solid rgba(120, 150, 255, 0.1);
    }

    .weekday {
      padding: 1rem 0.5rem;
      text-align: center;
      background: #0d1730;
      color: #9fb0d4;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .calendar-day {
      background: #0d1730;
      min-height: 100px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .calendar-day.other-month {
      opacity: 0.3;
    }

    .calendar-day.is-sunday {
      background: rgba(255, 125, 134, 0.03);
    }

    .calendar-day.is-sunday .day-number {
      color: #ff7d86;
    }

    .calendar-day.has-holiday {
      background: rgba(51, 208, 153, 0.08);
      box-shadow: inset 0 0 15px rgba(51, 208, 153, 0.15);
      border-left: 3px solid rgba(51, 208, 153, 0.5);
      position: relative;
    }

    .calendar-day.has-holiday::after {
      content: '🎉';
      position: absolute;
      top: 5px;
      right: 5px;
      font-size: 0.9rem;
      opacity: 0.8;
      filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
    }

    .calendar-day.has-holiday.national {
      background: rgba(255, 125, 134, 0.08);
      box-shadow: inset 0 0 15px rgba(255, 125, 134, 0.15);
      border-left: 3px solid rgba(255, 125, 134, 0.5);
    }

    .calendar-day.has-holiday.national::after {
      content: '🇮🇳';
    }

    .day-number {
      font-size: 0.9rem;
      font-weight: 600;
      color: #9fb0d4;
      z-index: 1;
    }

    .today .day-number {
      color: #5f7cff;
      font-weight: 800;
    }

    .day-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .holiday-pill {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(51, 208, 155, 0.15);
      color: #33d09b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-left: 3px solid #33d09b;
    }

    .holiday-pill.national {
      background: rgba(255, 125, 134, 0.15);
      color: #ff7d86;
      border-left-color: #ff7d86;
    }

    .holiday-pill.weekly-off {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
      border-left-color: #94a3b8;
      font-style: italic;
    }

    /* Upcoming & Form */
    .side-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #9fb0d4;
      margin-bottom: 0.3rem;
      text-transform: uppercase;
    }

    .form-group input, .form-group select {
      width: 100%;
      padding: 0.6rem;
      background: #112448;
      border: 1px solid rgba(120, 150, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      outline: none;
    }

    .upcoming-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .upcoming-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      position: relative;
    }

    .u-date {
      background: #5f7cff;
      color: #fff;
      padding: 0.4rem;
      border-radius: 8px;
      text-align: center;
      min-width: 45px;
    }

    .u-day { display: block; font-weight: 800; font-size: 1.1rem; line-height: 1; }
    .u-month { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; }

    .u-info h4 { margin: 0; font-size: 0.9rem; color: #f7faff; }
    .u-type { font-size: 0.7rem; color: #33d09b; }
    .u-type.national { color: #ff7d86; }

    .delete-btn {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #ff7d86;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.5;
    }

    .delete-btn:hover { opacity: 1; }

    .btn {
      padding: 0.6rem 1.1rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;
    }

    .btn-primary { background: #5f7cff; color: #fff; }
    .btn-secondary { background: rgba(148, 163, 184, 0.15); color: #cbd5e1; }
    .btn-success { background: #33d09b; color: #0b1531; width: 100%; }

    @media (max-width: 1024px) {
      .page-container { margin-left: 0; }
      .grid-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class HolidaysComponent implements OnInit {
  holidays: Holiday[] = [];
  upcomingHolidays: Holiday[] = [];
  viewDate = new Date();
  calendarDays: any[] = [];
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
        this.holidays = data;
        this.generateCalendar();
        this.updateUpcoming();
      }
    });
  }

  updateUpcoming() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.upcomingHolidays = this.holidays
      .filter(h => new Date(h.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }

  generateCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Previous month padding
    const prevLastDay = new Date(year, month, 0);
    for (let i = firstDay.getDay(); i > 0; i--) {
      const d = new Date(year, month - 1, prevLastDay.getDate() - i + 1);
      days.push({
        date: d,
        isCurrentMonth: false,
        holidays: this.getHolidaysForDay(d)
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        holidays: this.getHolidaysForDay(d)
      });
    }
    
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        holidays: this.getHolidaysForDay(d)
      });
    }
    
    this.calendarDays = days;
  }

  getHolidaysForDay(d: Date): any[] {
    const dayHolidays = this.holidays.filter(h => this.isSameDay(new Date(h.date), d));
    
    // Add Sunday as a holiday if it's Sunday
    if (d.getDay() === 0) {
      dayHolidays.push({
        id: -1, // Special ID for weekly off
        name: 'Sunday (Weekly Off)',
        date: d.toISOString(),
        is_national: false
      });
    }
    
    return dayHolidays;
  }

  hasNationalHoliday(holidays: any[]): boolean {
    return holidays.some(h => h.is_national);
  }

  isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  isToday(d: Date) {
    return this.isSameDay(d, new Date());
  }

  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  getMonthName(d: Date) {
    return d.toLocaleString('default', { month: 'long' });
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
      }
    });
  }

  seedIndianHolidays() {
    const indianHolidays = [
      { name: 'Republic Day', date: '2026-01-26', description: 'National Holiday', is_national: true },
      { name: 'Holi', date: '2026-03-04', description: 'Festival of Colors', is_national: true },
      { name: 'Eid ul-Fitr', date: '2026-03-20', description: 'End of Ramadan', is_national: true },
      { name: 'Independence Day', date: '2026-08-15', description: 'National Holiday', is_national: true },
      { name: 'Gandhi Jayanti', date: '2026-10-02', description: 'Mahatma Gandhi Birthday', is_national: true },
      { name: 'Dussehra', date: '2026-10-21', description: 'Victory of Good over Evil', is_national: true },
      { name: 'Diwali', date: '2026-11-08', description: 'Festival of Lights', is_national: true },
      { name: 'Christmas Day', date: '2026-12-25', description: 'Christian Festival', is_national: true }
    ];

    indianHolidays.forEach(h => {
      this.api.addHoliday(h).subscribe({
        next: () => this.loadHolidays()
      });
    });
  }

  deleteHoliday(id: number) {
    if (confirm('Delete this holiday?')) {
      this.api.deleteHoliday(id).subscribe({
        next: () => this.loadHolidays()
      });
    }
  }

  getDay(dateString: string): string {
    return new Date(dateString).getDate().toString().padStart(2, '0');
  }

  getMonth(dateString: string): string {
    return new Date(dateString).toLocaleString('default', { month: 'short' });
  }
}
