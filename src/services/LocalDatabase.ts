import { supabase } from '@/lib/supabase';

// Database Service - Synced with Supabase (No local cache)

const STORAGE_KEYS = {
  AUTH: 'alanis_admin_session'
};

export const LocalDB = {
  // Trigger general reload (deprecated, kept for compatibility if needed elsewhere, but no-op)
  sync: async () => {
    return Promise.resolve();
  },

  // --- Content ---
  getContent: async (key?: string) => {
    if (key) {
      const { data } = await supabase.from('site_content').select('*').eq('section_key', key).single();
      return data?.content;
    }
    const { data } = await supabase.from('site_content').select('*');
    return data || [];
  },
  saveContent: async (sectionKey: string, content: any) => {
    const { error } = await supabase.from('site_content').upsert({ section_key: sectionKey, content });
    return { error };
  },

  // --- Products ---
  getProducts: async () => {
    const { data } = await supabase.from('products').select('*');
    return { data: data || [], error: null };
  },
  saveProduct: async (product: any) => {
    const updated = { ...product };
    if (!updated.id) {
      updated.id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    const { error } = await supabase.from('products').upsert(updated);
    if (error) {
      console.error('Supabase error saving product:', error);
      return { error };
    }
    return { error: null };
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return { error };
  },

  // --- Courses ---
  getCourses: async () => {
    const { data } = await supabase.from('courses').select('*');
    return { data: data || [], error: null };
  },
  getCourseById: async (id: string) => {
    const { data } = await supabase.from('courses').select('*').eq('id', id).single();
    return { data, error: null };
  },
  // Save a course, ensuring complex fields are correctly formatted for Supabase
  saveCourse: async (course: any) => {
    // Clone and ensure an ID exists
    const updated: any = { ...course };
    if (!updated.id) {
      updated.id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    // Supabase expects JSON columns to receive plain objects, but if the column is TEXT we stringify
    // Convert curriculum (array of objects) and topics (array of strings) to JSON strings if needed
    if (Array.isArray(updated.curriculum)) {
      // If the column type is JSONB, this is fine; if it's TEXT, stringify
      updated.curriculum = JSON.stringify(updated.curriculum);
    }
    if (Array.isArray(updated.topics)) {
      updated.topics = JSON.stringify(updated.topics);
    }
    // Remove next_date because it does not exist as a column in the Supabase 'courses' table
    delete updated.next_date;

    // Ensure badge is null when empty
    if (updated.badge === '') updated.badge = null;
    // Upsert the record
    const { error } = await supabase.from('courses').upsert(updated);
    if (error) {
      console.error('Supabase error saving course:', error);
      return { error };
    }
    return { error: null };
  },
  deleteCourse: async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);
    return { error };
  },

  // --- Waitlist ---
  getWaitlist: async () => {
    const { data } = await supabase.from('waitlist').select('*');
    return { data: data || [], error: null };
  },
  addToWaitlist: async (email: string, source: string) => {
    const newItem = { email, source };
    const { error } = await supabase.from('waitlist').insert(newItem);
    return { error };
  },

  // --- Media ---
  getMedia: async () => {
    const { data } = await supabase.from('media').select('*');
    return { data: data || [], error: null };
  },
  saveMedia: async (file: any) => {
    const newItem = { ...file, id: file.id || (Math.random().toString(36).substring(2) + Date.now().toString(36)) };
    const { error } = await supabase.from('media').upsert(newItem);
    return { error };
  },
  deleteMedia: async (id: string) => {
    const { error } = await supabase.from('media').delete().eq('id', id);
    return { error };
  },

  // --- Messages ---
  syncMessages: async () => {
    // No-op
  },
  getMessages: async () => {
    const { data } = await supabase.from('messages').select('*');
    return { data: data || [], error: null };
  },
  saveMessage: async (msg: any) => {
    const newItem = { ...msg, status: 'new' };
    const { error } = await supabase.from('messages').insert(newItem);
    return { error };
  },
  updateMessageStatus: async (id: string, status: string) => {
    const { error } = await supabase.from('messages').update({ status }).eq('id', id);
    return { error };
  },
  deleteMessage: async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    return { error };
  },

  // --- Bookings ---
  getBookings: async () => {
    const { data } = await supabase.from('bookings').select('*');
    return { data: data || [], error: null };
  },
  saveBooking: async (booking: any) => {
    const updated = { ...booking };
    if (!updated.id) {
      updated.id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    const { error } = await supabase.from('bookings').upsert(updated);
    return { error };
  },
  deleteBooking: async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    return { error };
  },

  // --- Settings ---
  getSettings: async () => {
    const { data } = await supabase.from('settings').select('*').limit(1).single();
    return { data: data || {
      siteName: 'Alanís Salon & Spa',
      contactEmail: 'info@alanissalon.com',
      phone: '713-524-2610',
      address: 'Houston, TX'
    }, error: null };
  },
  saveSettings: async (settings: any) => {
    const { error } = await supabase.from('settings').update(settings).eq('id', 1);
    return { error };
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
  }
};
