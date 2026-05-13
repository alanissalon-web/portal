// Local Database Service - 100% Free & Offline
const STORAGE_KEYS = {
  CONTENT: 'alanis_site_content',
  COURSES: 'alanis_courses',
  PRODUCTS: 'alanis_products',
  WAITLIST: 'alanis_waitlist',
  AUTH: 'alanis_admin_session'
};

// Initial Data to seed the local database
const INITIAL_CONTENT = [
  { section_key: 'hero', content: { title: 'Elevate your hair, elevate your soul', subtitle: 'Experience luxury hair care and styling at Houston\'s premier salon.' } },
  { section_key: 'services', content: { badge: 'Our Services', title: 'Every service, a premium experience' } },
];

export const LocalDB = {
  // --- Content Management ---
  getContent: () => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTENT);
    return data ? JSON.parse(data) : INITIAL_CONTENT;
  },
  saveContent: (sectionKey: string, content: any) => {
    const current = LocalDB.getContent();
    const index = current.findIndex((i: any) => i.section_key === sectionKey);
    if (index > -1) {
      current[index].content = content;
    } else {
      current.push({ section_key: sectionKey, content });
    }
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(current));
  },

  // --- Courses Management ---
  getCourses: () => {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    return data ? JSON.parse(data) : [];
  },
  saveCourse: (course: any) => {
    const courses = LocalDB.getCourses();
    if (course.id) {
      const index = courses.findIndex((c: any) => c.id === course.id);
      courses[index] = course;
    } else {
      courses.push({ ...course, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },
  deleteCourse: (id: string) => {
    const courses = LocalDB.getCourses().filter((c: any) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  // --- Products Management ---
  getProducts: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProduct: (product: any) => {
    const products = LocalDB.getProducts();
    if (product.id) {
      const index = products.findIndex((p: any) => p.id === product.id);
      products[index] = product;
    } else {
      products.push({ ...product, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  deleteProduct: (id: string) => {
    const products = LocalDB.getProducts().filter((p: any) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // --- Waitlist ---
  getWaitlist: () => {
    const data = localStorage.getItem(STORAGE_KEYS.WAITLIST);
    return data ? JSON.parse(data) : [];
  },
  addToWaitlist: (email: string, source: string) => {
    const waitlist = LocalDB.getWaitlist();
    waitlist.push({ id: crypto.randomUUID(), email, source, created_at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
  },

  // --- Auth ---
  login: (email: string, pass: string) => {
    if (email === 'admin@alanissalon.com' && pass === 'admin123') {
      const session = { user: { email }, isAdmin: true, token: 'local-token-abc-123' };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(session));
      return { data: session, error: null };
    }
    return { data: null, error: 'Credenciales inválidas' };
  },
  getSession: () => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};
