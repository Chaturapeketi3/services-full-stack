import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="logo">HouseMate</div>
        <nav>
          <a routerLink="/customer" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Dashboard</a>
          <a routerLink="/customer/bookings" routerLinkActive="active">My Bookings</a>
          <a routerLink="/customer/services" routerLinkActive="active">Browse Services</a>
          <a routerLink="/customer/profile" routerLinkActive="active">Profile</a>
        </nav>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </aside>
      
      <main class="content">
        <header>
          <h1>Welcome, {{ userName$ | async }}</h1>
          <p>Find and book the best home services</p>
        </header>
        
        <section class="quick-actions">
          <div class="action-card">
            <h3>Book a Service</h3>
            <p>Plumbing, Cleaning, Electrical & more</p>
            <button class="btn-primary" routerLink="/customer/services">Browse Services</button>
          </div>
          
          <div class="action-card">
            <h3>Recent Bookings</h3>
            <p>You have no recent bookings.</p>
            <button class="btn-secondary" routerLink="/customer/bookings">View History</button>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background-color: #f9fafb; }
    .sidebar { width: 250px; background: white; border-right: 1px solid #e5e7eb; padding: 1.5rem; display: flex; flex-direction: column; }
    .logo { font-size: 1.5rem; font-weight: 800; color: #2563eb; margin-bottom: 2rem; }
    nav { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
    nav a { padding: 0.75rem 1rem; border-radius: 8px; color: #4b5563; text-decoration: none; cursor: pointer; font-weight: 500; transition: all 0.2s;}
    nav a:hover, nav a.active { background: #eff6ff; color: #2563eb; }
    .logout-btn { background: none; border: 1px solid #ef4444; color: #ef4444; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 600; margin-top: auto; }
    
    .content { flex: 1; padding: 2.5rem; }
    header h1 { font-size: 2rem; color: #111827; margin: 0 0 0.5rem; }
    header p { color: #6b7280; margin-bottom: 2rem; }
    
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .action-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .action-card h3 { margin: 0 0 0.5rem; color: #1f2937; }
    .action-card p { color: #6b7280; margin-bottom: 1.5rem; }
    .btn-primary { background: #2563eb; color: white; padding: 0.6rem 1.2rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;}
    .btn-secondary { background: #f3f4f6; color: #374151; padding: 0.6rem 1.2rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;}
  `]
})
export class CustomerDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName$ = this.authService.currentUser$.pipe(
    map(user => user?.customer_profile?.full_name || user?.expert_profile?.full_name || user?.email || '')
  );

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
