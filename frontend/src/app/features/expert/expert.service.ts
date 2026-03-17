import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ExpertDashboardSummary {
  total_earnings: number;
  completed_jobs_count: number;
  pending_requests_count: number;
  is_available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExpertService {
  private http = inject(HttpClient);

  getDashboardSummary(): Observable<ExpertDashboardSummary> {
    return this.http.get<ExpertDashboardSummary>(`${environment.apiUrl}/experts/dashboard`);
  }

  toggleAvailability(isAvailable: boolean): Observable<any> {
    const params = new HttpParams().set('is_available', isAvailable.toString());
    return this.http.put(`${environment.apiUrl}/experts/availability`, {}, { params });
  }

  getJobs(status?: string, page: number = 1, size: number = 20): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get(`${environment.apiUrl}/experts/jobs`, { params });
  }

  acceptJob(jobId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/experts/jobs/${jobId}/accept`, {});
  }

  rejectJob(jobId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/experts/jobs/${jobId}/reject`, {});
  }

  getEarnings(page: number = 1, size: number = 20): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get(`${environment.apiUrl}/experts/earnings`, { params });
  }

  updateBookingStatus(bookingId: string, status: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/bookings/${bookingId}`, { status });
  }
}
