// Local Database Service - 100% Free & Offline
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

// Initial Data to seed the local database
const INITIAL_CONTENT = [
  { 
    section_key: 'hero', 
    content: { 
      title: 'Expertos en Extensiones y Cuidado Capilar de Lujo', 
      subtitle: 'Transformamos tu cabello con las mejores técnicas del mundo. Especialistas en extensiones de queratina y balayage avanzado en Houston, TX.',
      cta_text: 'Reservar Cita'
    } 
  },
  { 
    section_key: 'about', 
    content: { 
      title: 'Nuestra Filosofía', 
      description: 'En Alanís Salon & Spa, creemos que tu cabello es el reflejo de tu alma. Liderados por Rosie Alanís, nuestro equipo combina años de experiencia internacional con las técnicas más innovadoras de la industria.',
      mission: 'Nuestra misión es empoderar a cada cliente a través de una transformación personalizada, utilizando solo productos de la más alta gama.'
    } 
  },
  { 
    section_key: 'services', 
    content: { 
      badge: 'Experiencia Alanís', 
      title: 'Servicios Exclusivos para un Cabello Radiante',
      subtitle: 'Desde aplicaciones de extensiones Great Lengths hasta correcciones de color complejas.'
    } 
  },
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const LocalDB = {
  // --- Content Management ---
  getContent: (key?: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.CONTENT);
    const content = data ? JSON.parse(data) : INITIAL_CONTENT;
    if (key) {
      return content.find((i: any) => i.section_key === key)?.content;
    }
    return content;
  },
  saveContent: (sectionKey: string, content: any) => {
    const current = LocalDB.getContent() as any[];
    const index = current.findIndex((i: any) => i.section_key === sectionKey);
    if (index > -1) {
      current[index].content = content;
    } else {
      current.push({ section_key: sectionKey, content });
    }
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(current));
  },

  getCourseById: (id: string) => {
    const courses = LocalDB.getCourses();
    return courses.find((c: any) => c.id === id);
  },

  // --- Products Management ---
  getProducts: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [
      { id: 'p1', name: 'Luxury Repair Shampoo', brand: 'Great Lengths', price: 42, image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80', category: 'Shampoo', description: 'Fórmula sin sulfatos diseñada específicamente para el cuidado de extensiones de queratina.', rating: 5, badge: 'Best Seller', stock: 12, status: 'active' },
      { id: 'p2', name: 'Ultimate Repair Mask', brand: 'Kerastase', price: 68, image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', category: 'Treatment', description: 'Mascarilla intensiva para reconstruir la fibra capilar dañada por procesos químicos.', rating: 5, badge: 'Premium', stock: 8, status: 'active' },
      { id: 'p3', name: 'Gold Lust Oil', brand: 'Oribe', price: 56, image_url: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&q=80', category: 'Treatment', description: 'Aceite nutritivo que aporta brillo instantáneo sin dejar residuos grasos.', rating: 5, stock: 15, status: 'active' },
      { id: 'p4', name: 'Silver Brightening Shampoo', brand: 'Wella Professionals', price: 34, image_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80', category: 'Shampoo', description: 'Elimina tonos amarillentos en cabellos rubios y canosos.', rating: 4, stock: 20, status: 'active' },
      { id: 'p5', name: 'Dry Texturizing Spray', brand: 'Oribe', price: 49, image_url: 'https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600&q=80', category: 'Styling', description: 'El spray favorito de los estilistas para volumen y textura duradera.', rating: 5, badge: 'Iconic', stock: 10, status: 'active' },
      { id: 'p6', name: 'Premium Hair Dryer', brand: 'Dyson', price: 429, image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80', category: 'Productos en Amazon', description: 'Secador de pelo profesional de alta velocidad. Encuéntralo en nuestra tienda oficial de Amazon.', rating: 5, badge: 'Amazon Choice', stock: 0, status: 'active', amazon_url: 'https://amazon.com' },
    ];
  },
  saveProduct: (product: any) => {
    const products = LocalDB.getProducts();
    const index = products.findIndex((p: any) => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push({ ...product, id: generateId() });
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  deleteProduct: (id: string) => {
    const products = LocalDB.getProducts().filter((p: any) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  // --- Academy Management ---
  getCourses: () => {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    return data ? JSON.parse(data) : [
      { 
        id: 'extensions-masterclass', 
        title: 'Master en Extensiones de Queratina', 
        type: 'on-demand', 
        duration: '8 horas', 
        level: 'Intermedio', 
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', 
        description: 'Aprende la técnica de fusión en frío y caliente de Great Lengths.', 
        topics: ['Fusión de Queratina', 'Corte de Mezcla', 'Color Matching'], 
        curriculum: [
          { module: 'Módulo 1', title: 'Introducción a la Queratina', lessons: 3, duration: '1h' },
          { module: 'Módulo 2', title: 'Técnica de Aplicación Paso a Paso', lessons: 5, duration: '3h' },
          { module: 'Módulo 3', title: 'Mantenimiento y Retiro Seguro', lessons: 4, duration: '2h' },
          { module: 'Módulo 4', title: 'Consultoría y Precios', lessons: 2, duration: '1h' }
        ],
        price: 499, 
        badge: 'Certificado', 
        status: 'published',
        access_code: 'ALANIS2024'
      },
      { 
        id: 'color-balayage', 
        title: 'Ciencia del Color y Balayage 2024', 
        type: 'on-demand', 
        duration: '5 horas', 
        level: 'Avanzado', 
        image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80', 
        description: 'Técnicas de difuminado y formulación avanzada para rubios perfectos.', 
        topics: ['Formulación', 'Seccionamiento', 'Tonalización'], 
        curriculum: [
          { module: 'Módulo 1', title: 'Teoría del Color Avanzada', lessons: 4, duration: '1.5h' },
          { module: 'Módulo 2', title: 'Técnicas de Seccionamiento Moderno', lessons: 3, duration: '1h' },
          { module: 'Módulo 3', title: 'Balayage a Mano Alzada', lessons: 6, duration: '2.5h' }
        ],
        price: 299, 
        badge: 'Top Ventas', 
        status: 'published',
        access_code: 'BALAYAGE24'
      },
      { 
        id: 'hair-loss', 
        title: 'Soluciones para la Pérdida de Cabello', 
        type: 'on-demand', 
        duration: '4 horas', 
        level: 'Todos los niveles', 
        image_url: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=600&q=80', 
        description: 'Implementa prótesis capilares y soluciones no quirúrgicas.', 
        topics: ['Análisis de Cuero Cabelludo', 'Micro Point', 'Prótesis'], 
        curriculum: [
          { module: 'Módulo 1', title: 'Análisis Capilar Profesional', lessons: 5, duration: '1h' },
          { module: 'Módulo 2', title: 'Sistemas Volumizadores', lessons: 4, duration: '2h' },
          { module: 'Módulo 3', title: 'Psicología del Cliente y Sensibilidad', lessons: 2, duration: '1h' }
        ],
        price: 199, 
        status: 'published',
        access_code: 'HAIRLOSS'
      },
    ];
  },
  saveCourse: (course: any) => {
    const courses = LocalDB.getCourses();
    const index = courses.findIndex((c: any) => c.id === course.id);
    if (index > -1) {
      courses[index] = course;
    } else {
      courses.push({ ...course, id: course.id || generateId() });
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },
  deleteCourse: (id: string) => {
    const courses = LocalDB.getCourses().filter((c: any) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  // --- Waitlist ---
  getWaitlist: () => {
    const data = localStorage.getItem(STORAGE_KEYS.WAITLIST);
    return data ? JSON.parse(data) : [
      { id: '1', email: 'v.rodriguez@houstonmail.com', source: 'academy', created_at: '2024-05-10T10:00:00Z' },
      { id: '2', email: 'jessica.smith@tx.rr.com', source: 'shop', created_at: '2024-05-11T14:30:00Z' },
      { id: '3', email: 'm.williams@salonowner.org', source: 'academy', created_at: '2024-05-12T09:15:00Z' },
    ];
  },
  addToWaitlist: (email: string, source: string) => {
    const waitlist = LocalDB.getWaitlist();
    waitlist.push({ id: generateId(), email, source, created_at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(waitlist));
  },

  // --- Media Management ---
  getMedia: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    return data ? JSON.parse(data) : [
      { id: '1', name: 'hero-salon-houston.jpg', size: '2.4MB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80' },
      { id: '2', name: 'balayage-technique.jpg', size: '1.1MB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80' },
      { id: '3', name: 'extension-install-detail.jpg', size: '980KB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80' },
      { id: '4', name: 'salon-interior-luxury.jpg', size: '3.2MB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80' },
      { id: '5', name: 'styling-station.jpg', size: '1.5MB', type: 'image/jpeg', url: 'https://images.unsplash.com/photo-1527799822367-a288a7228395?w=800&q=80' },
    ];
  },
  saveMedia: (file: any) => {
    const media = LocalDB.getMedia();
    media.push({ ...file, id: generateId(), created_at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
  },
  deleteMedia: (id: string) => {
    const media = LocalDB.getMedia().filter((m: any) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
  },
  
  // --- Messages/Leads ---
  getMessages: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [
      { id: '1', name: 'Laura Garcia', email: 'l.garcia88@yahoo.com', phone: '+1 713-123-4567', message: 'Hola Rosie, me gustaría agendar una cita para Balayage.', date: 'hace 2 horas', status: 'new', type: 'form' },
      { id: '2', name: 'Laura Garcia', email: 'user@example.com', phone: '', message: '¡Claro que sí! ¿Qué día te gustaría venir?', date: 'hace 1 hora', status: 'read', type: 'chat' },
      { id: '3', name: 'Laura Garcia', email: 'l.garcia88@yahoo.com', phone: '', message: 'El próximo martes a las 4:00 PM si es posible.', date: 'hace 30 min', status: 'new', type: 'chat' },
    ];
  },
  saveMessage: (msg: any) => {
    const msgs = LocalDB.getMessages();
    msgs.push({ ...msg, id: generateId(), status: 'new', created_at: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
  },
  updateMessageStatus: (id: string, status: string) => {
    const msgs = LocalDB.getMessages();
    const index = msgs.findIndex((m: any) => m.id === id);
    if (index > -1) {
      msgs[index].status = status;
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
    }
  },
  deleteMessage: (id: string) => {
    const msgs = LocalDB.getMessages().filter((m: any) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
  },

  // --- Bookings / Appointments ---
  getBookings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [
      { id: 'b1', clientName: 'Ana Martinez', service: 'Keratin Fusion Install', date: '2024-05-15', time: '10:00 AM', status: 'confirmed', email: 'ana.m@gmail.com', phone: '+1 713-524-1010' },
      { id: 'b2', clientName: 'Lucia Sosa', service: 'Color Correction', date: '2024-05-15', time: '02:30 PM', status: 'pending', email: 'lsosa@houstonisd.org', phone: '+1 832-555-9090' },
      { id: 'b3', clientName: 'Katherine Pierce', service: 'Bridal Styling Trial', date: '2024-05-16', time: '09:00 AM', status: 'confirmed', email: 'kpierce@vampire.co', phone: '+1 281-444-2211' },
    ];
  },
  saveBooking: (booking: any) => {
    const bookings = LocalDB.getBookings();
    const index = bookings.findIndex((b: any) => b.id === booking.id);
    if (index > -1) {
      bookings[index] = booking;
    } else {
      bookings.push({ ...booking, id: generateId(), created_at: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },
  deleteBooking: (id: string) => {
    const bookings = LocalDB.getBookings().filter((b: any) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  // --- Settings ---
  getSettings: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      siteName: 'Alanís Salon & Spa',
      contactEmail: 'info@alanissalon.com',
      phone: '713-524-2610',
      address: 'Houston, TX'
    };
  },
  saveSettings: (settings: any) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
