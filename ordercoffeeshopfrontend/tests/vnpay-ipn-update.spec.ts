
import { test, expect } from '@playwright/test';
import {config} from 'dotenv';

// run this file :
// npx playwright test tests/vnpay-ipn-update.spec.ts


const VNPAY_LOGIN_URL = 'https://sandbox.vnpayment.vn/vnpaygw-sit-testing/user/login';
const VNPAY_IPN_URL = 'https://sandbox.vnpayment.vn/vnpaygw-sit-testing/ipn';

const USERNAME = "td2005dataeg@gmail.com";
const PASSWORD = "Td12345678@";
const BACKEND_URL = "https://2ae228ac6189.ngrok-free.app";
// const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

test('update VNPay IPN URL', async ({ page }) => {
  // Check for required environment variables
  if (!USERNAME || !PASSWORD || !BACKEND_URL) {
    throw new Error('Missing required environment variables: SANDBOX_USERNAME, SANDBOX_PASSWORD, BACKEND_URL');
  }

  // 1. Go to login page
  await page.goto(VNPAY_LOGIN_URL);

  // 2. Fill in login credentials
  await page.locator('input[name="email"]').fill(USERNAME);
  await page.locator('input[name="password"]').fill(PASSWORD);

  // 3. Click login button
  await page.locator('button[type="submit"]').click();

  // Wait for a known element that appears only after login, e.g., the IPN config link.
  // This confirms the login was successful.
  const ipnLink = page.locator('a[href="/vnpaygw-sit-testing/ipn"]');
  await ipnLink.waitFor({ state: 'visible', timeout: 60000 });

  // 4. Go to the IPN page by clicking the link
  await ipnLink.click();

  // 5. Click the "Sửa" (Edit) button for the first entry
  await page.locator('button.edit-button[data-index="0"]').click();

  // 6. Update the IPN URL
  const ipnUrlInput = page.locator('#ipnurl-0');
  const newIpnUrl = `${BACKEND_URL}/api/v1/payment/callback`;
  await ipnUrlInput.fill(newIpnUrl);

  // 7. Click the "Cập nhật" (Update) button
  await page.locator('button.update-button[data-tmncode="8E0JFKRK"][data-index="0"]').click();

  // 8. Verify the update was successful by checking for the success message
  const successMessage = page.locator('div.alert.alert-success');
  await expect(successMessage).toBeVisible({ timeout: 10000 });
  await expect(successMessage).toContainText('Cập nhật thành công!');

  console.log(`Successfully updated IPN URL to: ${newIpnUrl}`);
});
