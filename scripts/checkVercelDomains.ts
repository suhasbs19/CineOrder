async function check() {
  const urls = [
    'https://order.vercel.app',
    'https://cineorder.vercel.app',
    'https://cine-order.vercel.app',
    'https://cineorder-git-main-suhasbs19.vercel.app',
    'https://cine-order-git-main-suhasbs19.vercel.app'
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`URL: ${u}`);
      console.log(`  Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      console.log(`  Title: "${titleMatch ? titleMatch[1] : 'No title'}"`);
      console.log(`  Snippet: ${text.slice(0, 120).replace(/\s+/g, ' ')}\n`);
    } catch (e: any) {
      console.log(`URL: ${u} => Error: ${e.message}\n`);
    }
  }
}

check();
