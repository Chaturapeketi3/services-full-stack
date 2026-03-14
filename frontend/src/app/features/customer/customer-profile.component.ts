import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { CatalogService } from '../booking/booking.service';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="page-header">
        <h1>My Profile</h1>
        <a routerLink="/customer/dashboard" class="back-link">&larr; Back to Dashboard</a>
      </div>

      <!-- User Info Card -->
      <div *ngIf="user$ | async as user" class="card">
        <h2 class="section-title">Account Information</h2>
        <div class="info-row">
          <label>Name</label>
          <div>{{ user?.customer_profile?.full_name || 'Not set' }}</div>
        </div>
        <div class="info-row">
          <label>Email</label>
          <div>{{ user.email }}</div>
        </div>
        <div class="info-row">
          <label>Role</label>
          <div>{{ (user.role || '').replace('ROLE_', '').toLowerCase() }}</div>
        </div>
      </div>

      <!-- Saved Addresses -->
      <div class="card">
        <h2 class="section-title">My Addresses</h2>

        <div *ngIf="isLoadingAddresses" class="empty-state">Loading addresses...</div>
        <div *ngIf="!isLoadingAddresses && addresses.length === 0" class="empty-state">
          No saved addresses yet. Add one below.
        </div>
        <div *ngFor="let addr of addresses" class="address-card">
          <div class="address-label">{{ addr.label }}</div>
          <div class="address-text">{{ addr.address_line_1 }}<span *ngIf="addr.address_line_2">, {{ addr.address_line_2 }}</span></div>
          <div class="address-text">{{ addr.city }}, {{ addr.state }} - {{ addr.zip_code }}</div>
        </div>

        <!-- Add Address Form -->
        <div class="divider"></div>
        <h3 class="sub-title">Add New Address</h3>
        <form [formGroup]="addressForm" (ngSubmit)="onAddAddress()">
          <div class="form-row-2">
            <div class="form-group">
              <label>Label (Home / Work)</label>
              <input type="text" formControlName="label" placeholder="e.g. Home">
              <div *ngIf="addressForm.get('label')?.invalid && addressForm.get('label')?.touched" class="error-text">Label is required.</div>
            </div>
            <div class="form-group">
              <label>Street Address</label>
              <input type="text" formControlName="address_line_1" placeholder="e.g. 123 Main Street">
              <div *ngIf="addressForm.get('address_line_1')?.invalid && addressForm.get('address_line_1')?.touched" class="error-text">Street address is required.</div>
            </div>
          </div>
          <div class="form-group">
            <label>Apartment / Flat (Optional)</label>
            <input type="text" formControlName="address_line_2" placeholder="Apt B, Floor 3, etc.">
          </div>
          <div class="form-row-3">
            <div class="form-group">
              <label>City</label>
              <input type="text" formControlName="city" placeholder="City">
              <div *ngIf="addressForm.get('city')?.invalid && addressForm.get('city')?.touched" class="error-text">City is required.</div>
            </div>
            <div class="form-group">
              <label>State</label>
              <input type="text" formControlName="state" placeholder="State">
              <div *ngIf="addressForm.get('state')?.invalid && addressForm.get('state')?.touched" class="error-text">State is required.</div>
            </div>
            <div class="form-group">
              <label>Zip Code</label>
              <input type="text" formControlName="zip_code" placeholder="ZIP">
              <div *ngIf="addressForm.get('zip_code')?.invalid && addressForm.get('zip_code')?.touched" class="error-text">Zip code is required.</div>
            </div>
          </div>

          <div *ngIf="addError" class="server-error">{{ addError }}</div>

          <button type="submit" class="btn-primary" [disabled]="isSaving">
            {{ isSaving ? 'Saving...' : 'Save Address' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { padding: 2.5rem; max-width: 700px; margin: 0 auto; min-height: 100vh; background-color: #f9fafb; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; margin: 0; color: #111827; }
    .back-link { color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.95rem; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
    .section-title { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0 0 1.5rem; }
    .sub-title { font-size: 1rem; font-weight: 600; color: #374151; margin: 0 0 1rem; }
    .info-row { margin-bottom: 1.25rem; }
    .info-row label { display: block; color: #6b7280; font-size: 0.8rem; margin-bottom: 0.2rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-row div { font-size: 1rem; font-weight: 500; color: #111827; text-transform: capitalize; }
    .empty-state { color: #9ca3af; font-size: 0.9rem; padding: 1rem 0; }
    .address-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.75rem; background: #f9fafb; }
    .address-label { font-weight: 700; font-size: 0.875rem; color: #2563eb; margin-bottom: 0.25rem; text-transform: uppercase; }
    .address-text { font-size: 0.9rem; color: #374151; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-weight: 500; font-size: 0.875rem; margin-bottom: 0.35rem; color: #374151; }
    .form-group input { width: 100%; padding: 0.6rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; }
    .form-group input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .error-text { color: #ef4444; font-size: 0.8rem; margin-top: 0.2rem; }
    .server-error { color: #ef4444; font-size: 0.875rem; background: #fee2e2; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; }
    .btn-primary { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; }
    .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
  `]
})
export class CustomerProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private catalogService = inject(CatalogService);
  private fb = inject(FormBuilder);

  user$ = this.authService.currentUser$;
  addresses: any[] = [];
  isLoadingAddresses = true;
  isSaving = false;
  addError = '';

  addressForm = this.fb.group({
    label: ['', [Validators.required, Validators.minLength(2)]],
    address_line_1: ['', [Validators.required, Validators.minLength(5)]],
    address_line_2: [''],
    city: ['', [Validators.required, Validators.minLength(2)]],
    state: ['', [Validators.required, Validators.minLength(2)]],
    zip_code: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit() {
    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoadingAddresses = true;
    this.catalogService.getAddresses().subscribe({
      next: (list) => {
        this.addresses = list;
        this.isLoadingAddresses = false;
      },
      error: () => {
        this.addresses = [];
        this.isLoadingAddresses = false;
      }
    });
  }

  onAddAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.addError = '';

    const payload = {
      label: this.addressForm.value.label,
      address_line_1: this.addressForm.value.address_line_1,
      address_line_2: this.addressForm.value.address_line_2 || null,
      city: this.addressForm.value.city,
      state: this.addressForm.value.state,
      zip_code: this.addressForm.value.zip_code
    };

    this.catalogService.createAddress(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.addressForm.reset();
        this.loadAddresses(); // Refresh the list immediately after saving
      },
      error: (err) => {
        this.isSaving = false;
        const detail = err.error?.detail;
        this.addError = detail
          ? (Array.isArray(detail) ? detail.map((d: any) => d.msg).join(', ') : String(detail))
          : 'Failed to save address. Please try again.';
      }
    });
  }
}
