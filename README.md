# Rin's Portfolio

Portfolio của Thanh Tuyền (Rin), dựng bằng [Astro](https://astro.build) từ thiết kế Figma.
https://ribisachi0319.github.io/rin-portfolio/

## Lệnh

| Lệnh             | Việc                                                     |
| :--------------- | :------------------------------------------------------- |
| `npm install`    | Cài thư viện (lần đầu, hoặc khi `package-lock.json` đổi) |
| `npm run dev`    | Chạy ở máy tại `localhost:4321/rin-portfolio/`           |
| `npm run build`  | Build ra `dist/`                                         |
| `npm run verify` | Kiểm tra kiểu, lint (kể cả accessibility) và định dạng   |
| `npm run format` | Tự định dạng code bằng Prettier                          |

## Cấu trúc

- `src/pages/` – trang Home (`index.astro`) và case study V-Heritage (`v-heritage.astro`)
- `src/components/` – các component lấy theo Figma: Roll Link, Roll Button, Index Row, Media, Split (tách chữ cho hiệu ứng)
- `src/styles/global.css` – token màu lấy 1:1 từ collection "Portfolio Tokens" trong Figma
- `src/scripts/motion.ts` – hiệu ứng mở đầu và hiện dần khi cuộn (thư viện Motion)

## Deploy

Push lên `main` thì GitHub Actions chạy `npm run verify`, build rồi deploy lên GitHub Pages.
