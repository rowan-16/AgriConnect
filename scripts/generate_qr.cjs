const fs = require('fs');
const path = require('path');
const https = require('https');

const targetUrl = 'https://agri-connect-delta-five.vercel.app/';
const encodedUrl = encodeURIComponent(targetUrl);

const publicDir = path.resolve(__dirname, '../public');
const artifactDir = 'C:\\Users\\rowan\\.gemini\\antigravity-ide\\brain\\8549f7e3-bf93-4dd5-9ef6-2daf32db9918';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(dest);
      });
    }).on('error', reject);
  });
}

async function run() {
  const pngUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodedUrl}&format=png&qzone=2`;
  const svgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodedUrl}&format=svg&qzone=2`;

  const publicPng = path.join(publicDir, 'agri-connect-qr.png');
  const publicSvg = path.join(publicDir, 'agri-connect-qr.svg');
  const artifactPng = path.join(artifactDir, 'agri-connect-qr.png');
  const artifactSvg = path.join(artifactDir, 'agri-connect-qr.svg');

  console.log('Downloading high-res QR code PNG...');
  await downloadFile(pngUrl, publicPng);
  fs.copyFileSync(publicPng, artifactPng);
  console.log('Saved PNG to:', publicPng, 'and artifact:', artifactPng);

  console.log('Downloading vector QR code SVG...');
  await downloadFile(svgUrl, publicSvg);
  fs.copyFileSync(publicSvg, artifactSvg);
  console.log('Saved SVG to:', publicSvg, 'and artifact:', artifactSvg);
}

run().catch(err => {
  console.error('Error downloading QR code:', err);
  process.exit(1);
});
