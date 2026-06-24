import { chromium } from 'playwright';
import { TempMail } from './temp-mail.js';

function generateNepalPhoneNumber() {
  const prefix = Math.random() < 0.5 ? '98' : '97';
  let rest = '';
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10);
  }
  return prefix + rest;
}

async function testSignupFlow() {
  const tempMail = new TempMail();
  const emailAddress = await tempMail.generateEmail();
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Step 1: Navigating to landing page...');
    await page.goto('https://authorized-partner.vercel.app/');
    
    console.log('Clicking Get Started...');
    await page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Join Us Now"), a:has-text("Join Us Now")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('Step 2: Checking terms checkbox (#remember)...');
    await page.locator('#remember').click();
    await page.waitForTimeout(500);
    
    console.log('Clicking Continue...');
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(2000);
    
    console.log('Step 3: Filling Form 1 (Account Setup)...');
    const firstName = 'QA_Test_First';
    const lastName = 'QA_Test_Last';
    const phoneNum = generateNepalPhoneNumber();
    const password = 'SecureP@ss123!';
    
    await page.getByPlaceholder('Enter Your First Name').fill(firstName);
    await page.getByPlaceholder('Enter Your Last Name').fill(lastName);
    await page.getByPlaceholder('Enter Your Email Address').fill(emailAddress);
    
    await page.getByPlaceholder('00-00000000').fill(phoneNum);
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);
    
    await page.screenshot({ path: 'test_form1_filled.png' });
    
    console.log('Clicking Next...');
    await page.locator('button:has-text("Next")').click();
    
    console.log('Step 4: Waiting for OTP screen...');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'test_otp_screen.png' });
    
    const otpCode = await tempMail.waitForOTP();
    console.log(`Received OTP Code: ${otpCode}`);
    
    const otpHTML = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      return main.innerHTML;
    });
    
    console.log('OTP page HTML content:');
    console.log(otpHTML);
    console.log('End of OTP page content.');
    
  } catch (err) {
    console.error('Error during flow:', err);
  } finally {
    await browser.close();
  }
}

testSignupFlow();
