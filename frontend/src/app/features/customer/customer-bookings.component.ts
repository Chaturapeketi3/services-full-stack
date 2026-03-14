import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../booking/booking.service';
import { Booking } from '../../shared/models';

@Component({
  selector: 'app-customer-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="padding: 2.5rem; max-width: 800px; margin: 0 auto; min-height: 100vh; background-color: #f9fafb;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1 style="font-size: 2rem; margin: 0;">My Bookings</h1>
        <a routerLink="/customer/dashboard" style="color: #2563eb; text-decoration: none; font-weight: 500;">&larr; Back to Dashboard</a>
      </div>

      <div *ngIf="isLoading" style="color: #6b7280; text-align: center; padding: 2rem;">Loading bookings...</div>
      
      <div *ngIf="!isLoading && bookings.length === 0" style="background: white; padding: 3rem; text-align: center; border-radius: 12px; border: 1px dashed #cbd5e1; color: #94a3b8;">
        <p style="margin-bottom: 1.5rem;">You have no bookings yet.</p>
        <a routerLink="/customer/services" style="background: #2563eb; color: white; padding: 0.6rem 1.2rem; border-radius: 6px; text-decoration: none; display: inline-block;">Browse Services</a>
      </div>

      <div style="display: grid; gap: 1rem;">
        <div *ngFor="let booking of bookings" style="background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0 0 0.5rem; color: #1f2937;">Service ID: {{ booking.service_id || 'N/A' }}</h3>
            <p style="margin: 0 0 0.25rem; color: #6b7280; font-size: 0.875rem;">Scheduled: {{ booking.start_time | date:'medium' }} - {{ booking.end_time | date:'shortTime' }} ({{ booking.duration_minutes }} mins)</p>
            <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Status: <strong style="color: #2563eb;">{{ booking.status }}</strong></p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem;">\${{ booking.total_amount }}</p>
            <a [routerLink]="['/customer/booking-details', booking.id]" style="color: #2563eb; text-decoration: none; font-size: 0.875rem; font-weight: 500;">View Details</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomerBookingsComponent implements OnInit {
  private bookingService = inject(BookingService);
  isLoading = true;
  bookings: Booking[] = [];

  ngOnInit() {
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings = res.items || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
