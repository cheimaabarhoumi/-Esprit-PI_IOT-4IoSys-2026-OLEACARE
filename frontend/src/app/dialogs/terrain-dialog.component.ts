import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-terrain-dialog',
  template: `
    <h2 mat-dialog-title>{{ (data?._id || data?.id) ? 'Modifier le Terrain' : 'Nouveau Terrain' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="terrainForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Terrain Name</mat-label>
          <input matInput formControlName="name" placeholder="North Field">
          <mat-error *ngIf="terrainForm.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Surface (hectares)</mat-label>
          <input matInput type="number" formControlName="surface_hectares" placeholder="5.5" step="0.1" min="0.1">
          <mat-error *ngIf="terrainForm.get('surface_hectares')?.hasError('required')">La surface est requise</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nombre d'arbres</mat-label>
          <input matInput type="number" formControlName="numberOfTrees" placeholder="100" min="1">
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Latitude</mat-label>
          <input matInput type="number" formControlName="latitude" placeholder="36.8065" step="0.0001">
          <mat-error *ngIf="terrainForm.get('latitude')?.hasError('required')">La latitude est requise</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Longitude</mat-label>
          <input matInput type="number" formControlName="longitude" placeholder="10.1815" step="0.0001">
          <mat-error *ngIf="terrainForm.get('longitude')?.hasError('required')">La longitude est requise</mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Variété d'olive</mat-label>
          <mat-select formControlName="variety">
            <mat-option value="Chemlali">Chemlali</mat-option>
            <mat-option value="Koroneiki">Koroneiki</mat-option>
            <mat-option value="Arbequina">Arbequina</mat-option>
            <mat-option value="Frantoio">Frantoio</mat-option>
            <mat-option value="Other">Autre</mat-option>
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!terrainForm.valid">
        {{ (data?._id || data?.id) ? 'Modifier' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-content {
      min-width: 450px;
    }
  `]
})
export class TerrainDialogComponent implements OnInit {
  terrainForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TerrainDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.terrainForm = this.fb.group({
      name: ['', Validators.required],
      surface_hectares: ['', [Validators.required, Validators.min(0.1)]],
      numberOfTrees: [''],
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      variety: ['Chemlali'],
    });
  }

  ngOnInit(): void {
    if (this.data?.id || this.data?._id) {
      this.terrainForm.patchValue({
        name: this.data.name,
        surface_hectares: this.data.surface_hectares,
        numberOfTrees: this.data.numberOfTrees,
        latitude: this.data.location?.latitude,
        longitude: this.data.location?.longitude,
        variety: this.data.variety || 'Chemlali',
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.terrainForm.valid) {
      const { latitude, longitude, ...rest } = this.terrainForm.value;
      const payload: any = {
        ...rest,
        location: { latitude, longitude }
      };
      if (!payload.numberOfTrees) delete payload.numberOfTrees;
      this.dialogRef.close(payload);
    }
  }
}
