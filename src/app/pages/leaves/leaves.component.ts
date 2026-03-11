import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Leave, LeaveType, LeaveBalance, Employee } from '../../services/api.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📅 Leave Management</h1>
        <div class="header-actions">
          <button (click)="toggleNewLeaveForm()" class="btn btn-primary">+ Request Leave</button>
        </div>
      </div>

      @if (showNewLeaveForm) {
        <div class="card form-card">
          <h2>Request New Leave</h2>
          <form (ngSubmit)="submitNewLeave()" class="form-grid">
            <div class="form-group">
              <label>Employee</label>
              <select [(ngModel)]="newLeave.employee_id" name="employee_id" required>
                <option [value]="0">Select Employee</option>
                @for (emp of employees; track emp.id) {
                  <option [value]="emp.id">{{ emp.full_name }} ({{ emp.employee_id }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Leave Type</label>
              <select [(ngModel)]="newLeave.leave_type_id" name="leave_type_id" required (change)="onLeaveTypeChange()">
                <option [value]="0">Select Leave Type</option>
                @for (type of leaveTypes; track type.id) {
                  <option [value]="type.id">{{ type.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" [(ngModel)]="newLeave.start_date" name="start_date" required>
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" [(ngModel)]="newLeave.end_date" name="end_date" required>
            </div>
            <div class="form-group full-width">
              <label>Reason</label>
              <textarea [(ngModel)]="newLeave.reason" name="reason" rows="3"></textarea>
            </div>
            <div class="form-actions full-width">
              <button type="submit" class="btn btn-success" [disabled]="!newLeave.employee_id || !newLeave.leave_type_id">Request Leave</button>
              <button type="button" (click)="toggleNewLeaveForm()" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="card">
        <h2>Leave Requests</h2>
        @if (loading) {
          <div class="loading">Loading leave requests...</div>
        } @else if (leaves.length === 0) {
          <div class="empty-state">No leave requests found</div>
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (leave of leaves; track leave.id) {
                  <tr>
                    <td>{{ getEmployeeName(leave.employee_id) }}</td>
                    <td>{{ getLeaveTypeName(leave.leave_type_id) }}</td>
                    <td>{{ leave.start_date }}</td>
                    <td>{{ leave.end_date }}</td>
                    <td>{{ leave.reason || '-' }}</td>
                    <td>
                      <span [class]="'status status-' + leave.status.toLowerCase()">
                        {{ leave.status }}
                      </span>
                    </td>
                    <td>
                      @if (leave.status.toLowerCase() === 'pending') {
                        <div class="action-buttons">
                          <button (click)="updateLeave(leave.id, 'Approved')" class="btn btn-sm btn-success">Approve</button>
                          <button (click)="updateLeave(leave.id, 'Rejected')" class="btn btn-sm btn-danger">Reject</button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <div class="card">
        <div class="balance-header">
          <h2>Leave Balances</h2>
          <div class="employee-selector">
            <label>Select Employee: </label>
            <select [(ngModel)]="selectedEmployeeId" (change)="loadLeaveBalances()" class="select-sm">
              <option [value]="0">-- Select --</option>
              @for (emp of employees; track emp.id) {
                <option [value]="emp.id">{{ emp.full_name }}</option>
              }
            </select>
          </div>
        </div>
        
        @if (selectedEmployeeId === 0) {
          <div class="empty-state">Select an employee to view their available leave balance</div>
        } @else if (leaveBalances.length === 0) {
          <div class="empty-state">No leave balance found for this employee</div>
        } @else {
          <div class="balance-grid">
            @for (balance of leaveBalances; track balance.id) {
              <div class="balance-card">
                <div class="balance-name">{{ getLeaveTypeName(balance.leave_type_id) }}</div>
                <div class="balance-stats">
                  <div class="stat">
                    <span class="stat-value">{{ balance.total_days }}</span>
                    <span class="stat-label">Total Days</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ balance.used_days }}</span>
                    <span class="stat-label">Used</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value" style="color: #34d399;">{{ balance.available_days }}</span>
                    <span class="stat-label">Available</span>
                  </div>
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
      width: 100%;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-header h1 {
      margin: 0;
      color: var(--text);
      font-size: clamp(1.35rem, 1.2rem + 0.8vw, 1.95rem);
    }

    .form-card {
      margin-bottom: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
      color: var(--text-muted);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      padding: 0.65rem 0.78rem;
      background: var(--bg-input);
      border: 1px solid rgba(120, 150, 255, 0.28);
      border-radius: 10px;
      color: var(--text);
      font-family: inherit;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    .card {
      margin-bottom: 1rem;
    }

    .card h2 {
      margin-top: 0;
      color: var(--text);
      border-bottom: 1px solid rgba(120, 150, 255, 0.2);
      padding-bottom: 0.7rem;
    }

    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
    }

    .status-pending {
      background: rgba(255, 125, 134, 0.2);
      color: #ffd2d5;
    }

    .status-approved {
      background: rgba(51, 208, 155, 0.2);
      color: #7bffd2;
    }

    .status-rejected {
      background: rgba(255, 125, 134, 0.2);
      color: #ffd2d5;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .balance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .balance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      border-bottom: 1px solid rgba(120, 150, 255, 0.2);
      padding-bottom: 0.7rem;
    }

    .balance-header h2 {
      margin: 0 !important;
      border-bottom: none !important;
    }

    .employee-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .select-sm {
      padding: 0.4rem 0.8rem;
      background: var(--bg-input);
      border: 1px solid rgba(120, 150, 255, 0.28);
      border-radius: 8px;
      color: var(--text);
      font-size: 0.9rem;
    }

    .balance-card {
      background: rgba(95, 124, 255, 0.1);
      padding: 1.15rem;
      border-radius: 12px;
      border: 1px solid rgba(120, 150, 255, 0.3);
    }

    .balance-name {
      color: #b7c8ff;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .balance-stats {
      display: flex;
      justify-content: space-around;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      color: var(--text);
      font-weight: 700;
    }

    .stat-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .btn-success {
      background: linear-gradient(140deg, #66e2b9, #33d09b);
      color: #0b1531;
    }

    .btn-danger {
      background: linear-gradient(140deg, rgba(255, 125, 134, 0.35), rgba(255, 92, 102, 0.28));
      color: #ffe7e8;
    }

    .btn-secondary {
      background: rgba(120, 144, 192, 0.35);
      color: #e6eeff;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }

    @media (max-width: 820px) {
      .action-buttons {
        flex-direction: column;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class LeavesComponent implements OnInit {
  leaves: Leave[] = [];
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  employees: Employee[] = [];
  loading = false;
  showNewLeaveForm = false;

  newLeave = {
    employee_id: 0,
    leave_type_id: 0,
    start_date: '',
    end_date: '',
    reason: ''
  };

  selectedEmployeeId = 0;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getLeaveTypes().subscribe(types => {
      this.leaveTypes = types;
      this.api.getEmployees().subscribe(emps => {
        this.employees = emps;
        this.loadLeaves();
      });
    });
  }

  loadEmployees() {
    this.api.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  loadLeaves() {
    this.loading = true;
    this.api.getLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading leaves:', err);
        this.loading = false;
      }
    });
  }

  loadLeaveTypes() {
    this.api.getLeaveTypes().subscribe({
      next: (data) => {
        this.leaveTypes = data;
      },
      error: (err) => console.error('Error loading leave types:', err)
    });
  }

  loadLeaveBalances() {
    if (this.selectedEmployeeId) {
      this.api.getLeaveBalance(this.selectedEmployeeId).subscribe({
        next: (data) => {
          this.leaveBalances = data;
        },
        error: (err) => console.error('Error loading balances:', err)
      });
    } else {
      this.leaveBalances = [];
    }
  }

  onLeaveTypeChange() {
    // Optional: add logic when leave type changes
  }

  toggleNewLeaveForm() {
    this.showNewLeaveForm = !this.showNewLeaveForm;
    if (this.showNewLeaveForm) {
      this.newLeave = { employee_id: 0, leave_type_id: 0, start_date: '', end_date: '', reason: '' };
    }
  }

  submitNewLeave() {
    if (!this.newLeave.employee_id || !this.newLeave.leave_type_id) return;
    
    this.api.requestLeave(this.newLeave).subscribe({
      next: () => {
        this.loadLeaves();
        this.showNewLeaveForm = false;
        this.newLeave = { employee_id: 0, leave_type_id: 0, start_date: '', end_date: '', reason: '' };
      },
      error: (err) => console.error('Error requesting leave:', err)
    });
  }

  updateLeave(leaveId: number, status: string) {
    this.api.updateLeave(leaveId, { status }).subscribe({
      next: () => this.loadLeaves(),
      error: (err) => console.error('Error updating leave:', err)
    });
  }

  getLeaveTypeName(typeId: any): string {
    if (!typeId) return 'N/A';
    const id = Number(typeId);
    const type = this.leaveTypes.find(t => t.id === id);
    if (type) return type.name;
    
    // Check if it's already a name
    if (isNaN(id) && typeof typeId === 'string') return typeId;
    
    return `Type: ${typeId}`;
  }

  getEmployeeName(employeeId: any): string {
    if (!employeeId) return 'Unknown';
    const id = Number(employeeId);
    const emp = this.employees.find(e => e.id === id);
    if (emp) return emp.full_name;
    
    // Check if it's already a name
    if (isNaN(id) && typeof employeeId === 'string') return employeeId;
    
    return `ID: ${employeeId}`;
  }
}
