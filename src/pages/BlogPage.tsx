import { SalonNavbar } from '@/components/SalonNavbar';
import { SalonFooter } from '@/components/SalonFooter';
import salonLoungeImage from '@/assets/salon-lounge-real.jpg';

const BlogPage = () => {
  return (
    <div className="min-h-screen">
      <SalonNavbar />
      {/* Hero banner */}
      <section className="relative pt-40 pb-16 md:pt-56 bg-charcoal overflow-hidden min-h-[40vh] flex items-center">
        <div className="absolute inset-0">
          <img src={salonLoungeImage} alt="Alanís Salon Blog" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="relative z-10 container mx-auto px-6 py-16 text-center">
          <span className="font-body text-xs uppercase tracking-[0.3em] text-accent mb-4 block">Descubre más</span>
          <h1 className="font-display text-5xl md:text-6xl font-light text-primary-foreground mb-4">
            Blog & Consejos
          </h1>
          <p className="font-body text-lg text-primary-foreground/70 max-w-lg mx-auto">
            Tendencias, cuidados del cabello y secretos de expertos.
          </p>
        </div>
      </section>
      
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center py-16 bg-accent/5 rounded-[2.5rem] border border-dashed border-accent/20">
            <h2 className="font-display text-3xl font-medium mb-4">Próximamente</h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto text-lg leading-relaxed">
              Estamos preparando artículos increíbles para ayudarte a cuidar tu cabello en casa. ¡Vuelve pronto!
            </p>
          </div>
        </div>
      </section>

      <SalonFooter />
    </div>
  );
};

export default BlogPage;
