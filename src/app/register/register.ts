import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegisterService } from '../services/register.service';

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
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService
  ) {
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
      this.isSubmitting = true;
      this.errorMessage = '';
     
      let request = {
        name: this.registrationForm.get('name')?.value,
        email: this.registrationForm.get('email')?.value,
        password: this.registrationForm.get('password')?.value
      };

      this.registerService.register(request).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.successMessage = true;
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.errorMessage = 'Erro ao realizar o cadastro. Tente novamente mais tarde.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  goToStep1() {
    this.step = 1;
  }
}
