import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="card">
        <h2>Create an Account</h2>
        <p class="subtitle">Join HouseMate today</p>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          
          <div class="role-selector">
            <label>
              <input type="radio" formControlName="role" value="ROLE_CUSTOMER"> I'm a Customer
            </label>
            <label>
              <input type="radio" formControlName="role" value="ROLE_EXPERT"> I'm an Expert
            </label>
          </div>

          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input id="fullName" type="text" formControlName="full_name" placeholder="John Doe">
          </div>

          <div class="form-group">
            <label for="email">Email address</label>
            <input id="email" type="email" formControlName="email" placeholder="name@example.com">
          </div>
          
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input id="phone" type="tel" formControlName="phone" placeholder="+1234567890">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••">
          </div>

          <div class="error-banner" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
          
          <div class="footer-links">
            <p>Already have an account? <a routerLink="/login">Sign in</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./auth.styles.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.registerForm = this.fb.group({
      role: ['ROLE_CUSTOMER', Validators.required],
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          // Auto login or redirect to login
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          const detail = err.error?.detail;
          let msg = err.error?.message || 'Registration failed.';
          if (detail) {
            msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : detail;
          }
          this.errorMessage = msg;
        }
      });
    }
  }
}
