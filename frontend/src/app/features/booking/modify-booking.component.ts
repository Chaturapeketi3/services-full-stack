import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-modify-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="modify-container">
      <div class="card">
        <h2>Modify Appointment time</h2>
        <p class="subtitle">Change your scheduled service time</p>
        
        <form [formGroup]="modifyForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>New Start Time</label>
            <input type="datetime-local" formControlName="start_time">
          </div>
          <div class="form-group">
            <label>New End Time</label>
            <input type="datetime-local" formControlName="end_time">
          </div>

          <div class="actions">
            <button type="button" class="btn-secondary" routerLink="/customer/dashboard">Go Back</button>
            <button type="submit" class="btn-primary" [disabled]="modifyForm.invalid || isLoading">
               {{ isLoading ? 'Saving...' : 'Update Time' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modify-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem;}
    .card { width: 100%; max-width: 500px; padding: 2.5rem; }
    h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .subtitle { color: #6b7280; margin-bottom: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: #374151; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
    .actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .actions button { flex: 1; }
  `]
})
export class ModifyBookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);

  bookingId: string = '';
  isLoading = false;

  modifyForm = this.fb.group({
    start_time: ['', Validators.required],
    end_time: ['', Validators.required]
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookingId = params.get('bookingId') || '';
    });
  }

  onSubmit() {
    if (this.modifyForm.valid) {
      this.isLoading = true;
      
      const startStr = this.modifyForm.value.start_time || '';
      const endStr = this.modifyForm.value.end_time || '';
      const payload = {
         start_time: new Date(startStr).toISOString(),
         end_time: new Date(endStr).toISOString()
      };

      this.bookingService.updateBooking(this.bookingId, payload).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Booking updated successfully!');
          this.router.navigate(['/customer/booking-details', this.bookingId]);
        },
        error: (err) => {
          this.isLoading = false;
          alert('Failed to update: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }
}
