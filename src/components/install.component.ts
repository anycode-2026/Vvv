import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-install',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-200">
      <div class="max-w-2xl w-full bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden relative">
        
        <!-- Progress Bar -->
        <div class="h-1.5 bg-slate-700 w-full">
            <div class="h-full bg-emerald-500 transition-all duration-500" [style.width]="(step() / 3) * 100 + '%'"></div>
        </div>

        <div class="p-10">
            <!-- Header -->
            <div class="text-center mb-10">
                <div class="w-16 h-16 bg-slate-700 rounded-xl mx-auto flex items-center justify-center mb-4 text-3xl shadow-inner">
                    🚀
                </div>
                <h1 class="text-2xl font-bold text-white mb-2">Everest Setup Wizard</h1>
                <p class="text-slate-400 text-sm">install.php - System Configuration</p>
            </div>

            <!-- Step 1: Database & Panels -->
            @if(step() === 1) {
                <div class="space-y-6 animate-fadeIn">
                    <div class="p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl flex items-center gap-3">
                        <span class="text-2xl">📁</span>
                        <div>
                            <h3 class="font-bold text-blue-100 text-sm">Directory Setup</h3>
                            <p class="text-xs text-blue-300">Defining panel structure for "Admin Panel of Everest" & "User Panel Offers"</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Database Name (Admin Panel)</label>
                            <input [(ngModel)]="config.dbName" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="Admin Panel of Everest">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">App Name (User Panel)</label>
                            <input [(ngModel)]="config.appName" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="User Panel Offers">
                        </div>
                    </div>
                </div>
            }

            <!-- Step 2: Firebase Connection -->
            @if(step() === 2) {
                <div class="space-y-6 animate-fadeIn">
                    <div class="p-4 bg-orange-900/20 border border-orange-800/50 rounded-xl flex items-center gap-3">
                        <span class="text-2xl">🔥</span>
                        <div>
                            <h3 class="font-bold text-orange-100 text-sm">Firebase Connection</h3>
                            <p class="text-xs text-orange-300">Connect Admin & User panels seamlessly.</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold uppercase text-slate-500 mb-1">API Key</label>
                                <input [(ngModel)]="config.firebase.apiKey" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none font-mono text-xs" placeholder="AIzaSy...">
                            </div>
                            <div>
                                <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Auth Domain</label>
                                <input [(ngModel)]="config.firebase.authDomain" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none font-mono text-xs" placeholder="everest-app.firebaseapp.com">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Project ID</label>
                            <input [(ngModel)]="config.firebase.projectId" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none font-mono text-xs" placeholder="everest-app">
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" checked disabled class="w-4 h-4 accent-emerald-500">
                            <span class="text-xs text-slate-400">Auto-sync Admin & User tables</span>
                        </div>
                    </div>
                </div>
            }

            <!-- Step 3: Admin Account -->
            @if(step() === 3) {
                <div class="space-y-6 animate-fadeIn">
                    <div class="p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-xl flex items-center gap-3">
                        <span class="text-2xl">👤</span>
                        <div>
                            <h3 class="font-bold text-emerald-100 text-sm">Super Admin Account</h3>
                            <p class="text-xs text-emerald-300">Create your master access credential.</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Admin Email</label>
                            <input [(ngModel)]="config.adminEmail" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="admin@everest.com">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
                            <input type="password" [(ngModel)]="config.adminPass" class="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="••••••••">
                        </div>
                    </div>
                </div>
            }

            <!-- Footer Actions -->
            <div class="mt-10 flex justify-between items-center border-t border-slate-700 pt-6">
                <button *ngIf="step() > 1" (click)="step.set(step() - 1)" class="text-slate-400 hover:text-white font-bold text-sm px-4 py-2">Back</button>
                <div class="flex-1"></div>
                <button (click)="nextStep()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                    {{ step() === 3 ? 'Install Now' : 'Next Step' }}
                    <svg *ngIf="step() !== 3" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
            </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
  `]
})
export class InstallComponent {
  store = inject(StoreService);
  step = signal(1);

  config = {
      dbName: 'Admin Panel of Everest',
      appName: 'User Panel Offers',
      firebase: { apiKey: '', authDomain: '', projectId: '' },
      adminEmail: 'xeno.mart.com@gmail.com',
      adminPass: 'skypay@121'
  };

  nextStep() {
      if (this.step() === 1) {
          if (!this.config.dbName || !this.config.appName) return alert('Please enter both panel names.');
          this.step.set(2);
      } else if (this.step() === 2) {
          this.step.set(3);
      } else if (this.step() === 3) {
          this.install();
      }
  }

  install() {
      // 1. Save Settings
      const settings = this.store.adminSettings();
      settings.appName = this.config.appName;
      settings.databaseName = this.config.dbName;
      settings.firebaseConfig = this.config.firebase;
      settings.isInstalled = true;
      
      this.store.updateAdminSettings(settings);

      // 2. Create/Update Admin User
      const adminUser = {
          firstName: 'Super',
          lastName: 'Admin',
          email: this.config.adminEmail,
          password: this.config.adminPass,
          phone: '01700000000',
          addresses: ['HQ'],
          isAdmin: true,
          isBanned: false
      };
      
      // Update store users
      this.store.users.update(users => {
          const others = users.filter(u => u.email !== this.config.adminEmail);
          return [adminUser, ...others];
      });

      alert('Installation Successful! Redirecting to Admin Panel...');
      this.store.setView('ADMIN_LOGIN');
  }
}
