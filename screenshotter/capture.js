const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\\\Users\\\\KIIT\\\\.gemini\\\\antigravity\\\\brain\\\\d8f501aa-3acd-4100-b402-b0bde850b1ef\\\\artifacts';
const BASE_URL = 'https://apex-intel-nine.vercel.app';

const targets = [
  { url: '/', name: '01_navbar_landing.png' },
  { url: '/e2e-dashboard', name: '02_dashboard.png' },
  { url: '/pricing', name: '03_pricing.png' },
  { url: '/e2e-analyze', name: '04_analysis_flow_analyze.png' },
  { url: '/e2e-waiting', name: '05_analysis_flow_waiting.png' },
  { url: '/e2e-report', name: '06_analysis_flow_completed.png' },
  { url: '/e2e-dashboard', name: '07_dashboard_after_usage.png' },
  { url: '/e2e-reports-library', name: '08_reports_library.png' },
  { url: '/e2e-compare', name: '09_reports_compare.png' },
  { url: '/e2e-admin', name: '10_admin_metrics.png' },
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const target of targets) {
    try {
      console.log("Capturing " + target.url + "...");
      await page.goto(BASE_URL + target.url, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1000));
      const outPath = path.join(ARTIFACTS_DIR, target.name);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log("Saved " + target.name);
    } catch (err) {
      console.error("Failed to capture " + target.url + ":", err);
    }
  }

  await browser.close();
  console.log('All screenshots captured!');
})();
