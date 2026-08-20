import { Link } from 'react-router-dom';
import { Film, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 border-t border-white/5 mt-8 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {/* Brand */}
          <div className="space-y-1.5 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-md flex items-center justify-center">
                <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold">
                Cine<span className="text-primary">Order</span>
              </span>
            </Link>
            <p className="text-[11px] sm:text-xs text-muted leading-relaxed max-w-sm">
              Find the perfect watch order for every movie franchise. Never watch out of order again.
            </p>
          </div>

          {/* Navigation Links (2 columns on mobile & desktop) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:col-span-2">
            {/* Popular Franchises */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white mb-1.5 sm:mb-2.5">
                Popular Franchises
              </h3>
              <ul className="space-y-1 sm:space-y-1.5">
                <FooterLink to="/franchise/marvel-cinematic-universe" label="Marvel (MCU)" />
                <FooterLink to="/franchise/star-wars" label="Star Wars" />
                <FooterLink to="/franchise/harry-potter" label="Harry Potter" />
                <FooterLink to="/franchise/dc-extended-universe" label="DC Universe" />
                <FooterLink to="/franchise/fast-and-furious" label="Fast & Furious" />
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white mb-1.5 sm:mb-2.5">
                Resources
              </h3>
              <ul className="space-y-1 sm:space-y-1.5">
                <FooterLink to="/search" label="Explore All" />
                <FooterLink to="/search?type=movie" label="Movies" />
                <FooterLink to="/search?type=series" label="TV Series" />
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs text-muted">
            © {currentYear} CineOrder. Made with{' '}
            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 inline text-primary fill-primary" />{' '}
            for movie lovers.
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted/70">
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="text-[11px] sm:text-xs text-muted hover:text-white transition-colors py-0.5 inline-block"
      >
        {label}
      </Link>
    </li>
  );
}
