# signup_automation_script
This project demonstrates end-to-end QA test automation using Playwright and JavaScript by automating the complete registration process on the "https://authorized-partner.vercel.app/" site. It generates a temporary email, retrieves the OTP automatically, fills all required forms, and completes the sign-up flow without manual input.

# 1. How do I run the script (commands and prerequisites)?
Answer:
1.	Open the project folder in a code editor such as Visual Studio Code.
2.	Open a terminal from the project root directory.
3.	Install the project dependencies:
npm install
4.	Install the Playwright browsers (if they are not already installed):
npx playwright install
5.	Run the automation script:
"node automation.js" command in the project root directory.

# Prerequisites:
•	Node.js version 18 or higher
•	Stable internet connection
•	All commands should be executed from the project's root directory

# 2. What environment and setup are required?
Answer:
The project is developed using JavaScript (Node.js) and the Playwright automation framework.
•	Programming Language: JavaScript (Node.js)
•	Framework: Playwright
•	Required Node.js Version: 18 or higher
•	Browser Driver: Playwright browsers (installed using npx playwright install)
•	Project Files:
o	automation.js – Main automation script
o	temp-mail.js – Generates a temporary email address and retrieves the OTP for email verification
o	package.json – Contains the project metadata and dependencies

# Note: 
The script runs in headed mode (headless: false) by default. This can be changed in automation.js if headless execution is preferred.

# 3. Were any test data or accounts used?
Answer:
This project automates the sign-up process for the website:
https://authorized-partner.vercel.app/
A temporary email address is automatically generated using the mail.tm API to receive the OTP required for email verification during registration. Therefore, no pre-existing test accounts or test data are required. An active internet connection is required to access both the target website and the mail.tm API.

