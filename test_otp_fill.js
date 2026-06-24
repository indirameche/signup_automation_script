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

async function testOtpFill() {
  const tempMail = new TempMail();
  const emailAddress = await tempMail.generateEmail();
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to landing page...');
    await page.goto('https://authorized-partner.vercel.app/');
    await page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Join Us Now"), a:has-text("Join Us Now")').first().click();
    await page.waitForTimeout(2000);
    
    console.log('Checking terms checkbox...');
    await page.locator('#remember').click();
    await page.locator('button:has-text("Continue")').click();
    await page.waitForTimeout(2000);
    
    console.log('Filling Form 1...');
    await page.getByPlaceholder('Enter Your First Name').fill('QA_Test');
    await page.getByPlaceholder('Enter Your Last Name').fill('User');
    await page.getByPlaceholder('Enter Your Email Address').fill(emailAddress);
    await page.getByPlaceholder('00-00000000').fill(generateNepalPhoneNumber());
    
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('SecureP@ss123!');
    await passwordInputs.nth(1).fill('SecureP@ss123!');
    await page.locator('button:has-text("Next")').click();
    
    console.log('Waiting for OTP email...');
    const otpCode = await tempMail.waitForOTP();
    console.log(`Extracted OTP: ${otpCode}`);
    
    await page.waitForTimeout(2000);
    
    console.log('Filling OTP input with full 6-digit code...');
    const otpInput = page.locator('input').first();
    await otpInput.fill(otpCode);
    
    await page.screenshot({ path: 'test_otp_filled_single.png' });
    
    console.log('Clicking Verify Code...');
    await page.locator('button:has-text("Verify Code")').click();
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'test_form2_transition.png' });
    console.log('Current page URL after verify:', page.url());
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

testOtpFill();
