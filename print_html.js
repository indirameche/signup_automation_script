import { chromium } from 'playwright';

async function printHTML() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to landing page...');
    await page.goto('https://authorized-partner.vercel.app/');
    
    await page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Join Us Now"), a:has-text("Join Us Now")').first().click();
    
    await page.waitForTimeout(2000);
    
    const bodyHTML = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      return main.innerHTML;
    });
    
    console.log('Page HTML content:');
    console.log(bodyHTML);
    console.log('End of page content.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

printHTML();
