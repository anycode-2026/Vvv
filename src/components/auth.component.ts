import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="min-h-screen bg-emerald-50 flex items-center justify-center py-20 px-4">
      <div class="bg-emerald-100 p-8 rounded-3xl shadow-xl w-full max-w-md border border-emerald-200">
        
        <!-- Tabs (Only show for Login/Register) -->
        @if(mode() !== 'FORGOT') {
            <div class="flex mb-8 border-b border-emerald-200">
            <button (click)="mode.set('LOGIN')" class="flex-1 pb-4 text-center font-bold transition-colors" [class.text-emerald-600]="mode() === 'LOGIN'" [class.border-b-2]="mode() === 'LOGIN'" [class.border-emerald-600]="mode() === 'LOGIN'" [class.text-emerald-400]="mode() !== 'LOGIN'">Login</button>
            <button (click)="mode.set('REGISTER')" class="flex-1 pb-4 text-center font-bold transition-colors" [class.text-emerald-600]="mode() === 'REGISTER'" [class.border-b-2]="mode() === 'REGISTER'" [class.border-emerald-600]="mode() === 'REGISTER'" [class.text-emerald-400]="mode() !== 'REGISTER'">Register</button>
            </div>
        }

        <!-- LOGIN FORM -->
        @if (mode() === 'LOGIN') {
          <form (ngSubmit)="onLogin()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-emerald-900 mb-1">Email or Phone</label>
              <input type="text" [(ngModel)]="email" name="email" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-emerald-900" placeholder="Enter your email" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-emerald-900 mb-1">Password</label>
              <input type="password" [(ngModel)]="password" name="password" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-emerald-900" placeholder="Enter password" required>
            </div>
            
            <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              Log In
            </button>
            
            <p class="text-center text-sm text-emerald-700 mt-4">
               <button type="button" (click)="mode.set('FORGOT')" class="text-emerald-600 font-bold hover:underline">Forgot Password?</button>
            </p>
          </form>
        }

        <!-- REGISTER FORM (Respects Admin Config) -->
        @if (mode() === 'REGISTER') {
          <form (ngSubmit)="onRegister()" class="space-y-4">
            <div class="grid gap-4" [ngClass]="{'grid-cols-2': store.adminSettings().authConfig.showLastName, 'grid-cols-1': !store.adminSettings().authConfig.showLastName}">
                @if(store.adminSettings().authConfig.showFirstName) {
                    <div>
                        <label class="block text-xs font-bold text-emerald-900 mb-1">First Name</label>
                        <input type="text" [(ngModel)]="firstName" name="firstName" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 text-emerald-900" required>
                    </div>
                }
                @if(store.adminSettings().authConfig.showLastName) {
                    <div>
                        <label class="block text-xs font-bold text-emerald-900 mb-1">Last Name</label>
                        <input type="text" [(ngModel)]="lastName" name="lastName" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 text-emerald-900" required>
                    </div>
                }
            </div>

            @if(store.adminSettings().authConfig.requireEmail) {
                <div>
                  <label class="block text-xs font-bold text-emerald-900 mb-1">Email Address</label>
                  <input type="email" [(ngModel)]="email" name="email" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 text-emerald-900" required>
                </div>
            }

            @if(store.adminSettings().authConfig.requirePhone) {
                <div>
                  <label class="block text-xs font-bold text-emerald-900 mb-1">Phone Number</label>
                  <input type="tel" [(ngModel)]="phone" name="phone" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 text-emerald-900" required>
                </div>
            }

            <div>
              <label class="block text-xs font-bold text-emerald-900 mb-1">Password (Min 6 chars)</label>
              <input type="password" [(ngModel)]="password" name="password" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 text-emerald-900" required>
            </div>

            <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
              Create Account
            </button>
          </form>
        }

        <!-- FORGOT PASSWORD FORM -->
        @if (mode() === 'FORGOT') {
           <div class="space-y-6 animate-fadeIn">
               <div class="text-center">
                   <h3 class="text-xl font-bold text-emerald-900 mb-2">Reset Password</h3>
                   <p class="text-sm text-emerald-700">Enter your registered email address to receive a password reset link.</p>
               </div>

               <form (ngSubmit)="onForgot()" class="space-y-4">
                   <div>
                      <label class="block text-sm font-medium text-emerald-900 mb-1">Email Address</label>
                      <input type="email" [(ngModel)]="forgotEmail" name="forgotEmail" class="w-full px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-emerald-900" placeholder="e.g. user@example.com" required>
                   </div>
                   
                   <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                      Send Reset Link
                   </button>
               </form>

               <div class="text-center">
                   <button (click)="mode.set('LOGIN')" class="text-emerald-600 font-bold hover:underline text-sm">Back to Login</button>
               </div>
           </div>
        }

      </div>
    </section>
  `,
  styles: [`
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
    }
  `]
})
export class AuthComponent {
  store = inject(StoreService);
  mode = signal<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Form Data
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  phone = '';
  
  forgotEmail = '';

  onLogin() {
      // Secret Admin Login Check - Trim inputs to ensure robustness
      if(this.email.trim() === 'xeno.mart.com@gmail.com' && this.password.trim() === 'Skaypay@121') {
          this.store.setView('ADMIN_DASHBOARD');
          return;
      }

      const users = this.store.users();
      const user = users.find(u => u.email === this.email);
      
      if(user && user.isBanned) {
          alert('Device Ban: This account has been suspended by the administrator.');
          return;
      }

      if (this.store.login(this.email, this.password)) {
          // Success handled in store (redirects)
      } else {
          alert('Invalid email or password. Please try again or register.');
      }
  }

  onRegister() {
      // 1. Validate Password Length
      if (this.password.length < 6) {
          alert('Password must be at least 6 characters long.');
          return;
      }

      // 2. Conditional Required Checks based on Admin Settings
      const config = this.store.adminSettings().authConfig;
      
      if (config.showFirstName && !this.firstName) { alert('First Name is required.'); return; }
      if (config.showLastName && !this.lastName) { alert('Last Name is required.'); return; }
      if (config.requireEmail && !this.email) { alert('Email is required.'); return; }
      if (config.requirePhone && !this.phone) { alert('Phone number is required.'); return; }

      this.store.register({
          email: this.email,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phone,
          addresses: []
      });
      
      alert('Registration successful! You are now logged in.');
  }

  onForgot() {
      if(!this.forgotEmail.includes('@')) {
          alert('Please enter a valid email address.');
          return;
      }
      // Mock Reset Logic
      alert(`If an account exists for ${this.forgotEmail}, a password reset link has been sent.`);
      this.mode.set('LOGIN');
      this.forgotEmail = '';
  }
}