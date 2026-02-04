import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { AttendanceComponent } from './pages/attendance/attendance.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: '**', redirectTo: '' },
];
