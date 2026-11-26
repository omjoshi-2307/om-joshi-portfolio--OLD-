import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readProjectFile = (relativePath) =>
  readFileSync(join(projectRoot, relativePath), 'utf8');

const journeySource = readProjectFile('src/data/journey.ts');
const identitySource = readProjectFile('src/config/identity.ts');
const caseStudiesSource = readProjectFile('src/data/caseStudies.ts');

const journeyAssets = [
  '01-discovery.svg',
  '02-first-build.svg',
  '03-walle.svg',
  '04-hackathon.svg',
  '05-sured.svg',
  '06-now.svg',
];

test('legacy journey stage paths point to existing public assets', () => {
  const mapping = journeySource.match(
    /const JOURNEY_IMAGE_PATHS:[\s\S]*?\n};/
  )?.[0];

  assert.ok(mapping, 'JOURNEY_IMAGE_PATHS mapping should exist');

  for (const asset of journeyAssets) {
    assert.match(mapping, new RegExp(`'/media/journey/${asset}'`));
    assert.ok(
      existsSync(join(projectRoot, 'public', 'media', 'journey', asset)),
      `Missing journey asset: ${asset}`
    );
  }

  assert.doesNotMatch(journeySource, /\/media\/journey\/0[1-6]-stage\.svg/);
});

test('configured repository URLs are valid GitHub URLs', () => {
  const repositoryValues = [...identitySource.matchAll(/repository:\s*'([^']+)'/g)]
    .map((match) => match[1]);

  assert.ok(repositoryValues.length > 0, 'At least one repository URL is configured');

  for (const repositoryUrl of repositoryValues) {
    const parsed = new URL(repositoryUrl);
    assert.equal(parsed.protocol, 'https:');
    assert.equal(parsed.hostname, 'github.com');
    assert.match(parsed.pathname, /^\/[^/]+\/[^/]+\/?$/);
  }
});

test('unverified JalSanchaee repository remains unlinked consistently', () => {
  assert.match(identitySource, /jalSanchaeeNavachar:\s*\{\s*repository:\s*undefined/);
  assert.match(caseStudiesSource, /repository:\s*undefined,\s*repositoryName:\s*'AISSMS Techathon 3\.0 Sprint \(Repository Pending\)'/);
});

test('required public assets are present', () => {
  const requiredAssets = [
    'public/favicon.svg',
    'public/robots.txt',
    'public/sitemap.xml',
    'public/portfolio-preview.svg',
    ...journeyAssets.map((asset) => `public/media/journey/${asset}`),
  ];

  for (const asset of requiredAssets) {
    assert.ok(existsSync(join(projectRoot, asset)), `Missing public asset: ${asset}`);
  }
});

const appSource = readProjectFile('src/App.tsx');

test('lazy route loading fallback announces status and respects reduced motion', () => {
  const fallback = appSource.match(
    /const CaseStudyLoadingFallback:[\s\S]*?\n\);/
  )?.[0];

  assert.ok(fallback, 'CaseStudyLoadingFallback should exist');
  assert.match(fallback, /role="status"/);
  assert.match(fallback, /aria-live="polite"/);
  assert.match(fallback, /aria-hidden="true"[^>]*motion-reduce:animate-none/);
  assert.doesNotMatch(fallback, /aria-busy/);
  assert.match(appSource, /<CaseStudyLoadingFallback label="LOADING CASE STUDY\.\.\." \/>/);
  assert.match(appSource, /<CaseStudyLoadingFallback label="LOADING PAGE\.\.\." \/>/);
});
