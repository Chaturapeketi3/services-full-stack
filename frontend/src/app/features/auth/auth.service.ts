import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, RoleEnum } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkToken();
  }

  private checkToken() {
    // Note: Local storage implementation. 
    // Wait for actual '/users/me' endpoint to fully hydrate profile.
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role') as RoleEnum;
    if (token && userRole) {
       this.currentUserSubject.next({ role: userRole } as User);
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('role', res.user.role);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): RoleEnum | null {
    return localStorage.getItem('role') as RoleEnum | null;
  }
}
