import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { BookingService, CatalogService } from './booking.service';

@Component({
  selector: 'app-booking-flow',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <div class="card">
        <h2>Schedule Service</h2>
        <p class="subtitle">Complete your booking request</p>

        <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label>Select Expert</label>
            <select formControlName="expert_id">
              <option value="">-- Choose an available professional --</option>
              <option *ngFor="let expert of experts" [value]="expert.id">
                {{ expert.full_name }}{{ expert.hourly_rate ? ' (₹' + expert.hourly_rate + '/hr)' : '' }}
              </option>
            </select>
            <div *ngIf="experts.length === 0" class="hint text-red">No experts available at the moment.</div>
          </div>

          <div class="form-group">
            <label>Service Address</label>
            <select formControlName="address_id">
              <option value="">-- Select a saved address --</option>
              <option *ngFor="let addr of addresses" [value]="addr.id">
                {{ addr.label }} – {{ addr.address_line_1 }}, {{ addr.city }}
              </option>
            </select>
            <div *ngIf="addresses.length === 0" class="hint text-red">No saved addresses. Please add one from your profile.</div>
            <div *ngIf="bookingForm.get('address_id')?.invalid && (bookingForm.get('address_id')?.dirty || bookingForm.get('address_id')?.touched)" class="error-text">
              <small *ngIf="bookingForm.get('address_id')?.hasError('required')">Please select a service address.</small>
            </div>
          </div>

          <div class="form-group">
            <label>Start Time</label>
            <input type="datetime-local" formControlName="start_time" [min]="minDate">
            <div *ngIf="bookingForm.get('start_time')?.invalid && (bookingForm.get('start_time')?.dirty || bookingForm.get('start_time')?.touched)" class="error-text">
              <small *ngIf="bookingForm.get('start_time')?.hasError('required')">Start time is required.</small>
              <small *ngIf="bookingForm.get('start_time')?.hasError('pastDate')">Start time must be in the future.</small>
            </div>
          </div>

          <div class="form-group">
            <label>End Time</label>
            <input type="datetime-local" formControlName="end_time" [min]="minDate">
            <div *ngIf="bookingForm.get('end_time')?.invalid && (bookingForm.get('end_time')?.dirty || bookingForm.get('end_time')?.touched)" class="error-text">
              <small *ngIf="bookingForm.get('end_time')?.hasError('required')">End time is required.</small>
            </div>
            <div *ngIf="bookingForm.hasError('invalidTimeRange') && (bookingForm.get('end_time')?.dirty || bookingForm.get('end_time')?.touched)" class="error-text">
              <small>End time must be after start time.</small>
            </div>
          </div>

          <div *ngIf="bookingForm.get('expert_id')?.invalid && (bookingForm.get('expert_id')?.dirty || bookingForm.get('expert_id')?.touched)" class="error-text">
            <small>Please select an expert.</small>
          </div>

          <div *ngIf="serverError" class="error-text" style="margin-bottom: 1rem; padding: 0.75rem; background: #fee2e2; border-radius: 8px;">
            {{ serverError }}
          </div>

          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="bookingForm.invalid || isLoading">
            {{ isLoading ? 'Processing...' : 'Confirm Booking' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem;}
    .card { width: 100%; max-width: 500px; padding: 2.5rem; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    h2 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #111827;}
    .subtitle { color: #6b7280; margin-bottom: 2rem; }
    
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: #374151; }
    input, select { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
    input:focus, select:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .hint { color: #9ca3af; font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    
    .btn-primary { width: 100%; margin-top: 1rem; }
    .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
    .error-text { color: #ef4444; font-size: 0.8rem; margin-top: 0.25rem; display: block; }
  `]
})
export class BookingFlowComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  private catalogService = inject(CatalogService);

  serviceId: string = '';
  isLoading = false;
  minDate: string;
  totalAmount: number = 0;
  experts: any[] = [];
  addresses: any[] = [];
  serverError: string = '';

  bookingForm = this.fb.group({
    expert_id: ['', Validators.required],
    address_id: ['', Validators.required],
    start_time: ['', [Validators.required, this.futureDateValidator()]],
    end_time: ['', [Validators.required]]
  }, { validators: this.timeRangeValidator() });

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.serviceId = params.get('serviceId') || '';
      if (this.serviceId) {
        this.catalogService.getServiceById(this.serviceId).subscribe(service => {
          this.totalAmount = service.base_price;
        });
        this.catalogService.getAvailableExperts(this.serviceId).subscribe(res => {
          this.experts = res.items;
        });
      }
    });

    // Load customer's saved addresses
    this.catalogService.getAddresses().subscribe({
      next: (addrs) => this.addresses = addrs,
      error: () => this.addresses = []
    });
    
    // Set minimum date to current date and time
    const now = new Date();
    // Format to YYYY-MM-DDThh:mm (which datetime-local expects)
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.minDate = now.toISOString().slice(0, 16);
  }

  // Custom validator for future dates
  private futureDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty string, let 'required' validator handle it
      }
      const selectedDate = new Date(control.value);
      const now = new Date();
      return selectedDate <= now ? { pastDate: true } : null;
    };
  }

  // Validator to ensure end_time > start_time
  private timeRangeValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('start_time')?.value;
      const end = group.get('end_time')?.value;
      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (endDate <= startDate) {
          return { invalidTimeRange: true };
        }
      }
      return null;
    };
  }

  // Basic idempotency key generator for the frontend demo
  private generateIdempotencyKey(): string {
     return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      this.isLoading = true;
      this.serverError = '';

      // Convert datetime-local string to ISO 8601 UTC string the backend's `datetime` field expects
      const startTimeStr: string = this.bookingForm.value.start_time || '';
      const endTimeStr: string = this.bookingForm.value.end_time || '';
      const startTimeISO = new Date(startTimeStr).toISOString();
      const endTimeISO = new Date(endTimeStr).toISOString();

      const payload = {
        expert_id: this.bookingForm.value.expert_id,
        address_id: this.bookingForm.value.address_id,
        service_id: this.serviceId,
        total_amount: this.totalAmount,
        start_time: startTimeISO,
        end_time: endTimeISO,
        idempotency_key: this.generateIdempotencyKey()
      };

      this.bookingService.createBooking(payload).subscribe({
        next: (booking) => {
          this.isLoading = false;
          this.router.navigate(['/customer/payment', booking.id]);
        },
        error: (err) => {
          this.isLoading = false;
          const detail = err.error?.detail;
          let msg = err.error?.message || 'Booking failed. Please try again.';
          if (detail) {
            msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : String(detail);
          }
          this.serverError = msg;
        }
      });
    } else {
      // Mark all fields as touched to trigger inline validation messages
      this.bookingForm.markAllAsTouched();
    }
  }
}
