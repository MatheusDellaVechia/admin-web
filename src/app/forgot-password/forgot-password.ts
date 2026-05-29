import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPasswordComponent implements OnDestroy {
  step = 1;
  forgotForm: FormGroup;
  timerSeconds = 60;
  canResend = false;
  timerSubscription?: Subscription;
  successMessage = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  sendCode() {
    const emailControl = this.forgotForm.get('email');
    emailControl?.markAsTouched();
    
    if (emailControl?.valid) {
      console.log('Sending code to:', emailControl.value);
      this.step = 2;
      this.startTimer();
    }
  }

  startTimer() {
    this.canResend = false;
    this.timerSeconds = 60;
    this.timerSubscription?.unsubscribe();
    
    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.timerSeconds > 0))
      .subscribe({
        next: () => this.timerSeconds--,
        complete: () => this.canResend = true
      });
  }

  resendCode() {
    if (this.canResend) {
      console.log('Resending code...');
      this.startTimer();
    }
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      console.log('Password reset submitted:', this.forgotForm.value);
      this.successMessage = true;
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }

  ngOnDestroy() {
    this.timerSubscription?.unsubscribe();
  }
}
