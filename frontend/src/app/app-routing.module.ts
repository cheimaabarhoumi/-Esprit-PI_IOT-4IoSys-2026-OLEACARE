import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { AdminUsersComponent } from './pages/admin-users.component';
import { AdminKitsComponent } from './pages/admin-kits.component';
import { AdminAssignComponent } from './pages/admin-assign.component';
import { FarmerDashboardComponent } from './pages/farmer-dashboard.component';
import { FarmerOverviewComponent } from './pages/farmer-overview.component';
import { TerrainDetailsComponent } from './pages/terrain-details.component';
import { PredictionsComponent } from './pages/predictions.component';
import { AlertsComponent } from './pages/alerts.component';
import { AuthGuard, AdminGuard, FarmerGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // Admin routes
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/kits', component: AdminKitsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'admin/assign', component: AdminAssignComponent, canActivate: [AuthGuard, AdminGuard] },

  // Farmer routes
  { path: 'farmer', component: FarmerOverviewComponent, canActivate: [AuthGuard, FarmerGuard] },
  { path: 'farmer/terrains', component: FarmerDashboardComponent, canActivate: [AuthGuard, FarmerGuard] },
  { path: 'farmer/terrain/:id', component: TerrainDetailsComponent, canActivate: [AuthGuard, FarmerGuard] },
  { path: 'farmer/predictions/:id', component: PredictionsComponent, canActivate: [AuthGuard, FarmerGuard] },
  { path: 'farmer/alerts', component: AlertsComponent, canActivate: [AuthGuard, FarmerGuard] },

  { path: '', redirectTo: '/farmer', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

