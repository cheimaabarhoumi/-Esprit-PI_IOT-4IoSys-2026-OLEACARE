import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-kit-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:8px;color:#86975e">sensors</mat-icon>
      {{ data?.kitId ? 'Modifier le Kit' : 'Enregistrer un Nouveau Kit' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="kitForm">

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Kit ID / Numéro de série</mat-label>
          <mat-icon matPrefix>qr_code</mat-icon>
          <input matInput formControlName="kitId" placeholder="KIT-001-2024">
          <mat-error *ngIf="kitForm.get('kitId')?.hasError('required')">Kit ID obligatoire</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Modèle</mat-label>
          <mat-icon matPrefix>device_hub</mat-icon>
          <input matInput formControlName="model" placeholder="OleaCare IoT Kit v2">
          <mat-error *ngIf="kitForm.get('model')?.hasError('required')">Modèle obligatoire</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Statut</mat-label>
          <mat-icon matPrefix>info</mat-icon>
          <mat-select formControlName="status">
            <mat-option value="in_stock">En stock</mat-option>
            <mat-option value="active">Actif</mat-option>
            <mat-option value="offline">Hors ligne</mat-option>
            <mat-option value="maintenance">Maintenance</mat-option>
          </mat-select>
          <mat-error *ngIf="kitForm.get('status')?.hasError('required')">Statut obligatoire</mat-error>
        </mat-form-field>

      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!kitForm.valid">
        <mat-icon>save</mat-icon>
        {{ data?.kitId ? 'Mettre à jour' : 'Enregistrer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 12px; display: block; }
    mat-dialog-content { min-width: 450px; }
  `]
})
export class KitDialogComponent implements OnInit {
  kitForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<KitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.kitForm = this.fb.group({
      kitId: ['', Validators.required],
      model: ['', Validators.required],
      status: ['in_stock', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.data?.kitId) {
      this.kitForm.patchValue({
        kitId: this.data.kitId,
        model: this.data.model,
        status: this.data.status,
      });
      this.kitForm.get('kitId')?.disable();
    }
  }

  onCancel(): void { this.dialogRef.close(); }

  onSubmit(): void {
    if (this.kitForm.valid) {
      this.dialogRef.close(this.kitForm.getRawValue());
    }
  }
}

