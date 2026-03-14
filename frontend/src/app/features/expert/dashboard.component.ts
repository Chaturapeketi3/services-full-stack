import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ExpertService, ExpertDashboardSummary } from './expert.service';

@Component({
  selector: 'app-expert-dashboard',
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
            <h1>Expert Dashboard</h1>
            <p>Manage your jobs and earnings</p>
          </div>
          <div class="status-toggle" (click)="toggleAvailability()" style="cursor: pointer;">
            <span class="status-dot" [class.online]="summary?.is_available"></span>
            <strong>{{ summary?.is_available ? 'Online' : 'Offline' }}</strong> - {{ summary?.is_available ? 'Receiving Jobs' : 'Not Receiving Jobs' }}
          </div>
        </header>

        <section class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ (summary?.total_earnings || 0).toFixed(2) }}</div>
            <div class="metric-label">Total Earnings</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ summary?.completed_jobs_count || 0 }}</div>
            <div class="metric-label">Completed Jobs</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ summary?.pending_requests_count || 0 }}</div>
            <div class="metric-label">Pending Requests</div>
          </div>
        </section>
        
        <section class="recent-requests">
          <h2>Recent Job Requests</h2>
          <div *ngIf="isLoadingJobs" class="empty-state"><p>Loading jobs...</p></div>
          <div *ngIf="!isLoadingJobs && recentJobs.length === 0" class="empty-state">
            <p>No new job requests at the moment.</p>
          </div>
          <div *ngFor="let job of recentJobs" class="job-card">
            <div class="job-info">
              <div class="job-header">
                <span class="job-status" [ngClass]="'status-' + job.status.toLowerCase()">{{ job.status }}</span>
                <span class="job-time">{{ job.start_time | date:'medium' }} - {{ job.end_time | date:'shortTime' }}</span>
              </div>
              <p class="job-amount">Amount: ₹{{ job.total_amount }}</p>
              <p class="job-id">Booking #{{ job.id.slice(0, 8) }}...</p>
            </div>
            <div class="job-actions" *ngIf="job.status === 'CONFIRMED'">
              <button class="btn-accept" (click)="acceptJob(job.id)">Accept</button>
              <button class="btn-reject" (click)="rejectJob(job.id)">Reject</button>
            </div>
          </div>
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
    
    .status-toggle { display: flex; align-items: center; gap: 0.5rem; background: white; padding: 0.75rem 1.25rem; border-radius: 50px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 0.875rem; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .status-dot.online { background-color: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }

    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
    .metric-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-left: 4px solid #3b82f6;}
    .metric-value { font-size: 2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
    .metric-label { color: #64748b; font-size: 0.875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .recent-requests h2 { font-size: 1.25rem; color: #1f2937; margin-bottom: 1rem; }
    .empty-state { background: white; padding: 3rem; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; color: #94a3b8; }
    .job-card { background: white; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #3b82f6; }
    .job-info { flex: 1; }
    .job-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .job-status { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: #e2e8f0; color: #475569; }
    .status-confirmed { background: #d1fae5; color: #065f46; }
    .status-pending_payment { background: #fef3c7; color: #92400e; }
    .status-accepted { background: #dbeafe; color: #1e40af; }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-rejected { background: #fee2e2; color: #991b1b; }
    .job-time { color: #6b7280; font-size: 0.875rem; }
    .job-amount { font-weight: 600; color: #111827; margin: 0.25rem 0; }
    .job-id { color: #9ca3af; font-size: 0.8rem; margin: 0; font-family: monospace; }
    .job-actions { display: flex; gap: 0.75rem; }
    .btn-accept { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-reject { background: none; color: #ef4444; border: 1px solid #ef4444; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
  `]
})
export class ExpertDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private expertService = inject(ExpertService);
  private router = inject(Router);

  summary: ExpertDashboardSummary | null = null;
  recentJobs: any[] = [];
  isLoading = true;
  isLoadingJobs = true;

  ngOnInit() {
    this.fetchDashboard();
    this.fetchRecentJobs();
  }

  fetchDashboard() {
    this.isLoading = true;
    this.expertService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  fetchRecentJobs() {
    this.isLoadingJobs = true;
    this.expertService.getJobs(undefined, 1, 5).subscribe({
      next: (res) => {
        this.recentJobs = res.items || [];
        this.isLoadingJobs = false;
      },
      error: () => { this.recentJobs = []; this.isLoadingJobs = false; }
    });
  }

  acceptJob(jobId: string) {
    this.expertService.acceptJob(jobId).subscribe({
      next: () => this.fetchRecentJobs(),
      error: (err: any) => alert('Failed to accept: ' + (err.error?.detail || 'Unknown error'))
    });
  }

  rejectJob(jobId: string) {
    this.expertService.rejectJob(jobId).subscribe({
      next: () => this.fetchRecentJobs(),
      error: (err: any) => alert('Failed to reject: ' + (err.error?.detail || 'Unknown error'))
    });
  }

  toggleAvailability() {
    if (!this.summary) return;
    const newState = !this.summary.is_available;
    this.expertService.toggleAvailability(newState).subscribe({
      next: () => {
        this.summary!.is_available = newState;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
