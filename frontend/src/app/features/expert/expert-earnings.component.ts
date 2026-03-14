import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ExpertService } from './expert.service';

@Component({
  selector: 'app-expert-earnings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="logo">HouseMate Expert</div>
        <nav>
          <a routerLink="/expert/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
          <a routerLink="/expert/jobs" routerLinkActive="active">Job Requests</a>
          <a routerLink="/expert/earnings" routerLinkActive="active">Earnings</a>
          <a routerLink="/expert/schedule" routerLinkActive="active">My Schedule</a>
        </nav>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </aside>
      
      <main class="content">
        <header class="header-flex">
          <div>
            <h1>Earnings</h1>
            <p>View your past earnings and payouts.</p>
          </div>
        </header>

        <section class="recent-requests">
          <div *ngIf="isLoading" class="empty-state">Loading earnings...</div>
          <div *ngIf="!isLoading && earnings.length === 0" class="empty-state">
            <p>No earnings history yet.</p>
          </div>
          <!-- Loop through earnings here in the future -->
        </section>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background-color: #f9fafb; }
    .sidebar { width: 250px; background: #1e293b; border-right: 1px solid #334155; padding: 1.5rem; display: flex; flex-direction: column; color: white; }
    .logo { font-size: 1.5rem; font-weight: 800; color: #e2e8f0; margin-bottom: 2rem; }
    nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
    nav a { padding: 0.75rem 1rem; border-radius: 8px; color: #94a3b8; text-decoration: none; cursor: pointer; font-weight: 500; transition: all 0.2s;}
    nav a:hover, nav a.active { background: #334155; color: white; }
    .logout-btn { background: none; border: 1px solid #ef4444; color: #ef4444; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: auto; }
    
    .content { flex: 1; padding: 2.5rem; }
    .header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;}
    header h1 { font-size: 2rem; color: #111827; margin: 0 0 0.5rem; }
    header p { color: #6b7280; margin: 0; }
    
    .recent-requests { margin-top: 1rem; }
    .empty-state { background: white; padding: 3rem; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; color: #94a3b8; }
  `]
})
export class ExpertEarningsComponent implements OnInit {
  private authService = inject(AuthService);
  private expertService = inject(ExpertService);
  private router = inject(Router);

  earnings: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.fetchEarnings();
  }

  fetchEarnings() {
    this.isLoading = true;
    this.expertService.getEarnings().subscribe({
      next: (res) => {
        this.earnings = res.items || [];
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
