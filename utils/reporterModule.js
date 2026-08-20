const WDIOReporter = require('@wdio/reporter').default;
const fs = require('fs');
const path = require('path');

class CustomerReporter extends WDIOReporter {
  constructor(options) {
    super(Object.assign({ stdout: false }, options));
    this.testStartTimes = {};
    this.runnerStartTime = null;
    this.logFilePath = path.join(this.options.outputDir || './logs', 'test-run.log');
    this.passCount = 0;
    this.failCount = 0;

    const originalLog = console.log;
    console.log = (...args) => {
      this.write(`[console.log] ${args.join(' ')}\n`);
      originalLog(...args);
    };
  }

  write(message) {
    fs.appendFileSync(this.logFilePath, message);
  }

  onRunnerStart(runner) {
    super.onRunnerStart(runner);
    this.runner = runner;

    if (runner.cid === '0-0') {
      fs.writeFileSync(this.logFilePath, '');
    }

    this.runnerStartTime = Date.now();

    // Use safe access for runner properties
    const browserName = runner.browserName || 'unknown';
    const browserVersion = runner.browserVersion || 'unknown';
    const osName = runner.os?.name || 'unknown';
    const sessionId = runner.sessionId || 'unknown';

    this.write(`\n------------------------------------------------------------------\n`);
    this.write(`[${browserName} ${browserVersion} ${osName} #${runner.cid}] Running: ${browserName} (v${browserVersion}) on ${osName}\n`);
    this.write(`[${browserName} ${browserVersion} ${osName} #${runner.cid}] Session ID: ${sessionId}\n\n`);

    this.write(`🟢 Test runner started: ${runner.cid}\n`);
  }

  onSuiteStart(suite) {
    super.onSuiteStart(suite);

    if (suite.file) {
      this.write(`[${this.runner.cid}] » ${suite.file}\n`);
    }

    this.write(`📂 Suite started: ${suite.title}\n`);
    this.write(`[${this.runner.cid}] ${suite.title}\n`);
  }

  onTestStart(test) {
    super.onTestStart(test);
    this.testStartTimes[test.uid] = Date.now();
    this.write(`🚀 Test started: ${test.title}\n`);
  }

  onTestPass(test) {
    super.onTestPass(test);
    const duration = this._getDuration(test.uid);
    this.passCount++;
    this.write(`✅ Test passed: ${test.title} (${duration} ms)\n`);
    this.write(`[${this.runner.cid}]    ✓ ${test.title}\n`);
  }

  onTestFail(test) {
    super.onTestFail(test);
    const duration = this._getDuration(test.uid);
    this.failCount++;
    this.write(`❌ Test failed: ${test.title} (${duration} ms)\n`);
    this.write(`[${this.runner.cid}]    ✖ ${test.title}\n`);
    if (test.error) {
      this.write(`   └─ Error: ${test.error.message}\n`);
      this.write(`[${this.runner.cid}] ❌ ${test.error.message}\n`);
    }
  }

  onTestSkip(test) {
    super.onTestSkip(test);
    this.write(`⏭️ Test skipped: ${test.title}\n`);
  }

  onSuiteEnd(suite) {
    super.onSuiteEnd(suite);
    this.write(`📁 Suite finished: ${suite.title}\n`);
  }

  onRunnerEnd(runner) {
    super.onRunnerEnd(runner);
    const totalDuration = Date.now() - this.runnerStartTime;
    this.write(`🔴 Test runner finished: ${runner.cid}\n`);
    this.write(`🕐 Total runtime: ${totalDuration} ms\n`);

    // 🆕 Spec-style summary
    this.write(`[${runner.cid}] ${this.passCount} passing\n`);
    this.write(`[${runner.cid}] ${this.failCount} failing\n`);
  }

  _getDuration(uid) {
    const start = this.testStartTimes[uid];
    return start ? Date.now() - start : 'unknown';
  }
}

module.exports = CustomerReporter;
