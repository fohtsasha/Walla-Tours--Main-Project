# Walla Tours QA Automation Framework

This repository contains the End-to-End (E2E) automated testing framework for **Walla Tours** applications (Desktop, Mobile, and Nofy). The framework is built using [WebdriverIO](https://webdriver.io/) and the [Mocha](https://mochajs.org/) testing framework.

## 🛠 Tech Stack

- **Testing Framework**: WebdriverIO (v9)
- **Test Runner**: Mocha (BDD interface)
- **Language**: JavaScript (Node.js)
- **Reporting**: Minimal Reporter, Customer Reporter, Allure, Slack Reporter
- **Assertions**: WebdriverIO built-in `expect` / NodeJS `assert`
- **Other Utilities**: Axios (API calls), Nodemailer (Email reports)

## 📁 Project Structure

```text
qa-automation/
├── config/             # Environment and global configuration files
├── helpers/            # Reusable helper functions (e.g., Slack notifications, logging)
├── logs/               # Test execution logs and screenshots for failed tests
├── test/               # Contains all test suites organized by platform and product
│   ├── desktopFlights/     # Desktop Flights E2E Tests
│   ├── desktopHotels/      # Desktop Hotels E2E Tests
│   ├── desktopMainPage/    # Desktop Main Page Tests
│   ├── desktopPackages/    # Desktop Packages E2E Tests
│   ├── mobileFlights/      # Mobile Flights E2E Tests
│   ├── mobilePackages/     # Mobile Packages E2E Tests
│   └── nofyPackages/       # Nofy Packages E2E Tests
├── utils/              # General utility modules (e.g., reporters, email services)
├── wdio.conf.js        # Main WebdriverIO configuration file
└── package.json        # Node.js dependencies and NPM scripts
```

## 🚀 Prerequisites

Before you begin, ensure you have the following installed on your local machine:
- **Node.js** (v16.x or higher is recommended)
- **npm** (Node Package Manager)
- Google Chrome (or configured alternative browsers)

## 📦 Installation

1. Clone the repository to your local machine:
   ```bash
   git clone https://bitbucket.org/wallatours/qa-automation.git
   ```

2. Navigate into the project directory:
   ```bash
   cd qa-automation
   ```

3. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

## ⚙️ Configuration & Environment Variables

Test execution relies on environment variables for certain configurations (e.g., defining environments, controlling headless execution, or sending emails). 
Key environment variables include:
- `ENVIRONMENT` / `NODE_ENV`: Target environment (e.g., `test`, `staging`, `production`).
- `HEADLESS`: Run browsers in headless mode. Set `HEADLESS=false` to see the browser UI. Default behavior runs Chrome in headless.
- `NO_EMAIL`: If set, prevents test summary emails from being sent at the end of execution.
- `ONLY`: Used for running specific test slices (e.g., `ONLY=perfSearchTime`).
- `IGNORE_ONLY` / `IGNORE_SKIP`: Modifies what tests get included or excluded based on file naming.

## ▶️ Running Tests

The framework comes with several predefined NPM scripts to easily run specific test suites.

### Run All Tests
```bash
npm run wdio
```

### Run Specific Test Suites
You can run targeted suites using the following commands:
- **Desktop Flights**: `npm run test:desktopFlights`
- **Desktop Hotels**: `npm run test:desktopHotels`
- **Desktop Main Page**: `npm run test:desktopMainPage`
- **Desktop Packages**: `npm run test:desktopPackages`
- **Mobile Flights**: `npm run test:mobileFlights`
- **Mobile Packages**: `npm run test:mobilePackages`
- **Nofy Packages**: `npm run test:nofyPackages`

### Performance Tests
- **Search Time Performance**: `npm run test:perfSearchTime`

## 📊 Reporting and Logs

- **Console & File Logs**: Basic test pass/fail metrics and detailed execution logs are output to the terminal and saved under the `/logs/` directory (e.g., `test-run.log`, `test-run-minimal.log`).
- **Screenshots & HTML Snapshots**: If a test fails, the framework automatically captures a screenshot and saves the HTML page source in the `/logs/` directory to assist with debugging.
- **Email Notifications**: Upon completion, test run summaries and logs are emailed (unless `NO_EMAIL` is set). Emails include attachments of the run logs.
- **Slack Notifications**: Failed tests automatically send detailed Slack alerts (including screenshots, failure steps, and logs) to the designated Slack channel.

## 🤝 Contributing

1. Create a new branch for your feature or bugfix.
2. Ensure you follow the Page Object Model (POM) pattern when creating new page elements or interactions.
3. Write reliable selectors (prefer unique IDs or robust CSS attributes).
4. Do not commit `.only` modifiers in test files unless strictly for temporary local debugging.
