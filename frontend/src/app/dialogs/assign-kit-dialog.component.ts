import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-assign-kit-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:8px;color:#86975e">link</mat-icon>
      Affecter le Kit <strong>{{ data.kit.kitId }}</strong>
    </h2>

    <mat-dialog-content>
      <form [formGroup]="assignForm">

        <!-- Sélection agriculteur -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Agriculteur</mat-label>
          <mat-select formControlName="farmerId">
            <mat-option value="">— Non assigné —</mat-option>
            <mat-option *ngFor="let u of farmers" [value]="u._id || u.id">
              <mat-icon style="font-size:16px;vertical-align:middle">agriculture</mat-icon>
              {{ u.firstName }} {{ u.lastName }} — {{ u.email }}
              <span *ngIf="u.farmName"> ({{ u.farmName }})</span>
            </mat-option>
          </mat-select>
          <mat-error>Veuillez sélectionner un agriculteur</mat-error>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="assignForm.invalid">
        <mat-icon>save</mat-icon>
        Affecter
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; display: block; }
    mat-dialog-content { min-width: 460px; padding-top: 8px !important; }
  `]
})
export class AssignKitDialogComponent implements OnInit {
  assignForm: FormGroup;
  farmers: any[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AssignKitDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { kit: any; users: any[]; terrains: any[] }
  ) {
    this.assignForm = this.fb.group({
      farmerId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.farmers = (this.data.users || []).filter(u => u.role === 'farmer');

    // Pré-remplir si déjà assigné
    if (this.data.kit.assignedTo) {
      const farmerId = this.data.kit.assignedTo._id || this.data.kit.assignedTo;
      this.assignForm.patchValue({ farmerId });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.assignForm.valid) {
      const raw = this.assignForm.getRawValue();
      this.dialogRef.close({
        farmerId: raw.farmerId || null,
        terrainId: null
      });
    }
  }
}
