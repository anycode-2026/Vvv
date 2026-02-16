import { Injectable, signal, computed, effect } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update, remove } from 'firebase/database';

// --- FIREBASE CONFIGURATION (LuxeMart BD) ---
const firebaseConfig = {
  apiKey: "AIzaSyAt3tkf6VjOL8HugpGXs9rTfVH4f74iXRo",
  authDomain: "luxemart-db.firebaseapp.com",
  databaseURL: "https://luxemart-db-default-rtdb.firebaseio.com", 
  projectId: "luxemart-db",
  storageBucket: "luxemart-db.firebasestorage.app",
  messagingSenderId: "298713741423",
  appId: "1:298713741423:web:eb50e7dcb0b6d0e4b4f59a",
  measurementId: "G-Y54C8TGTDP"
};

export interface Product {
  id: number;
  name: string;
  price: number; 
  originalPrice?: number; 
  category: string;
  image: string;
  gallery?: string[]; 
  video?: string; 
  rating: number;
  reviews: number; 
  description: string;
  shippingInfo?: string;
  shippingInsideDhaka?: number; 
  shippingOutsideDhaka?: number; 
  isNew?: boolean;
  sale?: boolean;
  isVerified?: boolean; 
  views: number;
  sold: number; 
  stock: number;
  isVisible: boolean; 
  sizes?: string[]; 
  stickers?: string[]; 
  bundleConfig?: {
      allowDouble: boolean;
      doubleDiscount: number; 
      allowFamily: boolean;
      familyDiscount: number; 
  };
  badge?: {
    text: string;
    colorClass: string;
  };
}

export interface CartItem extends Product {
  quantity: number;
  selectedBundle?: string; 
  selectedSizes?: string[];
  finalPrice: number; 
  badgeDiscount: number; 
  bundleDiscountPercent?: number; 
}

export interface AffiliateData {
    status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    balance: number;
    totalSales: number;
    documents: {
        passportPhoto: string;
        nidFront: string;
        nidBack: string;
    };
    registrationDate?: Date;
}

export interface User {
  email: string;
  password?: string; 
  firstName: string;
  lastName: string;
  phone: string;
  dob?: string; 
  avatar?: string;
  addresses: string[];
  isAdmin?: boolean;
  joinedDate?: any; 
  isBanned?: boolean; 
  isPinned?: boolean; 
  affiliateData?: AffiliateData; 
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Packaging' | 'Shipped' | 'Delivered' | 'Rejected';

export interface Order {
  id: string;
  date: any; 
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  transactionId: string;
  customerInfo: {
      name: string;
      phone: string;
      email: string;
      address: string;
  };
  isReviewed?: boolean;
  isAffiliateOrder?: boolean;
  affiliateEmail?: string;
  affiliateSellPrice?: number; 
  affiliateCommission?: number; 
}

export interface WithdrawalRequest {
    id: string;
    userEmail: string;
    amount: number;
    method: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'BUSD';
    number: string;
    status: 'Pending' | 'Completed' | 'Rejected';
    date: any;
}

export interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  productName: string;
}

export interface BlogPost {
  id: number;
  title: string;
  image: string;
  excerpt: string;
  date: string;
  isVisible: boolean; 
}

export interface Brand {
  name: string;
  logo: string;
}

export interface PartnershipPlatform {
    id: number;
    title: string;
    image: string;
    url: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    logo: string;
    number: string; 
    isVisible: boolean; 
}

export interface ServiceStrip {
    id: number;
    title: string;
    subtitle: string;
    icon: string; 
    isVisible: boolean;
}

export interface SocialLink {
    platform: string;
    url: string;
    icon: string; 
    isEnabled: boolean;
}

export interface HeroSlide {
    id: number;
    image: string;
    link?: string; 
    isVisible: boolean;
}

export interface AdminSettings {
    appName: string;
    appLogo: string; 
    themeColor: string; 
    adminDarkMode: boolean; 
    heroSlides: HeroSlide[];
    
    // Global Toggles
    showBuyButton: boolean;
    showAddToCartButton: boolean;

    // Layout Config
    announcementText: string; 
    serviceStrips: ServiceStrip[];
    hiddenCategories: string[]; 
    homeProductLimit: number; 
    categoryLimit: number; 
    
    // Content
    partners: Brand[];
    partnershipPlatforms: PartnershipPlatform[]; 
    
