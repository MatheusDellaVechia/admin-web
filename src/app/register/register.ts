import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  step = 1;
  registrationForm: FormGroup;
  successMessage = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registrationForm = this.fb.group({
      // Step 1
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required],
      // Step 2
      verificationCode: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  nextStep() {
    const step1Fields = ['name', 'email', 'birthDate'];
    let step1Valid = true;
    
    step1Fields.forEach(field => {
      const control = this.registrationForm.get(field);
      control?.markAsTouched();
      if (control?.invalid) step1Valid = false;
    });

    if (step1Valid) {
      this.step = 2;
    }
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log('Registration submitted:', this.registrationForm.value);
      this.successMessage = true;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  goToStep1() {
    this.step = 1;
  }
}
