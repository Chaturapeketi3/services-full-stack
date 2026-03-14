import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rate-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="rating-container">
      <div class="card">
        <h2>Rate your Expert</h2>
        <p class="subtitle">How was your service experience?</p>
        
        <form [formGroup]="ratingForm" (ngSubmit)="onSubmit()">
          <div class="stars">
             <span *ngFor="let star of [1,2,3,4,5]" 
                   (click)="setScore(star)"
                   [class.active]="star <= currentScore"
                   class="star">★</span>
          </div>
          
           <!-- Hidden field to validate score -->
          <input type="hidden" formControlName="score">

          <div class="form-group">
            <label>Leave a Review (Optional)</label>
            <textarea formControlName="comment" rows="4" placeholder="Tell us about the service..."></textarea>
          </div>

          <div class="actions">
            <button type="button" class="btn-secondary" routerLink="/customer/dashboard">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="ratingForm.invalid || isLoading">
               {{ isLoading ? 'Submitting...' : 'Submit Rating' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .rating-container { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem;}
    .card { width: 100%; max-width: 500px; padding: 2.5rem; text-align: center; }
    h2 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .subtitle { color: #6b7280; margin-bottom: 2rem; }
    
    .stars { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; }
    .star { font-size: 3rem; color: #d1d5db; cursor: pointer; transition: color 0.2s; }
    .star:hover, .star.active { color: #fbbf24; }
    
    .form-group { text-align: left; margin-bottom: 1.5rem; }
    label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: #374151; }
    textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; resize: vertical; }
    textarea:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    
    .actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .actions button { flex: 1; }
  `]
})
export class RateBookingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  bookingId: string = '';
  currentScore = 0;
  isLoading = false;

  ratingForm = this.fb.group({
    score: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['']
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.bookingId = params.get('bookingId') || '';
    });
  }

  setScore(score: number) {
    this.currentScore = score;
    this.ratingForm.patchValue({ score });
  }

  onSubmit() {
    if (this.ratingForm.valid) {
      this.isLoading = true;
      const payload = {
        booking_id: this.bookingId,
        score: this.ratingForm.value.score,
        comment: this.ratingForm.value.comment
      };

      // Assuming POST /ratings endpoint exists conceptually mapped to models
      this.http.post(`${environment.apiUrl}/ratings`, payload).subscribe({
        next: () => {
          this.isLoading = false;
          alert('Thank you! Your rating has been submitted.');
          this.router.navigate(['/customer/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          alert('Failed to submit rating: ' + (err.error?.message || 'Unknown error'));
        }
      });
    }
  }
}
