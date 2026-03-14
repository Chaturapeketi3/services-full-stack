import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Booking } from '../../shared/models';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-container">
      <div class="card payment-card">
        <div class="header">
          <h2>Secure Checkout</h2>
          <span class="lock-icon">🔒</span>
        </div>
        
        <div class="booking-summary" *ngIf="booking">
          <h3>Order Summary</h3>
          <div class="row">
            <span>Booking Reference:</span>
            <strong>{{ booking.id.substring(0,8) }}</strong>
          </div>
          <div class="row">
            <span>Total Amount:</span>
            <strong class="price">$\{{ booking.total_amount }}</strong>
          </div>
        </div>

        <div class="payment-methods">
          <label class="method" [class.selected]="selectedMethod === 'CARD'">
            <input type="radio" name="method" value="CARD" (change)="selectedMethod = 'CARD'">
            💳 Credit / Debit Card
          </label>
          <label class="method" [class.selected]="selectedMethod === 'UPI'">
            <input type="radio" name="method" value="UPI" (change)="selectedMethod = 'UPI'">
            📱 UPI Transfer
          </label>
          <label class="method" [class.selected]="selectedMethod === 'NET_BANKING'">
            <input type="radio" name="method" value="NET_BANKING" (change)="selectedMethod = 'NET_BANKING'">
            🏦 Net Banking
          </label>
        </div>

        <button 
          class="btn-primary pay-btn" 
          [disabled]="isLoading || !selectedMethod"
          (click)="processPayment()">
          {{ isLoading ? 'Processing...' : 'Pay $' + (booking?.total_amount || 0) }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f3f4f6; padding: 2rem;}
    .payment-card { max-width: 450px; width: 100%; border-radius: 16px; overflow: hidden; padding: 0; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .header { background: #1e3a8a; color: white; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; }
    .header h2 { margin: 0; font-size: 1.5rem; }
    .lock-icon { font-size: 1.25rem; }
    
    .booking-summary { padding: 2rem; background: #eff6ff; border-bottom: 1px solid #bfdbfe;}
    .booking-summary h3 { margin-top: 0; color: #1e3a8a; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;}
    .row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #475569; }
    .price { font-size: 1.5rem; color: #0f172a; }

    .payment-methods { padding: 2rem 2rem 1rem 2rem; display: flex; flex-direction: column; gap: 1rem; }
    .method { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;}
    .method:hover { border-color: #cbd5e1; background: #f8fafc; }
    .method.selected { border-color: #3b82f6; background: #eff6ff; font-weight: 600; color: #1e40af;}
    
    .pay-btn { margin: 1rem 2rem 2rem 2rem; width: calc(100% - 4rem); padding: 1rem; font-size: 1.1rem; border-radius: 8px; }
  `]
})
export class PaymentModalComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  bookingId: string = '';
  booking: Booking | null = null;
  selectedMethod: string = '';
  isLoading = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookingId = params.get('bookingId') || '';
      if (this.bookingId) {
        this.fetchBookingDetails();
      }
    });
  }

  fetchBookingDetails() {
    this.http.get<Booking>(`${environment.apiUrl}/bookings/${this.bookingId}`).subscribe(
      res => this.booking = res
    );
  }
  
  private generateIdempotencyKey(): string {
     return Math.random().toString(36).substring(2, 15);
  }

  processPayment() {
    if (!this.booking || !this.selectedMethod) return;

    this.isLoading = true;
    const payload = {
      booking_id: this.bookingId,
      amount: this.booking.total_amount,
      payment_method: this.selectedMethod,
      idempotency_key: this.generateIdempotencyKey()
    };

    this.http.post(`${environment.apiUrl}/payments`, payload).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Payment Success! Your booking is confirmed.');
        this.router.navigate(['/customer/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const detail = err.error?.detail;
        let msg = err.error?.message || 'Try again';
        if (detail) {
          msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : detail;
        }
        alert('Payment Failed: ' + msg);
      }
    });
  }
}
