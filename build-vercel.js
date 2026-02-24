#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');

const FILES = [
  'index.html',
  '404.html',
  'app.js',
  'style.css',
  'favicon.png',
  'logo.png',
  '_headers',
];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

FILES.forEach((file) => {
  const src = path.join(ROOT, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT, file));
    console.log('Copied:', file);
  }
});

console.log('Build done. Output:', OUT);
