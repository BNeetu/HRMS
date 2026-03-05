import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Employee, EmployeeCreate, Department } from '../../services/api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
})
export class EmployeesComponent implements OnInit {
  loading = false;
  listError: string | null = null;
  formError: string | null = null;
  successMessage: string | null = null;
  employees: Employee[] = [];
  // updated form to use numeric department_id instead of free-text department name
  form: EmployeeCreate = {
    employee_id: '',
    full_name: '',
    email: '',
    department_id: 0,
  };

  departments: Department[] = [];
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadList();
    this.loadDepartments();
  }

  loadList(): void {
    this.loading = true;
    this.listError = null;
    this.api.getEmployees().subscribe({
      next: (list) => {
        this.employees = list;
        this.loading = false;
      },
      error: (err: string) => {
        this.listError = err;
        this.loading = false;
      },
    });
  }

  loadDepartments(): void {
    this.api.getDepartments().subscribe({
      next: (list) => (this.departments = list),
      error: (err: string) => {
        // not critical, just log
        console.error('Failed to load departments:', err);
      },
    });
  }

  onSubmit(): void {
    this.formError = null;
    this.successMessage = null;
    const deptId = Number(this.form.department_id);
    const payload: EmployeeCreate = {
      employee_id: this.form.employee_id.trim(),
      full_name: this.form.full_name.trim(),
      email: this.form.email.trim(),
      department_id: deptId,
    };
    if (!payload.employee_id || !payload.full_name || !payload.email || !deptId) {
      this.formError = 'All fields are required.';
      return;
    }
    this.api.addEmployee(payload).subscribe({
      next: () => {
        this.successMessage = 'Employee added successfully.';
        this.form = { employee_id: '', full_name: '', email: '', department_id: 0 };
        this.loadList();
      },
      error: (err: string) => {
        this.formError = err;
      },
    });
      },
    });
  }

  delete(emp: Employee): void {
    if (!confirm('Delete employee ' + emp.full_name + '?')) return;
    this.api.deleteEmployee(emp.id).subscribe({
      next: () => this.loadList(),
      error: (err: string) => {
        this.listError = err;
      },
    });
  }
}
