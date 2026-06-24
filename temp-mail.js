export class TempMail {
  constructor() {
    this.email = null;
    this.password = null;
    this.token = null;
    this.accountId = null;
  }

  _randomStr(length = 10) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  async generateEmail() {
    console.log('Getting mail.tm domains...');
    const domainsResponse = await fetch('https://api.mail.tm/domains');
    if (!domainsResponse.ok) {
      throw new Error(`Failed to fetch domains: ${domainsResponse.statusText}`);
    }
    const domainsData = await domainsResponse.json();
    if (!domainsData['hydra:member'] || domainsData['hydra:member'].length === 0) {
      throw new Error('No domains returned from mail.tm');
    }
    
    const domain = domainsData['hydra:member'][0].domain;
    const username = this._randomStr(12).toLowerCase();
    this.email = `${username}@${domain}`;
    this.password = this._randomStr(14);

    console.log('Creating temporary email account...');

    const createResponse = await fetch('https://api.mail.tm/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: this.email,
        password: this.password
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create account: ${createResponse.statusText} - ${errorText}`);
    }

    const createData = await createResponse.json();
    this.accountId = createData.id;

    console.log('Authenticating email account...');
    const tokenResponse = await fetch('https://api.mail.tm/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: this.email,
        password: this.password
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to retrieve token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    this.token = tokenData.token;

    console.log(`Temporary email ready: ${this.email}`);
    return this.email;
  }

  async waitForOTP(timeoutMs = 120000, intervalMs = 5000) {
    if (!this.token) {
      throw new Error('Not authenticated. Call generateEmail() first.');
    }

    const startTime = Date.now();
    console.log('Polling inbox for the verification email...');

    while (Date.now() - startTime < timeoutMs) {
      try {
        const listResponse = await fetch('https://api.mail.tm/messages', {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!listResponse.ok) {
          console.warn(`Unable to read inbox: ${listResponse.statusText}`);
          await new Promise(resolve => setTimeout(resolve, intervalMs));
          continue;
        }

        const listData = await listResponse.json();
        const messages = listData['hydra:member'] || [];

        if (messages.length > 0) {
          const newestMsg = messages[0];
          console.log(`Received email: "${newestMsg.subject}" from ${newestMsg.from.address}.`);

          const detailResponse = await fetch(`https://api.mail.tm/messages/${newestMsg.id}`, {
            headers: {
              'Authorization': `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          });

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            const body = detailData.text || detailData.html || '';
            const subject = detailData.subject || '';

            const otpMatch = body.match(/\b\d{6}\b/) || subject.match(/\b\d{6}\b/);
            if (otpMatch) {
              const otp = otpMatch[0];
              console.log(`OTP extracted: ${otp}`);
              return otp;
            } else {
              console.log('Email arrived but no 6-digit code was found. Retrying...');
            }
          }
        }
      } catch (err) {
        console.error(`Inbox polling error: ${err.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error(`[TempMail] Timeout waiting for OTP after ${timeoutMs / 1000}s`);
  }
}
