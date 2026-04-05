import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	base: '/', // deploy path uchun, agar subpath bo'lsa '/subpath/'
	server: {
		host: '::',
		port: 8080,
		proxy: {
			'/api': {
				target: 'https://oympics.onrender.com/',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		outDir: 'dist', // Vercel deploy uchun
	},
}));
