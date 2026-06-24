import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { TempMail } from './temp-mail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const randomSuffix = (length = 6) => Math.random().toString(36).substring(2, 2 + length);

function generateNepalPhoneNumber() {
  const prefix = Math.random() < 0.5 ? '98' : '97';
  let rest = '';
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10);
  }
  return prefix + rest;
}

function generatePassword() {
  const capitals = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowers = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specials = '!@#$%^&*()_+';

  const pick = (s) => s[Math.floor(Math.random() * s.length)];

  let pwd = '';
  pwd += pick(capitals);
  pwd += pick(lowers);
  pwd += pick(digits);
  pwd += pick(specials);

  const all = capitals + lowers + digits + specials;
  for (let i = 0; i < 8; i++) pwd += pick(all);

  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

function randomString(length = 10) {
  return Math.random().toString(36).substring(2, 2 + length);
}

async function runAutomation() {
  const dummyPdfPath = path.join(__dirname, 'Nist_1.SP.800-160v1r1.pdf');
  
  console.log('Preparing temporary email...');

  const tempMail = new TempMail();
  const emailAddress = await tempMail.generateEmail();

  console.log('Starting browser automation');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Navigating to landing page...');
    await page.goto('https://authorized-partner.vercel.app/', { waitUntil: 'domcontentloaded' });
    
    await page.screenshot({ path: 'step1_landing.png' });
    
    console.log('Locating Get Started / Join Us Now button...');
    const startButton = page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Join Us Now"), a:has-text("Join Us Now")').first();
    await startButton.click();
    
    console.log('Waiting for Terms of Service page...');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'step2_terms.png' });

    console.log('Checking Terms of Service box...');
    await page.locator('#remember').click();
    
    console.log('Clicking Continue...');
    await page.locator('button:has-text("Continue")').click();

    console.log('Waiting for Account Setup (Form 1) page...');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'step3_form1_account.png' });

    const firstName = `QA_Test_${randomSuffix(4)}`;
    const lastName = `User_${randomSuffix(4)}`;
    const phoneNum = generateNepalPhoneNumber();
    const password = generatePassword();

    console.log(`Filling registration form with generated test data.`);

    await page.getByPlaceholder('Enter Your First Name').fill('Indira');
    await page.getByPlaceholder('Enter Your Last Name').fill('Meche');
    await page.getByPlaceholder('Enter Your Email Address').fill(emailAddress);
    await page.getByPlaceholder('00-00000000').fill(phoneNum);

    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(password);
    await passwordInputs.nth(1).fill(password);

    await page.screenshot({ path: 'step3_form1_filled.png' });

    console.log('Submitting Form 1...');
    await page.locator('button:has-text("Next")').click();

    console.log('Waiting for OTP Verification screen...');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'step4_otp_screen.png' });

    const otpCode = await tempMail.waitForOTP();
    console.log(`Retrieved OTP code: ${otpCode}`);

    await page.waitForTimeout(2000);

    console.log('Entering OTP code into input...');
    await page.locator('input').first().fill(otpCode);

    await page.screenshot({ path: 'step4_otp_filled.png' });

    console.log('Clicking Verify Code...');
    await page.locator('button:has-text("Verify Code")').click();

    console.log('Waiting for Agency Details (Form 2)...');
    await page.waitForTimeout(3000);
    try {
      await page.waitForLoadState('networkidle');
    } catch (e) {
      console.warn('Network still loading after wait, continuing.');
    }
    await page.screenshot({ path: 'step5_form2_agency.png' });

    console.log('Filling Agency Details...');
    await page.waitForTimeout(500);
    await page.getByPlaceholder('Enter Agency Name').fill('Vrit Technologies');
    
    await page.getByPlaceholder('Enter Your Role in Agency').fill('QA');

    await page.getByPlaceholder('Enter Your Agency Email Address').fill('info@vrittechnologies.com');
    await page.getByPlaceholder('Enter Your Agency Website').fill('www.vrittechnologies.com');
    await page.getByPlaceholder('Enter Your Agency Address').fill('Sankhamul');

    console.log('Selecting Nepal region...');
    await page.locator('button:has-text("Select Your Region of Operation"), [role="combobox"]').first().click();
    await page.waitForTimeout(500);
    const nepalOption = page.locator('[role="option"]:has-text("Nepal")').or(page.getByText('Nepal', { exact: true }));
    await nepalOption.first().click();

    await page.screenshot({ path: 'step5_form2_filled.png' });

    console.log('Clicking Next (Form 2)...');
    await page.locator('button:has-text("Next")').click();

    console.log('Waiting for Professional Experience (Form 3)...');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.screenshot({ path: 'step6_form3_experience.png' });

    console.log('Filling Professional Experience...');
    await page.waitForTimeout(500);
    
    const expDropdown = page.locator('button:has-text("Select Your Experience Level")').first();
    if (await expDropdown.count() > 0) {
      await expDropdown.click();
      await page.waitForTimeout(500);
      
      await page.locator('[role="option"]:has-text("1 year")').filter({ visible: true }).first().click();
      await page.waitForTimeout(500);
    }

    await page.locator('input[name="number_of_students_recruited_annually"]').fill('50');
    await page.locator('input[name="focus_area"]').fill('Undergraduate admissions to Canada');
    await page.locator('input[name="success_metrics"]').fill('90');

    console.log('Selecting Services Provided...');
    const services = ['Career Counseling', 'Admission Applications', 'Visa Processing', 'Test Prepration'];
    for (const service of services) {
      const label = page.locator(`label:has-text("${service}")`).first();
      if (await label.count() > 0) {
        await label.click();
        await page.waitForTimeout(100);
      }
    }

    await page.screenshot({ path: 'step6_form3_filled.png' });

    console.log('Clicking Next (Form 3)...');
    await page.locator('button:has-text("Next")').click();

    console.log('Waiting for Verification and Preferences (Form 4)...');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.screenshot({ path: 'step7_form4_verification.png' });

    console.log('Filling Verification Details...');
    await page.locator('input[name="business_registration_number"]').fill(randomString(10).replace(/[^0-9]/g, '9'));

    console.log('Selecting Preferred Countries...');
    const countriesBtn = page.locator('button:has-text("Select Your Preferred Countries")').first();
    if (await countriesBtn.count() > 0) {
      await countriesBtn.click();
      await page.waitForTimeout(500);
      await page.getByText('Australia', { exact: true }).filter({ visible: true }).first().click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    console.log('Selecting institution types...');
    const uniCheckbox = page.locator('label:has-text("Universities")').first();
    if (await uniCheckbox.count() > 0) {
      await uniCheckbox.click();
      await page.waitForTimeout(100);
    }
    const collegeCheckbox = page.locator('label:has-text("Colleges")').first();
    if (await collegeCheckbox.count() > 0) {
      await collegeCheckbox.click();
      await page.waitForTimeout(100);
    }

    const certInput = page.locator('input[name="certification_details"]').first();
    if (await certInput.count() > 0) {
      await certInput.fill('ICEF Certified Agent');
    }

    console.log('Uploading required files...');
    const fileInputs = page.locator('input[type="file"]');
    if (await fileInputs.count() > 0) {
      await fileInputs.nth(0).setInputFiles(dummyPdfPath);
      await page.waitForTimeout(500);
    }
    if (await fileInputs.count() > 1) {
      await fileInputs.nth(1).setInputFiles(dummyPdfPath);
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'step7_form4_filled.png' });
    
    await page.waitForTimeout(1000);

    console.log('Clicking Submit (Form 4)...');
    const submitBtn = page.locator('button[type="submit"]:has-text("Submit")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
    } else {
      console.warn('Submit button not found with standard selectors, trying alternative...');
      await page.locator('button').last().click();
    }

    console.log('Waiting for redirect to post-registration landing page / dashboard...');
    await page.waitForTimeout(2000);
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
    } catch (e) {
      console.log('Navigation event did not fire within timeout, continuing...');
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'phase3_success_dashboard.png' });
    console.log(`Successfully registered! Current URL: ${page.url()}`);

    console.log('Waiting on the final landing page...');
    await page.waitForTimeout(30000);
    console.log('Final wait complete.');

  } catch (error) {
    console.error('Automation encountered an error:', error);
    await page.screenshot({ path: 'automation_error.png' });
  } finally {
    await context.close();
    await browser.close();
    console.log('Automation complete.');
  }
}

runAutomation();
