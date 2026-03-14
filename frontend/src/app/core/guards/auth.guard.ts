import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const requiredRole = route.data?.['role'];
    if (requiredRole && authService.getRole() !== requiredRole) {
       return router.createUrlTree(['/']);
    }
    return true;
  }
  
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
};
