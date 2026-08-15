-- ╔══════════════════════════════════════════════════════════════╗
-- ║  CineOrder — Supabase Seed Script (14 Complete Franchises)  ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── 1. Insert 14 Franchises (No Godzilla Placeholders) ────────

INSERT INTO public.franchises (id, name, slug, description, poster_url, banner_url, tmdb_collection_id, total_movies, total_series, total_runtime, status) VALUES
  (
    'marvel-cinematic-universe',
    'Marvel Cinematic Universe',
    'marvel-cinematic-universe',
    'The Marvel Cinematic Universe is an interconnected series of films and television series produced by Marvel Studios. Following the mythical Super Heroes of Marvel Comics, the franchise spans from Iron Man (2008) to the Multiverse Saga and beyond.',
    'https://image.tmdb.org/t/p/w500/v7XZTuSWGmX5GI32OmpD47zMokl.jpg',
    'https://image.tmdb.org/t/p/w1280/7RyHsO4yKYtUsAwmN1ddWTXBWpu.jpg',
    NULL,
    33, 10, 12240, 'active'
  ),
  (
    'star-wars',
    'Star Wars',
    'star-wars',
    'Star Wars is an epic space opera franchise created by George Lucas. The saga follows the conflict between the Galactic Empire and the Rebel Alliance, the rise and fall of the Jedi, and the struggle between the light and dark sides of the Force.',
    'https://image.tmdb.org/t/p/w500/iL8bKkL4b9Wj1QZzW90WnJqQe3a.jpg',
    'https://image.tmdb.org/t/p/w1280/d8duYyyC9J5T825Hg7grmaabfxQ.jpg',
    10,
    11, 6, 4080, 'active'
  ),
  (
    'harry-potter',
    'Wizarding World (Harry Potter)',
    'harry-potter',
    'The Wizarding World franchise began with Harry Potter, following a young wizard''s journey through Hogwarts School of Witchcraft and Wizardry. Expanded with Fantastic Beasts prequels exploring the magical world''s past.',
    'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
    'https://image.tmdb.org/t/p/w1280/hziiv14OpD73u9gAak4XDDfBKa2.jpg',
    1241,
    11, 1, 1620, 'active'
  ),
  (
    'dc-extended-universe',
    'DC Universe',
    'dc-extended-universe',
    'The DC Universe (DCU) features iconic superheroes including Batman, Superman, and Wonder Woman. From the DCEU to the new DCU under James Gunn, these interconnected stories explore the greatest heroes and villains of DC Comics.',
    'https://image.tmdb.org/t/p/w500/69WJIEsVZrjOqcjEBgzFCbcByV7.jpg',
    'https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmPp1m2YMDNkGo8.jpg',
    NULL,
    15, 3, 2340, 'active'
  ),
  (
    'the-conjuring-universe',
    'The Conjuring Universe',
    'the-conjuring-universe',
    'The Conjuring Universe is a horror franchise centered on the cases of real-life paranormal investigators Ed and Lorraine Warren. Spanning multiple spin-off series including Annabelle, The Nun, and The Curse of La Llorona.',
    'https://image.tmdb.org/t/p/w500/wVYREutTvI2tmxr6ujrHT704wGF.jpg',
    'https://image.tmdb.org/t/p/w1280/bHRr0Wk50UDLi0FRcvSuVlS4kn0.jpg',
    549339,
    8, 0, 840, 'active'
  ),
  (
    'fast-and-furious',
    'Fast & Furious',
    'fast-and-furious',
    'The Fast & Furious franchise follows Dominic Toretto and his crew through high-speed heists, international espionage, and family bonds. Starting from street racing in Los Angeles, the saga has evolved into a global action spectacle.',
    'https://image.tmdb.org/t/p/w500/lgCEntS9mHagxdL5hb3qaV49YTd.jpg',
    'https://image.tmdb.org/t/p/w1280/xXHZeb1yhJvnSHPzZDqee0zfMb6.jpg',
    9485,
    11, 1, 1380, 'active'
  ),
  (
    'john-wick',
    'John Wick',
    'john-wick',
    'The John Wick series follows legendary hitman John Wick as he is pulled back into the criminal underworld. Known for its intricate world-building of assassin society and groundbreaking action choreography.',
    'https://image.tmdb.org/t/p/w500/wF6DBo4cEoAGwYKEFmtWvERFCLn.jpg',
    'https://image.tmdb.org/t/p/w1280/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg',
    404609,
    4, 1, 540, 'active'
  ),
  (
    'mission-impossible',
    'Mission: Impossible',
    'mission-impossible',
    'The Mission: Impossible franchise follows IMF agent Ethan Hunt through increasingly dangerous and impossible missions to protect the world from global threats. Known for its breathtaking practical stunts and action sequences.',
    'https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
    'https://image.tmdb.org/t/p/w1280/628Dep6AxEtDxjZoGP78TsOxYbK.jpg',
    87359,
    8, 0, 960, 'active'
  ),
  (
    'x-men',
    'X-Men',
    'x-men',
    'The X-Men franchise follows Marvel''s mutant superheroes as they fight for coexistence between humans and mutants. Spanning original trilogy, prequels, and spin-offs featuring Wolverine and Deadpool.',
    'https://image.tmdb.org/t/p/w500/jFfsNElbr0jFJUkSIfaFRfRONVi.jpg',
    'https://image.tmdb.org/t/p/w1280/fq3DSw74fAodrbLiSv0BW1FiUoq.jpg',
    32264,
    13, 2, 1740, 'completed'
  ),
  (
    'jurassic-park',
    'Jurassic Park / World',
    'jurassic-park',
    'The Jurassic Park franchise explores the consequences of genetic engineering and the resurrection of dinosaurs. From the original island theme park disaster to the global implications of dinosaurs in the modern world.',
    'https://image.tmdb.org/t/p/w500/b8gfKVYREt0VcC84N1gWeONgNq8.jpg',
    'https://image.tmdb.org/t/p/w1280/aQ1ritm5CXBqFfNsMx9HoV0Ewrl.jpg',
    328,
    6, 1, 780, 'active'
  ),
  (
    'pirates-of-the-caribbean',
    'Pirates of the Caribbean',
    'pirates-of-the-caribbean',
    'Follow Captain Jack Sparrow through supernatural adventures across the seven seas. A swashbuckling franchise mixing pirate lore, undead curses, and the mysteries of the deep.',
    'https://image.tmdb.org/t/p/w500/z8onk7LV9Mmw6zKz4JT6yqbig56.jpg',
    'https://image.tmdb.org/t/p/w1280/5bdHjmGH5csCWyTE8sTcG2JJcpP.jpg',
    295,
    5, 0, 680, 'active'
  ),
  (
    'transformers',
    'Transformers',
    'transformers',
    'The Transformers cinematic universe follows the ancient war between Autobots and Decepticons taking place on Earth. Spanning live-action blockbusters, spin-offs like Bumblebee, and animated prequels.',
    'https://image.tmdb.org/t/p/w500/6yN7L1e3nNuZgRpsCtdb7HjE4h.jpg',
    'https://image.tmdb.org/t/p/w1280/8N5Gvvevd6B3QW4F1aZ23t7Dkng.jpg',
    11739,
    7, 2, 960, 'active'
  ),
  (
    'lord-of-the-rings',
    'Lord of the Rings / Middle-earth',
    'lord-of-the-rings',
    'J.R.R. Tolkien''s epic fantasy brought to life by Peter Jackson. Follow hobbits, elves, dwarves, and men in their quest to destroy the One Ring and defeat the Dark Lord Sauron in Middle-earth.',
    'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    'https://image.tmdb.org/t/p/w1280/vRQnzOn4HjIMX4LBq9nHhFXbsSu.jpg',
    119,
    6, 1, 1200, 'active'
  ),
  (
    'the-hobbit',
    'The Hobbit',
    'the-hobbit',
    'Peter Jackson''s epic trilogy prequel to The Lord of the Rings, following Bilbo Baggins as he is swept into an epic quest to reclaim the Erebor Dwarf Kingdom from the fearsome dragon Smaug.',
    'https://image.tmdb.org/t/p/w500/xRzTgeZzNgu0Hss2N1F17W0eNef.jpg',
    'https://image.tmdb.org/t/p/w1280/h9SBRw5wX8xKngpBw2r3Pww9B6M.jpg',
    121938,
    3, 0, 480, 'completed'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  banner_url = EXCLUDED.banner_url,
  tmdb_collection_id = EXCLUDED.tmdb_collection_id,
  total_movies = EXCLUDED.total_movies,
  total_series = EXCLUDED.total_series,
  total_runtime = EXCLUDED.total_runtime,
  status = EXCLUDED.status;
