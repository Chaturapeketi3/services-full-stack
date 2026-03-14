import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="hero">
      <nav class="navbar">
        <div class="logo">HouseMate</div>
        <div class="nav-links">
          <a routerLink="/login" class="btn-login">Log In</a>
          <a routerLink="/register" class="btn-signup">Sign Up</a>
        </div>
      </nav>
      
      <div class="hero-content">
        <h1>Reliable Home Services, On Demand.</h1>
        <p>Book trusted experts for cleaning, plumbing, shifting, and more instantly.</p>
        
        <div class="search-bar">
          <input type="text" placeholder="What do you need help with?">
          <button>Search Services</button>
        </div>
      </div>
    </header>

    <section class="features">
      <div class="feature-card">
        <div class="icon">✓</div>
        <h3>Verified Experts</h3>
        <p>All our professionals undergo strict KYC and background checks.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🛡️</div>
        <h3>Safe Payments</h3>
        <p>Secure double-charge-proof idempotent transactions.</p>
      </div>
      <div class="feature-card">
        <div class="icon">⚡</div>
        <h3>Instant Booking</h3>
        <p>Schedules that fit your busy life, confirmed in seconds.</p>
      </div>
    </section>
  `,
  styles: [`
    .hero { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; min-height: 80vh; padding: 0 2rem; display: flex; flex-direction: column; }
    .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; }
    .logo { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.05em; }
    .nav-links { display: flex; gap: 1rem; align-items: center;}
    .btn-login { color: white; text-decoration: none; font-weight: 500; }
    .btn-signup { background: white; color: #1e3a8a; padding: 0.6rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: background 0.2s; }
    .btn-signup:hover { background: #f3f4f6; }
    
    .hero-content { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 4rem; line-height: 1.1; margin-bottom: 1.5rem; font-weight: 800; }
    p { font-size: 1.25rem; color: #bfdbfe; margin-bottom: 2.5rem; max-width: 600px; }
    
    .search-bar { display: flex; width: 100%; max-width: 600px; background: white; padding: 0.5rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
    .search-bar input { flex: 1; border: none; padding: 1rem; font-size: 1.1rem; border-radius: 8px; outline: none; }
    .search-bar button { background: #10b981; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 600; font-size: 1.1rem; cursor: pointer; transition: background 0.2s;}
    .search-bar button:hover { background: #059669; }

    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 1200px; margin: -4rem auto 4rem auto; padding: 0 2rem; position: relative; z-index: 10; }
    .feature-card { background: white; padding: 2.5rem; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); text-align: center; }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; color: #3b82f6; }
    .feature-card h3 { color: #1e293b; margin-bottom: 0.5rem; font-size: 1.25rem; }
    .feature-card p { color: #64748b; font-size: 1rem; margin: 0; }
  `]
})
export class LandingPageComponent {
}
