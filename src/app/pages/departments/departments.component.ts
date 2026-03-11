import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Department } from '../../services/api.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>🏭 Department Management</h1>
        <div class="header-actions">
           <button (click)="seedSampleDepartments()" class="btn btn-secondary" *ngIf="departments.length === 0">📂 Seed Sample Depts</button>
           <button (click)="toggleNewDeptForm()" class="btn btn-primary">+ Add Department</button>
        </div>
      </div>

      <div class="grid-layout">
        <!-- Main List -->
        <div class="card main-card">
          <div class="card-header">
            <h2>All Departments</h2>
            <span class="count-badge">{{ departments.length }} Total</span>
          </div>

          @if (departments.length === 0) {
            <div class="empty-state">
              <p>No departments found. Use "Seed Samples" to quickly add some.</p>
              <button (click)="seedSampleDepartments()" class="btn btn-secondary btn-sm">Seed Samples</button>
            </div>
          } @else {
            <div class="dept-list">
              @for (dept of departments; track dept.id) {
                <div class="dept-item">
                  <div class="dept-icon">{{ dept.name.charAt(0) }}</div>
                  <div class="dept-info">
                    <h3>{{ dept.name }}</h3>
                    <p>{{ dept.description || 'No description provided' }}</p>
                  </div>
                  <div class="dept-actions">
                    <button (click)="editDept(dept)" class="icon-btn edit" title="Edit">✎</button>
                    <button (click)="deleteDept(dept.id)" class="icon-btn delete" title="Delete">×</button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Action Panel -->
        <div class="side-panel">
          @if (showNewDeptForm || editingDept) {
            <div class="card form-card">
              <h2>{{ editingDept ? 'Edit' : 'Add' }} Department</h2>
              <form (ngSubmit)="editingDept ? submitEditDept() : submitNewDept()" class="form-grid">
                <div class="form-group">
                  <label>Department Name</label>
                  @if (editingDept) {
                    <input type="text" [(ngModel)]="editingDept.name" name="name" required>
                  } @else {
                    <input type="text" [(ngModel)]="newDept.name" name="name" required placeholder="e.g. Engineering">
                    <div class="suggestions">
                      <span (click)="newDept.name='IT'" class="suggestion-chip">IT</span>
                      <span (click)="newDept.name='Sales'" class="suggestion-chip">Sales</span>
                      <span (click)="newDept.name='HR'" class="suggestion-chip">HR</span>
                      <span (click)="newDept.name='Finance'" class="suggestion-chip">Finance</span>
                    </div>
                  }
                </div>
                <div class="form-group">
                  <label>Description</label>
                  @if (editingDept) {
                    <textarea [(ngModel)]="editingDept.description" name="description" rows="3"></textarea>
                  } @else {
                    <textarea [(ngModel)]="newDept.description" name="description" rows="3"></textarea>
                  }
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-success">{{ editingDept ? 'Save Changes' : 'Create Department' }}</button>
                  <button type="button" (click)="cancelForm()" class="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          }
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

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(120, 150, 255, 0.1);
      padding-bottom: 1rem;
    }

    .card h2 {
      margin: 0;
      color: #85a0ff;
      font-size: 1.2rem;
    }

    .count-badge {
      background: rgba(95, 124, 255, 0.1);
      color: #85a0ff;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .dept-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .dept-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(120, 150, 255, 0.1);
      border-radius: 12px;
      transition: all 0.2s;
    }

    .dept-item:hover {
      background: rgba(95, 124, 255, 0.05);
      border-color: rgba(120, 150, 255, 0.3);
      transform: translateX(4px);
    }

    .dept-icon {
      width: 40px;
      height: 40px;
      background: #5f7cff;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-weight: 800;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .dept-info {
      flex: 1;
    }

    .dept-info h3 {
      margin: 0 0 0.2rem 0;
      color: #f7faff;
      font-size: 1rem;
    }

    .dept-info p {
      margin: 0;
      color: #9fb0d4;
      font-size: 0.85rem;
    }

    .dept-actions {
      display: flex;
      gap: 0.5rem;
    }

    .icon-btn {
      background: none;
      border: none;
      color: #9fb0d4;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .icon-btn.edit:hover { background: rgba(51, 208, 155, 0.1); color: #33d09b; }
    .icon-btn.delete:hover { background: rgba(255, 125, 134, 0.1); color: #ff7d86; }

    /* Form Styles */
    .side-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: #9fb0d4;
      margin-bottom: 0.4rem;
      text-transform: uppercase;
    }

    .form-group input, .form-group textarea {
      width: 100%;
      padding: 0.7rem;
      background: #112448;
      border: 1px solid rgba(120, 150, 255, 0.2);
      border-radius: 10px;
      color: #fff;
      outline: none;
    }

    .suggestions {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .suggestion-chip {
      background: rgba(95, 124, 255, 0.1);
      border: 1px solid rgba(120, 150, 255, 0.15);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      color: #85a0ff;
      cursor: pointer;
    }

    .info-card h3 { color: #85a0ff; font-size: 0.9rem; margin-top: 0; }
    .info-card p { font-size: 0.85rem; color: #9fb0d4; margin-bottom: 0; line-height: 1.5; }

    .btn {
      padding: 0.6rem 1.1rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.2s;
    }

    .btn-primary { background: #5f7cff; color: #fff; }
    .btn-secondary { background: rgba(148, 163, 184, 0.1); color: #cbd5e1; }
    .btn-success { background: #33d09b; color: #0b1531; width: 100%; }

    .empty-state { text-align: center; padding: 2rem; color: #9fb0d4; font-style: italic; }

    @media (max-width: 1024px) {
      .page-container { margin-left: 0; }
      .grid-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  showNewDeptForm = false;
  editingDept: Department | null = null;

  newDept = {
    name: '',
    description: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.api.getDepartments().subscribe({
      next: (data) => {
        this.departments = data;
      }
    });
  }

  toggleNewDeptForm() {
    this.showNewDeptForm = !this.showNewDeptForm;
    this.editingDept = null;
  }

  submitNewDept() {
    this.api.addDepartment(this.newDept).subscribe({
      next: () => {
        this.loadDepartments();
        this.showNewDeptForm = false;
        this.newDept = { name: '', description: '' };
      }
    });
  }

  editDept(dept: Department) {
    this.editingDept = { ...dept };
    this.showNewDeptForm = false;
  }

  submitEditDept() {
    if (this.editingDept) {
      this.api.updateDepartment(this.editingDept.id, this.editingDept).subscribe({
        next: () => {
          this.loadDepartments();
          this.editingDept = null;
        }
      });
    }
  }

  cancelForm() {
    this.showNewDeptForm = false;
    this.editingDept = null;
  }

  deleteDept(id: number) {
    if (confirm('Delete this department?')) {
      this.api.deleteDepartment(id).subscribe({
        next: () => this.loadDepartments()
      });
    }
  }

  seedSampleDepartments() {
    const samples = [
      { name: 'Engineering', description: 'Software and Hardware development' },
      { name: 'Human Resources', description: 'Talent management and employee relations' },
      { name: 'Marketing', description: 'Sales and brand promotion' },
      { name: 'Finance', description: 'Accounting and financial planning' }
    ];
    
    samples.forEach(sample => {
      this.api.addDepartment(sample).subscribe({
        next: () => this.loadDepartments()
      });
    });
  }
}
