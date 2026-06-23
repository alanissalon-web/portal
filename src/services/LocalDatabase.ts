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

  // Helper to ensure curriculum and topics are parsed as arrays
  parseCourseFields: (course: any) => {
    if (!course) return course;
    const parsed = { ...course };
    if (typeof parsed.curriculum === 'string') {
      try {
        parsed.curriculum = JSON.parse(parsed.curriculum);
      } catch (e) {
        parsed.curriculum = [];
      }
    }
    if (!Array.isArray(parsed.curriculum)) {
      parsed.curriculum = [];
    }

    if (typeof parsed.topics === 'string') {
      try {
        // Try parsing as JSON array first
        const parsedTopics = JSON.parse(parsed.topics);
        parsed.topics = Array.isArray(parsedTopics) ? parsedTopics : [];
      } catch (e) {
        // Fallback to comma separated string
        parsed.topics = parsed.topics.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    if (!Array.isArray(parsed.topics)) {
      parsed.topics = [];
    }
    return parsed;
  },

  // --- Courses ---
  getCourses: async () => {
    const { data } = await supabase.from('courses').select('*');
    const parsedData = (data || []).map(c => LocalDB.parseCourseFields(c));
    return { data: parsedData, error: null };
  },
  getCourseById: async (id: string) => {
    const { data } = await supabase.from('courses').select('*').eq('id', id).single();
    const parsedData = data ? LocalDB.parseCourseFields(data) : null;
    return { data: parsedData, error: null };
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
    const newItem = { 
      ...msg, 
      id: msg.id || (Math.random().toString(36).substring(2) + Date.now().toString(36)),
      status: msg.status || 'new' 
    };
    const { error } = await supabase.from('messages').upsert(newItem);
    if (error) console.error('Error saving message:', error);
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

  // --- Enrollments (Student Portal) ---
  getStudentEnrollments: async (userId: string) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching enrollments:', error);
      return { data: [], error };
    }
    return { data: data.map(e => e.course_id), error: null };
  },

  enrollStudentInCourse: async (userId: string, courseId: string) => {
    const { error } = await supabase
      .from('enrollments')
      .insert({ user_id: userId, course_id: courseId });
    if (error && error.code !== '23505') { // 23505 is unique constraint violation (already enrolled)
      console.error('Error enrolling student:', error);
      return { error };
    }
    return { error: null };
  },

  checkEnrollment: async (userId: string, courseId: string) => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    if (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
    return !!data;
  },

  // --- Shop Reserves & Favorites ---
  reserveProducts: async (userId: string, items: { product: any; quantity: number }[]) => {
    const promises = items.map(item => {
      return supabase.from('product_reservations').insert({
        user_id: userId,
        product_id: item.product.id,
        status: 'pending'
      });
    });
    const results = await Promise.all(promises);
    const failed = results.find(r => r.error);
    if (failed) {
      console.error('Error creating product reservation:', failed.error);
      return { error: failed.error };
    }
    return { error: null };
  },

  savePurchaseIntent: async (userId: string, productId: string) => {
    // Check if an intent already exists for this product and user
    const { data: existing } = await supabase
      .from('product_reservations')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('status', 'intent')
      .maybeSingle();

    if (existing) {
      return { error: null }; // Already recorded
    }

    const { error } = await supabase.from('product_reservations').insert({
      user_id: userId,
      product_id: productId,
      status: 'intent'
    });
    
    return { error };
  },

  getProductReservations: async (userId: string) => {
    const { data, error } = await supabase
      .from('product_reservations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  toggleFavorite: async (userId: string, productId: string) => {
    const { data } = await supabase
      .from('product_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (data) {
      const { error } = await supabase
        .from('product_favorites')
        .delete()
        .eq('id', data.id);
      return { favorited: false, error };
    } else {
      const { error } = await supabase
        .from('product_favorites')
        .insert({ user_id: userId, product_id: productId });
      return { favorited: true, error };
    }
  },

  toggleCourseFavorite: async (userId: string, courseId: string) => {
    const { data } = await supabase
      .from('course_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (data) {
      const { error } = await supabase
        .from('course_favorites')
        .delete()
        .eq('id', data.id);
      return { favorited: false, error };
    } else {
      const { error } = await supabase
        .from('course_favorites')
        .insert({ user_id: userId, course_id: courseId });
      return { favorited: true, error };
    }
  },

  getCourseFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from('course_favorites')
      .select('course_id')
      .eq('user_id', userId);
    if (error) {
      console.error('Error getting course favorites:', error);
      return { data: [], error };
    }
    return { data: data.map(f => f.course_id), error: null };
  },

  getProductFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from('product_favorites')
      .select('product_id')
      .eq('user_id', userId);
    if (error) {
      return { data: [], error };
    }
    return { data: data.map(e => e.product_id), error: null };
  },



  // --- Blogs ---
  getBlogs: async (onlyPublished = false) => {
    let query = supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (onlyPublished) {
      query = query.eq('status', 'published');
    }
    const { data, error } = await query;
    return { data: data || [], error };
  },
  getBlogBySlug: async (slug: string) => {
    const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
    return { data, error };
  },
  saveBlog: async (blog: any) => {
    // Si no tiene slug, generarlo desde el título
    if (!blog.slug && blog.title) {
      blog.slug = blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    // Si es actualización
    if (blog.id) {
      blog.updated_at = new Date().toISOString();
      const { error } = await supabase.from('blogs').update(blog).eq('id', blog.id);
      return { error };
    } else {
      // Es nuevo
      const { error } = await supabase.from('blogs').insert(blog);
      return { error };
    }
  },
  deleteBlog: async (id: string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};
