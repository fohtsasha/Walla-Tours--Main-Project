const fs = require('fs');
const path = require('path');
const WDIOReporter = require('@wdio/reporter').default;

class MinimalReporter extends WDIOReporter {
  constructor(options = {}) {
    super({ ...options, stdout: true });

    this.outputDir = options.outputDir || path.join(process.cwd(), 'logs');
    fs.mkdirSync(this.outputDir, { recursive: true });
    this.filePath = path.join(this.outputDir, 'test-run-minimal.log');

    this.testStartTimes = {};
    this.results = [];
    this.startTime = 0;
    this.cid = '';

    // ➕ track which spec files we've already printed a category for
    this._seenSpecs = new Set();
  }

  writeLine(line) {
    fs.appendFileSync(this.filePath, line + '\n', 'utf8');
  }

  onRunnerStart(runner) {
    this.startTime = Date.now();
    this.cid = runner?.cid || '';
    this.results = [];
    this.testStartTimes = {};
    this._seenSpecs.clear?.();
  }

  // ➕ print category once per spec (taken from the top-level describe title)
  onSuiteStart(suite) {
    const key = suite?.file || `${this.cid}:${suite?.title || 'root'}`;
    if (!this._seenSpecs.has(key)) {
      this._seenSpecs.add(key);
      const category = this._categoryFromTopDescribe(suite?.title);
      this.results.push(`► Category: ${category}`);
    }
  }

  // ➕ simple extractor: take the part before ":" / "—" / "-" if present
  _categoryFromTopDescribe(title) {
    if (!title) return 'Unknown';
    const m = String(title).match(/^(.*?)(?:[:\-—–]|$)/);
    return (m ? m[1] : title).trim();
  }

  onTestStart(test) {
    this.testStartTimes[test.uid] = Date.now();
  }

  onTestPass(test) {
    this.results.push(`✅ ${test.title} (${this._duration(test.uid)})`);
  }

  _shortError(test) {
    const err = (test?.errors?.[0]) || test?.error;
    if (!err) return 'Error';
    const raw = String(err.stack || err.message || err);
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    let line = lines.find(l => /^(\w*Error:|Error:)/.test(l)) ||
               lines.find(l => !l.startsWith('at ')) ||
               lines[0] || '';
    line = line.replace(/^\w*Error:\s*/,'').replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+/g, ' ').trim();
    if (line.length > 200) line = line.slice(0, 199) + '…';
    return line;
  }

  onTestFail(test) {
    this.results.push(`❌ ${test.title} (${this._duration(test.uid)}) — ${this._shortError(test)}`);
  }

  onTestSkip(test) {
    this.results.push(`➖ ${test.title} (${this._duration(test.uid)})`);
  }

  onRunnerEnd() {
    const seconds = ((Date.now() - this.startTime) / 1000).toFixed(2) + 's';
    const passed  = this.results.filter(l => l.startsWith('✅')).length;
    const failed  = this.results.filter(l => l.startsWith('❌')).length;
    const skipped = this.results.filter(l => l.startsWith('➖')).length;
    const total   = passed + failed + skipped;

    const block = [
      ...this.results,
      '',
      `Total: ${total} | Passed: ${passed} | Failed: ${failed}` +
        (skipped ? ` | Skipped: ${skipped}` : '') +
        ` | Time: ${seconds}`,
      ''
    ].join('\n');

    this.writeLine(block);
  }

  _duration(uid) {
    const ms = Date.now() - (this.testStartTimes[uid] || Date.now());
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
  }
}

module.exports = MinimalReporter;

