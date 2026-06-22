import { supabase } from '@/lib/supabase';

// Database Service - Synced with Supabase
const STORAGE_KEYS = {
  CONTENT: 'alanis_site_content',
  COURSES: 'alanis_courses',
  PRODUCTS: 'alanis_products',
  WAITLIST: 'alanis_waitlist',
  MEDIA: 'alanis_media',
  MESSAGES: 'alanis_messages',
  BOOKINGS: 'alanis_bookings',
  SETTINGS: 'alanis_settings',
  AUTH: 'alanis_admin_session'
};

// Pre-load Cache synchronously from localStorage for instant rendering
const getCache = (key: string, defaultValue: any) => {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // ignore
    }
  }
  return defaultValue;
};

const saveCache = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize memory state from cache
let contentCache = getCache(STORAGE_KEYS.CONTENT, []);
let productsCache = getCache(STORAGE_KEYS.PRODUCTS, []);
let coursesCache = getCache(STORAGE_KEYS.COURSES, []);
let bookingsCache = getCache(STORAGE_KEYS.BOOKINGS, []);
let messagesCache = getCache(STORAGE_KEYS.MESSAGES, []);
let waitlistCache = getCache(STORAGE_KEYS.WAITLIST, []);
let mediaCache = getCache(STORAGE_KEYS.MEDIA, []);
let settingsCache = getCache(STORAGE_KEYS.SETTINGS, {
  siteName: 'Alanís Salon & Spa',
  contactEmail: 'info@alanissalon.com',
  phone: '713-524-2610',
  address: 'Houston, TX'
});

// Asynchronously sync public data in the background
const syncPublicData = async () => {
  try {
    const { data: contentData } = await supabase.from('site_content').select('*');
    if (contentData) {
      contentCache = contentData;
      saveCache(STORAGE_KEYS.CONTENT, contentCache);
    }

    const { data: productsData } = await supabase.from('products').select('*');
    if (productsData) {
      productsCache = productsData;
      saveCache(STORAGE_KEYS.PRODUCTS, productsCache);
    }

    const { data: coursesData } = await supabase.from('courses').select('*');
    if (coursesData) {
      coursesCache = coursesData;
      saveCache(STORAGE_KEYS.COURSES, coursesCache);
    }

    const { data: settingsData } = await supabase.from('settings').select('*').limit(1).single();
    if (settingsData) {
      settingsCache = settingsData;
      saveCache(STORAGE_KEYS.SETTINGS, settingsCache);
    }
  } catch (err) {
    console.warn('API sync failed, using local cache:', err);
  }
};

// Sync admin/private data if authenticated
const syncAdminData = async () => {
  const session = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!session) return;
  try {
    const { data: waitlistData } = await supabase.from('waitlist').select('*');
    if (waitlistData) {
      waitlistCache = waitlistData;
      saveCache(STORAGE_KEYS.WAITLIST, waitlistCache);
    }

    const { data: mediaData } = await supabase.from('media').select('*');
    if (mediaData) {
      mediaCache = mediaData;
      saveCache(STORAGE_KEYS.MEDIA, mediaCache);
    }

    const { data: messagesData } = await supabase.from('messages').select('*');
    if (messagesData) {
      messagesCache = messagesData;
      saveCache(STORAGE_KEYS.MESSAGES, messagesCache);
    }

    const { data: bookingsData } = await supabase.from('bookings').select('*');
    if (bookingsData) {
      bookingsCache = bookingsData;
      saveCache(STORAGE_KEYS.BOOKINGS, bookingsCache);
    }
  } catch (err) {
    console.warn('Admin API sync failed:', err);
  }
};

// Start background syncing immediately
syncPublicData();
syncAdminData();

