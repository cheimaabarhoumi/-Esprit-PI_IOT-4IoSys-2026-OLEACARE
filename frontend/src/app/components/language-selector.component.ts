import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  template: `
    <mat-form-field appearance="outline" class="lang-select">
      <mat-select [value]="currentLang" (selectionChange)="changeLang($event.value)">
        <mat-option *ngFor="let l of languages" [value]="l.code">{{ l.label }}</mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    .lang-select { width: 120px; }
    @media (max-width: 600px) { .lang-select { width: 90px; } }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' }
  ];
  currentLang = 'en';

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('app_language');
    this.currentLang = saved || this.translate.getDefaultLang() || 'en';
    this.translate.use(this.currentLang);
  }

  changeLang(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
    localStorage.setItem('app_language', lang);
  }
}
