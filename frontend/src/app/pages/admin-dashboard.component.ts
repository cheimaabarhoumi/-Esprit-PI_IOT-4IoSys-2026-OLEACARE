import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  kitStats: any = null;
  totalUsers = 0;
  loading = true;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    Promise.all([
      this.apiService.getKitStats().toPromise(),
      this.apiService.getUsers(0, 1).toPromise()
    ]).then(([statsRes, usersRes]) => {
      if (statsRes?.success && statsRes.data) this.kitStats = statsRes.data;
      if (usersRes?.success) this.totalUsers = usersRes.pagination?.total || usersRes.data?.length || 0;
      this.loading = false;
    }).catch(() => {
      this.error = 'Impossible de charger les statistiques';
      this.loading = false;
    });
  }

  getTotalKitsByStatus(): number {
    if (!this.kitStats?.byStatus) return 0;
    return this.kitStats.byStatus.reduce((sum: number, i: any) => sum + i.count, 0);
  }

  getActiveKitsCount(): number {
    return this.kitStats?.byStatus?.find((s: any) => s._id === 'active')?.count || 0;
  }

  getInStockKitsCount(): number {
    return this.kitStats?.byStatus?.find((s: any) => s._id === 'in_stock')?.count || 0;
  }

  getAssignedKitsCount(): number {
    return this.kitStats?.byStatus?.find((s: any) => s._id === 'assigned')?.count || 0;
  }

  getOfflineKitsCount(): number {
    return this.kitStats?.byStatus?.find((s: any) => s._id === 'offline')?.count ?? 0;
  }
}
