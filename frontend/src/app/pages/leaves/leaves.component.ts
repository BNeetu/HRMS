import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Leave, LeaveType, LeaveBalance } from '../../services/api.service';

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
              <label>Employee ID</label>
              <input type="number" [(ngModel)]="newLeave.employee_id" name="employee_id" required>
            </div>
            <div class="form-group">
              <label>Leave Type</label>
              <select [(ngModel)]="newLeave.leave_type_id" name="leave_type_id" required>
                <option value="">Select Leave Type</option>
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
              <button type="submit" class="btn btn-success">Request Leave</button>
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
                    <td>{{ leave.employee_id }}</td>
                    <td>{{ getLeaveTypeName(leave.leave_type_id) }}</td>
                    <td>{{ leave.start_date }}</td>
                    <td>{{ leave.end_date }}</td>
                    <td>{{ leave.reason || '-' }}</td>
                    <td>
                      <span [class]="'status status-' + leave.status">
                        {{ leave.status }}
                      </span>
                    </td>
                    <td>
                      @if (leave.status === 'pending') {
                        <div class="action-buttons">
                          <button (click)="updateLeave(leave.id, 'approved')" class="btn btn-sm btn-success">Approve</button>
                          <button (click)="updateLeave(leave.id, 'rejected')" class="btn btn-sm btn-danger">Reject</button>
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
        <h2>Leave Balances</h2>
        @if (leaveBalances.length === 0) {
          <div class="empty-state">No leave balances available</div>
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

    .form-card {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      margin-bottom: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

    .status {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .status-pending {
      background: rgba(248, 113, 113, 0.2);
      color: #fca5a5;
    }

    .status-approved {
      background: rgba(52, 211, 153, 0.2);
      color: #6ee7b7;
    }

    .status-rejected {
      background: rgba(248, 113, 113, 0.2);
      color: #fca5a5;
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

    .balance-card {
      background: rgba(56, 189, 248, 0.1);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .balance-name {
      color: #38bdf8;
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
      color: #f1f5f9;
      font-weight: 700;
    }

    .stat-label {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.25rem;
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

    @media (max-width: 768px) {
      .page-container {
        margin-left: 0;
        padding: 1rem;
      }
    }
  `]
})
export class LeavesComponent implements OnInit {
  leaves: Leave[] = [];
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  loading = false;
  showNewLeaveForm = false;

  newLeave = {
    employee_id: 0,
    leave_type_id: 0,
    start_date: '',
    end_date: '',
    reason: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadLeaves();
    this.loadLeaveTypes();
    this.loadLeaveBalances();
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
    // This would typically load for a specific employee
    // For now, we'll keep it simple
  }

  toggleNewLeaveForm() {
    this.showNewLeaveForm = !this.showNewLeaveForm;
  }

  submitNewLeave() {
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

  getLeaveTypeName(typeId: number): string {
    return this.leaveTypes.find(t => t.id === typeId)?.name || 'Unknown';
  }
}
