const notifyOnComplete = require('./helpers/notifyOnComplete');
const sendEmailWithLogs = require('./utils/sendEmailWithLogs');
const CustomerReporter = require('./utils/reporterModule');
const MinimalReporter = require('./utils/minimalReporter')
const fs = require('fs');
const path = require('path');
const ONLY = process.env.ONLY;
const LOG_DIR = path.join(__dirname, 'logs');
const MIN_FILE = path.join(LOG_DIR, 'test-run-minimal.log');
let RUN_START = 0;
exports.config = {


  onPrepare() {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    try { fs.unlinkSync(MIN_FILE); } catch { }
    RUN_START = Date.now();
  },

  onComplete: async function () {

    let txt = '';
    try { txt = fs.readFileSync(MIN_FILE, 'utf8'); } catch { }

    const totals = { total: 0, passed: 0, failed: 0, skipped: 0 };
    const re = /Total:\s*(\d+)\s*\|\s*Passed:\s*(\d+)\s*\|\s*Failed:\s*(\d+)(?:\s*\|\s*Skipped:\s*(\d+))?/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      totals.total += +m[1];
      totals.passed += +m[2];
      totals.failed += +m[3];
      if (m[4]) totals.skipped += +m[4];
    }

    const runSeconds = RUN_START ? (Date.now() - RUN_START) / 1000 : null;
    const fmtPct = (n, d) => (d ? `${((n / d) * 100).toFixed(1)}%` : '0.0%');
    const fmtTime = (s) => (s == null ? '' : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`);

    const failedLines = (txt.match(/^❌ .+/gm) || []).join('\n');

    const finalLine =
      `\nALL TESTS — Total: ${totals.total} | Passed: ${totals.passed} (${fmtPct(totals.passed, totals.total)}) | ` +
      `Failed: ${totals.failed} (${fmtPct(totals.failed, totals.total)})` +
      (totals.skipped ? ` | Skipped: ${totals.skipped} (${fmtPct(totals.skipped, totals.total)})` : '') +
      (runSeconds != null ? ` | Time: ${fmtTime(runSeconds)} (${runSeconds.toFixed(2)}s)` : '') + `\n`;
    // After you finish all calculations and have finalLine and failedLines:
    try {
      // Read the current minimal log
      let currentLog = '';
      try { currentLog = fs.readFileSync(MIN_FILE, 'utf8'); } catch { }

      // Remove any previous ALL TESTS summary line if present
      currentLog = currentLog.replace(/^ALL TESTS —.*\n?/m, '');

      // Compose the new log with finalLine at the top
      let newLog = finalLine + (failedLines ? `\nFAILED TESTS:\n${failedLines}\n` : '') + '\n' + currentLog;

      // Write back to the file (overwrite)
      fs.writeFileSync(MIN_FILE, newLog, 'utf8');
    } catch (err) {
      console.error('❌ Failed to update minimal log:', err.message);
    }


    // Send Email and notify URL
    console.log(finalLine.trim());
    const env = (process.env.ENVIRONMENT || process.env.NODE_ENV || '').toLowerCase();
    const envLabel = (env === 'test' || env === 'staging' || env === 'qa') ? 'TEST' : 'PRODUCTION';

    const logPath = path.resolve(__dirname, 'logs', 'test-run.log');
    const minLogPath = path.resolve(__dirname, 'logs', 'test-run-minimal.log');
    try {
      // ⬇️ Only send email if NO_EMAIL is not set
      if (!process.env.NO_EMAIL) {
        if (fs.existsSync(logPath)) {
          await sendEmailWithLogs(
            logPath,
            `📊 Walla Tours ${envLabel} Full Test Log`,
            'alexandrafo@wallatours.co.il, igortr@wallatours.co.il'
          );
        }
        if (fs.existsSync(minLogPath)) {
          await sendEmailWithLogs(
            minLogPath,
            `📊 Walla Tours ${envLabel} Log`,
            'alexandrafo@wallatours.co.il, igortr@wallatours.co.il, eug@pillonet.com'
          );
        }
      } else {
        console.log('📭 NO_EMAIL is set, skipping email sending.');
      }
    } catch (err) {
      console.error('❌ Failed to send logs:', err.message);
    } finally {
      await notifyOnComplete();
    }
  },

  // ...existing code...
  afterTest: async function (test, context, { error }) {
    if (!error) return;

    const fs = require('fs');
    const path = require('path');
    const logsDir = path.resolve(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    const safeTitle = test.title.replace(/[^\w\d]+/g, '_').substring(0, 60);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `FAILED_${safeTitle}_${timestamp}.png`;
    const screenshotPath = path.join(logsDir, screenshotName);

    await browser.saveScreenshot(screenshotPath);
    const htmlPath = path.join(logsDir, `FAILED_${safeTitle}_${timestamp}.html`);
    const html = await browser.getPageSource();
    fs.writeFileSync(htmlPath, html);
    fs.appendFileSync(path.join(logsDir, 'test-run.log'), `\n[HTML] ${test.title}: ${htmlPath}\n`);
    fs.appendFileSync(path.join(logsDir, 'test-run.log'), `\n[Screenshot] ${test.title}: ${screenshotPath}\n`);

    // collect browser console logs (if supported)
    let browserLogs = [];
    try {
      browserLogs = await browser.getLogs('browser').catch(() => []);
    } catch (e) {
      browserLogs = [];
    }
    const consoleLogText = (browserLogs && browserLogs.length)
      ? browserLogs.map(l => {
        const ts = new Date(l.timestamp || Date.now()).toISOString();
        return `[${ts}] ${l.level}: ${l.message}`;
      }).join('\n')
      : 'No browser console logs available';

    // append console logs to test-run.log
    fs.appendFileSync(path.join(logsDir, 'test-run.log'), `\n[Console logs] ${test.title}:\n${consoleLogText}\n`);

    // include runner/minimal log snippet for this failed test
    const MIN_FILE = path.join(__dirname, 'logs', 'test-run-minimal.log');
    let runnerSnippet = 'No runner/minimal logs available';
    try {
      if (fs.existsSync(MIN_FILE)) {
        const minTxt = fs.readFileSync(MIN_FILE, 'utf8');
        // prefer lines referencing this test title or recent failed markers
        const lines = minTxt.split('\n').filter(Boolean);
        const matched = lines.filter(l => l.includes(test.title) || l.startsWith('❌') || l.includes('FAILED TESTS'));
        runnerSnippet = matched.length ? matched.slice(-80).join('\n') : lines.slice(-200).join('\n');
      }
    } catch (e) {
      runnerSnippet = `Failed to read minimal log: ${e.message}`;
    }
    fs.appendFileSync(path.join(logsDir, 'test-run.log'), `\n[Runner snippet] ${test.title}:\n${runnerSnippet}\n`);

    // determine env + category
    const env = (process.env.ENVIRONMENT || process.env.NODE_ENV || 'unknown').toUpperCase();
    let category = process.env.TEST_CATEGORY || '';
    let currentUrl = 'n/a';
    try { currentUrl = await browser.getUrl(); } catch (e) { /* ignore */ }
    if (!category && currentUrl && typeof currentUrl === 'string') {
      const url = currentUrl.toLowerCase();
      if (url.includes('nofy')) category = 'nofy';
      else if (url.includes('mobile')) category = 'mobile';
      else if (url.includes('wallatours')) category = 'desktop';
      else category = 'unknown';
    }

    // extract failing step (first non-node_modules stack frame)
    let failedStep = 'unknown';
    try {
      const stack = error.stack || String(error);
      const lines = stack.split('\n').map(l => l.trim()).filter(Boolean);
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes('node_modules') && !line.includes('(internal')) {
          const m1 = line.match(/^at\s+(.*?)\s+\((.*):(\d+):(\d+)\)$/);
          const m2 = line.match(/^at\s+(.*):(\d+):(\d+)$/);
          if (m1) { failedStep = `${m1[1]} @ ${m1[2]}:${m1[3]}`; break; }
          if (m2) { failedStep = `${m2[1]}:${m2[2]}`; break; }
          failedStep = line; break;
        }
      }
    } catch (e) {
      failedStep = String(error);
    }

    // limit console log length for email body
    const maxBodyLogChars = 8000;
    const trimmedConsole = consoleLogText.length > maxBodyLogChars
      ? '...TRIMMED...\n' + consoleLogText.slice(-maxBodyLogChars)
      : consoleLogText;

    const slackEmail = 'bugs-aaaaqzlq34lfn3wzzxlttis62a@wallatours.slack.com';
    const subject = `❌ [${env}] [${category}] Failed test: ${test.title} — Step: ${failedStep}`;
    const body = [
      `Test: ${test.title}`,
      `Suite: ${test.parent || 'n/a'}`,
      `Environment: ${env}`,
      `Category: ${category}`,
      `URL: ${currentUrl}`,
      `Failed Step: ${failedStep}`,
      `Error: ${error.message || String(error)}`,
      `Timestamp: ${new Date().toISOString()}`,
      `Screenshot: ${screenshotPath}`,
      '',
      '--- Browser console (recent) ---',
      trimmedConsole,
      '',
      '--- Runner / Minimal log snippet ---',
      runnerSnippet
    ].join('\n');

    try {
      // sendEmailWithLogs(attachmentPath, subject, to, body) - pass body if supported
      await sendEmailWithLogs(screenshotPath, subject, slackEmail, body);
      console.log(`📧 Sent failed test screenshot + console logs to ${slackEmail} with subject: ${subject}`);
    } catch (err) {
      console.error('❌ Failed to send failed test screenshot email:', err.message);
    }
  },
  //},


  beforeSession: function (config, capabilities) {
    const uniq = `${process.pid}-${Date.now()}-${Math.random()}`;
    capabilities['goog:chromeOptions'].args =
      capabilities['goog:chromeOptions'].args.filter(a => !a.startsWith('--user-data-dir='));
    capabilities['goog:chromeOptions'].args.push(`--user-data-dir=/tmp/chrome-${uniq}`);
  },

  runner: 'local',

  reporters: [
    [CustomerReporter, { outputDir: './logs' }],
    [MinimalReporter, { outputDir: './logs' }]
  ],

  specs: getSpecsForRun(),
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],

  maxInstances: 1,

  capabilities: [{
    maxInstances: 1,
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        ...(process.env.HEADLESS === 'false' ? [] : ['--headless=new']), '--disable-gpu',
        '--window-size=1920,1080',
        `--user-data-dir=/tmp/chrome-${process.pid}-${Date.now()}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--ignore-certificate-errors',
        '--unsafely-treat-insecure-origin-as-secure=http://mobile.wallatours.co.il',
        '--allow-insecure-localhost'
      ]
    }
  }],


  logLevel: 'error',

  bail: 0,

  customBaseUrls: {
    mobile: 'https://m.wallatours.co.il/',
    desktop: 'https://www.wallatours.co.il/',
    mobileTest: 'http://m-test.wallatours.co.il',
    desktopTest: 'https://dev-www.wallatours.co.il/',
    nofyTest: 'http://nofy-test.co.il/',
    nofy: 'https://www.nofy.co.il/',
  },
  waitforTimeout: 20000,

  connectionRetryTimeout: 120000,

  connectionRetryCount: 3,

  services: ['firefox-profile'],
  framework: 'mocha',

  //specFileRetries: 1,

  // Delay in seconds between the spec file retry attempts
  // specFileRetriesDelay: 0,
  //
  // Whether or not retried spec files should be retried immediately or deferred to the end of the queue
  // specFileRetriesDeferred: false,
  //
  // Test reporter for stdout.
  // The only one supported by default is 'dot'
  // see also: https://webdriver.io/docs/dot-reporter

  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd',
    timeout: 200000
  },

  //
  // =====
  // Hooks
  // =====
  // WebdriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  /**
   * Gets executed once before all workers get launched.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   */

  /**
   * Gets executed before a worker process is spawned and can be used to initialize specific service
   * for that worker as well as modify runtime environments in an async fashion.
   * @param  {string} cid      capability id (e.g 0-0)
   * @param  {object} caps     object containing capabilities for session that will be spawn in the worker
   * @param  {object} specs    specs to be run in the worker process
   * @param  {object} args     object that will be merged with the main configuration once worker is initialized
   * @param  {object} execArgv list of string arguments passed to the worker process
   */
  // onWorkerStart: function (cid, caps, specs, args, execArgv) {
  // },
  /**
   * Gets executed just after a worker process has exited.
   * @param  {string} cid      capability id (e.g 0-0)
   * @param  {number} exitCode 0 - success, 1 - fail
   * @param  {object} specs    specs to be run in the worker process
   * @param  {number} retries  number of retries used
   */
  // onWorkerEnd: function (cid, exitCode, specs, retries) {
  // },
  /**
   * Gets executed just before initialising the webdriver session and test framework. It allows you
   * to manipulate configurations depending on the capability or spec.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that are to be run
   * @param {string} cid worker id (e.g. 0-0)
   */

  /**
   * Gets executed before test execution begins. At this point you can access to all global
   * variables like `browser`. It is the perfect place to define custom commands.
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs        List of spec file paths that are to be run
   * @param {object}         browser      instance of created browser/device session
   */
  // before: function (capabilities, specs) {
  // },
  /**
   * Runs before a WebdriverIO command gets executed.
   * @param {string} commandName hook command name
   * @param {Array} args arguments that command would receive
   */
  // beforeCommand: function (commandName, args) {
  // },
  /**
   * Hook that gets executed before the suite starts
   * @param {object} suite suite details
   */
  // beforeSuite: function (suite) {
  // },
  /**
   * Function to be executed before a test (in Mocha/Jasmine) starts.
   */

  /**
   * Hook that gets executed _before_ a hook within the suite starts (e.g. runs before calling
   * beforeEach in Mocha)
   */
  // beforeHook: function (test, context, hookName) {
  // },
  /**
   * Hook that gets executed _after_ a hook within the suite starts (e.g. runs after calling
   * afterEach in Mocha)
   */


  /**
   * Function to be executed after a test (in Mocha/Jasmine only)
   * @param {object}  test             test object
   * @param {object}  context          scope object the test was executed with
   * @param {Error}   result.error     error object in case the test fails, otherwise `undefined`
   * @param {*}       result.result    return object of test function
   * @param {number}  result.duration  duration of test
   * @param {boolean} result.passed    true if test has passed, otherwise false
   * @param {object}  result.retries   information about spec related retries, e.g. `{ attempts: 0, limit: 0 }`
   */
  /**
afterTest: async function (test, context, { error }) {
  if (error) {
    await browser.saveScreenshot(`./errorShots/${test.title}.png`);
    const html = await browser.getHTML('html', false);
    require('fs').writeFileSync(`./errorShots/${test.title}.html`, html);
  }
}


    /**
     * Hook that gets executed after the suite has ended
     * @param {object} suite suite details
     */
  // afterSuite: function (suite) {
  // },
  /**
   * Runs after a WebdriverIO command gets executed
   * @param {string} commandName hook command name
   * @param {Array} args arguments that command would receive
   * @param {number} result 0 - command success, 1 - command error
   * @param {object} error error object if any
   */
  // afterCommand: function (commandName, args, result, error) {
  // },
  /**
   * Gets executed after all tests are done. You still have access to all global variables from
   * the test.
   * @param {number} result 0 - test pass, 1 - test fail
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // after: function (result, capabilities, specs) {
  // },
  /**
   * Gets executed right after terminating the webdriver session.
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {Array.<String>} specs List of spec file paths that ran
   */
  // afterSession: function (config, capabilities, specs) {
  // },
  /**
   * Gets executed after all workers got shut down and the process is about to exit. An error
   * thrown in the onComplete hook will result in the test run failing.
   * @param {object} exitCode 0 - success, 1 - fail
   * @param {object} config wdio configuration object
   * @param {Array.<Object>} capabilities list of capabilities details
   * @param {<Object>} results object containing test results
   */
  // onComplete: function(exitCode, config, capabilities, results) {
  // },
  /**
  * Gets executed when a refresh happens.
  * @param {string} oldSessionId session ID of the old session
  * @param {string} newSessionId session ID of the new session
  */
  // onReload: function(oldSessionId, newSessionId) {
  // }
  /**
  * Hook that gets executed before a WebdriverIO assertion happens.
  * @param {object} params information about the assertion to be executed
  */
  // beforeAssertion: function(params) {
  // }
  /**
  * Hook that gets executed after a WebdriverIO assertion happened.
  * @param {object} params information about the assertion that was executed, including its results
  */
  // afterAssertion: function(params) {
  // }
};

function getSpecsForRun() {
  const glob = require('glob');
  let specs = glob.sync('./test/**/specs/**/*.js');

  if (ONLY === 'perfSearchTime') {
    specs = [
      './test/desktopFlights/specs/performance/searchTime.e2e.js',
      './test/mobileFlights/specs/performance/searchTime.e2e.js',
    ];
  }

  if (process.env.IGNORE_ONLY) {
    specs = specs.filter(f => !f.includes('.only.'));
  }
  if (process.env.IGNORE_SKIP) {
    specs = specs.filter(f => !f.includes('.skip.'));
  }

  return specs;
}