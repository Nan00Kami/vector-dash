/**
 * Authentication and Payment Abstraction Layer
 * Handles local profile persistence, Google / Gmail linking, and monetization webhooks.
 */
class AccountService {
  constructor() {
    this.STORAGE_KEY = 'aetheria_save_v1';
    this.user = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      isGuest: true,
      email: null,
      shards: 3200,      // Premium currency (diamonds)
      tickets: 10,       // Summon tickets
      unlockedIds: [1, 2, 3], // 3 default characters
      pityCount: 0,
      activeTeam: [1, 2, 3]
    };
    this.loadLocal();
  }

  loadLocal() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.user = { ...this.user, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Storage read failed, initializing defaults.");
    }
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.user));
    } catch (e) {
      console.error("Storage save failed", e);
    }
  }

  /**
   * Google / Gmail Sign-in Integration Hook
   * Drop in Firebase Auth, Google Identity Services (GSI), or Supabase Auth here.
   */
  async linkGoogleAccount() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockEmail = prompt("Enter your Gmail address to simulate Google OAuth:", "astral_traveler@gmail.com");
        if (mockEmail && mockEmail.includes('@')) {
          this.user.email = mockEmail;
          this.user.isGuest = false;
          this.user.uid = 'goog_' + btoa(mockEmail).substring(0, 10);
          this.save();
          resolve({ success: true, user: this.user });
        } else {
          resolve({ success: false });
        }
      }, 300);
    });
  }

  /**
   * In-App Purchases (IAP) & Stripe Checkout Hook
   */
  async triggerPurchase(packageId) {
    // Ready for Stripe Payment Links, Razorpay, or Google Play Web Billing
    console.log(`[IAP Engine] Initializing checkout flow for: ${packageId}`);
    return new Promise((resolve) => {
      const confirmed = confirm(`Confirm simulated purchase: 1,600 Astral Shards ($9.99)?`);
      if (confirmed) {
        this.user.shards += 1600;
        this.save();
        resolve({ success: true, newBalance: this.user.shards });
      } else {
        resolve({ success: false });
      }
    });
  }
}

window.accountService = new AccountService();
