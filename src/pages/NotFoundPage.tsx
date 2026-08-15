import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Home, Search, Film } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found — CineOrder</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="relative mb-8"
          >
            <span className="text-[150px] sm:text-[200px] font-black text-white/5 select-none leading-none">
              404
            </span>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Film className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
          </motion.div>

          <h1 className="text-3xl font-bold mb-3">Scene Not Found</h1>
          <p className="text-muted-light mb-8">
            Looks like this scene was cut from the final release. Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button leftIcon={<Home className="w-4 h-4" />} size="lg">
                Go Home
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="secondary" leftIcon={<Search className="w-4 h-4" />} size="lg">
                Search Franchises
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
