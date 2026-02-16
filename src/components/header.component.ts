import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="fixed top-0 left-0 w-full z-50 bg-emerald-50/90 backdrop-blur-md shadow-sm transition-all duration-300 border-b border-emerald-100">
      <div class="container mx-auto px-4 py-2 flex items-center justify-between h-16">
        <!-- Logo Section -->
        <div class="flex items-center cursor-pointer flex-shrink-0 mr-6 gap-2" (click)="store.setView('HOME'); store.setSearchQuery('')">
          
          <!-- BRAND LOGO CONTAINER (Square System with White Barrier) -->
          <div class="relative w-10 h-10 flex-shrink-0">
             @if(store.adminSettings().appLogo) {
                <!-- User Uploaded Logo -->
                <img [src]="store.adminSettings().appLogo" class="w-full h-full object-contain rounded-lg border-2 border-white shadow-sm">
             } @else {
                <!-- CUSTOM PROFESSIONAL "L" LOGO with White Barrier -->
                <div class="w-full h-full rounded-lg bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600 flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-[2.5px] border-white ring-1 ring-emerald-100 relative overflow-hidden group">
                    
                    <!-- Internal Shine/Gloss -->
                    <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50"></div>
                    
                    <!-- The "L" Monogram (White Color & Moved Up) -->
                    <span class="text-2xl font-serif font-black italic relative z-10 leading-none mb-1.5 text-white" 
                          style="font-family: 'Playfair Display', serif; 
                                 filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5));">
                        L
                    </span>
                    
                    <!-- Decorative Golden Dot -->
                    <div class="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>
                </div>
             }
          </div>

          <!-- Text (Closer to Logo) -->
          <div class="flex flex-col justify-center">
              <h1 class="text-xl font-bold tracking-tight text-emerald-950 font-serif leading-none drop-shadow-sm">{{ store.adminSettings().appName }}</h1>
              <p class="text-[8px] text-emerald-600 tracking-[0.2em] uppercase font-bold mt-0.5">Premium Store</p>
          </div>
        </div>

        <!-- Desktop Search Bar -->
        <div class="hidden md:flex flex-1 max-w-xl relative mx-auto">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <input 
                type="text" 
                [ngModel]="store.searchQuery()"
                (ngModelChange)="store.setSearchQuery($event)"
                class="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-emerald-900 placeholder:text-emerald-300 shadow-sm" 
                placeholder="Search for products, brands and more..."
            >
        </div>

        <div class="flex items-center gap-3 flex-shrink-0 ml-4">
            
            <!-- Mobile Search Toggle -->
            <button (click)="toggleSearch()" class="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-100 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

            <!-- Cart Button -->
            <button (click)="store.setView('CART')" class="relative w-10 h-10 rounded-full text-emerald-600 hover:bg-emerald-100 transition-colors bg-white border border-emerald-100 shadow-sm group flex items-center justify-center">
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                @if(store.cartCount() > 0) {
                    <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                        {{ store.cartCount() }}
                    </span>
                }
            </button>

            <!-- Desktop Account (Simpler, no initial circle) -->
            <button (click)="handleProfileClick()" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors border border-transparent hover:border-emerald-200">
                <div class="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs overflow-hidden">
                    <img *ngIf="store.currentUser()?.avatar" [src]="store.currentUser()?.avatar" class="w-full h-full object-cover">
                    <!-- If no avatar, show generic user icon instead of initial -->
                    <svg *ngIf="!store.currentUser()?.avatar" class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div class="text-left hidden lg:block">
                    <div class="text-[10px] text-emerald-500 font-bold uppercase">Account</div>
                    <div class="text-xs font-bold text-emerald-900 leading-none">{{ store.currentUser() ? 'Profile' : 'Login' }}</div>
                </div>
            </button>
        </div>
      </div>

      <!-- Mobile Search Input (Expandable) -->
      <div *ngIf="isSearchOpen()" class="md:hidden px-4 pb-3 animate-slideDown border-b border-emerald-100 bg-white/50 backdrop-blur">
          <input 
                type="text" 
                [ngModel]="store.searchQuery()"
                (ngModelChange)="store.setSearchQuery($event)"
                class="w-full px-4 py-2 rounded-lg bg-white border border-emerald-200 focus:border-emerald-500 outline-none text-sm" 
                placeholder="Search..."
                autoFocus
            >
      </div>
    </header>
  `,
  styles: [`
    @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .animate-slideDown { animation: slideDown 0.2s ease-out forwards; }
  `]
})
export class HeaderComponent {
  readonly store = inject(StoreService);
  isSearchOpen = signal(false);

  toggleSearch() {
      this.isSearchOpen.update(v => !v);
  }

  handleProfileClick() {
      if(this.store.currentUser()) {
          this.store.setView('PROFILE');
      } else {
          this.store.setView('LOGIN');
      }
  }
}