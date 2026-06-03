import { Component, ChangeDetectorRef } from '@angular/core';
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
  verificationCodeSent = false;
  codeValidated = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private registerService: RegisterService,
    private cdr: ChangeDetectorRef
  ) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  sendVerificationCode() {
    const emailControl = this.registrationForm.get('email');
    emailControl?.markAsTouched();
    
    if (emailControl?.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      this.registerService.sendVerificationCode(emailControl.value).subscribe({
        next: (response) => {
          console.log('Verification code sent:', response);
          this.verificationCodeSent = true;
          this.step = 2;
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Failed to send verification code:', error);
          this.errorMessage = error.error?.message || 'Erro ao enviar código de verificação. Tente novamente.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  validateCode() {
    const codeControl = this.registrationForm.get('verificationCode');
    codeControl?.markAsTouched();
    
    if (codeControl?.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const email = this.registrationForm.get('email')?.value;
      const code = codeControl.value;
      
      this.registerService.validateVerificationCode(email, code).subscribe({
        next: (response) => {
          console.log('Code validated:', response);
          this.codeValidated = true;
          this.step = 3;
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Invalid verification code:', error);
          this.errorMessage = error.error?.message || 'Código de verificação inválido.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onSubmit() {
    const step3Fields = ['name', 'password', 'confirmPassword'];
    let step3Valid = true;
    
    step3Fields.forEach(field => {
      const control = this.registrationForm.get(field);
      control?.markAsTouched();
      if (control?.invalid) step3Valid = false;
    });

    if (step3Valid && !this.registrationForm.hasError('mismatch')) {
      this.isSubmitting = true;
      this.errorMessage = '';
     
      let request = {
        email: this.registrationForm.get('email')?.value,
        name: this.registrationForm.get('name')?.value,
        password: this.registrationForm.get('password')?.value,
        verificationCode: this.registrationForm.get('verificationCode')?.value
      };

      this.registerService.register(request).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.successMessage = true;
          this.isSubmitting = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.errorMessage = error.error?.message || 'Erro ao realizar o cadastro. Tente novamente mais tarde.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  goToStep1() {
    this.step = 1;
  }

  goToStep2() {
    this.step = 2;
  }

  resendCode() {
    this.sendVerificationCode();
  }
}
