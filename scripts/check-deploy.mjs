for(const key of ['CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN']){
  if(!process.env[key])throw new Error(`${key} belum dikonfigurasi di GitHub Actions.`);
}
console.log('Konfigurasi deployment Cloudflare tersedia.');
