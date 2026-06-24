import { chromium } from 'playwright';
import path from 'path';
import { TempMail } from './temp-mail.js';

function generateNepalPhoneNumber() {
  const prefix = Math.random() < 0.5 ? '98' : '97';
  let rest = '';
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10);
  }
  return prefix + rest;
}

async function testForm2Fill() {
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
    await page.locator('input').first().fill(otpCode);
    await page.locator('button:has-text("Verify Code")').click();
    await page.waitForTimeout(3000);

    console.log('Filling Form 2 (Agency Details)...');
    await page.getByPlaceholder('Enter Agency Name').fill('Vrit Technologies');
    await page.getByPlaceholder('Enter Your Role in Agency').fill('QA');
    await page.getByPlaceholder('Enter Your Agency Email Address').fill('info@vrittechnologies.com');
    await page.getByPlaceholder('Enter Your Agency Website').fill('www.vrittechnologies.com');
    await page.getByPlaceholder('Enter Your Agency Address').fill('Sankhamul');

    console.log('Clicking Region of Operation dropdown...');
    const dropdown = page.locator('button:has-text("Select Your Region of Operation"), [role="combobox"]');
    await dropdown.click();
    await page.waitForTimeout(500);

    console.log('Selecting Nepal...');
    await page.locator('[role="option"]:has-text("Nepal")').or(page.getByText('Nepal', { exact: true })).first().click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test_form2_filled.png' });

    console.log('Clicking Next (Form 2)...');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test_form3_transition.png' });
    console.log('Current page URL after Form 2:', page.url());

    console.log('Filling Professional Experience...');

    const expDropdown = page.locator('button:has-text("Select Your Experience Level")').first();
    await expDropdown.click();
    await page.waitForTimeout(500);

    console.log('Selecting experience level option...');
    await page.locator('[role="option"]:has-text("1 year")').filter({ visible: true }).first().click();
    await page.waitForTimeout(500);

    console.log('Filling students recruited...');
    await page.locator('input[name="number_of_students_recruited_annually"]').fill('50');

    console.log('Filling focus area...');
    await page.locator('input[name="focus_area"]').fill('Undergraduate admissions to Canada');

    console.log('Filling success metrics...');
    await page.locator('input[name="success_metrics"]').fill('90');

    console.log('Checking services provided checkboxes...');
    const services = ['Career Counseling', 'Admission Applications', 'Visa Processing', 'Test Prepration'];
    for (const service of services) {
      await page.locator(`label:has-text("${service}")`).first().click();
      await page.waitForTimeout(100);
    }

    await page.screenshot({ path: 'test_form3_filled.png' });

    console.log('Clicking Next (Form 3)...');
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test_form4_transition.png' });
    console.log('Current page URL after Form 3:', page.url());

    console.log('Filling Form 4 (Verification and Preferences)...');

    console.log('Filling business registration number...');
    await page.locator('input[name="business_registration_number"]').fill('9999999999');

    console.log('Clicking Preferred Countries dropdown...');
    await page.locator('button:has-text("Select Your Preferred Countries")').first().click();
    await page.waitForTimeout(1500);

    console.log('Selecting Australia...');
    await page.getByText('Australia', { exact: true }).filter({ visible: true }).first().click();
    await page.waitForTimeout(500);

    console.log('Closing dropdown...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    console.log('Selecting institution types...');
    await page.locator('label:has-text("Universities")').first().click();
    await page.waitForTimeout(100);
    await page.locator('label:has-text("Colleges")').first().click();
    await page.waitForTimeout(100);

    console.log('Filling certification details...');
    await page.locator('input[name="certification_details"]').fill('ICEF Certified Agent');

    console.log('Uploading dummy documents...');
    const dummyPdfPath = path.resolve('Nist_1.SP.800-160v1r1.pdf');
    const fileInputs = page.locator('input[type="file"]');
    if (await fileInputs.count() > 0) {
      await fileInputs.nth(0).setInputFiles(dummyPdfPath);
      await page.waitForTimeout(500);
    }
    if (await fileInputs.count() > 1) {
      await fileInputs.nth(1).setInputFiles(dummyPdfPath);
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'test_form4_filled.png' });

    console.log('Clicking Submit (Form 4)...');
    await page.locator('button[type="submit"]:has-text("Submit")').first().click();

    console.log('Waiting for final redirect or success message...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'test_success_dashboard.png' });
    console.log('Current page URL after Submit:', page.url());

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

testForm2Fill();
