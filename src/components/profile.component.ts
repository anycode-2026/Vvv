import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService, Product, WithdrawalRequest } from '../services/store.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="min-h-screen bg-emerald-50 pt-24 pb-12">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <!-- Sidebar -->
          <div class="md:col-span-1">
            <div class="bg-emerald-100 rounded-3xl shadow-sm p-6 text-center border border-emerald-200 mb-6">
              <div class="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
                 <img [src]="store.currentUser()?.avatar || 'https://i.pravatar.cc/150'" class="w-full h-full rounded-full object-cover border-4 border-emerald-200 shadow-md">
                 <div class="absolute inset-0 bg-emerald-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label for="avatarUpload" class="text-white text-xs cursor-pointer font-bold">Change</label>
                 </div>
                 <input type="file" id="avatarUpload" (change)="onFileSelected($event)" class="hidden">
              </div>
              <h2 class="font-bold text-lg text-emerald-900">{{ store.currentUser()?.firstName }} {{ store.currentUser()?.lastName }}</h2>
              <p class="text-emerald-700 text-sm">{{ store.currentUser()?.email }}</p>
            </div>

            <div class="bg-emerald-100 rounded-3xl shadow-sm overflow-hidden border border-emerald-200">
              <button (click)="activeTab.set('DASHBOARD')" class="w-full text-left px-6 py-4 font-bold text-sm transition-colors" [class.bg-emerald-200]="activeTab() === 'DASHBOARD'" [class.text-emerald-700]="activeTab() === 'DASHBOARD'" [class.text-emerald-900]="activeTab() !== 'DASHBOARD'">Dashboard</button>
              <button (click)="activeTab.set('ORDERS')" class="w-full text-left px-6 py-4 font-bold text-sm transition-colors" [class.bg-emerald-200]="activeTab() === 'ORDERS'" [class.text-emerald-700]="activeTab() === 'ORDERS'" [class.text-emerald-900]="activeTab() !== 'ORDERS'">My Orders</button>
              <button (click)="activeTab.set('WISHLIST')" class="w-full text-left px-6 py-4 font-bold text-sm transition-colors" [class.bg-emerald-200]="activeTab() === 'WISHLIST'" [class.text-emerald-700]="activeTab() === 'WISHLIST'" [class.text-emerald-900]="activeTab() !== 'WISHLIST'">My Favorites</button>
              <button (click)="activeTab.set('ADDRESS')" class="w-full text-left px-6 py-4 font-bold text-sm transition-colors" [class.bg-emerald-200]="activeTab() === 'ADDRESS'" [class.text-emerald-700]="activeTab() === 'ADDRESS'" [class.text-emerald-900]="activeTab() !== 'ADDRESS'">Addresses</button>
              <button (click)="store.logout()" class="w-full text-left px-6 py-4 font-bold text-sm text-emerald-500 hover:bg-emerald-200 transition-colors border-t border-emerald-200">Logout</button>
            </div>
          </div>

          <!-- Main Content -->
          <div class="md:col-span-3">
            
            <!-- Dashboard / Edit Profile -->
            @if(activeTab() === 'DASHBOARD') {
              <div class="bg-emerald-100 rounded-3xl shadow-sm p-8 border border-emerald-200 animate-fadeIn">
                <h3 class="text-xl font-bold text-emerald-900 mb-6 font-serif">Personal Information</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs font-bold text-emerald-800 mb-1">First Name</label>
                    <input [(ngModel)]="editData.firstName" name="editFirstName" class="w-full p-3 bg-emerald-50 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none text-emerald-900">
                  </div>
                   <div>
                    <label class="block text-xs font-bold text-emerald-800 mb-1">Last Name</label>
                    <input [(ngModel)]="editData.lastName" name="editLastName" class="w-full p-3 bg-emerald-50 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none text-emerald-900">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-emerald-800 mb-1">Phone Number</label>
                    <input [(ngModel)]="editData.phone" name="editPhone" class="w-full p-3 bg-emerald-50 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none text-emerald-900">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-emerald-800 mb-1">Email (Read Only)</label>
                    <input [value]="store.currentUser()?.email" disabled class="w-full p-3 bg-emerald-200 rounded-xl border border-emerald-300 text-emerald-700/70 cursor-not-allowed">
                  </div>
                </div>
                <button (click)="saveProfile()" class="mt-6 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-colors">Save Changes</button>
              </div>
            }

            <!-- Orders -->
            @if(activeTab() === 'ORDERS') {
               <div class="space-y-4 animate-fadeIn">
                  <h3 class="text-xl font-bold text-emerald-900 mb-4 font-serif">My Orders</h3>
                  @for(order of store.myOrders(); track order.id) {
                    <div class="bg-emerald-100 rounded-3xl shadow-sm p-6 border border-emerald-200">
                      <div class="flex justify-between items-start mb-4 border-b border-emerald-200 pb-4">
                        <div>
                          <span class="font-bold text-emerald-900">{{ order.id }}</span>
                          <span class="text-xs text-emerald-700 ml-2">{{ order.date | date:'medium' }}</span>
                        </div>
                        <div class="flex flex-col items-end">
                            <span class="px-3 py-1 rounded-full text-xs font-bold mb-1"
                                [class.bg-yellow-200]="order.status === 'Pending'"
                                [class.text-yellow-800]="order.status === 'Pending'"
                                [class.bg-blue-200]="order.status === 'Confirmed'"
                                [class.text-blue-800]="order.status === 'Confirmed'"
                                [class.bg-purple-200]="order.status === 'Shipped'"
                                [class.text-purple-800]="order.status === 'Shipped'"
                                [class.bg-indigo-200]="order.status === 'Packaging'"
                                [class.text-indigo-800]="order.status === 'Packaging'"
                                [class.bg-green-200]="order.status === 'Delivered'"
                                [class.text-green-800]="order.status === 'Delivered'">
                              {{ order.status }}
                            </span>
                        </div>
                      </div>
                      
                      <!-- Tracking Progress Bar -->
                      <div class="w-full bg-white h-2 rounded-full mb-6 overflow-hidden flex relative">
                         <div class="h-full bg-emerald-600 transition-all duration-1000" 
                              [style.width]="order.status === 'Pending' ? '10%' : (order.status === 'Packaging' ? '30%' : (order.status === 'Shipped' ? '70%' : '100%'))"></div>
                      </div>

                      <div class="space-y-3 mb-4">
                        @for(item of order.items; track item.id) {
                          <div class="flex items-center">
                            <img [src]="item.image" class="w-12 h-12 rounded-lg object-cover border border-emerald-200 mr-3">
                            <div class="flex-1">
                              <h4 class="text-sm font-bold text-emerald-900">{{ item.name }}</h4>
                              <p class="text-xs text-emerald-700">Qty: {{ item.quantity }} | {{ item.selectedBundle }}</p>
                            </div>
                            <div class="text-sm font-bold text-emerald-600">৳ {{ item.price * item.quantity | number }}</div>
                          </div>
                        }
                      </div>
                      
                      <div class="flex justify-between items-center pt-2">
                         <div class="text-emerald-800 text-xs">Payment: <span class="uppercase font-bold">{{ order.paymentMethod }}</span></div>
                         @if(order.status === 'Delivered' && !order.isReviewed) {
                             <button (click)="store.markOrderReviewed(order.id)" class="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow hover:bg-emerald-700">Write a Review</button>
                         } @else if(order.isReviewed) {
                             <span class="text-green-600 text-xs font-bold flex items-center gap-1">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                                Reviewed
                             </span>
                         }
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-10 bg-emerald-100 rounded-3xl border border-emerald-200">
                      <p class="text-emerald-800">No orders yet.</p>
                      <button (click)="store.setView('PRODUCTS')" class="mt-4 text-emerald-600 font-bold hover:underline">Start Shopping</button>
                    </div>
                  }
               </div>
            }

            <!-- Wishlist -->
            @if(activeTab() === 'WISHLIST') {
              <div class="animate-fadeIn">
                <h3 class="text-xl font-bold text-emerald-900 mb-6 font-serif">My Favorites</h3>
                <div class="grid grid-cols-2 gap-4">
                  @for(prod of store.myWishlistProducts(); track prod.id) {
                    <div class="bg-emerald-100 rounded-2xl shadow-sm border border-emerald-200 overflow-hidden group cursor-pointer" (click)="store.viewProduct(prod.id)">
                      <img [src]="prod.image" class="w-full h-32 object-cover">
                      <div class="p-3">
                        <h4 class="text-sm font-bold text-emerald-900 truncate">{{ prod.name }}</h4>
                        <div class="flex justify-between items-center mt-2">
                           <span class="text-emerald-600 font-bold text-sm">৳ {{ prod.price | number }}</span>
                           <button (click)="$event.stopPropagation(); store.toggleWishlist(prod.id)" class="text-emerald-600 hover:text-emerald-800">
                             <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                           </button>
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <div class="col-span-full text-center py-10">
                      <p class="text-emerald-700">Your wishlist is empty.</p>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Addresses -->
            @if(activeTab() === 'ADDRESS') {
              <div class="bg-emerald-100 rounded-3xl shadow-sm p-8 border border-emerald-200 animate-fadeIn">
                 <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-emerald-900 font-serif">Saved Addresses</h3>
                    @if (!isAddingAddress()) {
                      <button (click)="isAddingAddress.set(true)" class="text-sm bg-emerald-900 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors shadow-md">Add New</button>
                    }
                 </div>

                 <!-- Add Address Form -->
                 @if(isAddingAddress()) {
                    <div class="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fadeIn space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-emerald-800 mb-1">First Name</label>
                                <input [(ngModel)]="newAddr.firstName" name="addrFirstName" class="w-full p-2 rounded-lg border border-emerald-300 bg-emerald-100 text-emerald-900 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-emerald-800 mb-1">Last Name</label>
                                <input [(ngModel)]="newAddr.lastName" name="addrLastName" class="w-full p-2 rounded-lg border border-emerald-300 bg-emerald-100 text-emerald-900 text-sm">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-emerald-800 mb-1">Full Address Details</label>
                            <textarea [(ngModel)]="newAddr.address" name="addrFull" rows="2" class="w-full p-3 rounded-lg border border-emerald-300 focus:border-emerald-500 outline-none bg-emerald-100 text-emerald-900" placeholder="House, Road, Area, City..."></textarea>
                        </div>
                        <div class="flex justify-end gap-2">
                            <button (click)="isAddingAddress.set(false); resetNewAddr()" class="px-4 py-2 text-sm font-bold text-emerald-500 hover:text-emerald-700">Cancel</button>
                            <button (click)="saveAddress()" class="px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-sm">Save Permanently</button>
                        </div>
                    </div>
                 }

                 <div class="space-y-4">
                   @for(addr of store.currentUser()?.addresses; track addr; let i = $index) {
                     <div class="p-4 border border-emerald-200 rounded-xl flex justify-between items-center bg-emerald-50 hover:border-emerald-300 transition-colors group">
                       <div class="flex items-center">
                         <div class="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center mr-3 text-emerald-600">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 01 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                         </div>
                         <span class="text-emerald-900 font-medium">{{ addr }}</span>
                       </div>
                       <button (click)="deleteAddress(i)" class="text-emerald-300 hover:text-emerald-600 p-2 hover:bg-emerald-100 rounded-full transition-colors" title="Delete Address">
                         <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                       </button>
                     </div>
                   } @empty {
                     @if(!isAddingAddress()) {
                        <div class="text-center py-8">
                            <p class="text-emerald-400 italic mb-2">No addresses saved yet.</p>
                        </div>
                     }
                   }
                 </div>
              </div>
            }

          </div>
        </div>
      </div>

    </section>
  `
})
export class ProfileComponent {
  store = inject(StoreService);
  activeTab = signal<'DASHBOARD' | 'ORDERS' | 'WISHLIST' | 'ADDRESS'>('DASHBOARD');
  
  editData: any = {};
  
  // Address Management
  isAddingAddress = signal(false);
  newAddr = { firstName: '', lastName: '', address: '' };

  constructor() {
    effect(() => {
        const user = this.store.currentUser();
        if (user) {
            this.editData = { ...user };
        }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editData.avatar = e.target.result;
        this.saveProfile();
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (this.store.currentUser()) {
      const updatedUser = { 
          ...this.store.currentUser()!, 
          ...this.editData 
      };
      this.store.updateProfile(updatedUser);
      alert('Profile updated successfully!');
    }
  }

  resetNewAddr() {
      this.newAddr = { firstName: '', lastName: '', address: '' };
  }

  saveAddress() {
      if(this.newAddr.address.trim() && this.newAddr.firstName.trim()) {
          const user = this.store.currentUser();
          if(user) {
              const formattedAddress = `${this.newAddr.firstName} ${this.newAddr.lastName}: ${this.newAddr.address}`;
              const updatedAddresses = [...(user.addresses || []), formattedAddress];
              this.store.updateProfile({ ...user, addresses: updatedAddresses });
              this.resetNewAddr();
              this.isAddingAddress.set(false);
          }
      } else {
          alert('Please fill in First Name and Address.');
      }
  }

  deleteAddress(index: number) {
      if(confirm('Are you sure you want to remove this address?')) {
          const user = this.store.currentUser();
          if(user && user.addresses) {
              const updatedAddresses = [...user.addresses];
              updatedAddresses.splice(index, 1);
              this.store.updateProfile({ ...user, addresses: updatedAddresses });
          }
      }
  }
}