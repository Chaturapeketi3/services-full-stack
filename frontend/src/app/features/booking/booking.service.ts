import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, PaginatedResponse, Service, Category } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);

  getCategories(): Observable<PaginatedResponse<Category>> {
    return this.http.get<PaginatedResponse<Category>>(`${environment.apiUrl}/categories`);
  }

  getServices(categoryId?: string, search?: string): Observable<PaginatedResponse<Service>> {
    let params = new HttpParams();
    if (categoryId) params = params.set('category_id', categoryId);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResponse<Service>>(`${environment.apiUrl}/services`, { params });
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${environment.apiUrl}/services/${id}`);
  }

  getAvailableExperts(serviceId?: string): Observable<PaginatedResponse<any>> {
    let params = new HttpParams();
    if (serviceId) params = params.set('service_id', serviceId);
    return this.http.get<PaginatedResponse<any>>(`${environment.apiUrl}/experts`, { params });
  }

  getAddresses(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/addresses`);
  }

  createAddress(address: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/addresses`, address);
  }
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private http = inject(HttpClient);

  createBooking(bookingData: any): Observable<Booking> {
    return this.http.post<Booking>(`${environment.apiUrl}/bookings`, bookingData);
  }

  getMyBookings(page: number = 1, size: number = 20): Observable<PaginatedResponse<Booking>> {
    return this.http.get<PaginatedResponse<Booking>>(`${environment.apiUrl}/bookings`, {
      params: new HttpParams().set('page', page).set('size', size)
    });
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${environment.apiUrl}/bookings/${id}`);
  }

  updateBooking(id: string, data: any): Observable<Booking> {
    return this.http.put<Booking>(`${environment.apiUrl}/bookings/${id}`, data);
  }
  
  cancelBooking(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/bookings/${id}`);
  }
}
