import dns from 'dns';
import https from 'https';

dns.lookup('iknxldrylfsuphaydamr.supabase.co', (err, address) => {
  console.log('DNS lookup for iknxldrylfsuphaydamr.supabase.co:', err ? err.code : address);
});
