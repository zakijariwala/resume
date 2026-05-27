// Run before every deploy: node scripts/generate-pdf.js
// Requires: npm install puppeteer --save-dev
// Astro dev server must be running

import puppeteer from 'puppeteer';
import { resolve } from 'path';

(async () => {
  try {
    console.log('Launching headless browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    console.log('Opening local server with recruiter mode...');
    await page.goto('http://localhost:4321?mode=recruiter', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Make sure elements have transitioned and painted
    await new Promise(r => setTimeout(r, 1000));

    const outputPath = resolve('public/resume.pdf');
    console.log('Printing PDF...');
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm'
      },
      printBackground: true
    });

    console.log('PDF generated: public/resume.pdf');
    await browser.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
    process.exit(1);
  }
})();
