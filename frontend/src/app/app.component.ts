import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-layout">
      <header class="header">
        <div class="header-inner">
          <div class="logo">HRMS Lite <span>| Quess Corp</span></div>
          <nav class="nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Dashboard</a>
            <a routerLink="/employees" routerLinkActive="active" class="nav-link">Employees</a>
            <a routerLink="/attendance" routerLinkActive="active" class="nav-link">Attendance</a>
          </nav>
        </div>
      </header>
      <main class="layout">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AppComponent {}
