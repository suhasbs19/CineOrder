import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Cine<span className="text-primary">Order</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Find the perfect watch order for every movie franchise. Never watch out of order again.
            </p>
          </div>

          {/* Franchises */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-light mb-4">
              Popular Franchises
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/franchise/marvel-cinematic-universe" label="Marvel (MCU)" />
              <FooterLink to="/franchise/star-wars" label="Star Wars" />
              <FooterLink to="/franchise/harry-potter" label="Harry Potter" />
              <FooterLink to="/franchise/dc-extended-universe" label="DC Universe" />
              <FooterLink to="/franchise/fast-and-furious" label="Fast & Furious" />
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-light mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/search" label="Explore All" />
              <FooterLink to="/search?type=movie" label="Movies" />
              <FooterLink to="/search?type=series" label="TV Series" />
              <FooterLink to="/dev-diagnostics" label="Developer Diagnostics 🛠️" />
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-light mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/about" label="About" />
              <FooterLink to="/privacy" label="Privacy Policy" />
              <FooterLink to="/terms" label="Terms of Service" />
              <FooterLink to="/contact" label="Contact" />
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            © {currentYear} CineOrder. Made with{' '}
            <Heart className="w-3.5 h-3.5 inline text-primary fill-primary" />{' '}
            for movie lovers.
          </p>
          <p className="text-xs text-muted">
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted hover:text-white transition-colors" aria-label="Twitter">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted hover:text-white transition-colors" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
          </div>
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
        className="text-sm text-muted hover:text-white transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}
