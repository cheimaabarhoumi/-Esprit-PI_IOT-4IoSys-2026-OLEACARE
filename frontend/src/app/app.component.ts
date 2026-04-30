import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ProfileDialogComponent } from './dialogs/profile-dialog.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  title = 'OleaCare';
  currentUser: any = null;
  isMobile = false;
  isLoginPage = false;
  currentRoute: string = '';

  menuItems: any[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/farmer', exact: true, highlight: true },
    { label: 'My Fields', icon: 'landscape', route: '/farmer/terrains' },
    { label: 'Alerts', icon: 'notifications_active', route: '/farmer/alerts', highlight: true },
  ];

  adminMenuItems: any[] = [
    { label: 'Overview', icon: 'analytics', route: '/admin', exact: true, highlight: true },
    { label: 'Users', icon: 'people', route: '/admin/users' },
    { label: 'IoT Kits', icon: 'router', route: '/admin/kits' },
    { label: 'Assignments', icon: 'link', route: '/admin/assign' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
    ,
    private translate: TranslateService
  ) {
    this.isMobile = window.innerWidth < 768;
  }

  @HostListener('window:resize')
  onResize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    if (wasMobile && !this.isMobile && this.sidenav) {
      this.sidenav.open();
    }
    if (!wasMobile && this.isMobile && this.sidenav) {
      this.sidenav.close();
    }
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.isLoginPage = this.currentRoute === '/login' || this.currentRoute.startsWith('/login');
      this.currentUser = this.authService.isLoggedIn() ? this.authService.getCurrentUser() : null;
      // Fermer automatiquement le sidenav sur mobile après chaque navigation
      if (this.isMobile && this.sidenav) {
        this.sidenav.close();
      }
    });

    // Initialisation immédiate
    this.currentRoute = this.router.url;
    this.isLoginPage = this.router.url === '/login' || this.router.url.startsWith('/login');
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.currentUser = this.authService.getCurrentUser();
    }

    // Force English interface and ignore any saved language
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  getMenuItems(): any[] {
    if (this.currentUser?.role === 'admin') {
      return this.adminMenuItems;
    }
    return this.menuItems;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openProfileDialog(): void {
    if (!this.currentUser) return;

    this.dialog.open(ProfileDialogComponent, {
      width: '550px',
      maxWidth: '90vw',
      data: {
        user: this.currentUser,
        isAdmin: this.currentUser.role === 'admin'
      },
      panelClass: 'profile-dialog-panel'
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  isMenuItemHighlight(item: any): boolean {
    return item.highlight && (this.currentRoute === item.route || this.currentRoute.startsWith(item.route));
  }
}

