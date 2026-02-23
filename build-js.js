#!/usr/bin/env node
'use strict';
const esbuild = require('esbuild');

esbuild.buildSync({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'app.js',
  format: 'iife',
  target: ['es2020'],
});

console.log('Built app.js from src/');
