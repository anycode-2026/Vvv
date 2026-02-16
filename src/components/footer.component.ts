import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- BOX STYLE CENTRAL FOOTER (Green Theme) -->
    <footer class="mt-4 px-2 pb-20"> 
      <div class="container mx-auto max-w-4xl"> 
          
        <div class="bg-emerald-100 rounded-3xl p-6 shadow-lg border border-emerald-200 relative overflow-hidden mx-2 md:mx-0">
            
            <div class="relative z-10 grid md:grid-cols-2 gap-6 items-center">
                
                <!-- Left: Branding & Info -->
                <div class="text-left">
                    <div class="flex items-center gap-3 mb-2">
                         <div class="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md text-lg">
                            {{ store.adminSettings().appName[0] }}
                         </div>
                         <div>
                             <h3 class="font-bold text-emerald-900 text-xl leading-none tracking-tight font-serif">{{ store.adminSettings().appName }}</h3>
                             <p class="text-[9px] uppercase tracking-widest text-emerald-600 font-bold mt-0.5">Premium Shopping</p>
                         </div>
                    </div>
                    <p class="text-emerald-800 text-xs leading-relaxed max-w-sm mb-3">
                        {{ store.adminSettings().aboutText }}
                    </p>
                    
                    <div class="text-emerald-700 text-[10px] space-y-1 font-medium">
                        <div class="flex items-center gap-2">
                            <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            {{ store.adminSettings().contactInfo.address }}
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            {{ store.adminSettings().contactInfo.phone }}
                        </div>
                    </div>
                </div>

                <!-- Right: Social & Links -->
                <div class="flex flex-col items-start md:items-end w-full border-t border-emerald-200 md:border-t-0 pt-4 md:pt-0">
                    <h4 class="text-emerald-900 font-bold mb-3 uppercase text-[10px] tracking-widest">Connect With Us</h4>
                    
                    <!-- Social Buttons Grid -->
                    <div class="grid grid-cols-5 gap-2 mb-4">
                        <!-- Facebook -->
                        <a [href]="store.adminSettings().socialLinks.facebook" target="_blank" class="w-8 h-8 rounded-lg bg-white/60 hover:bg-[#1877F2] hover:text-white text-emerald-600 flex items-center justify-center transition-all border border-emerald-200 hover:border-transparent group shadow-sm">
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        
                        <!-- YouTube -->
                        <a [href]="store.adminSettings().socialLinks.youtube" target="_blank" class="w-8 h-8 rounded-lg bg-white/60 hover:bg-[#FF0000] hover:text-white text-emerald-600 flex items-center justify-center transition-all border border-emerald-200 hover:border-transparent shadow-sm">
                            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.498-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>

                        <!-- Telegram -->
                        <a [href]="store.adminSettings().socialLinks.telegram" target="_blank" class="w-8 h-8 rounded-lg bg-white/60 hover:bg-[#229ED9] hover:text-white text-emerald-600 flex items-center justify-center transition-all border border-emerald-200 hover:border-transparent shadow-sm">
                             <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.638z"/></svg>
                        </a>

                        <!-- Twitter / X -->
                        <a [href]="store.adminSettings().socialLinks.twitter" target="_blank" class="w-8 h-8 rounded-lg bg-white/60 hover:bg-black hover:text-white text-emerald-600 flex items-center justify-center transition-all border border-emerald-200 hover:border-transparent shadow-sm">
                            <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>

                        <!-- TikTok -->
                        <a [href]="store.adminSettings().socialLinks.tiktok" target="_blank" class="w-8 h-8 rounded-lg bg-white/60 hover:bg-black hover:text-white text-emerald-600 flex items-center justify-center transition-all border border-emerald-200 hover:border-transparent shadow-sm">
                            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.17 1.09-1.07 1.93.03.58.45 1.13 1.02 1.3.74.22 1.59.02 2.16-.56.51-.55.77-1.32.74-2.09.02-3.33 0-6.66 0-10.03.01-.85.01-1.69.02-2.54h2.4z"/></svg>
                        </a>
                    </div>

                    <div class="flex gap-4 text-[9px] text-emerald-500 font-bold uppercase tracking-wider mb-2">
                        <a href="#" class="hover:text-emerald-800 transition-colors">Privacy Policy</a>
                        <a href="#" class="hover:text-emerald-800 transition-colors">Terms of Service</a>
                    </div>

                    <p class="text-[9px] text-emerald-400">&copy; 2024 {{ store.adminSettings().appName }}. All rights reserved.</p>
                </div>
            </div>

        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
    store = inject(StoreService);
}