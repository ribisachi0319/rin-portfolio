import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
	{ ignores: ['dist/', '.astro/'] },
	js.configs.recommended,
	tseslint.configs.recommended,
	astro.configs.recommended,
	// Kiểm tra accessibility trong markup (alt, aria, nhãn link…)
	astro.configs['jsx-a11y-recommended'],
	{ languageOptions: { globals: globals.browser } },
]);
