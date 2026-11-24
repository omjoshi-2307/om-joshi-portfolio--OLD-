import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyTextToClipboard } from '../src/utils/copyTextToClipboard.js';

function installBrowserMocks({ isSecureContext = true, writeText, execCommandResult = true } = {}) {
  const originalDescriptors = Object.fromEntries(
    ['navigator', 'window', 'document'].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)])
  );
  const calls = [];
  let appendedTextarea;
  const body = {
    appendChild(element) {
      appendedTextarea = element;
      calls.push('append');
    },
    removeChild(element) {
      assert.equal(element, appendedTextarea);
      calls.push('remove');
    },
  };
  const documentMock = {
    body,
    createElement(tag) {
      assert.equal(tag, 'textarea');
      return {
        value: '',
        style: {},
        attributes: {},
        setAttribute(name, value) {
          this.attributes[name] = value;
        },
        focus() { calls.push('focus'); },
        select() { calls.push('select'); },
      };
    },
    execCommand(command) {
      calls.push(`exec:${command}`);
      return typeof execCommandResult === 'function' ? execCommandResult(command) : execCommandResult;
    },
  };

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: writeText ? { writeText } : undefined },
  });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { isSecureContext } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: documentMock });

  return {
    calls,
    get textarea() { return appendedTextarea; },
    restore() {
      for (const [name, descriptor] of Object.entries(originalDescriptors)) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    },
  };
}

test('uses the secure Clipboard API when available', async () => {
  let copied;
  const browser = installBrowserMocks({ writeText: async (text) => { copied = text; } });
  try {
    await copyTextToClipboard('hello@example.com');
    assert.equal(copied, 'hello@example.com');
    assert.deepEqual(browser.calls, []);
  } finally {
    browser.restore();
  }
});

test('falls back after Clipboard API rejection and removes the textarea', async () => {
  const browser = installBrowserMocks({
    writeText: async () => { throw new Error('permission denied'); },
  });
  try {
    await copyTextToClipboard('hello@example.com');
    assert.equal(browser.textarea.value, 'hello@example.com');
    assert.equal(browser.textarea.attributes.readonly, '');
    assert.deepEqual(browser.calls, ['append', 'focus', 'select', 'exec:copy', 'remove']);
  } finally {
    browser.restore();
  }
});

test('rejects a failed legacy copy and still removes the textarea', async () => {
  const browser = installBrowserMocks({ isSecureContext: false, execCommandResult: false });
  try {
    await assert.rejects(copyTextToClipboard('hello@example.com'), /Clipboard copy was rejected/);
    assert.deepEqual(browser.calls, ['append', 'focus', 'select', 'exec:copy', 'remove']);
  } finally {
    browser.restore();
  }
});

test('uses legacy copy in an insecure context', async () => {
  let clipboardApiCalled = false;
  const browser = installBrowserMocks({
    isSecureContext: false,
    writeText: async () => { clipboardApiCalled = true; },
  });
  try {
    await copyTextToClipboard('hello@example.com');
    assert.equal(clipboardApiCalled, false);
    assert.deepEqual(browser.calls, ['append', 'focus', 'select', 'exec:copy', 'remove']);
  } finally {
    browser.restore();
  }
});
