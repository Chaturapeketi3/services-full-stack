import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { CustomerDashboardComponent } from './features/customer/dashboard.component';
import { CustomerBookingsComponent } from './features/customer/customer-bookings.component';
import { CustomerProfileComponent } from './features/customer/customer-profile.component';
import { ExpertDashboardComponent } from './features/expert/dashboard.component';
import { LandingPageComponent } from './features/public/landing.component';
import { ServiceListComponent } from './features/booking/service-list.component';
import { BookingFlowComponent } from './features/booking/booking-flow.component';
import { BookingDetailsComponent } from './features/booking/booking-details.component';
import { ModifyBookingComponent } from './features/booking/modify-booking.component';
import { RateBookingComponent } from './features/booking/rate-booking.component';
import { PaymentModalComponent } from './features/payment/payment-modal.component';
import { ExpertJobsComponent } from './features/expert/expert-jobs.component';
import { ExpertEarningsComponent } from './features/expert/expert-earnings.component';
import { ExpertScheduleComponent } from './features/expert/expert-schedule.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'customer/dashboard', 
    component: CustomerDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'customer/bookings', 
    component: CustomerBookingsComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'customer/profile', 
    component: CustomerProfileComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'expert/dashboard', 
    component: ExpertDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_EXPERT' }
  },
  { 
    path: 'expert/jobs', 
    component: ExpertJobsComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_EXPERT' }
  },
  { 
    path: 'expert/earnings', 
    component: ExpertEarningsComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_EXPERT' }
  },
  { 
    path: 'expert/schedule', 
    component: ExpertScheduleComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_EXPERT' }
  },
  { 
    path: 'customer/services', 
    component: ServiceListComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'customer/booking-flow/:serviceId', 
    component: BookingFlowComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'customer/payment/:bookingId', 
    component: PaymentModalComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'customer/booking-details/:bookingId', 
    component: BookingDetailsComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'customer/modify-booking/:bookingId', 
    component: ModifyBookingComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { 
    path: 'customer/rate-booking/:bookingId', 
    component: RateBookingComponent,
    canActivate: [authGuard],
    data: { role: 'ROLE_CUSTOMER' }
  },
  { path: '**', redirectTo: '' }
];
