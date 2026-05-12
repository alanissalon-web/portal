## Admin Panel - Implementation Plan

### Phase 1: Database Setup
Create tables for dynamic content:
- **courses** — title, description, price, image_url, type (on-demand/live), duration, level, topics, meet_link, status (draft/published), badge
- **products** — name, brand, price, image_url, category, description, rating, badge, stock, status
- **site_content** — section_key, content (JSONB), for editable text blocks
- **user_roles** — user_id, role (admin) with security definer function

### Phase 2: Authentication
- Admin login page at `/admin/login`
- Protected admin routes
- Single admin role check via `has_role()` function

### Phase 3: Admin Dashboard (`/admin`)
- Overview with quick stats (courses, products, waitlist count)
- Sidebar navigation

### Phase 4: Academy Management (`/admin/courses`)
- List all courses with status badges
- Create/edit course form: title, description, price, image, topics, Meet/Zoom link, duration, level
- Toggle publish/draft
- View waitlist emails

### Phase 5: Shop Management (`/admin/products`)
- List all products with filters
- Create/edit product form: name, brand, price, category, image, description, stock
- Toggle active/inactive

### Phase 6: Site Content Editor (`/admin/content`)
- Edit hero text, about section, team bios
- Simple WYSIWYG-style fields

### Tech Stack
- Lovable Cloud (Supabase) for DB + Auth + Storage
- React admin pages with shadcn components
- RLS policies for secure admin-only access
