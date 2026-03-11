import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <button
      class="sidebar-backdrop"
      type="button"
      [class.show]="isOpen"
      (click)="closeSidebar.emit()"
      aria-label="Close menu">
    </button>
    <nav class="sidebar" [class.open]="isOpen">
      <div class="sidebar-header">
        <h1>Ethara HRMS</h1>
      </div>

      <ul class="nav-menu">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="onNavClick()">
            <span class="icon">◉</span>
            <span class="label">Dashboard</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Management</span>
        </li>

        <li>
          <a routerLink="/employees" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon">◎</span>
            <span class="label">Employees</span>
          </a>
        </li>

        <li>
          <a routerLink="/attendance" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon">◍</span>
            <span class="label">Attendance</span>
          </a>
        </li>

        <li>
          <a routerLink="/leaves" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon">◐</span>
            <span class="label">Leave Management</span>
          </a>
        </li>

        <li>
          <a routerLink="/departments" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon">◧</span>
            <span class="label">Departments</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Organization</span>
        </li>

        <li>
          <a routerLink="/holidays" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon">◓</span>
            <span class="label">Holidays</span>
          </a>
        </li>

        <li class="nav-section">
          <span class="section-title">Reports</span>
        </li>

        <li>
          <a routerLink="/reports" routerLinkActive="active" (click)="onNavClick()">
            <span class="icon">◨</span>
            <span class="label">Analytics & Reports</span>
          </a>
        </li>
      </ul>

      <div class="sidebar-footer">
        <p style="margin: 0; font-size: 0.75rem; color: #7b8fbd;">HRMS v2.0</p>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(2, 6, 23, 0.65);
      border: 0;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 999;
    }

    .sidebar-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }

    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: linear-gradient(170deg, #111b35 0%, #0b1225 65%, #090f1f 100%);
      border-right: 1px solid rgba(82, 120, 255, 0.24);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .sidebar-header {
      padding: 1.4rem 1.25rem 1.1rem;
      border-bottom: 1px solid rgba(82, 120, 255, 0.2);
    }

    .sidebar-header h1 {
      margin: 0;
      color: #f5f8ff;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .nav-menu {
      list-style: none;
      padding: 1rem 0.75rem;
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
      padding: 0.68rem 0.9rem;
      border-radius: 10px;
      color: #d8e0f2;
      text-decoration: none;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .nav-menu a:hover {
      background: rgba(82, 120, 255, 0.16);
      color: #ffffff;
      border-color: rgba(82, 120, 255, 0.35);
    }

    .nav-menu a.active {
      background: linear-gradient(90deg, rgba(82, 120, 255, 0.35), rgba(44, 84, 200, 0.2));
      color: #ffffff;
      border-color: rgba(116, 148, 255, 0.45);
      font-weight: 600;
    }

    .nav-section {
      padding: 1rem 0.9rem 0.4rem;
      margin-top: 1rem;
    }

    .section-title {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #7b8fbd;
      letter-spacing: 0.08em;
    }

    .icon {
      font-size: 0.95rem;
      min-width: 1.25rem;
      opacity: 0.9;
    }

    .label {
      font-size: 0.9rem;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(82, 120, 255, 0.2);
      text-align: center;
      color: #9db0d8;
    }

    @media (max-width: 1024px) {
      .sidebar {
        width: min(82vw, 320px);
        transform: translateX(-100%);
        transition: transform 0.25s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();

  onNavClick(): void {
    if (window.innerWidth <= 1024) {
      this.closeSidebar.emit();
    }
  }
}
