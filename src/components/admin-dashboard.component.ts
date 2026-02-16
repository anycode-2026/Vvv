import { Component, inject, signal, computed, OnInit, effect, Pipe, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StoreService, Product, Order, AdminSettings, BlogPost, Review } from '../services/store.service';

@Pipe({
  name: 'noSanitize',
  standalone: true
})
export class NoSanitizePipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  transform(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NoSanitizePipe],
  providers: [DatePipe],
  template: `
    <div class="h-screen w-full font-sans flex overflow-hidden selection:bg-emerald-500 selection:text-white relative bg-slate-950 text-slate-200">
      
      <!-- SAVING OVERLAY -->
      <div *ngIf="isProcessing()" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div class="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl shadow-emerald-900/50 flex flex-col items-center">
              <div *ngIf="!processSuccess()" class="flex flex-col items-center">
                  <svg class="animate-spin h-12 w-12 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span class="text-emerald-400 font-bold text-lg animate-pulse tracking-widest uppercase">Processing...</span>
              </div>
              <div *ngIf="processSuccess()" class="flex flex-col items-center animate-bounce-in">
                  <div class="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-500 border border-emerald-500">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="text-white font-black text-xl tracking-widest uppercase">Success</span>
              </div>
          </div>
      </div>

      <!-- SIDEBAR -->
      <aside class="fixed lg:static top-0 left-0 h-full w-72 flex-shrink-0 z-50 transform transition-transform duration-300 ease-in-out border-r border-white/5 bg-slate-900/95 backdrop-blur flex flex-col"
             [class.translate-x-0]="isSidebarOpen()"
             [class.-translate-x-full]="!isSidebarOpen()"
             [class.lg:translate-x-0]="true">
          
          <!-- Logo Area -->
          <div class="h-24 flex items-center gap-4 px-6 border-b border-white/5 bg-slate-900 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent"></div>
              <div class="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-900 font-black text-xl relative z-10">A</div>
              <div class="relative z-10">
                  <h1 class="text-xl font-bold tracking-tighter text-white leading-none">Admin<span class="text-emerald-500">Pro</span></h1>
                  <span class="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">Control Center</span>
              </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
              <button *ngFor="let tab of tabs" 
                      (click)="currentTab.set(tab.id); isSidebarOpen.set(false)"
                      class="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group font-bold text-xs uppercase tracking-wider relative overflow-hidden"
                      [class.bg-emerald-500]="currentTab() === tab.id"
                      [class.text-slate-900]="currentTab() === tab.id"
                      [class.text-slate-400]="currentTab() !== tab.id"
                      [class.hover:bg-white/5]="currentTab() !== tab.id"
                      [class.hover:text-white]="currentTab() !== tab.id">
                   
                   <span class="relative z-10 flex items-center gap-3">
                       <span [ngSwitch]="tab.id">
                           <svg *ngSwitchCase="'dashboard'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                           <svg *ngSwitchCase="'inventory'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                           <svg *ngSwitchCase="'content'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                           <svg *ngSwitchCase="'users'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                           <svg *ngSwitchCase="'reviews'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                           <svg *ngSwitchDefault class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                       </span>
                       {{ tab.name }}
                   </span>
                   
                   <span *ngIf="tab.id === 'orders' && pendingOrdersCount() > 0" class="ml-auto bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">{{ pendingOrdersCount() }}</span>
              </button>
          </nav>

          <div class="p-4 border-t border-white/5 bg-black/20">
              <button (click)="store.setView('HOME')" class="w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all text-xs font-bold uppercase tracking-wider hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/20">
                  Exit to Shop
              </button>
          </div>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <div class="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-slate-950">
           
           <header class="h-24 px-8 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur sticky top-0 z-30">
               <div class="flex items-center gap-4">
                   <button (click)="isSidebarOpen.set(true)" class="lg:hidden text-slate-400 hover:text-white"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg></button>
                   <div>
                       <span class="block text-2xl font-black text-white tracking-tight">{{ getTabName(currentTab()) }}</span>
                       <span class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Administrator Access</span>
                   </div>
               </div>
               
               <div class="flex items-center gap-4">
                   <!-- Search Bar -->
                   <div class="hidden md:flex items-center bg-slate-800 rounded-full px-4 py-2 border border-white/5 focus-within:border-emerald-500/50 focus-within:bg-slate-800/80 transition-all w-80 lg:w-96">
                       <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                       <input 
                           type="text" 
                           [ngModel]="searchQuery()" 
                           (ngModelChange)="searchQuery.set($event)"
                           placeholder="Search..." 
                           class="bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-slate-500 w-full ml-2 outline-none"
                       >
                       <button *ngIf="searchQuery()" (click)="searchQuery.set('')" class="text-slate-500 hover:text-white">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                   </div>

                   <button class="w-10 h-10 rounded-full bg-slate-800 text-emerald-500 flex items-center justify-center border border-white/5 shadow-lg relative">
                       <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                       <span class="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></span>
                       <span class="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full"></span>
                   </button>
               </div>
           </header>

           <main class="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
               <div class="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
                   
                   <!-- DASHBOARD TAB -->
                   <div *ngIf="currentTab() === 'dashboard'" class="animate-fadeIn space-y-8">
                       <!-- KPI Stats -->
                       <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                           @for(stat of kpiStats(); track stat.label) {
                               <div class="p-6 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl relative overflow-hidden group">
                                   <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                   <div class="flex justify-between items-start mb-4 relative z-10">
                                       <div class="p-3 rounded-2xl" [ngClass]="stat.bgClass"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" [innerHTML]="stat.icon | noSanitize"></svg></div>
                                   </div>
                                   <div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 relative z-10">{{ stat.label }}</div>
                                   <div class="text-3xl font-black text-white tracking-tight relative z-10">{{ stat.value }}</div>
                               </div>
                           }
                       </div>
                   </div>

                   <!-- CONTENT (Control Center) TAB -->
                   <div *ngIf="currentTab() === 'content'" class="space-y-8 animate-fadeIn pb-10">
                       <div class="flex justify-between items-center border-b border-white/10 pb-6">
                           <div>
                               <h3 class="font-black uppercase text-xl text-white">Control Center</h3>
                               <p class="text-xs text-slate-500">Website Configuration & UI</p>
                           </div>
                           <button (click)="saveSettings()" class="bg-emerald-500 text-slate-900 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">Save Configuration</button>
                       </div>

                       <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           
                           <!-- BRANDING MANAGER -->
                           <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl">
                               <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest mb-4">Branding & Identity</h4>
                               <div class="space-y-4">
                                   <div>
                                       <label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">App Name</label>
                                       <input [(ngModel)]="settings.appName" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none font-bold">
                                   </div>
                                   <div>
                                       <label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Website Logo</label>
                                       <div class="flex items-center gap-4">
                                           <div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 relative group overflow-hidden">
                                               <img *ngIf="settings.appLogo" [src]="settings.appLogo" class="w-full h-full object-contain">
                                               <span *ngIf="!settings.appLogo" class="text-black text-xs font-bold">L</span>
                                           </div>
                                           <div class="relative">
                                               <button class="bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold border border-slate-700 hover:bg-slate-700">Upload Logo</button>
                                               <input type="file" (change)="onFileSelected($event, 'logo')" class="absolute inset-0 opacity-0 cursor-pointer">
                                           </div>
                                       </div>
                                   </div>
                               </div>
                           </div>

                           <!-- PRODUCT PAGE CONFIG (SOCIAL & BUTTONS) -->
                           <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl">
                               <h4 class="font-bold text-xs uppercase mb-6 text-emerald-500 tracking-widest">Product Page Configuration</h4>
                               
                               <!-- Buttons Toggle -->
                               <div class="mb-6 p-4 bg-slate-950 rounded-xl border border-white/5 space-y-3">
                                   <div class="text-[10px] font-bold text-slate-500 uppercase">Action Buttons</div>
                                   <div class="flex items-center justify-between">
                                       <span class="text-xs font-bold text-white">Show "Buy Now"</span>
                                       <input type="checkbox" [(ngModel)]="settings.showBuyButton" class="accent-emerald-500 w-5 h-5">
                                   </div>
                                   <div class="flex items-center justify-between">
                                       <span class="text-xs font-bold text-white">Show "Add to Cart"</span>
                                       <input type="checkbox" [(ngModel)]="settings.showAddToCartButton" class="accent-emerald-500 w-5 h-5">
                                   </div>
                               </div>

                               <!-- Social Links Input -->
                               <div class="space-y-4">
                                   <div class="space-y-2">
                                       <div class="flex justify-between items-center">
                                           <label class="text-[10px] font-bold text-slate-400 uppercase">WhatsApp Contact</label>
                                           <div class="flex items-center gap-2">
                                               <span class="text-[9px] text-slate-500">{{ settings.productSocialLinks.whatsapp.isEnabled ? 'Shown' : 'Hidden' }}</span>
                                               <input type="checkbox" [(ngModel)]="settings.productSocialLinks.whatsapp.isEnabled" class="accent-emerald-500 w-4 h-4">
                                           </div>
                                       </div>
                                       <input [(ngModel)]="settings.productSocialLinks.whatsapp.url" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none" placeholder="https://wa.me/...">
                                   </div>

                                   <div class="space-y-2">
                                       <div class="flex justify-between items-center">
                                           <label class="text-[10px] font-bold text-slate-400 uppercase">Facebook Messenger</label>
                                           <div class="flex items-center gap-2">
                                               <span class="text-[9px] text-slate-500">{{ settings.productSocialLinks.facebook.isEnabled ? 'Shown' : 'Hidden' }}</span>
                                               <input type="checkbox" [(ngModel)]="settings.productSocialLinks.facebook.isEnabled" class="accent-emerald-500 w-4 h-4">
                                           </div>
                                       </div>
                                       <input [(ngModel)]="settings.productSocialLinks.facebook.url" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none" placeholder="https://m.me/...">
                                   </div>
                               </div>
                           </div>

                           <!-- AUTH CONFIG -->
                           <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl">
                               <h5 class="font-bold text-xs uppercase text-emerald-500 mb-6 tracking-widest">Registration Fields</h5>
                               <div class="space-y-3">
                                   <div class="flex items-center justify-between">
                                       <span class="text-xs font-bold text-slate-300">Show Email Field</span>
                                       <input type="checkbox" [(ngModel)]="settings.authConfig.requireEmail" class="accent-emerald-500 w-4 h-4">
                                   </div>
                                   <div class="flex items-center justify-between">
                                       <span class="text-xs font-bold text-slate-300">Show Phone Field</span>
                                       <input type="checkbox" [(ngModel)]="settings.authConfig.requirePhone" class="accent-emerald-500 w-4 h-4">
                                   </div>
                                   <div class="flex items-center justify-between">
                                       <span class="text-xs font-bold text-slate-300">Show Address Field</span>
                                       <input type="checkbox" [(ngModel)]="settings.authConfig.showAddress" class="accent-emerald-500 w-4 h-4">
                                   </div>
                               </div>
                           </div>

                           <!-- 1. SLIDERS MANAGER -->
                           <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl lg:col-span-2">
                               <div class="flex justify-between mb-4">
                                   <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">Home Sliders</h4>
                                   <button (click)="addSlide()" class="text-[10px] bg-emerald-500 text-slate-900 px-2 py-1 rounded font-bold">+ Add Slide</button>
                               </div>
                               <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                   <div *ngFor="let slide of settings.heroSlides; let i = index" class="relative group aspect-[2/1] rounded-xl overflow-hidden border border-white/10 bg-black">
                                       <img [src]="slide.image" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity">
                                       <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                           <div class="relative">
                                               <button class="bg-white text-black text-[10px] font-bold px-3 py-1 rounded">Upload Image</button>
                                               <input type="file" (change)="onFileSelected($event, 'hero', i)" class="absolute inset-0 opacity-0 cursor-pointer">
                                           </div>
                                           <input [(ngModel)]="slide.image" placeholder="Or Image URL" class="w-3/4 bg-black/50 border border-white/20 text-[9px] text-white p-1 rounded">
                                           <button (click)="removeSlide(i)" class="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold">Remove</button>
                                       </div>
                                   </div>
                               </div>
                           </div>

                           <!-- 2. PARTNERSHIP MANAGER -->
                           <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl lg:col-span-2">
                               <div class="flex justify-between mb-4">
                                   <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">Trusted Partners & Affiliates</h4>
                                   <button (click)="addPartner()" class="text-[10px] bg-emerald-500 text-slate-900 px-2 py-1 rounded font-bold">+ Add Partner</button>
                               </div>
                               <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   <div *ngFor="let partner of settings.partnershipPlatforms; let i = index" class="bg-slate-950 p-4 rounded-xl border border-white/10 relative group">
                                       <div class="w-full h-16 bg-white rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                                           <img [src]="partner.image" class="max-h-full max-w-full object-contain p-2">
                                           <!-- Upload Overlay -->
                                           <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                               <div class="relative">
                                                   <span class="text-[9px] font-bold text-white bg-black/80 px-2 py-1 rounded">Upload</span>
                                                   <input type="file" (change)="onFileSelected($event, 'partner', i)" class="absolute inset-0 opacity-0 cursor-pointer" title="Upload Image">
                                               </div>
                                           </div>
                                       </div>
                                       <input [(ngModel)]="partner.title" class="w-full bg-transparent text-xs font-bold text-white border-b border-white/10 mb-1 focus:border-emerald-500 outline-none" placeholder="Name">
                                       <input [(ngModel)]="partner.url" class="w-full bg-transparent text-[10px] text-slate-400 border-b border-white/10 focus:border-emerald-500 outline-none" placeholder="Link URL">
                                       <button (click)="removePartner(i)" class="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">×</button>
                                   </div>
                               </div>
                           </div>

                           <!-- 3. PAYMENT METHODS MANAGER -->
                           <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl lg:col-span-2">
                               <div class="flex justify-between mb-4">
                                   <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">Payment Methods</h4>
                                   <button (click)="addNewPaymentMethod()" class="text-[10px] bg-emerald-500 text-slate-900 px-2 py-1 rounded font-bold">+ Add Method</button>
                               </div>
                               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <!-- COD TOGGLE -->
                                   <div class="flex gap-3 items-center border border-emerald-500/30 p-3 rounded-xl bg-slate-950/80">
                                       <div class="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                           <img src="https://cdn-icons-png.flaticon.com/512/9198/9198191.png" class="w-6 h-6 object-contain">
                                       </div>
                                       <div class="flex-1">
                                           <div class="text-xs font-bold text-white">Cash On Delivery</div>
                                           <div class="text-[9px] text-slate-400">Default Offline Payment</div>
                                       </div>
                                       <input type="checkbox" [(ngModel)]="settings.enableCOD" class="accent-emerald-500 w-5 h-5">
                                   </div>

                                   <!-- DYNAMIC METHODS -->
                                   <div *ngFor="let pm of store.paymentMethods(); let i = index" class="flex gap-3 items-center border border-white/5 p-3 rounded-xl bg-slate-950/50 relative group">
                                       <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                                           <img [src]="pm.logo" class="w-full h-full object-contain p-1">
                                           <input type="file" (change)="onFileSelected($event, 'payment', i, pm.id)" class="absolute inset-0 opacity-0 cursor-pointer" title="Upload Logo">
                                       </div>
                                       <div class="flex-1 space-y-1 min-w-0">
                                           <input [(ngModel)]="pm.name" class="w-full bg-transparent text-xs font-bold text-white border-b border-white/10 focus:border-emerald-500 outline-none" placeholder="Method Name">
                                           <input [(ngModel)]="pm.number" class="w-full bg-transparent text-[10px] text-slate-400 border-b border-white/10 focus:border-emerald-500 outline-none" placeholder="Number/Address">
                                       </div>
                                       <input type="checkbox" [(ngModel)]="pm.isVisible" class="accent-emerald-500 w-4 h-4">
                                       <button (click)="store.deletePaymentMethod(pm.id)" class="text-red-500 font-bold opacity-0 group-hover:opacity-100 px-2">×</button>
                                   </div>
                               </div>
                           </div>

                       </div>
                   </div>

                   <!-- USER MANAGEMENT TAB -->
                   <div *ngIf="currentTab() === 'users'" class="space-y-8 animate-fadeIn">
                       <div class="flex justify-between items-center mb-4">
                           <h3 class="font-black uppercase text-xl text-white">Registered Users</h3>
                           <div class="text-xs text-slate-500">Total Users: <span class="text-white font-bold">{{ store.users().length }}</span></div>
                       </div>
                       <!-- Table -->
                       <div class="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                           <table class="w-full text-left">
                               <thead class="bg-slate-950 border-b border-white/5 text-slate-500 uppercase text-[10px] tracking-widest">
                                   <tr>
                                       <th class="p-6">User Details</th>
                                       <th class="p-6">Role</th>
                                       <th class="p-6">Status</th>
                                       <th class="p-6 text-right">Actions</th>
                                   </tr>
                               </thead>
                               <tbody class="text-slate-300 text-xs">
                                   @for(user of filteredUsers(); track user.email) {
                                       <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                                           <td class="p-6">
                                               <div class="flex items-center gap-3">
                                                   <!-- FIXED: Smaller Icon-based Avatar, no large initials -->
                                                   <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                                       <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                   </div>
                                                   <div>
                                                       <div class="font-bold text-white text-sm">{{ user.firstName }} {{ user.lastName }}</div>
                                                       <div class="text-slate-500">{{ user.email }}</div>
                                                       <div class="text-slate-500 text-[10px]">{{ user.phone }}</div>
                                                   </div>
                                               </div>
                                           </td>
                                           <td class="p-6">
                                               <span *ngIf="user.isAdmin" class="bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-[10px] font-bold border border-emerald-500/30">ADMIN</span>
                                               <span *ngIf="!user.isAdmin" class="bg-slate-800 text-slate-400 px-2 py-1 rounded text-[10px] font-bold border border-slate-700">USER</span>
                                           </td>
                                           <td class="p-6">
                                               <span *ngIf="user.isBanned" class="text-red-500 font-bold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> BANNED</span>
                                               <span *ngIf="!user.isBanned" class="text-emerald-500 font-bold flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> ACTIVE</span>
                                           </td>
                                           <td class="p-6 text-right">
                                               <div class="flex justify-end gap-2">
                                                   <button (click)="store.toggleUserBan(user.email)" 
                                                           class="px-3 py-1 rounded border transition-colors text-[10px] font-bold"
                                                           [class.border-red-500]="!user.isBanned" [class.text-red-500]="!user.isBanned" [class.hover:bg-red-500]="!user.isBanned" [class.hover:text-white]="!user.isBanned"
                                                           [class.border-emerald-500]="user.isBanned" [class.text-emerald-500]="user.isBanned" [class.hover:bg-emerald-500]="user.isBanned" [class.hover:text-white]="user.isBanned">
                                                       {{ user.isBanned ? 'Unban' : 'Ban' }}
                                                   </button>
                                                   <button *ngIf="!user.isAdmin" (click)="store.deleteUser(user.email)" class="px-3 py-1 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 text-[10px] font-bold">
                                                       Delete
                                                   </button>
                                               </div>
                                           </td>
                                       </tr>
                                   } @empty {
                                       <tr>
                                           <td colspan="4" class="p-8 text-center text-slate-500 italic">No users found matching "{{ searchQuery() }}"</td>
                                       </tr>
                                   }
                               </tbody>
                           </table>
                       </div>
                   </div>

                   <!-- SETTINGS TAB -->
                   <div *ngIf="currentTab() === 'settings'" class="space-y-8 animate-fadeIn pb-10">
                        <div class="flex justify-between items-center border-b border-white/10 pb-6">
                           <div>
                               <h3 class="font-black uppercase text-xl text-white">Global Settings</h3>
                               <p class="text-xs text-slate-500">About, Contact, Socials & Policies</p>
                           </div>
                           <button (click)="saveSettings()" class="bg-emerald-500 text-slate-900 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">Save All</button>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <!-- Contact Information -->
                            <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl space-y-4">
                                <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">Footer Contact Info</h4>
                                <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Phone Number</label><input [(ngModel)]="settings.contactInfo.phone" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"></div>
                                <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Email Address</label><input [(ngModel)]="settings.contactInfo.email" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"></div>
                                <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Office Address</label><textarea [(ngModel)]="settings.contactInfo.address" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none"></textarea></div>
                            </div>

                            <!-- Social Media Links -->
                            <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl space-y-4">
                                <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">Social Media Links</h4>
                                <div class="grid grid-cols-2 gap-4">
                                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Facebook</label><input [(ngModel)]="settings.socialLinks.facebook" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">YouTube</label><input [(ngModel)]="settings.socialLinks.youtube" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">TikTok</label><input [(ngModel)]="settings.socialLinks.tiktok" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Twitter (X)</label><input [(ngModel)]="settings.socialLinks.twitter" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Telegram</label><input [(ngModel)]="settings.socialLinks.telegram" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                    <div><label class="block text-[10px] font-bold text-slate-500 mb-1">Instagram</label><input [(ngModel)]="settings.socialLinks.instagram" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                </div>
                            </div>
                            
                            <!-- CATEGORY MANAGER (MOVED HERE) -->
                            <div class="col-span-full p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl">
                                <div class="flex justify-between items-center mb-6">
                                    <div>
                                        <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">Category Management</h4>
                                        <p class="text-[10px] text-slate-500">Reorder or hide categories from the user panel. Click "Save All" to apply.</p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <input #catInput placeholder="New Category Name" class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none w-40 focus:border-emerald-500">
                                        <button (click)="addCategory(catInput.value); catInput.value=''" class="bg-emerald-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-400">+ Add</button>
                                    </div>
                                </div>
                                
                                <div class="flex flex-wrap gap-3">
                                    <div *ngFor="let cat of localCategories; let i = index" class="bg-slate-950 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-3 border border-white/10 group transition-all" 
                                         [class.opacity-50]="isLocalHidden(cat)" [class.border-dashed]="isLocalHidden(cat)">
                                        
                                        <span class="mr-1">{{ cat }}</span>
                                        
                                        <!-- Controls -->
                                        <div class="flex items-center gap-1 bg-slate-900 rounded p-0.5 border border-white/5">
                                            <!-- Move Left -->
                                            <button *ngIf="i > 0" (click)="localMoveCategory(i, 'left')" class="w-5 h-5 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-500 rounded transition-colors text-slate-500" title="Move Left">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                                            </button>
                                            <!-- Move Right -->
                                            <button *ngIf="i < localCategories.length - 1" (click)="localMoveCategory(i, 'right')" class="w-5 h-5 flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-500 rounded transition-colors text-slate-500" title="Move Right">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                            </button>
                                        </div>

                                        <div class="flex items-center gap-1 border-l border-white/10 pl-2 ml-1">
                                            <!-- Hide/Show Toggle -->
                                            <button (click)="localToggleHide(cat)" class="w-5 h-5 flex items-center justify-center rounded transition-colors" [title]="isLocalHidden(cat) ? 'Unhide' : 'Hide'">
                                                <svg *ngIf="!isLocalHidden(cat)" class="w-3.5 h-3.5 text-emerald-500 hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                <svg *ngIf="isLocalHidden(cat)" class="w-3.5 h-3.5 text-slate-600 hover:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                            </button>
                                            
                                            <!-- Delete -->
                                            <button *ngIf="cat !== 'All'" (click)="deleteCategory(cat)" class="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-500 rounded transition-colors" title="Delete">
                                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                   </div>

                   <!-- INVENTORY (Product Management) -->
                   <div *ngIf="currentTab() === 'inventory'" class="space-y-8 animate-fadeIn">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-black uppercase text-xl text-white">Product Inventory</h3>
                                <p class="text-xs text-slate-500">Manage Stock, Prices, and Media</p>
                            </div>
                            <div class="flex gap-3">
                                <button (click)="openProductModal()" class="bg-emerald-500 text-slate-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 shadow-lg hover:scale-105 transition-all">+ Add Product</button>
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap gap-2 mb-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                            <span class="text-xs font-bold text-slate-500 uppercase self-center mr-2">Quick Categories:</span>
                            <div *ngFor="let cat of store.categories()" class="bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-white/5">
                                {{ cat }}
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <div *ngFor="let p of filteredProducts()" (click)="editProduct(p)" class="bg-slate-900 border border-white/5 rounded-2xl p-3 cursor-pointer hover:border-emerald-500/50 transition-all relative group overflow-hidden">
                                <div class="relative aspect-square rounded-xl overflow-hidden mb-3">
                                    <img [src]="p.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                                    <div *ngIf="!p.isVisible" class="absolute inset-0 bg-black/60 flex items-center justify-center text-xs font-bold text-white uppercase tracking-widest backdrop-blur-sm">Hidden</div>
                                    <div *ngIf="p.stickers && p.stickers.length > 0" class="absolute top-1 left-1 flex flex-col gap-1">
                                        <span *ngFor="let s of p.stickers" class="bg-red-600 text-white text-[8px] font-bold px-1 rounded shadow">{{ s }}</span>
                                    </div>
                                </div>
                                <div class="font-bold text-xs text-white truncate mb-1">{{ p.name }}</div>
                                <div class="flex justify-between items-center">
                                    <div class="text-[10px] text-slate-500">Stock: {{ p.stock }}</div>
                                    <div class="text-xs font-bold text-emerald-400">৳{{ p.price }}</div>
                                </div>
                                <button (click)="$event.stopPropagation(); deleteProduct(p.id)" class="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-bold shadow-lg hover:bg-red-600">×</button>
                            </div>
                            <!-- No Results for Products -->
                            <div *ngIf="filteredProducts().length === 0" class="col-span-full p-8 text-center text-slate-500 italic border border-dashed border-white/10 rounded-2xl">
                                No products found matching "{{ searchQuery() }}"
                            </div>
                        </div>
                   </div>

                   <!-- REVIEWS & NEWS (FIXED NEWS DELETE 100%) -->
                   <div *ngIf="currentTab() === 'reviews'" class="space-y-8 animate-fadeIn">
                       <!-- News Section -->
                       <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl">
                           <div class="flex justify-between mb-4">
                               <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">Latest Updates (News Post)</h4>
                               <button (click)="openBlogModal()" class="text-[10px] bg-emerald-500 text-slate-900 px-3 py-1.5 rounded font-bold hover:scale-105 transition-transform">+ New Post</button>
                           </div>
                           <div class="space-y-3">
                               <div *ngFor="let news of store.blogs(); let i = index" class="flex gap-4 p-3 bg-slate-950 rounded-xl border border-white/5 group">
                                   <div class="w-16 h-16 bg-black rounded-lg overflow-hidden relative border border-white/10 flex-shrink-0">
                                       <img [src]="news.image" class="w-full h-full object-cover">
                                   </div>
                                   <div class="flex-1 space-y-1">
                                       <div class="flex justify-between items-start">
                                           <h3 class="font-bold text-sm text-white">{{ news.title }}</h3>
                                           <div class="flex items-center gap-2">
                                               <button (click)="editBlog(news)" class="text-emerald-500 text-[10px] font-bold hover:underline">Edit</button>
                                               <!-- 100% FIXED DELETE BUTTON LOGIC (Direct Delete, No Confirm needed as per user 'like customer review') -->
                                               <button (click)="deleteNews($event, news.id)" class="text-red-500 text-[10px] font-bold hover:underline cursor-pointer">Delete</button>
                                           </div>
                                       </div>
                                       <p class="text-xs text-slate-400 line-clamp-2">{{ news.excerpt }}</p>
                                       <div class="text-[9px] text-slate-600">{{ news.date }}</div>
                                   </div>
                               </div>
                           </div>
                       </div>

                       <!-- Reviews Section -->
                       <div class="p-8 rounded-3xl border border-white/5 bg-slate-900/50 shadow-xl">
                           <div class="flex justify-between mb-4">
                               <h4 class="font-bold text-xs uppercase text-emerald-500 tracking-widest">User Reviews</h4>
                               <button (click)="openReviewModal()" class="text-[10px] bg-emerald-500 text-slate-900 px-3 py-1.5 rounded font-bold hover:scale-105 transition-transform">+ Add Manual Review</button>
                           </div>
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div *ngFor="let r of store.customerReviews()" class="bg-slate-950 p-4 rounded-xl border border-white/5 relative group">
                                   <div class="flex gap-3">
                                       <img [src]="r.avatar" class="w-10 h-10 rounded-full bg-slate-800 object-cover">
                                       <div class="flex-1">
                                           <div class="font-bold text-sm text-white">{{ r.user }}</div>
                                           <div class="text-yellow-500 text-[10px] mb-1">
                                               <span *ngFor="let s of [1,2,3,4,5]">
                                                   {{ s <= r.rating ? '★' : '☆' }}
                                               </span>
                                           </div>
                                           <p class="text-xs text-slate-500">{{ r.comment }}</p>
                                       </div>
                                   </div>
                                   <button (click)="store.deleteReview(r.id)" class="absolute top-2 right-2 text-red-500 font-bold opacity-0 group-hover:opacity-100 text-xs hover:text-red-400 transition-opacity">Delete</button>
                               </div>
                           </div>
                       </div>
                   </div>

                   <!-- ORDERS -->
                   <div *ngIf="currentTab() === 'orders'" class="space-y-6 animate-fadeIn">
                       <div class="p-4 rounded-2xl border border-white/5 bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                           
                           <!-- Filter Buttons -->
                           <div class="flex flex-wrap gap-2 items-center">
                               <span class="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Filter:</span>
                               <button *ngFor="let f of ['All', 'Pending', 'Confirmed', 'Packaging', 'Shipped', 'Delivered']" (click)="setOrderFilter(f)" 
                                       class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border"
                                       [class.bg-emerald-500]="currentOrderFilter() === f" [class.text-slate-900]="currentOrderFilter() === f" [class.border-emerald-500]="currentOrderFilter() === f"
                                       [class.border-white/10]="currentOrderFilter() !== f" [class.text-slate-400]="currentOrderFilter() !== f">{{ f }}</button>
                           </div>

                           <!-- ORDER ID SEARCH -->
                           <div class="relative w-full md:w-64">
                               <input type="text" [(ngModel)]="orderSearchQuery" (ngModelChange)="orderSearch.set($event)" placeholder="Search Order ID..." class="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:border-emerald-500 outline-none">
                               <div class="absolute right-3 top-2 text-slate-500">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                               </div>
                           </div>
                       </div>

                       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                           <div *ngFor="let o of filteredOrders()" (click)="openOrderModal(o)" class="bg-slate-900 rounded-xl shadow-sm border-l-4 p-4 cursor-pointer hover:bg-slate-800 transition-all border-white/5"
                                [ngClass]="{'border-l-yellow-400': o.status === 'Pending', 'border-l-green-500': o.status === 'Delivered', 'border-l-blue-500': o.status === 'Confirmed'}">
                               <div class="flex justify-between items-start">
                                   <span class="font-bold text-xs text-white">{{ o.id }}</span>
                                   <span class="font-bold text-emerald-400">৳{{ o.total }}</span>
                               </div>
                               <div class="text-xs text-slate-500 mt-1">{{ o.customerInfo.name }}</div>
                               <div class="mt-2 text-[10px] uppercase font-bold inline-block px-2 py-1 rounded bg-slate-800 text-slate-300">{{ o.status }}</div>
                           </div>
                           <!-- No Results for Orders -->
                           <div *ngIf="filteredOrders().length === 0" class="col-span-full p-8 text-center text-slate-500 italic border border-dashed border-white/10 rounded-2xl">
                               No orders found matching your criteria.
                           </div>
                       </div>
                   </div>
                   
               </div>
           </main>
      </div>

      <!-- REVIEW MODAL -->
      <div *ngIf="isReviewModalOpen()" class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div class="bg-slate-900 rounded-3xl w-full max-w-md p-6 relative border border-white/10 shadow-2xl animate-slide-up">
              <h3 class="text-xl font-bold text-white mb-6">Create Manual Review</h3>
              <div class="space-y-4">
                  <button (click)="autoFillReview()" class="w-full bg-slate-800 border border-emerald-500/50 text-emerald-400 font-bold py-2 rounded-lg text-xs hover:bg-emerald-500 hover:text-black transition-all mb-2 flex items-center justify-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      🎲 Auto-Fill Random Data
                  </button>
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Customer Name</label><input [(ngModel)]="reviewForm.user" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"></div>
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Rating (1-5)</label><select [(ngModel)]="reviewForm.rating" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"><option [value]="5">5 Stars</option><option [value]="4">4 Stars</option><option [value]="3">3 Stars</option></select></div>
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Comment</label><textarea [(ngModel)]="reviewForm.comment" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none"></textarea></div>
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Avatar Image (Optional)</label><div class="relative border-2 border-dashed border-slate-700 rounded-lg h-24 flex items-center justify-center hover:border-emerald-500 transition-colors"><img *ngIf="reviewForm.avatar" [src]="reviewForm.avatar" class="h-full object-contain"><span *ngIf="!reviewForm.avatar" class="text-xs text-slate-500">Upload Photo</span><input type="file" (change)="onFileSelected($event, 'reviewAvatar')" class="absolute inset-0 opacity-0 cursor-pointer"></div></div>
              </div>
              <div class="flex justify-end gap-3 mt-6"><button (click)="isReviewModalOpen.set(false)" class="text-slate-400 hover:text-white font-bold text-xs px-4">Cancel</button><button (click)="saveReview()" class="bg-emerald-500 text-slate-900 font-bold px-6 py-2 rounded-lg text-xs hover:bg-emerald-400">Save Review</button></div>
          </div>
      </div>

      <!-- BLOG MODAL -->
      <div *ngIf="isBlogModalOpen()" class="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div class="bg-slate-900 rounded-3xl w-full max-w-md p-6 relative border border-white/10 shadow-2xl animate-slide-up">
              <h3 class="text-xl font-bold text-white mb-6">{{ editingBlog ? 'Edit Post' : 'Create News Post' }}</h3>
              <div class="space-y-4">
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Post Title</label><input [(ngModel)]="blogForm.title" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"></div>
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Date</label><input [(ngModel)]="blogForm.date" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"></div>
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Short Description</label><textarea [(ngModel)]="blogForm.excerpt" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm resize-none"></textarea></div>
                  <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Cover Image</label><div class="relative border-2 border-dashed border-slate-700 rounded-lg h-32 flex items-center justify-center hover:border-emerald-500 transition-colors"><img *ngIf="blogForm.image" [src]="blogForm.image" class="h-full w-full object-cover rounded-md"><div *ngIf="!blogForm.image" class="text-xs text-slate-500">Upload Cover</div><input type="file" (change)="onFileSelected($event, 'blogImage')" class="absolute inset-0 opacity-0 cursor-pointer"></div></div>
              </div>
              <div class="flex justify-end gap-3 mt-6"><button (click)="isBlogModalOpen.set(false)" class="text-slate-400 hover:text-white font-bold text-xs px-4">Cancel</button><button (click)="saveBlog()" class="bg-emerald-500 text-slate-900 font-bold px-6 py-2 rounded-lg text-xs hover:bg-emerald-400">Save Post</button></div>
          </div>
      </div>

      <!-- PRODUCT MODAL -->
      <div *ngIf="isProductModalOpen()" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
           <div class="w-full md:max-w-4xl bg-slate-900 rounded-[2rem] shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-slide-up border border-emerald-500/30 overflow-hidden">
               <div class="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950">
                   <div><h3 class="font-black text-lg text-white uppercase tracking-wider">{{ editingProduct ? 'Edit Product' : 'New Product Listing' }}</h3><p class="text-xs text-slate-500">Advanced Configuration Panel</p></div>
                   <button (click)="isProductModalOpen.set(false)" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-500 text-white flex items-center justify-center font-bold transition-colors">✕</button>
               </div>
               <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-900">
                    <div class="flex gap-4 mb-6 border-b border-white/5 pb-2">
                        <button (click)="productModalTab.set('GENERAL')" class="text-xs font-bold uppercase pb-2 transition-colors border-b-2" [class.text-emerald-500]="productModalTab() === 'GENERAL'" [class.border-emerald-500]="productModalTab() === 'GENERAL'" [class.text-slate-500]="productModalTab() !== 'GENERAL'">General</button>
                        <button (click)="productModalTab.set('MEDIA')" class="text-xs font-bold uppercase pb-2 transition-colors border-b-2" [class.text-emerald-500]="productModalTab() === 'MEDIA'" [class.border-emerald-500]="productModalTab() === 'MEDIA'" [class.text-slate-500]="productModalTab() !== 'MEDIA'">Media & Gallery</button>
                        <button (click)="productModalTab.set('PACKAGES')" class="text-xs font-bold uppercase pb-2 transition-colors border-b-2" [class.text-emerald-500]="productModalTab() === 'PACKAGES'" [class.border-emerald-500]="productModalTab() === 'PACKAGES'" [class.text-slate-500]="productModalTab() !== 'PACKAGES'">Packages</button>
                    </div>
                    <div *ngIf="productModalTab() === 'GENERAL'" class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
                        <div class="space-y-6">
                            <div class="space-y-4">
                                <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Product Name</label><input [(ngModel)]="productForm.name" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none font-bold"></div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Price (৳)</label><input type="number" [(ngModel)]="productForm.price" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-400 focus:border-emerald-500 outline-none font-bold"></div>
                                    <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Original Price (৳)</label><input type="number" [(ngModel)]="productForm.originalPrice" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-400 focus:border-emerald-500 outline-none"></div>
                                </div>
                                <div class="bg-slate-950 border border-white/5 rounded-2xl p-4">
                                    <h4 class="text-[10px] font-bold text-emerald-500 uppercase mb-3 tracking-widest">Manual Data Overrides</h4>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div><label class="block text-[9px] font-bold uppercase text-slate-500 mb-1">Reviews Count</label><input type="number" [(ngModel)]="productForm.reviews" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                        <div><label class="block text-[9px] font-bold uppercase text-slate-500 mb-1">Sold Count</label><input type="number" [(ngModel)]="productForm.sold" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                        <div><label class="block text-[9px] font-bold uppercase text-slate-500 mb-1">Rating (0-5)</label><input type="number" [(ngModel)]="productForm.rating" step="0.1" max="5" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                        <div><label class="block text-[9px] font-bold uppercase text-slate-500 mb-1">Stock Qty</label><input type="number" [(ngModel)]="productForm.stock" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"></div>
                                    </div>
                                </div>
                                <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label><select [(ngModel)]="productForm.category" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none"><option *ngFor="let cat of store.categories()" [value]="cat">{{ cat }}</option></select></div>
                            </div>
                            <div class="p-4 bg-slate-950 rounded-2xl border border-white/5"><h4 class="text-xs font-bold text-yellow-500 uppercase mb-3">Stickers & Badges</h4><div class="flex flex-wrap gap-2"><button *ngFor="let s of ['HOT', 'NEW', 'SALE', 'BIG SAVE']" (click)="toggleSticker(s)" class="px-3 py-1 rounded-full text-[10px] font-bold border transition-colors" [class.bg-emerald-500]="hasSticker(s)" [class.text-black]="hasSticker(s)" [class.border-emerald-500]="hasSticker(s)" [class.text-slate-500]="!hasSticker(s)" [class.border-slate-700]="!hasSticker(s)">{{ s }}</button></div><div class="mt-3 flex items-center gap-2"><input type="checkbox" [(ngModel)]="productForm.isVerified" class="w-4 h-4 accent-blue-500 rounded bg-slate-800 border-slate-600"><span class="text-xs font-bold text-blue-400 uppercase">Verified Badge</span></div></div>
                        </div>
                        <div class="space-y-6">
                            <div class="grid grid-cols-2 gap-3"><div><label class="block text-[9px] font-bold uppercase text-slate-500 mb-1">Shipping Inside Dhaka</label><input type="number" [(ngModel)]="productForm.shippingInsideDhaka" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div><div><label class="block text-[9px] font-bold uppercase text-slate-500 mb-1">Shipping Outside</label><input type="number" [(ngModel)]="productForm.shippingOutsideDhaka" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"></div></div>
                            <div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Detailed Description</label><textarea [(ngModel)]="productForm.description" rows="6" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:border-emerald-500 outline-none"></textarea></div>
                        </div>
                    </div>
                    <div *ngIf="productModalTab() === 'MEDIA'" class="space-y-6 animate-fadeIn"><div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="space-y-2"><label class="block text-[10px] font-bold uppercase text-slate-500">Main Product Image</label><div class="relative group h-48 w-full bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors overflow-hidden"><img *ngIf="productForm.image" [src]="productForm.image" class="w-full h-full object-contain"><div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white">Change Main Image</div><input type="file" (change)="onFileSelected($event, 'product')" class="absolute inset-0 opacity-0 cursor-pointer"></div></div><div class="space-y-2"><label class="block text-[10px] font-bold uppercase text-slate-500">Product Video URL</label><input [(ngModel)]="productForm.video" placeholder="https://youtube.com/..." class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-blue-400 focus:border-emerald-500 outline-none"><div *ngIf="productForm.video" class="mt-2 text-[10px] text-green-500">Video Link Active</div></div></div><div><div class="flex justify-between items-center mb-2"><label class="block text-[10px] font-bold uppercase text-slate-500">Gallery Images (Multiple)</label><div class="relative"><button class="bg-emerald-500 text-slate-900 text-xs font-bold px-3 py-1 rounded">+ Add Image</button><input type="file" (change)="onFileSelected($event, 'gallery')" class="absolute inset-0 opacity-0 cursor-pointer"></div></div><div class="flex flex-wrap gap-3 p-4 bg-slate-950 rounded-xl border border-white/5 min-h-[100px]"><div *ngFor="let img of productForm.gallery; let i = index" class="relative w-20 h-20 bg-black rounded-lg overflow-hidden group border border-slate-800"><img [src]="img" class="w-full h-full object-cover"><button (click)="removeGalleryImage(i)" class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button></div><div *ngIf="!productForm.gallery?.length" class="text-slate-600 text-xs italic w-full text-center py-4">No gallery images added.</div></div></div></div>
                    <div *ngIf="productModalTab() === 'PACKAGES'" class="animate-fadeIn"><div class="p-6 bg-slate-950 rounded-2xl border border-purple-500/20"><h4 class="text-sm font-bold text-purple-400 uppercase mb-4">Bundle Configuration</h4><div class="space-y-4"><div class="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-white/5"><label class="flex items-center gap-3 text-sm font-bold text-slate-300"><input type="checkbox" [(ngModel)]="productForm.bundleConfig.allowDouble" class="w-5 h-5 accent-purple-500 rounded"> Enable Double Package (2x)</label><div class="flex items-center gap-2"><span class="text-xs text-slate-500">Discount %</span><input *ngIf="productForm.bundleConfig.allowDouble" type="number" [(ngModel)]="productForm.bundleConfig.doubleDiscount" placeholder="%" class="w-20 bg-slate-800 border border-slate-600 rounded p-2 text-center text-sm text-white font-bold"></div></div><div class="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-white/5"><label class="flex items-center gap-3 text-sm font-bold text-slate-300"><input type="checkbox" [(ngModel)]="productForm.bundleConfig.allowFamily" class="w-5 h-5 accent-purple-500 rounded"> Enable Family Package (3x)</label><div class="flex items-center gap-2"><span class="text-xs text-slate-500">Discount %</span><input *ngIf="productForm.bundleConfig.allowFamily" type="number" [(ngModel)]="productForm.bundleConfig.familyDiscount" placeholder="%" class="w-20 bg-slate-800 border border-slate-600 rounded p-2 text-center text-sm text-white font-bold"></div></div></div></div></div>
               </div>
               <div class="p-6 border-t border-white/10 bg-slate-950 flex justify-end gap-4"><button (click)="isProductModalOpen.set(false)" class="px-6 py-3 rounded-xl font-bold text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button><button (click)="saveProduct()" class="px-8 py-3 bg-emerald-500 text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">{{ editingProduct ? 'Save Changes' : 'Publish Product' }}</button></div>
           </div>
      </div>

      <!-- ORDER MODAL -->
      <div *ngIf="orderModalOpen()" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div class="bg-slate-900 rounded-2xl w-full max-w-lg p-6 relative border border-white/10 shadow-2xl">
              <button (click)="closeOrderModal()" class="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
              <h3 class="text-xl font-bold text-white mb-4">Order Details {{ selectedOrder?.id }}</h3>
              <div *ngIf="selectedOrder" class="space-y-4"><div class="bg-slate-950 p-4 rounded-xl border border-white/5"><div class="text-xs text-slate-500 uppercase font-bold mb-2">Status</div><div class="flex flex-wrap gap-2"><button *ngFor="let s of ['Pending', 'Confirmed', 'Packaging', 'Shipped', 'Delivered', 'Rejected']" (click)="updateOrderStatus(s)" class="px-3 py-1 rounded text-[10px] border transition-colors font-bold uppercase" [class.bg-emerald-500]="selectedOrder?.status === s" [class.text-slate-900]="selectedOrder?.status === s" [class.border-emerald-500]="selectedOrder?.status === s" [class.border-slate-700]="selectedOrder?.status !== s" [class.text-slate-400]="selectedOrder?.status !== s">{{ s }}</button></div></div><div class="bg-slate-950 p-4 rounded-xl border border-white/5 text-sm text-slate-300"><p><strong class="text-white">Customer:</strong> {{ selectedOrder?.customerInfo?.name }}</p><p><strong class="text-white">Phone:</strong> {{ selectedOrder?.customerInfo?.phone }}</p><p><strong class="text-white">Address:</strong> {{ selectedOrder?.customerInfo?.address }}</p><p class="mt-2"><strong class="text-white">Payment:</strong> {{ selectedOrder?.paymentMethod }}</p><p *ngIf="selectedOrder?.transactionId"><strong class="text-white">Trans ID:</strong> {{ selectedOrder?.transactionId }}</p></div><div class="max-h-40 overflow-y-auto custom-scrollbar bg-slate-950 rounded-xl p-2 border border-white/5"><div *ngFor="let item of selectedOrder?.items" class="flex gap-2 mb-2 p-2 hover:bg-white/5 rounded"><img [src]="item.image" class="w-10 h-10 rounded object-cover"><div><div class="text-white text-xs font-bold">{{ item.name }}</div><div class="text-slate-500 text-[10px]">{{ item.quantity }} x ৳{{ item.finalPrice }}</div></div></div></div><div class="flex justify-end gap-2 mt-4"><button (click)="deleteOrder()" class="text-red-500 text-xs font-bold hover:underline">Delete Order</button></div></div>
          </div>
      </div>

    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  store = inject(StoreService);
  isSidebarOpen = signal(false);
  currentTab = signal('dashboard');
  productModalTab = signal<'GENERAL' | 'MEDIA' | 'PACKAGES'>('GENERAL');
  
  // Global Search
  searchQuery = signal('');
  
  // Specific Order Search
  orderSearch = signal('');
  orderSearchQuery = ''; 

  isProcessing = signal(false);
  processSuccess = signal(false);

  // Manual Review & Blog State
  isReviewModalOpen = signal(false);
  reviewForm: any = { user: '', rating: 5, comment: '', avatar: '' };
  
  isBlogModalOpen = signal(false);
  editingBlog: boolean = false;
  blogForm: any = { id: 0, title: '', date: '', excerpt: '', image: '', isVisible: true };

  currentOrderFilter = signal<'All' | 'Pending' | 'Shipped' | 'Delivered' | 'Confirmed' | 'Packaging' | 'Rejected'>('All');
  
  tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'content', name: 'Control Center' }, 
    { id: 'inventory', name: 'Inventory' }, 
    { id: 'orders', name: 'Orders' },
    { id: 'users', name: 'Users' },
    { id: 'reviews', name: 'Reviews / News' },
    { id: 'settings', name: 'Settings' }
  ];

  settings: AdminSettings = {} as any; 
  // Local Category State for Settings Page Management
  localCategories: string[] = [];

  orderModalOpen = signal(false);
  selectedOrder: Order | null = null;
  isProductModalOpen = signal(false);
  editingProduct = false;
  
  productForm: any = { 
      name: '', price: 0, originalPrice: 0, stock: 0, category: '', description: '', shippingInfo: '', image: '', 
      gallery: [], video: '', rating: 5, reviews: 0, sold: 0, isVisible: true,
      bundleConfig: { allowDouble: false, doubleDiscount: 0, allowFamily: false, familyDiscount: 0 }, 
      isVerified: false, badge: { text: '', colorClass: '' }, stickers: [], sizes: [], shippingInsideDhaka: null, shippingOutsideDhaka: null
  };
  
  pendingOrdersCount = computed(() => this.store.orders().filter(o => o.status === 'Pending').length);
  
  filteredOrders = computed(() => {
      const all = this.store.orders();
      const filter = this.currentOrderFilter();
      const globalQuery = this.searchQuery().toLowerCase().trim();
      const orderQuery = this.orderSearch().toLowerCase().trim();
      const query = orderQuery || globalQuery; 
      
      let result = all;
      if(filter !== 'All') {
          result = result.filter(o => o.status === filter);
      }
      if(query) {
          result = result.filter(o => 
              o.id.toLowerCase().includes(query) ||
              o.customerInfo.name.toLowerCase().includes(query) ||
              o.customerInfo.phone.toLowerCase().includes(query) ||
              (o.customerInfo.email && o.customerInfo.email.toLowerCase().includes(query)) ||
              (o.transactionId && o.transactionId.toLowerCase().includes(query))
          );
      }
      return result;
  });

  filteredProducts = computed(() => {
      const all = this.store.products();
      const query = this.searchQuery().toLowerCase().trim();
      if (!query) return all;
      return all.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.category.toLowerCase().includes(query) ||
          String(p.id).includes(query)
      );
  });

  filteredUsers = computed(() => {
      const all = this.store.users();
      const query = this.searchQuery().toLowerCase().trim();
      if (!query) return all;
      return all.filter(u => 
          u.firstName.toLowerCase().includes(query) || 
          u.lastName.toLowerCase().includes(query) || 
          u.email.toLowerCase().includes(query) ||
          u.phone.includes(query)
      );
  });

  kpiStats = computed(() => {
      const orders = this.store.orders();
      const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
      return [
          { label: 'Total Revenue', value: '৳' + (totalRevenue > 1000 ? (totalRevenue/1000).toFixed(1) + 'k' : totalRevenue), icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />', bgClass: 'bg-emerald-500' },
          { label: 'Orders', value: orders.length, icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />', bgClass: 'bg-blue-500' },
          { label: 'Affiliates', value: this.store.users().filter(u => u.affiliateData?.status === 'APPROVED').length, icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />', bgClass: 'bg-purple-500' },
          { label: 'Products', value: this.store.products().length, icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />', bgClass: 'bg-orange-500' }
      ];
  });

  constructor() {
      effect(() => { 
          this.settings = JSON.parse(JSON.stringify(this.store.adminSettings())); 
          this.localCategories = [...this.store.categories()];
      });
  }

  ngOnInit() { }

  getTabName(id: string) { return this.tabs.find(x => x.id === id)?.name || 'Dashboard'; }
  setOrderFilter(filter: any) { this.currentOrderFilter.set(filter); }
  toggleDarkMode() { this.settings.adminDarkMode = !this.settings.adminDarkMode; this.saveSettings(); }

  onFileSelected(event: any, type: string, index?: number, subId?: any) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
              const base64 = e.target.result;
              if (type === 'logo') this.settings.appLogo = base64;
              if (type === 'hero' && index !== undefined) this.settings.heroSlides[index].image = base64;
              if (type === 'partner' && index !== undefined) this.settings.partnershipPlatforms[index].image = base64;
              if (type === 'product') this.productForm.image = base64;
              if (type === 'reviewAvatar') this.reviewForm.avatar = base64;
              if (type === 'blogImage') this.blogForm.image = base64;
              
              if (type === 'gallery') {
                  if(!this.productForm.gallery) this.productForm.gallery = [];
                  this.productForm.gallery.push(base64);
              }

              if (type === 'news' && subId !== undefined) {
                  // Deprecated: used in previous version inside list, now using modal
              }
              if (type === 'payment' && index !== undefined) {
                 this.store.paymentMethods.update(ms => ms.map(m => m.id === subId ? { ...m, logo: base64 } : m));
              }
          };
          reader.readAsDataURL(file);
      }
  }

  // LOGIC
  addSlide() { this.settings.heroSlides.push({ id: Date.now(), image: 'https://via.placeholder.com/800x400', link: '', isVisible: true }); }
  removeSlide(index: number) { this.settings.heroSlides.splice(index, 1); }
  
  // PARTNER LOGIC
  addPartner() {
      this.settings.partnershipPlatforms.push({
          id: Date.now(),
          title: 'New Partner',
          image: 'https://via.placeholder.com/150',
          url: '#'
      });
  }
  
  removePartner(index: number) {
      if(confirm('Remove this partner?')) {
          this.settings.partnershipPlatforms.splice(index, 1);
      }
  }

  // Blog Logic (New Manual)
  openBlogModal() { this.editingBlog = false; this.blogForm = { id: 0, title: '', date: new Date().toLocaleDateString(), excerpt: '', image: '', isVisible: true }; this.isBlogModalOpen.set(true); }
  editBlog(b: BlogPost) { this.editingBlog = true; this.blogForm = { ...b }; this.isBlogModalOpen.set(true); }
  saveBlog() {
      if(this.editingBlog) { this.store.updateBlog(this.blogForm); }
      else { this.store.addBlog({ ...this.blogForm, id: Date.now() }); }
      this.isBlogModalOpen.set(false);
  }
  addNews() { this.openBlogModal(); } // Redirect old call
  
  // 100% FIXED DELETE LOGIC (INSTANT DELETE, NO CONFIRM)
  deleteNews(event: Event, id: number) { 
      event.preventDefault();
      event.stopPropagation();
      this.store.deleteBlog(id); 
  }

  // Review Logic (New Manual & Auto)
  openReviewModal() { this.reviewForm = { user: '', rating: 5, comment: '', avatar: '' }; this.isReviewModalOpen.set(true); }
  
  // NEW: Auto Fill Review
  autoFillReview() {
      const names = ['Aisha R.', 'Rahim Uddin', 'Tania K.', 'Sadia Islam', 'Karim Hossain', 'Customer'];
      const comments = [
          'Excellent product quality, highly recommended!',
          'Delivery was fast and packaging was good.',
          'Value for money. Satisfied.',
          'Great service from support team.',
          'Product matches the description perfectly.'
      ];
      this.reviewForm.user = names[Math.floor(Math.random() * names.length)];
      this.reviewForm.comment = comments[Math.floor(Math.random() * comments.length)];
      this.reviewForm.rating = 5;
      this.reviewForm.avatar = `https://i.pravatar.cc/150?u=${Date.now()}`;
  }

  saveReview() {
      if(!this.reviewForm.user || !this.reviewForm.comment) { alert('Name and Comment required'); return; }
      this.store.addReview({
          id: Date.now(),
          user: this.reviewForm.user,
          rating: Number(this.reviewForm.rating),
          comment: this.reviewForm.comment,
          avatar: this.reviewForm.avatar || 'https://i.pravatar.cc/150',
          productName: 'Customer Review'
      });
      this.isReviewModalOpen.set(false);
  }
  addFakeReview() { this.openReviewModal(); } // Redirect

  openOrderModal(order: Order) { this.selectedOrder = order; this.orderModalOpen.set(true); }
  closeOrderModal() { this.orderModalOpen.set(false); this.selectedOrder = null; }
  updateOrderStatus(status: any) { if(this.selectedOrder) { this.store.updateOrderStatus(this.selectedOrder.id, status); this.selectedOrder.status = status; } }
  deleteOrder() { if(this.selectedOrder && confirm('Delete?')) { this.store.deleteOrder(this.selectedOrder.id); this.closeOrderModal(); } }

  openProductModal() { 
      this.editingProduct = false; 
      this.productModalTab.set('GENERAL');
      this.productForm = { 
          name: '', price: 0, originalPrice: 0, stock: 100, category: 'Electronics', description: '', shippingInfo: '', image: 'https://via.placeholder.com/400', 
          gallery: [], video: '', rating: 5, reviews: 10, sold: 100, isVisible: true,
          bundleConfig: { allowDouble: false, doubleDiscount: 0, allowFamily: false, familyDiscount: 0 }, 
          isVerified: true, badge: { text: '', colorClass: '' }, stickers: [], sizes: [], shippingInsideDhaka: 60, shippingOutsideDhaka: 120
      }; 
      this.isProductModalOpen.set(true); 
  }
  
  editProduct(p: Product) { 
      this.editingProduct = true; 
      this.productModalTab.set('GENERAL');
      this.productForm = JSON.parse(JSON.stringify(p)); 
      if(!this.productForm.bundleConfig) this.productForm.bundleConfig = { allowDouble: false, doubleDiscount: 0, allowFamily: false, familyDiscount: 0 };
      if(!this.productForm.stickers) this.productForm.stickers = [];
      if(!this.productForm.gallery) this.productForm.gallery = [];
      this.isProductModalOpen.set(true); 
  }
  
  saveProduct() {
      const productData: Product = { ...this.productForm, id: this.editingProduct ? this.productForm.id : Date.now() };
      if(this.editingProduct) { this.store.updateProduct(productData); } else { this.store.addProduct(productData); }
      this.isProductModalOpen.set(false);
  }

  deleteProduct(id: number) { if(confirm('Move to Trash?')) this.store.deleteProduct(id); }
  addNewPaymentMethod() { this.store.addPaymentMethod({ id: 'custom-'+Date.now(), name: 'New Method', logo: 'https://via.placeholder.com/50', number: '', isVisible: true }); }
  addCategory(name: string) { 
      if(name && !this.localCategories.includes(name)) { 
          // Insert at start (index 1 after All) for immediate feedback, or end
          const others = this.localCategories.filter(x => x !== 'All');
          this.localCategories = ['All', name, ...others];
      } 
  }
  deleteCategory(name: string) { if(confirm('Delete Category?')) this.localCategories = this.localCategories.filter(c => c !== name); }
  
  // Local Category Management Logic (In Settings Tab)
  localMoveCategory(index: number, direction: 'left' | 'right') {
      const newCats = [...this.localCategories];
      if (direction === 'left') {
          if (index > 0) { 
              const temp = newCats[index];
              newCats[index] = newCats[index - 1];
              newCats[index - 1] = temp;
          }
      } else {
          if (index < newCats.length - 1) {
              const temp = newCats[index];
              newCats[index] = newCats[index + 1];
              newCats[index + 1] = temp;
          }
      }
      // Ensure 'All' stays at index 0
      if(newCats.includes('All') && newCats[0] !== 'All') {
          const idx = newCats.indexOf('All');
          newCats.splice(idx, 1);
          newCats.unshift('All');
      }
      this.localCategories = newCats;
  }

  isLocalHidden(cat: string) {
      return this.settings.hiddenCategories?.includes(cat);
  }

  localToggleHide(cat: string) {
      if(!this.settings.hiddenCategories) this.settings.hiddenCategories = [];
      if(this.settings.hiddenCategories.includes(cat)) {
          this.settings.hiddenCategories = this.settings.hiddenCategories.filter(c => c !== cat);
      } else {
          this.settings.hiddenCategories.push(cat);
      }
  }

  toggleSticker(sticker: string) {
      if(!this.productForm.stickers) this.productForm.stickers = [];
      const idx = this.productForm.stickers.indexOf(sticker);
      if(idx > -1) this.productForm.stickers.splice(idx, 1);
      else this.productForm.stickers.push(sticker);
  }
  hasSticker(sticker: string) { return this.productForm.stickers?.includes(sticker); }
  removeGalleryImage(index: number) { this.productForm.gallery.splice(index, 1); }

  saveSettings() { 
      this.isProcessing.set(true);
      this.processSuccess.set(false);
      
      // Save both Settings (Hidden Cats) and Order (Local Categories)
      this.store.updateAdminSettings(this.settings);
      this.store.setCategories(this.localCategories);
      
      setTimeout(() => {
          this.processSuccess.set(true);
          setTimeout(() => { this.isProcessing.set(false); }, 1500);
      }, 1500);
  }
}