import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Employee, EmployeeCreate } from '../../services/api.service';

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
  form: EmployeeCreate = {
    employee_id: '',
    full_name: '',
    email: '',
    department: '',
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadList();
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

  onSubmit(): void {
    this.formError = null;
    this.successMessage = null;
    const payload: EmployeeCreate = {
      employee_id: this.form.employee_id.trim(),
      full_name: this.form.full_name.trim(),
      email: this.form.email.trim(),
      department: this.form.department.trim(),
    };
    if (!payload.employee_id || !payload.full_name || !payload.email || !payload.department) {
      this.formError = 'All fields are required.';
      return;
    }
    this.api.addEmployee(payload).subscribe({
      next: () => {
        this.successMessage = 'Employee added successfully.';
        this.form = { employee_id: '', full_name: '', email: '', department: '' };
        this.loadList();
      },
      error: (err: string) => {
        this.formError = err;
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
