import { motion } from 'framer-motion';

export function SearchSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.02 }}
          className="rounded-2xl bg-card border border-white/10 overflow-hidden shadow-xl"
        >
          <div className="relative aspect-[2/3] bg-white/5 animate-pulse flex flex-col justify-between p-3">
            <div className="w-12 h-4 rounded bg-white/10" />
            <div className="space-y-2">
              <div className="w-3/4 h-4 rounded bg-white/10" />
              <div className="w-1/2 h-3 rounded bg-white/5" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
