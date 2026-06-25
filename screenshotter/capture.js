const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://apex-intel-nine.vercel.app/mock-pricing', { waitUntil: 'networkidle0' });
  
  // Wait a bit just to be safe
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Take screenshot
  const artifactPath = 'C:\\Users\\KIIT\\.gemini\\antigravity\\brain\\d8f501aa-3acd-4100-b402-b0bde850b1ef\\artifacts\\pricing_screenshot.png';
  await page.screenshot({ path: artifactPath, fullPage: false });
  
  console.log('Screenshot saved to', artifactPath);
  await browser.close();
})();