    // Product Detail Config
    productSocialLinks: {
        whatsapp: SocialLink;
        facebook: SocialLink;
    };

    privacyPolicy: string;
    terms: string;
    aboutText: string;
    shippingCost: number; 
    enableCOD: boolean;
    contactInfo: {
        phone: string;
        email: string;
        address: string;
    };
    socialLinks: { 
        facebook: string;
        youtube: string;
        instagram: string;
        twitter: string;
        telegram: string; 
        tiktok: string;   
    };
    authConfig: {
        requireEmail: boolean;
        requirePhone: boolean;
        showFirstName: boolean;
        showLastName: boolean;
        showAddress: boolean;
    };
    isInstalled?: boolean;
    databaseName?: string;
    firebaseConfig?: any;
}

export type ViewState = 'INSTALL' | 'HOME' | 'PRODUCTS' | 'DETAIL' | 'CART' | 'CHECKOUT' | 'SUCCESS' | 'LOGIN' | 'REGISTER' | 'PROFILE' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // APP STATE
  readonly currentView = signal<ViewState>('HOME');
  readonly selectedProductId = signal<number | null>(null);
  readonly searchQuery = signal<string>('');
  
  // DATA SIGNALS 
  // RECOVERED: Initialized with Generator Functions to ensure 100% data presence
  readonly adminSettings = signal<AdminSettings>(this.loadFromStorage('adminSettings', this.getDefaultSettings()));
  readonly categories = signal<string[]>(this.loadFromStorage('categories', ['All', 'Best Seller', 'Sale', 'Electronics', 'Fashion', 'Home']));
  
  // 100% RECOVERY: Generators used as default fallback
  readonly paymentMethods = signal<PaymentMethod[]>(this.loadFromStorage('paymentMethods', this.generateDefaultPaymentMethods()));
  readonly users = signal<User[]>(this.loadFromStorage('users', this.generateDefaultUsers()));
  readonly orders = signal<Order[]>(this.loadFromStorage('orders', []));
  readonly withdrawalRequests = signal<WithdrawalRequest[]>(this.loadFromStorage('withdrawalRequests', []));
  readonly products = signal<Product[]>(this.loadFromStorage('products', []));
  readonly customerReviews = signal<Review[]>(this.loadFromStorage('reviews', this.generateDefaultReviews()));
  readonly blogs = signal<BlogPost[]>(this.loadFromStorage('blogs', this.generateDefaultBlogs()));
  readonly trashBin = signal<any[]>(this.loadFromStorage('trashBin', []));

  // CART (Local Session)
  readonly cart = signal<CartItem[]>([]);
  readonly promoDiscount = signal<number>(0); 
  readonly wishlist = signal<number[]>(this.loadFromStorage('wishlist', []));
  
  // LOCAL USER SESSION
  readonly currentUser = signal<User | null>(this.loadFromStorage('currentUser', null));

  // Firebase Instances
  private app: any;
  private db: any;
  private isFirebaseInitialized = false;

  // Computed Values
  readonly cartCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));
  readonly cartTotal = computed(() => {
      const subtotal = this.cart().reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
      return Math.max(0, subtotal - this.promoDiscount());
  });
  
  readonly activeProduct = computed(() => {
    const id = this.selectedProductId();
    return this.products().find(p => p.id === id) || null;
  });

  // 100% FIX: Case-Insensitive Email Matching for Order History
  readonly myOrders = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    // Normalize user email
    const userEmail = user.email.trim().toLowerCase();
    
    return this.orders().filter(o => 
        o.customerInfo && 
        o.customerInfo.email && 
        o.customerInfo.email.trim().toLowerCase() === userEmail
    ); 
  });

  readonly myWishlistProducts = computed(() => {
    const ids = this.wishlist();
    return this.products().filter(p => ids.includes(p.id));
  });

  readonly topSellingProducts = computed(() => {
      return [...this.products()].filter(p => p.isVisible).sort((a,b) => b.sold - a.sold).slice(0, 5);
  });

  constructor() {
      // 1. Initialize Firebase (Attempts Sync, but doesn't block app)
      this.initFirebase();

      // 2. AUTO-PERSISTENCE EFFECTS
      effect(() => this.safeSetItem('adminSettings', this.adminSettings()));
      effect(() => this.safeSetItem('categories', this.categories()));
      effect(() => this.safeSetItem('products', this.products()));
      effect(() => this.safeSetItem('orders', this.orders()));
      effect(() => this.safeSetItem('users', this.users()));
      effect(() => this.safeSetItem('paymentMethods', this.paymentMethods()));
      effect(() => this.safeSetItem('reviews', this.customerReviews()));
      effect(() => this.safeSetItem('blogs', this.blogs()));
      effect(() => this.safeSetItem('currentUser', this.currentUser()));
      effect(() => this.safeSetItem('wishlist', this.wishlist()));
      
      // Initial Data Check: If no products exist (local or remote), generate sample data
      if (this.products().length === 0) {
          setTimeout(() => { 
              if (this.products().length === 0) {
                  this.products.set(this.generateProducts());
              }
          }, 2000);
      }
  }

  // --- FIREBASE SYNC CORE ---
  private initFirebase() {
      try {
          this.app = initializeApp(firebaseConfig);
          this.db = getDatabase(this.app);
          this.isFirebaseInitialized = true;

          // LISTENERS with Permission Error Handling
          onValue(ref(this.db, 'settings'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.adminSettings.set({ ...this.getDefaultSettings(), ...val });
          }, (err) => console.warn('Sync Skipped (Using Local Data):', err.message));

          onValue(ref(this.db, 'products'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.products.set(Object.values(val));
          }, (err) => console.warn('Sync Skipped:', err.message));

          onValue(ref(this.db, 'categories'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.categories.set(val);
          }, (err) => {});

          onValue(ref(this.db, 'orders'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.orders.set(Object.values(val).reverse());
          }, (err) => {});

          onValue(ref(this.db, 'users'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.users.set(Object.values(val));
          }, (err) => {});

          onValue(ref(this.db, 'reviews'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.customerReviews.set(Object.values(val));
          }, (err) => {});

          onValue(ref(this.db, 'blogs'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.blogs.set(Object.values(val));
          }, (err) => {});
          
          onValue(ref(this.db, 'paymentMethods'), (snapshot) => {
              const val = snapshot.val();
              if (val) this.paymentMethods.set(Object.values(val));
          }, (err) => {});

      } catch (e) {
          console.error("Firebase Init Failed (Running Offline Mode):", e);
      }
  }

  // Helper to remove invalid characters from Firebase paths (like #, ., $, [, ])
  private getSafeKey(key: string | number): string {
      return String(key).replace(/[.#$\[\]]/g, '');
  }

  // Helper to remove undefined values for Firebase (prevents "set failed: value argument contains undefined")
  private cleanData(data: any): any {
    return JSON.parse(JSON.stringify(data));
  }

  // --- WRITE OPERATIONS (Modified to be robust) ---

  // Update Settings
  updateAdminSettings(settings: AdminSettings) {
      this.adminSettings.set(settings); 
      if (this.isFirebaseInitialized) {
          set(ref(this.db, 'settings'), this.cleanData(settings)).catch(err => console.warn("Firebase Write Failed (Offline/Permission):", err.message));
      }
  }

  // Categories
  addCategory(name: string) {
      const current = this.categories();
      if (!current.includes(name)) {
          const others = current.filter(x => x !== 'All' && x !== name);
          const newCats = ['All', name, ...others];
          this.categories.set(newCats);
          if (this.isFirebaseInitialized) set(ref(this.db, 'categories'), newCats).catch(err => console.warn(err.message));
      }
  }

  deleteCategory(name: string) {
      const newCats = this.categories().filter(c => c !== name);
      this.categories.set(newCats);
      if (this.isFirebaseInitialized) set(ref(this.db, 'categories'), newCats).catch(err => console.warn(err.message));
  }

  setCategories(cats: string[]) {
      this.categories.set(cats);
      if (this.isFirebaseInitialized) set(ref(this.db, 'categories'), cats).catch(err => console.warn(err.message));
  }

  // Products
  addProduct(product: Product) {
      this.products.update(p => [product, ...p]);
      if (this.isFirebaseInitialized) {
          set(ref(this.db, 'products/' + product.id), this.cleanData(product)).catch(err => console.warn(err.message));
      }
  }

  updateProduct(product: Product) {
      this.products.update(p => p.map(x => x.id === product.id ? product : x));
      if (this.isFirebaseInitialized) {
          update(ref(this.db, 'products/' + product.id), this.cleanData(product)).catch(err => console.warn(err.message));
      }
  }

  deleteProduct(id: number) {
      this.products.update(p => p.filter(x => x.id !== id));
      if (this.isFirebaseInitialized) {
          remove(ref(this.db, 'products/' + id)).catch(err => console.warn(err.message));
      }
  }

  // Orders
  placeOrder(paymentMethod: string, total: number, transactionId: string, customerData: any) {
      const rawId = Math.floor(Math.random() * 1000000);
      
      // 100% FIX: Normalize Email to Ensure Match with Profile
      const normalizedCustomerData = {
          ...customerData,
          email: customerData.email ? customerData.email.trim().toLowerCase() : ''
      };

      const newOrder: Order = {
          id: '#' + rawId,
          date: new Date().toISOString(),
          items: [...this.cart()],
          total,
          status: 'Pending',
          paymentMethod,
          transactionId,
          customerInfo: normalizedCustomerData,
          isReviewed: false
      };

      this.orders.update(o => [newOrder, ...o]);
      
      if (this.isFirebaseInitialized) {
          // Use sanitized ID for Firebase Path to prevent "invalid path" errors
          const dbKey = this.getSafeKey(newOrder.id);
          // Use cleanData to remove undefined fields which Firebase rejects
          set(ref(this.db, 'orders/' + dbKey), this.cleanData(newOrder)).catch(err => console.warn("Firebase Order Write Blocked (Using Local):", err.message));
      }
      
      this.clearCart();
      this.setView('PROFILE');
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
      this.orders.update(orders => orders.map(o => o.id === orderId ? { ...o, status: status } : o));
      this.handleAffiliateCommission(orderId, status); // Handle affiliate locally first

      if (this.isFirebaseInitialized) {
          const dbKey = this.getSafeKey(orderId);
          update(ref(this.db, 'orders/' + dbKey), { status: status }).catch(err => console.warn(err.message));
      }
  }

  private handleAffiliateCommission(orderId: string, status: OrderStatus) {
      const order = this.orders().find(o => o.id === orderId);
      if(order && order.isAffiliateOrder && status === 'Delivered') {
          const users = this.users();
          const user = users.find(u => u.email === order.affiliateEmail);
          
          if(user && user.affiliateData) {
              const updatedUser = {
                  ...user,
                  affiliateData: {
                      ...user.affiliateData,
                      balance: user.affiliateData.balance + (order.affiliateCommission || 0),
                      totalSales: user.affiliateData.totalSales + 1
                  }
              };
              // Update local state first
              this.users.update(list => list.map(u => u.email === user.email ? updatedUser : u));
              
              if(this.isFirebaseInitialized) {
                  const safeKey = this.getSafeKey(user.email.replace(/\./g, '_'));
                  update(ref(this.db, 'users/' + safeKey), this.cleanData(updatedUser)).catch(err => console.warn(err.message));
              }
          }
      }
  }

  deleteOrder(id: string) {
      this.orders.update(o => o.filter(x => x.id !== id));
      if(this.isFirebaseInitialized) {
          const dbKey = this.getSafeKey(id);
          remove(ref(this.db, 'orders/' + dbKey)).catch(err => console.warn(err.message));
      }
  }

  // Users
  // MODIFIED: Added shouldRedirect parameter for silent checkout registration
  register(user: User, shouldRedirect: boolean = true) {
      // 100% FIX: Ensure email is stored lowercase for consistency
      const normalizedEmail = user.email.trim().toLowerCase();
      const newUser = { ...user, email: normalizedEmail, joinedDate: new Date().toISOString(), isBanned: false, isPinned: false };
      
      this.users.update(u => [...u, newUser]);
      this.currentUser.set(newUser);
      
      if(this.isFirebaseInitialized) {
          const safeKey = normalizedEmail.replace(/\./g, '_'); // Emails usually need '.' replaced
          set(ref(this.db, 'users/' + safeKey), this.cleanData(newUser)).catch(err => console.warn(err.message));
      }
      
      if (shouldRedirect) {
          this.setView('HOME');
      }
  }

  updateProfile(updatedUser: User) {
      this.currentUser.set(updatedUser);
      this.users.update(users => users.map(u => u.email === updatedUser.email ? updatedUser : u));
      
      if(this.isFirebaseInitialized) {
          const safeKey = updatedUser.email.replace(/\./g, '_');
          update(ref(this.db, 'users/' + safeKey), this.cleanData(updatedUser)).catch(err => console.warn(err.message));
      }
  }

  toggleUserBan(email: string) {
      const user = this.users().find(u => u.email === email);
      if(user) {
          const newVal = !user.isBanned;
          this.users.update(users => users.map(u => u.email === email ? { ...u, isBanned: newVal } : u));
          
          if(this.isFirebaseInitialized) {
              const safeKey = email.replace(/\./g, '_');
              update(ref(this.db, 'users/' + safeKey), { isBanned: newVal }).catch(err => console.warn(err.message));
          }
      }
  }

  deleteUser(email: string) {
      this.users.update(users => users.filter(u => u.email !== email));
      if(this.isFirebaseInitialized) {
          const safeKey = email.replace(/\./g, '_');
          remove(ref(this.db, 'users/' + safeKey)).catch(err => console.warn(err.message));
      }
  }

  // Reviews & Blogs
  addReview(review: Review) {
      this.customerReviews.update(r => [review, ...r]);
      if(this.isFirebaseInitialized) set(ref(this.db, 'reviews/' + review.id), this.cleanData(review)).catch(err => console.warn(err.message));
  }
  
  deleteReview(id: number) {
      this.customerReviews.update(list => list.filter(x => x.id !== id));
      if(this.isFirebaseInitialized) remove(ref(this.db, 'reviews/' + id)).catch(err => console.warn(err.message));
  }

  addBlog(blog: BlogPost) {
      this.blogs.update(b => [blog, ...b]);
      if(this.isFirebaseInitialized) set(ref(this.db, 'blogs/' + blog.id), this.cleanData(blog)).catch(err => console.warn(err.message));
  }

  updateBlog(blog: BlogPost) {
      this.blogs.update(b => b.map(x => x.id === blog.id ? blog : x));
      if(this.isFirebaseInitialized) update(ref(this.db, 'blogs/' + blog.id), this.cleanData(blog)).catch(err => console.warn(err.message));
  }

  deleteBlog(id: number) {
      this.blogs.update(b => b.filter(x => x.id !== id));
      if(this.isFirebaseInitialized) remove(ref(this.db, 'blogs/' + id)).catch(err => console.warn(err.message));
  }

  // Payment Methods
  addPaymentMethod(method: PaymentMethod) {
      this.paymentMethods.update(m => [...m, method]);
      if(this.isFirebaseInitialized) set(ref(this.db, 'paymentMethods/' + method.id), this.cleanData(method)).catch(err => console.warn(err.message));
  }
  
  updatePaymentMethod(updated: PaymentMethod) {
      this.paymentMethods.update(ms => ms.map(m => m.id === updated.id ? updated : m));
      if(this.isFirebaseInitialized) update(ref(this.db, 'paymentMethods/' + updated.id), this.cleanData(updated)).catch(err => console.warn(err.message));
  }

  deletePaymentMethod(id: string) {
      this.paymentMethods.update(m => m.filter(x => x.id !== id));
      if(this.isFirebaseInitialized) remove(ref(this.db, 'paymentMethods/' + id)).catch(err => console.warn(err.message));
  }

  // --- HELPERS ---

  private safeSetItem(key: string, value: any) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
  }

  private loadFromStorage(key: string, defaultValue: any) {
      try {
          const stored = localStorage.getItem(key);
          return stored ? JSON.parse(stored) : defaultValue;
      } catch (e) {
          return defaultValue;
      }
  }

  // RECOVERED: Default Content Generator for 100% Data Availability
  private generateDefaultReviews(): Review[] {
    return [
        { id: 1, user: 'Arif Hossain', avatar: 'https://i.pravatar.cc/150?u=10', rating: 5, comment: 'Product quality is premium as described. Delivery was super fast within Dhaka.', productName: 'Premium Panjabi' },
        { id: 2, user: 'Nusrat Jahan', avatar: 'https://i.pravatar.cc/150?u=20', rating: 4, comment: 'Packaging was excellent. The color matches the picture 100%.', productName: 'Silk Saree' },
        { id: 3, user: 'Tanvir Ahmed', avatar: 'https://i.pravatar.cc/150?u=30', rating: 5, comment: 'Best gadget shop in BD. I got my smartwatch in 2 days.', productName: 'Smart Watch Ultra' },
        { id: 4, user: 'Rubina Akter', avatar: 'https://i.pravatar.cc/150?u=40', rating: 5, comment: 'Highly recommended! Will order again soon.', productName: 'Ladies Bag' }
    ];
  }

  private generateDefaultBlogs(): BlogPost[] {
    return [
        { id: 1, title: 'Grand Eid Sale is Live!', image: 'https://picsum.photos/id/20/600/400', excerpt: 'Enjoy up to 50% discount on all Panjabi and Saree collections this Eid.', date: '12 Oct 2024', isVisible: true },
        { id: 2, title: 'New Payment Partners', image: 'https://picsum.photos/id/24/600/400', excerpt: 'We have officially partnered with bKash and Nagad for seamless payments.', date: '08 Oct 2024', isVisible: true },
        { id: 3, title: 'Winter Collection 2024', image: 'https://picsum.photos/id/26/600/400', excerpt: 'Get up to 50% off on all winter jackets and hoodies.', date: '01 Oct 2024', isVisible: true }
    ];
  }

  private generateDefaultPaymentMethods(): PaymentMethod[] {
    return [
        { 
            id: 'bkash', 
            name: 'bKash', 
            logo: 'https://freepnglogo.com/images/all_img/1701594910bkash-logo-transparent.png', 
            number: '01700000000', 
            isVisible: true 
        },
        { 
            id: 'nagad', 
            name: 'Nagad', 
            logo: 'https://freepnglogo.com/images/all_img/1679248787nagad-logo.png', 
            number: '01700000000', 
            isVisible: true 
        },
        {
            id: 'rocket',
            name: 'Rocket',
            logo: 'https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png',
            number: '01700000000',
            isVisible: true
        },
        {
            id: 'usdt',
            name: 'USDT (TRC20)',
            logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=029',
            number: 'TMJ7...WalletAddress',
            isVisible: true
        }
    ];
  }

  private generateDefaultUsers(): User[] {
    return [
        { email: 'admin@luxemart.bd', password: '123', firstName: 'Super', lastName: 'Admin', phone: '01700000000', addresses: ['Dhaka'], isAdmin: true, isBanned: false, joinedDate: new Date().toISOString() },
        { email: 'customer@test.com', password: '123', firstName: 'Rahim', lastName: 'Customer', phone: '01800000000', addresses: ['Chittagong'], isAdmin: false, isBanned: false, joinedDate: new Date().toISOString() }
    ];
  }

  private getDefaultSettings(): AdminSettings {
      return {
          appName: 'LuxeMart',
          appLogo: '', 
          themeColor: '#059669', 
          adminDarkMode: true, 
          heroSlides: [
            { id: 1, image: 'https://picsum.photos/id/6/1200/600', isVisible: true },
            { id: 2, image: 'https://picsum.photos/id/21/1200/600', isVisible: true }
          ],
          showBuyButton: true,
          showAddToCartButton: true,
          announcementText: 'Welcome to LuxeMart!',
          serviceStrips: [
              { id: 1, title: 'Fast Delivery', subtitle: 'All over Bangladesh', icon: 'truck', isVisible: true },
              { id: 2, title: '100% Authentic', subtitle: 'Original Products', icon: 'check', isVisible: true },
              { id: 3, title: 'Payment Secure', subtitle: 'Cash on Delivery', icon: 'cash', isVisible: true },
              { id: 4, title: '24/7 Support', subtitle: 'Always Online', icon: 'support', isVisible: true }
          ],
          hiddenCategories: [],
          homeProductLimit: 20,
          categoryLimit: 20,
          partners: [],
          partnershipPlatforms: [
              { id: 1, title: 'Alibaba Group', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Alibaba-Group-Logo.svg/1200px-Alibaba-Group-Logo.svg.png', url: 'https://www.alibaba.com' },
              { id: 2, title: 'Daraz', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Daraz_Logo.png/640px-Daraz_Logo.png', url: 'https://www.daraz.com.bd' }
          ],
          productSocialLinks: {
              whatsapp: { platform: 'WhatsApp', url: 'https://wa.me/8801700000000', icon: '', isEnabled: true },
              facebook: { platform: 'Messenger', url: 'https://m.me/luxemart', icon: '', isEnabled: true }
          },
          privacyPolicy: 'We respect your privacy...',
          terms: 'Terms of service apply...',
          aboutText: 'LuxeMart is Bangladesh\'s premium online shopping destination, offering 100% authentic products with fast delivery nationwide.',
          shippingCost: 120,
          enableCOD: true, 
          contactInfo: {
              phone: '+880 1700-000000',
              email: 'support@luxemart.bd',
              address: 'Dhaka, Bangladesh'
          },
          socialLinks: { 
              facebook: 'https://facebook.com', 
              youtube: 'https://youtube.com', 
              instagram: 'https://instagram.com', 
              twitter: '#',
              telegram: '#',
              tiktok: '#' 
          },
          authConfig: {
              requireEmail: true,
              requirePhone: true,
              showFirstName: true,
              showLastName: true,
              showAddress: true
          }
      };
  }

  private generateProducts(): Product[] {
    const categories = ['Electronics', 'Panjabi', 'Shirt', 'T-Shirt', 'Watches', 'Shoes'];
    const products: Product[] = [];
    
    for (let i = 1; i <= 20; i++) {
      const catIndex = Math.floor(Math.random() * categories.length);
      const category = categories[catIndex];
      let price = Math.floor(Math.random() * (5000 - 300) + 300);
      products.push({
        id: i,
        name: `Premium ${category} Item ${i}`,
        price: price,
        originalPrice: Math.floor(price * 1.3),
        category: category,
        image: `https://picsum.photos/id/${(i + 10) * 2}/400/400`,
        gallery: [],
        rating: 4.5,
        reviews: Math.floor(Math.random() * 50) + 5,
        description: `Authentic ${category} product. Best quality material.`,
        shippingInfo: 'Inside Dhaka: 2-3 Days',
        shippingInsideDhaka: 60,
        shippingOutsideDhaka: 120,
        isNew: i % 5 === 0,
        sale: i % 8 === 0,
        isVerified: i % 4 === 0, 
        views: Math.floor(Math.random() * 5000) + 500,
        sold: Math.floor(Math.random() * 1000) + 50,
        stock: 100,
        isVisible: true,
        badge: i % 3 === 0 ? { text: 'HOT', colorClass: 'bg-red-500' } : undefined,
        stickers: i % 3 === 0 ? ['HOT'] : [],
        sizes: ['M', 'L', 'XL'],
        bundleConfig: { allowDouble: true, doubleDiscount: 5, allowFamily: true, familyDiscount: 10 }
      });
    }
    return products;
  }

  // View Navigation
  setView(view: ViewState) {
    const u = this.currentUser();
    if(u && u.isBanned) {
        this.currentUser.set(null);
        alert('Your account has been banned. You cannot access the site.');
        this.currentView.set('LOGIN');
        return;
    }
    this.currentView.set(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
    if (query.trim().length > 0 && this.currentView() !== 'PRODUCTS' && this.currentView() !== 'ADMIN_DASHBOARD') {
        this.setView('PRODUCTS');
    }
  }

  viewProduct(id: number) { this.selectedProductId.set(id); this.setView('DETAIL'); }

  // Cart (Local Only)
  addToCart(product: Product, quantity = 1, bundle = 'single', priceOverride?: number, sizes: string[] = [], bundleDiscountPercent: number = 0) {
    let finalPrice = priceOverride ?? product.price;
    this.cart.update(items => {
      this.promoDiscount.set(0); 
      return [...items, { ...product, finalPrice, quantity, selectedBundle: bundle, selectedSizes: sizes, badgeDiscount: 0 }];
    });
  }
  removeFromCart(id: number) { this.cart.update(items => items.filter(i => i.id !== id)); }
  updateQuantity(id: number, delta: number) { this.cart.update(items => items.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)); }
  clearCart() { this.cart.set([]); }

  // Auth
  login(email: string, pass: string): boolean {
    // 1. Check Local Users first
    let found = this.users().find(u => u.email === email && u.password === pass);
    
    if (found) {
      if(found.isBanned) return false; 
      this.currentUser.set(found);
      this.setView('HOME');
      return true;
    }
    return false;
  }
  logout() { this.currentUser.set(null); this.setView('LOGIN'); }

  // Wishlist (Local)
  toggleWishlist(productId: number) {
    this.wishlist.update(ids => ids.includes(productId) ? ids.filter(id => id !== productId) : [...ids, productId]);
  }
  isInWishlist(productId: number): boolean { return this.wishlist().includes(productId); }

  // Recovery (Mock Local)
  recoverItem(index: number) { /* Implementation for recover logic if needed */ }
  resetAllData() { localStorage.clear(); location.reload(); }
  moveCategory(index: number, direction: 'left' | 'right') { /* Handled in AdminDashboard local state, finalized in setCategories */ }
}