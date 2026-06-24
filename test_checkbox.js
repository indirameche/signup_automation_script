import { chromium } from 'playwright';

async function testCheckbox() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to landing page...');
    await page.goto('https://authorized-partner.vercel.app/');
    
    await page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Join Us Now"), a:has-text("Join Us Now")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('Clicking the checkbox button (#remember)...');
    await page.locator('#remember').click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test_checked.png' });
    
    console.log('Clicking the Continue button...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test_form1.png' });
    
    const formHTML = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      return main.innerHTML;
    });
    
    console.log('Form 1 page HTML content:');
    console.log(formHTML);
    console.log('End of Form 1 content.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

testCheckbox();
