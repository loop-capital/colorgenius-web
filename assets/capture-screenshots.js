const { chromium } = require('playwright');
const path = require('path');

const SCREENS_DIR = path.join(__dirname, 'screens');
const BASE_URL = 'https://colorgenius.co';

const screens = [
  { name: '01-landing', path: '/' },
  { name: '02-login', path: '/login' },
  { name: '03-beta', path: '/beta' },
  { name: '04-dashboard', path: '/dashboard' },
  { name: '05-formula', path: '/formula' },
  { name: '06-inventory', path: '/inventory' },
  { name: '07-clients', path: '/clients' },
  { name: '08-salon', path: '/salon' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  for (const screen of screens) {
    const page = await context.newPage();
    try {
      console.log(`Capturing: ${screen.name} → ${BASE_URL}${screen.path}`);
      await page.goto(`${BASE_URL}${screen.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      // Wait for any animations/lazy loads
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(SCREENS_DIR, `${screen.name}.png`),
        fullPage: true 
      });
      console.log(`  ✅ Saved ${screen.name}.png`);
    } catch (err) {
      console.log(`  ❌ Failed ${screen.name}: ${err.message.slice(0, 100)}`);
    }
    await page.close();
  }

  // Also capture desktop views of key screens
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const desktopScreens = [
    { name: '01-landing-desktop', path: '/' },
    { name: '02-login-desktop', path: '/login' },
  ];

  for (const screen of desktopScreens) {
    const page = await desktopContext.newPage();
    try {
      console.log(`Capturing desktop: ${screen.name}`);
      await page.goto(`${BASE_URL}${screen.path}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await page.waitForTimeout(2000);
      await page.screenshot({ 
        path: path.join(SCREENS_DIR, `${screen.name}.png`),
        fullPage: true 
      });
      console.log(`  ✅ Saved ${screen.name}.png`);
    } catch (err) {
      console.log(`  ❌ Failed ${screen.name}: ${err.message.slice(0, 100)}`);
    }
    await page.close();
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to:', SCREENS_DIR);
})();
