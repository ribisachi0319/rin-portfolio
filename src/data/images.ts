import type { ImageOutputFormat } from 'astro';

// Mã hoá AVIF rất chậm (sharp chỉ chạy 1 luồng trên Linux glibc) và dev server không lưu kết quả,
// nên khi dev chỉ xuất WebP cho ảnh hiện ngay. Bản build vẫn có AVIF.
export const IMAGE_FORMATS: ImageOutputFormat[] = import.meta.env.DEV ? ['webp'] : ['avif', 'webp'];
