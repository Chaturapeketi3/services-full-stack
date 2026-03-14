import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from './booking.service';
import { Booking } from '../../shared/models';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="details-container">
      <div class="header">
        <h1>Booking Details</h1>
        <a routerLink="/customer/dashboard" class="btn-secondary">Back to Dashboard</a>
      </div>
      
      <div class="card" *ngIf="booking; else loading">
        <div class="status-badge" [ngClass]="booking.status.toLowerCase()">
          {{ booking.status }}
        </div>
        
        <div class="grid-2">
          <div class="info-group">
            <label>Booking ID</label>
            <p>{{ booking.id }}</p>
          </div>
          <div class="info-group">
            <label>Scheduled For</label>
            <p>{{ booking.start_time | date:'medium' }} - {{ booking.end_time | date:'shortTime' }} ({{ booking.duration_minutes }} mins)</p>
          </div>
          
          <div class="info-group" *ngIf="booking.expert_earning">
             <label>Expert Earning</label>
             <p class="price" style="font-size: 1rem !important; color:#059669 !important;">$\{{ booking.expert_earning }}</p>
          </div>
          <div class="info-group">
            <label>Amount</label>
            <p class="price">$\{{ booking.total_amount }}</p>
          </div>
        </div>

        <div class="actions" *ngIf="booking.status === 'PENDING_PAYMENT'">
            <button class="btn-primary" [routerLink]="['/customer/payment', booking.id]">Complete Payment</button>
        </div>
        
        <div class="actions" *ngIf="booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED'">
            <button class="btn-primary" [routerLink]="['/customer/modify-booking', booking.id]">Modify Time</button>
            <button class="btn-secondary text-red" (click)="cancel()">Cancel Booking</button>
        </div>
        
        <div class="actions" *ngIf="booking.status === 'COMPLETED'">
            <button class="btn-primary" [routerLink]="['/customer/rate-booking', booking.id]">Leave a Rating</button>
        </div>
      </div>
      
      <ng-template #loading>
        <div class="empty-state">Loading booking details...</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .details-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header h1 { margin: 0; font-size: 2rem; color: #111827; }
    
    .status-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 2rem; background: #e5e7eb; color: #374151;}
    .status-badge.confirmed { background: #dbeafe; color: #1e40af; }
    .status-badge.completed { background: #d1fae5; color: #065f46; }
    .status-badge.pending_payment { background: #fef3c7; color: #92400e; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .info-group label { display: block; color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em;}
    .info-group p { font-size: 1.1rem; color: #111827; margin: 0; font-weight: 500;}
    .price { font-size: 1.25rem !important; color: #2563eb !important; font-weight: 700 !important; }
    
    .actions { display: flex; gap: 1rem; border-top: 1px solid #e5e7eb; padding-top: 1.5rem; }
    .text-red { color: #ef4444 !important; border-color: #ef4444 !important; }
    .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 12px; color: #64748b; }
  `]
})
export class BookingDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  booking: Booking | null = null;
  bookingId: string = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookingId = params.get('bookingId') || '';
      if (this.bookingId) {
        this.fetchBooking();
      }
    });
  }

  fetchBooking() {
    this.bookingService.getBookingById(this.bookingId).subscribe(res => {
      this.booking = res;
    });
  }

  cancel() {
    if(confirm('Are you sure you want to cancel this booking?')) {
       this.bookingService.cancelBooking(this.bookingId).subscribe(() => {
          alert('Booking cancelled successfully');
          this.fetchBooking();
       });
    }
  }
}
