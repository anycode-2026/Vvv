import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <!-- Matrix/Cyber Background Effect -->
      <div class="absolute inset-0 z-0">
          <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse"></div>
          <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 1.5s"></div>
          <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <div class="bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/5 w-full max-w-sm relative z-10 overflow-hidden group">
        
        <!-- Header -->
        <div class="text-center mb-10 relative">
          <div class="w-24 h-24 bg-slate-800 rounded-full mx-auto flex items-center justify-center shadow-lg border border-emerald-500/30 mb-6 group-hover:border-emerald-500 transition-colors duration-500">
            <svg class="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 class="text-3xl font-black text-white tracking-tight uppercase">Admin<span class="text-emerald-500">Panel</span></h2>
          <p class="text-slate-400 text-xs font-bold tracking-[0.2em] mt-2 uppercase">Restricted Access 400% Control</p>
        </div>

        <form (submit)="login($event)" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest pl-1">Administrator ID</label>
            <div class="relative group/input">
                <input type="text" [(ngModel)]="username" name="username" class="w-full bg-slate-950 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all pl-12 placeholder:text-slate-700 font-bold tracking-wide" placeholder="Enter ID">
                <svg class="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/input:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest pl-1">Secure Passkey</label>
            <div class="relative group/input">
                <input type="password" [(ngModel)]="password" name="password" class="w-full bg-slate-950 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all pl-12 placeholder:text-slate-700 font-bold tracking-wide" placeholder="••••••••">
                <svg class="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/input:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
          </div>

          <button type="submit" class="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:to-emerald-400 text-black font-black py-4 rounded-xl shadow-lg shadow-emerald-900/50 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            Access System
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-white/5 text-center">
            <button (click)="store.setView('HOME')" class="text-xs font-bold text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-wider">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Return to Shop
            </button>
        </div>
      </div>
    </section>
  `
})
export class AdminLoginComponent {
  store = inject(StoreService);
  username = '';
  password = '';

  login(event: Event) {
    event.preventDefault(); 
    
    const inputUser = this.username.trim();
    const inputPass = this.password.trim();

    if (
        (inputUser === 'admin' && inputPass === '123456') || 
        (inputUser === 'xeno.mart.com@gmail.com' && inputPass === 'Skaypay@121')
    ) {
      this.store.setView('ADMIN_DASHBOARD');
    } else {
      alert('Access Denied: Invalid Credentials');
    }
  }
}