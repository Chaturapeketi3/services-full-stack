import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch(error.status) {
        case 401:
          authService.logout();
          router.navigate(['/login']);
          break;
        case 403:
          alert('Insufficient permissions to access this resource.');
          router.navigate(['/']);
          break;
        case 404:
          alert('Resource not found.');
          break;
        case 500:
          alert('Internal Server Error. Please try again later.');
          break;
        default:
          break;
      }
      return throwError(() => error);
    })
  );
};
