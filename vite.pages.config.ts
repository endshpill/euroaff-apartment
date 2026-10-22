import {writeFileSync} from 'node:fs';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('./github-pages',import.meta.url)),base:'/euroaff-apartment/',publicDir:fileURLToPath(new URL('./public',import.meta.url)),plugins:[react(),{name:'pages-nojekyll',closeBundle(){writeFileSync(new URL('./docs/.nojekyll',import.meta.url),'')}}],build:{outDir:fileURLToPath(new URL('./docs',import.meta.url)),emptyOutDir:true}});
