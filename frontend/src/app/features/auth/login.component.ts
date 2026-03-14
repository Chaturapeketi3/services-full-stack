import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="card">
        <h2>Welcome to HouseMate</h2>
        <p class="subtitle">Login to your account</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          
          <div class="form-group">
            <label for="email">Email address</label>
            <input 
              id="email" 
              type="email" 
              formControlName="email"
              placeholder="name@example.com"
              [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            >
            <div class="error-msg" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Please enter a valid email.
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              id="password" 
              type="password" 
              formControlName="password"
              placeholder="••••••••"
              [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
          </div>

          <div class="error-banner" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn-primary" 
            [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
          
          <div class="footer-links">
            <p>Don't have an account? <a routerLink="/register">Register here</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./auth.styles.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.user.role === 'ROLE_CUSTOMER') {
            this.router.navigate(['/customer/dashboard']);
          } else if (res.user.role === 'ROLE_EXPERT') {
            this.router.navigate(['/expert/dashboard']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          const detail = err.error?.detail;
          let msg = err.error?.message || 'Invalid credentials. Please try again.';
          if (detail) {
            msg = Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : detail;
          }
          this.errorMessage = msg;
        }
      });
    }
  }
}
