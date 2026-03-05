import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="sidebar-header">
        <h1>🏢 HRMS</h1>
      </div>

      <ul class="nav-menu">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <span class="icon">📊</span>
            <span class="label">Dashboard</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Management</span>
        </li>

        <li>
          <a routerLink="/employees" routerLinkActive="active">
            <span class="icon">👥</span>
            <span class="label">Employees</span>
          </a>
        </li>

        <li>
          <a routerLink="/attendance" routerLinkActive="active">
            <span class="icon">✓</span>
            <span class="label">Attendance</span>
          </a>
        </li>

        <li>
          <a routerLink="/leaves" routerLinkActive="active">
            <span class="icon">📅</span>
            <span class="label">Leave Management</span>
          </a>
        </li>

        <li>
          <a routerLink="/departments" routerLinkActive="active">
            <span class="icon">🏭</span>
            <span class="label">Departments</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Organization</span>
        </li>

        <li>
          <a routerLink="/holidays" routerLinkActive="active">
            <span class="icon">🎉</span>
            <span class="label">Holidays</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Reports</span>
        </li>

        <li>
          <a routerLink="/reports" routerLinkActive="active">
            <span class="icon">📈</span>
            <span class="label">Analytics & Reports</span>
          </a>
        </li>
      </ul>

      <div class="sidebar-footer">
        <p style="margin: 0; font-size: 0.75rem; color: #64748b;">HRMS v2.0</p>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-right: 1px solid rgba(56, 189, 248, 0.2);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      overflow-y: auto;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    }

    .sidebar-header h1 {
      margin: 0;
      color: #38bdf8;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .nav-menu {
      list-style: none;
      padding: 1rem 0;
      margin: 0;
      flex: 1;
    }

    .nav-menu li {
      margin: 0;
    }

    .nav-menu a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.3s;
      border-left: 3px solid transparent;
    }

    .nav-menu a:hover {
      background: rgba(56, 189, 248, 0.1);
      color: #38bdf8;
      border-left-color: #38bdf8;
    }

    .nav-menu a.active {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border-left-color: #38bdf8;
      font-weight: 600;
    }

    .nav-section {
      padding: 1rem 1.5rem 0.5rem;
      margin-top: 1rem;
    }

    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
    }

    .icon {
      font-size: 1.25rem;
      min-width: 1.25rem;
    }

    .label {
      font-size: 0.9rem;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(56, 189, 248, 0.2);
      text-align: center;
      color: #94a3b8;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 60px;
      }

      .nav-menu a {
        justify-content: center;
        padding: 0.75rem;
      }

      .label,
      .section-title {
        display: none;
      }

      .sidebar-header h1 {
        font-size: 1rem;
        text-align: center;
      }

      .sidebar-footer p {
        display: none;
      }
    }
  `]
})
export class SidebarComponent {}
