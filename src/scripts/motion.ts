import { animate, stagger } from 'motion';

const EASE_OUT = [0, 0, 0.58, 1] as const;

type RevealKind = '' | 'label' | 'media' | 'down' | 'meta';

// Thông số lấy theo motion trong Figma
const REVEAL: Record<RevealKind, { y: number; scale?: number; duration: number }> = {
	'': { y: 32, duration: 0.7 },
	label: { y: 20, duration: 0.6 },
	meta: { y: 16, duration: 0.6 },
	down: { y: -20, duration: 0.6 },
	media: { y: 60, scale: 0.94, duration: 1 },
};

function revealBlock(el: HTMLElement, delay: number) {
	const kind = (el.dataset.reveal ?? '') as RevealKind;
	const { y, scale, duration } = REVEAL[kind] ?? REVEAL[''];
	animate(el, { opacity: [0, 1], y: [y, 0], ...(scale && { scale: [scale, 1] }) }, { duration, delay, ease: EASE_OUT });
}

function revealSplit(el: HTMLElement, delay: number) {
	const pieces = el.querySelectorAll<HTMLElement>('.sp');
	const isChar = el.dataset.split === 'char';
	const fontSize = parseFloat(getComputedStyle(el).fontSize);
	animate(
		pieces,
		{
			opacity: [0, 1],
			y: [isChar ? fontSize * 0.5 : 24, 0],
			filter: [`blur(${isChar ? 12 : 6}px)`, 'blur(0px)'],
		},
		{
			duration: isChar ? 0.6 : 0.5,
			delay: stagger(isChar ? 0.07 : 0.035, { startDelay: delay }),
			ease: EASE_OUT,
		},
	);
}

function reveal(el: HTMLElement, batchIndex: number) {
	const explicit = el.dataset.delay;
	const delay = explicit !== undefined ? Number(explicit) : Math.min(batchIndex, 6) * 0.09;
	if (el.dataset.split) revealSplit(el, delay);
	else revealBlock(el, delay);
}

// Hiện dần khi cuộn tới, mỗi phần tử chỉ chạy một lần.
// Các phần tử vào khung nhìn cùng lúc thì lệch nhau một nhịp nhỏ.
function initReveal() {
	const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]');
	const observer = new IntersectionObserver(
		(entries) => {
			let i = 0;
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				observer.unobserve(entry.target);
				reveal(entry.target as HTMLElement, i++);
			}
		},
		{ rootMargin: '0px 0px -10% 0px' },
	);
	targets.forEach((el) => {
		if (!el.closest('[data-intro]')) observer.observe(el);
	});
}

// Chuỗi mở đầu của Home: "Thanh Tuyền." + thẻ ảnh → thẻ lật/bay, chữ đổi thành "UX/UI Designer."
// Chạy một lần khi tải trang. Trạng thái cuối nằm sẵn trong CSS (khi không có JS hoặc giảm chuyển động).
function initHomeIntro(root: HTMLElement) {
	const u = root.querySelector<HTMLElement>('.name-block')!.offsetWidth / 1344;
	const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;

	root.querySelectorAll<HTMLElement>('[data-split], [data-reveal]').forEach((el) => reveal(el, 0));

	const name1 = q('.name1');
	const name2 = q('.name2');
	const alt1 = q('.alt1');
	const alt2 = q('.alt2');
	const scene = q('.flip-scene');
	const card = q('.flip-card');

	animate(scene, { opacity: [0, 1] }, { duration: 0.4, delay: 0.7, ease: EASE_OUT });
	animate(scene, { rotate: [18, 0], scale: [0.5, 1] }, { duration: 0.8, delay: 0.7, ease: [0.45, 1.45, 0.8, 1] }).then(
		() => {
			const t = 1.7; // nghỉ một nhịp rồi chuyển cảnh
			animate(name1, { opacity: 0, y: -32 * u }, { duration: 0.3, delay: t, ease: [0.7, 0, 0.84, 0] });
			animate(name2, { opacity: 0, y: -58 * u }, { duration: 0.3, delay: t + 0.05, ease: [0.7, 0, 0.84, 0] });
			animate(card, { rotateY: [0, 180] }, { duration: 1.2, delay: t, ease: [0.65, 0, 0.35, 1] });
			animate(card, { z: [0, 36, 0] }, { duration: 1.2, delay: t, ease: 'easeInOut' });
			animate(scene, { x: -682 * u, y: 147 * u }, { duration: 1.6, delay: t, ease: [0.65, 0, 0.35, 1] });
			animate(alt1, { opacity: [0, 1] }, { duration: 0.4, delay: t + 0.25, ease: EASE_OUT });
			animate(
				alt1,
				{ x: [198 * u, 420 * u], y: [0, 63 * u] },
				{ duration: 1.35, delay: t + 0.25, ease: [0.65, 0, 0.35, 1] },
			);
			animate(alt2, { opacity: [0, 1] }, { duration: 0.4, delay: t + 0.35, ease: EASE_OUT });
			animate(
				alt2,
				{ x: [198 * u, 416 * u], y: [0, -58 * u] },
				{ duration: 1.25, delay: t + 0.35, ease: [0.65, 0, 0.35, 1] },
			);
		},
	);
}

function initMarquee() {
	document.querySelectorAll<HTMLElement>('.marquee-track').forEach((track) => {
		// Tốc độ như Figma: ~175px/giây, nửa track là một vòng
		track.style.setProperty('--marquee-duration', `${track.scrollWidth / 2 / 175}s`);
	});
}

initMarquee();
if (document.documentElement.classList.contains('motion-ok')) {
	const intro = document.querySelector<HTMLElement>('[data-intro="home"]');
	if (intro) initHomeIntro(intro);
	initReveal();
}
