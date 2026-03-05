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
        <button (click)="toggleNewDeptForm()" class="btn btn-primary">+ Add Department</button>
      </div>

      @if (showNewDeptForm) {
        <div class="card form-card">
          <h2>Add New Department</h2>
          <form (ngSubmit)="submitNewDept()" class="form-grid">
            <div class="form-group full-width">
              <label>Department Name</label>
              <input type="text" [(ngModel)]="newDept.name" name="name" required>
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea [(ngModel)]="newDept.description" name="description" rows="3"></textarea>
            </div>
            <div class="form-actions full-width">
              <button type="submit" class="btn btn-success">Add Department</button>
              <button type="button" (click)="toggleNewDeptForm()" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      }

      <div class="card">
        <h2>All Departments</h2>
        @if (departments.length === 0) {
          <div class="empty-state">No departments found</div>
        } @else {
          <div class="dept-grid">
            @for (dept of departments; track dept.id) {
              <div class="dept-card">
                <div class="dept-header">
                  <h3>{{ dept.name }}</h3>
                  <div class="dept-actions">
                    <button (click)="editDept(dept)" class="btn btn-sm btn-secondary">Edit</button>
                    <button (click)="deleteDept(dept.id)" class="btn btn-sm btn-danger">Delete</button>
                  </div>
                </div>
                <p class="dept-desc">{{ dept.description || 'No description' }}</p>
              </div>
            }
          </div>
        }
      </div>

      @if (editingDept) {
        <div class="card form-card">
          <h2>Edit Department</h2>
          <form (ngSubmit)="submitEditDept()" class="form-grid">
            <div class="form-group full-width">
              <label>Department Name</label>
              <input type="text" [(ngModel)]="editingDept.name" name="name" required>
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea [(ngModel)]="editingDept.description" name="description" rows="3"></textarea>
            </div>
            <div class="form-actions full-width">
              <button type="submit" class="btn btn-success">Save Changes</button>
              <button type="button" (click)="cancelEdit()" class="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      }
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
    .form-group textarea {
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

    .dept-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .dept-card {
      background: rgba(56, 189, 248, 0.1);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid rgba(56, 189, 248, 0.3);
      transition: all 0.3s;
    }

    .dept-card:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.5);
    }

    .dept-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .dept-header h3 {
      margin: 0;
      color: #38bdf8;
      font-size: 1.2rem;
    }

    .dept-actions {
      display: flex;
      gap: 0.5rem;
    }

    .dept-desc {
      color: #cbd5e1;
      margin: 0;
      font-size: 0.9rem;
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

      .dept-grid {
        grid-template-columns: 1fr;
      }
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
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  toggleNewDeptForm() {
    this.showNewDeptForm = !this.showNewDeptForm;
  }

  submitNewDept() {
    this.api.addDepartment(this.newDept).subscribe({
      next: () => {
        this.loadDepartments();
        this.showNewDeptForm = false;
        this.newDept = { name: '', description: '' };
      },
      error: (err) => console.error('Error adding department:', err)
    });
  }

  editDept(dept: Department) {
    this.editingDept = { ...dept };
  }

  submitEditDept() {
    if (this.editingDept) {
      this.api.updateDepartment(this.editingDept.id, {
        name: this.editingDept.name,
        description: this.editingDept.description
      }).subscribe({
        next: () => {
          this.loadDepartments();
          this.editingDept = null;
        },
        error: (err) => console.error('Error updating department:', err)
      });
    }
  }

  cancelEdit() {
    this.editingDept = null;
  }

  deleteDept(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.api.deleteDepartment(id).subscribe({
        next: () => this.loadDepartments(),
        error: (err) => console.error('Error deleting department:', err)
      });
    }
  }
}
