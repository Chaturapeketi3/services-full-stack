import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ExpertService } from './expert.service';

@Component({
  selector: 'app-expert-jobs',
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
            <h1>Job Requests</h1>
            <p>View and manage all your assigned jobs.</p>
          </div>
        </header>

        <section class="recent-requests">
          <div *ngIf="isLoading" class="empty-state">Loading jobs...</div>
          <div *ngIf="!isLoading && jobs.length === 0" class="empty-state">
            <p>No job requests at the moment.</p>
          </div>
          <div *ngFor="let job of jobs" class="job-card">
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
            <div class="job-actions" *ngIf="job.status === 'ACCEPTED'">
              <button class="btn-complete" (click)="completeJob(job.id)">✅ Mark Complete</button>
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
    
    .recent-requests { margin-top: 1rem; }
    .empty-state { background: white; padding: 3rem; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; color: #94a3b8; }
    .job-card { background: white; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #3b82f6; }
    .job-info { flex: 1; }
    .job-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
    .job-status { padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: #e2e8f0; color: #475569; }
    .status-confirmed { background: #d1fae5; color: #065f46; } .status-pending_payment { background: #fef3c7; color: #92400e; } .status-accepted { background: #dbeafe; color: #1e40af; }
    .job-time { color: #6b7280; font-size: 0.875rem; } .job-amount { font-weight: 600; color: #111827; margin: 0.25rem 0; } .job-id { color: #9ca3af; font-size: 0.8rem; margin: 0; font-family: monospace; }
    .job-actions { display: flex; gap: 0.75rem; }
    .btn-accept { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-reject { background: none; color: #ef4444; border: 1px solid #ef4444; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-complete { background: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
  `]
})
export class ExpertJobsComponent implements OnInit {
  private authService = inject(AuthService);
  private expertService = inject(ExpertService);
  private router = inject(Router);

  jobs: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.fetchJobs();
  }

  fetchJobs() {
    this.isLoading = true;
    this.expertService.getJobs().subscribe({
      next: (res) => {
        this.jobs = res.items || [];
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  acceptJob(jobId: string) {
    this.expertService.acceptJob(jobId).subscribe({
      next: () => this.fetchJobs(),
      error: (err: any) => alert('Failed to accept: ' + (err.error?.detail || 'Unknown error'))
    });
  }

  rejectJob(jobId: string) {
    this.expertService.rejectJob(jobId).subscribe({
      next: () => this.fetchJobs(),
      error: (err: any) => alert('Failed to reject: ' + (err.error?.detail || 'Unknown error'))
    });
  }

  completeJob(jobId: string) {
    if (!confirm('Mark this job as completed? This will credit your earnings.')) return;
    this.expertService.updateBookingStatus(jobId, 'COMPLETED').subscribe({
      next: () => {
        this.fetchJobs();
        alert('Job marked complete! Earnings have been updated.');
      },
      error: (err: any) => alert('Failed to complete: ' + (err.error?.detail || 'Unknown error'))
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