export const LocalDB = {
  // Trigger general reload
  sync: async () => {
    await syncPublicData();
    await syncAdminData();
  },

  // --- Content ---
  getContent: (key?: string) => {
    if (key) {
      return contentCache.find((i: any) => i.section_key === key)?.content;
    }
    return contentCache;
  },
  saveContent: async (sectionKey: string, content: any) => {
    const index = contentCache.findIndex((i: any) => i.section_key === sectionKey);
    if (index > -1) {
      contentCache[index].content = content;
    } else {
      contentCache.push({ section_key: sectionKey, content });
    }
    saveCache(STORAGE_KEYS.CONTENT, contentCache);
    
    await supabase.from('site_content').upsert({ section_key: sectionKey, content });
  },

  // --- Products ---
  getProducts: () => {
    return productsCache;
  },
  saveProduct: async (product: any) => {
    const index = productsCache.findIndex((p: any) => p.id === product.id);
    const updated = { ...product };
    if (index > -1) {
      productsCache[index] = updated;
    } else {
      updated.id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      productsCache.push(updated);
    }
    saveCache(STORAGE_KEYS.PRODUCTS, productsCache);

    const { error } = await supabase.from('products').upsert(updated);
    if (error) {
      console.error('Supabase error saving product:', error);
      return { error };
    }
    return { error: null };
  },
  deleteProduct: async (id: string) => {
    productsCache = productsCache.filter((p: any) => p.id !== id);
    saveCache(STORAGE_KEYS.PRODUCTS, productsCache);

    await supabase.from('products').delete().eq('id', id);
  },

  // --- Courses ---
  getCourses: () => {
    return coursesCache;
  },
  getCourseById: (id: string) => {
    return coursesCache.find((c: any) => c.id === id);
  },
  saveCourse: async (course: any) => {
    const index = coursesCache.findIndex((c: any) => c.id === course.id);
    const updated = { ...course };
    if (index > -1) {
      coursesCache[index] = updated;
    } else {
      updated.id = course.id || (Math.random().toString(36).substring(2) + Date.now().toString(36));
      coursesCache.push(updated);
    }
    saveCache(STORAGE_KEYS.COURSES, coursesCache);

    const { error } = await supabase.from('courses').upsert(updated);
    if (error) {
      console.error('Supabase error saving course:', error);
      return { error };
    }
    return { error: null };
  },
  deleteCourse: async (id: string) => {
    coursesCache = coursesCache.filter((c: any) => c.id !== id);
    saveCache(STORAGE_KEYS.COURSES, coursesCache);

    await supabase.from('courses').delete().eq('id', id);
  },

  // --- Waitlist ---
  getWaitlist: () => {
    return waitlistCache;
  },
  addToWaitlist: async (email: string, source: string) => {
    const newItem = { email, source };
    
    // Optimistic UI update
    const cacheItem = { id: Math.random().toString(), email, source, created_at: new Date().toISOString() };
    waitlistCache.push(cacheItem);
    saveCache(STORAGE_KEYS.WAITLIST, waitlistCache);

    await supabase.from('waitlist').insert(newItem);
  },

  // --- Media ---
  getMedia: () => {
    return mediaCache;
  },
  saveMedia: async (file: any) => {
    const newItem = { ...file, id: file.id || (Math.random().toString(36).substring(2) + Date.now().toString(36)) };
    
    mediaCache.push(newItem);
    saveCache(STORAGE_KEYS.MEDIA, mediaCache);

    await supabase.from('media').upsert(newItem);
  },
  deleteMedia: async (id: string) => {
    mediaCache = mediaCache.filter((m: any) => m.id !== id);
    saveCache(STORAGE_KEYS.MEDIA, mediaCache);

    await supabase.from('media').delete().eq('id', id);
  },

  // --- Messages ---
  syncMessages: async () => {
    await syncAdminData();
  },
  getMessages: () => {
    return messagesCache;
  },
  saveMessage: async (msg: any) => {
    const newItem = { ...msg, status: 'new' };
    
    const cacheItem = { ...newItem, id: Math.random().toString(), created_at: new Date().toISOString() };
    messagesCache.push(cacheItem);
    saveCache(STORAGE_KEYS.MESSAGES, messagesCache);

    await supabase.from('messages').insert(newItem);
  },
  updateMessageStatus: async (id: string, status: string) => {
    const index = messagesCache.findIndex((m: any) => m.id === id);
    if (index > -1) {
      messagesCache[index].status = status;
      saveCache(STORAGE_KEYS.MESSAGES, messagesCache);
    }

    await supabase.from('messages').update({ status }).eq('id', id);
  },
  deleteMessage: async (id: string) => {
    messagesCache = messagesCache.filter((m: any) => m.id !== id);
    saveCache(STORAGE_KEYS.MESSAGES, messagesCache);

    await supabase.from('messages').delete().eq('id', id);
  },

  // --- Bookings ---
  getBookings: () => {
    return bookingsCache;
  },
  saveBooking: async (booking: any) => {
    const index = bookingsCache.findIndex((b: any) => b.id === booking.id);
    const updated = { ...booking };
    if (index > -1) {
      bookingsCache[index] = updated;
    } else {
      updated.id = booking.id || (Math.random().toString(36).substring(2) + Date.now().toString(36));
      bookingsCache.push(updated);
    }
    saveCache(STORAGE_KEYS.BOOKINGS, bookingsCache);

    await supabase.from('bookings').upsert(updated);
  },
  deleteBooking: async (id: string) => {
    bookingsCache = bookingsCache.filter((b: any) => b.id !== id);
    saveCache(STORAGE_KEYS.BOOKINGS, bookingsCache);

    await supabase.from('bookings').delete().eq('id', id);
  },

  // --- Settings ---
  getSettings: () => {
    return settingsCache;
  },
  saveSettings: async (settings: any) => {
    settingsCache = settings;
    saveCache(STORAGE_KEYS.SETTINGS, settingsCache);

    await supabase.from('settings').update(settings).eq('id', 1);
  },

  // --- Auth ---
  signUp: async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (error) return { error: error.message };
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || 'Error al registrarse' };
    }
  },
  login: async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      
      if (error) {
        return { data: null, error: error.message };
      }
      
      const session = { user: data.user, isAdmin: true, token: data.session.access_token };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
      
      await syncAdminData();
      return { data: session, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al conectar' };
    }
  },
  getSession: () => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.WAITLIST);
    localStorage.removeItem(STORAGE_KEYS.MEDIA);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    waitlistCache = [];
    mediaCache = [];
    bookingsCache = [];
    messagesCache = [];
  }
};
