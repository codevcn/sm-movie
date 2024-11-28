import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        open: true, // Tự động mở trình duyệt khi chạy server
        port: 3000,
    },
    build: {
        outDir: 'build', // Đầu ra tương tự như CRA
    },
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'), // Đặt alias '~' trỏ đến thư mục 'src'
        },
    },
});
