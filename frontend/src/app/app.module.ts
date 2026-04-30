import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

// Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Routing
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// ngx-translate  
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class CustomLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`assets/i18n/${lang}.json`);
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomLoader(http);
}

// Guards and Interceptors
import { AuthInterceptor } from './guards/auth.interceptor';

// Pages
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

// Components
import { ChatbotComponent } from './components/chatbot.component';
import { LanguageSelectorComponent } from './components/language-selector.component';
import { MLResultsDisplayComponent } from './components/ml-results-display.component';

// Dialogs
import { UserDialogComponent } from './dialogs/user-dialog.component';
import { KitDialogComponent } from './dialogs/kit-dialog.component';
import { AssignKitDialogComponent } from './dialogs/assign-kit-dialog.component';
import { TerrainDialogComponent } from './dialogs/terrain-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import { ProfileDialogComponent } from './dialogs/profile-dialog.component';
// Language selector removed per user request

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminKitsComponent,
    AdminAssignComponent,
    FarmerOverviewComponent,
    FarmerDashboardComponent,
    TerrainDetailsComponent,
    PredictionsComponent,
    AlertsComponent,
    UserDialogComponent,
    KitDialogComponent,
    AssignKitDialogComponent,
    TerrainDialogComponent,
    ConfirmDialogComponent,
    ProfileDialogComponent,
    ChatbotComponent,
    LanguageSelectorComponent,
    MLResultsDisplayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgChartsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatGridListModule,
    MatMenuModule,
    MatBadgeModule,
    MatSelectModule,
    MatSidenavModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDividerModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
