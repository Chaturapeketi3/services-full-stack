import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CatalogService } from './booking.service';
import { Category, Service } from '../../shared/models';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <header class="page-header">
        <h1>Browse Services</h1>
        <p>Select a category to view available experts</p>
      </header>

      <div class="content-grid">
        <!-- Categories Sidebar -->
        <aside class="categories">
          <h3>Categories</h3>
          <ul *ngIf="categories.length > 0; else noCats">
            <li 
              *ngFor="let cat of categories" 
              [class.active]="selectedCategoryId === cat.id"
              (click)="selectCategory(cat.id)">
              {{ cat.name }}
            </li>
          </ul>
          <ng-template #noCats>
            <p class="text-gray-500 text-sm">Loading categories...</p>
          </ng-template>
        </aside>

        <!-- Services List -->
        <main class="services">
          <div class="service-cards" *ngIf="services.length > 0; else noServices">
            <div class="service-card" *ngFor="let service of services">
              <div class="card-body">
                <h3>{{ service.name }}</h3>
                <p>{{ service.description }}</p>
                <div class="price-row">
                  <span class="price">From $\{{ service.base_price }}</span>
                  <span class="duration">{{ service.duration_minutes }} mins</span>
                </div>
              </div>
              <div class="card-footer">
                <button class="btn-primary full-width" (click)="bookService(service.id)">Book Now</button>
              </div>
            </div>
          </div>
          <ng-template #noServices>
            <div class="empty-state">
               <p>No services found in this category.</p>
            </div>
          </ng-template>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 2rem; text-align: center; }
    .page-header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .page-header p { color: #6b7280; font-size: 1.1rem; }
    
    .content-grid { display: grid; grid-template-columns: 250px 1fr; gap: 2rem; }
    
    .categories { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); align-self: start;}
    .categories h3 { margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
    .categories ul { list-style: none; padding: 0; margin: 0; }
    .categories li { padding: 0.75rem 1rem; cursor: pointer; border-radius: 8px; margin-bottom: 0.25rem; font-weight: 500; color: #4b5563; transition: background 0.2s;}
    .categories li:hover { background: #f3f4f6; }
    .categories li.active { background: #eff6ff; color: #2563eb; }
    
    .service-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
    .service-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; overflow: hidden; }
    .card-body { padding: 1.5rem; flex: 1; border-bottom: 1px solid #e5e7eb; }
    .card-body h3 { margin-top: 0; margin-bottom: 0.5rem; font-size: 1.25rem; }
    .card-body p { color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; line-height: 1.4; }
    
    .price-row { display: flex; justify-content: space-between; align-items: center; }
    .price { font-weight: 700; font-size: 1.25rem; color: #111827; }
    .duration { background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; color: #4b5563; font-weight: 600;}
    
    .card-footer { padding: 1rem; background: #f9fafb; }
    .full-width { width: 100%; display: block; }

    .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b; }
  `]
})
export class ServiceListComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);

  categories: Category[] = [];
  services: Service[] = [];
  selectedCategoryId: string | null = null;

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.catalogService.getCategories().subscribe(res => {
      this.categories = res.items;
      if (this.categories.length > 0) {
        this.selectCategory(this.categories[0].id);
      }
    });
  }

  selectCategory(categoryId: string) {
    this.selectedCategoryId = categoryId;
    this.catalogService.getServices(categoryId).subscribe(res => {
      this.services = res.items;
    });
  }

  bookService(serviceId: string) {
    this.router.navigate(['/customer/booking-flow', serviceId]);
  }
}
