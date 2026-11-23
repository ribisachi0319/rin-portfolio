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

// Hero của Home: thẻ bật ra, rồi lặp mãi giữa 2 trạng thái
// "Thanh Tuyền." + thẻ ảnh  ⇄  "UX/UI [thẻ xanh] Designer.", chạy theo thời gian, không theo cuộn.
// Chữ chuyển cùng khung thời gian với thẻ và đan chéo ở giữa, nên 2 trạng thái hiện lâu như nhau.
// Trạng thái "Designer" nằm sẵn trong CSS (khi không có JS / giảm chuyển động).
const HOLD = 3; // giây đứng yên ở mỗi trạng thái
const SWAP = 1.6; // giây chuyển cảnh
const IN_OUT = [0.65, 0, 0.35, 1] as const;
const SLIDE_IN = [0.5, 1, 0.89, 1] as const; // ease-out nhẹ: đi đều hơn ở đầu, mắt kịp thấy
const SLIDE_OUT = [0.11, 0, 0.5, 0] as const;

// Dưới mốc này hero xếp lại theo lưới (CSS trong index.astro), thẻ lật tại chỗ, chữ đổi tại chỗ
const WIDE = '(width >= 1100px)';

function initHomeHero(root: HTMLElement) {
	const q = (s: string) => root.querySelector<HTMLElement>(s)!;
	const block = q('.name-block');
	const name1 = q('.name1');
	const name2 = q('.name2');
	const alt1 = q('.alt1');
	const alt2 = q('.alt2');
	const scene = q('.flip-scene');
	const card = q('.flip-card');

	root.querySelectorAll<HTMLElement>('[data-split], [data-reveal]').forEach((el) => reveal(el, 0));

	// Một vòng: đứng ở "Thanh Tuyền" → chuyển sang "Designer" → đứng → chuyển ngược lại.
	// Thẻ lật tiếp cùng chiều ở lượt về (180° → 360°). Lượt về là lượt đi tua ngược.
	const go = HOLD;
	const back = HOLD * 2 + SWAP;
	const appear = [0.33, 1, 0.68, 1] as const; // rõ lên sớm
	const vanish = [0.32, 0, 0.67, 0] as const; // giữ rõ lâu rồi mới mờ

	// Desktop: thẻ bay chéo sang trái, chữ cũ mờ và nhích lên (như Figma) ngay khi thẻ chuyển,
	// chữ mới hiện và trượt vào từ giữa chừng, dừng đúng lúc thẻ dừng. Hai chữ đan chéo ở giữa.
	function wideLoop() {
		const u = block.offsetWidth / 1344;
		const LEAVE = 1; // giây chữ cũ mờ dần
		const ENTER = SWAP - 0.6; // giây chữ mới hiện và trượt vào, bắt đầu từ 0.6s
		const z = 36 * u;
		return animate(
			[
				[card, { rotateY: [0, 180], z: [0, z, 0] }, { duration: SWAP, at: go, ease: IN_OUT }],
				[scene, { x: [0, -682 * u], y: [0, 147 * u] }, { duration: SWAP, at: go, ease: IN_OUT }],
				[name1, { opacity: [1, 0] }, { duration: LEAVE, at: go, ease: vanish }],
				[name1, { y: [0, -32 * u] }, { duration: LEAVE, at: go, ease: SLIDE_OUT }],
				[name2, { opacity: [1, 0] }, { duration: LEAVE, at: go, ease: vanish }],
				[name2, { y: [0, -58 * u] }, { duration: LEAVE, at: go, ease: SLIDE_OUT }],
				[alt1, { opacity: [0, 1] }, { duration: ENTER, at: go + SWAP - ENTER, ease: appear }],
				[alt1, { x: [198 * u, 420 * u], y: [0, 63 * u] }, { duration: ENTER, at: go + SWAP - ENTER, ease: SLIDE_IN }],
				[alt2, { opacity: [0, 1] }, { duration: ENTER, at: go + SWAP - ENTER, ease: appear }],
				[alt2, { x: [198 * u, 420 * u], y: [0, -58 * u] }, { duration: ENTER, at: go + SWAP - ENTER, ease: SLIDE_IN }],

				[card, { rotateY: [180, 360], z: [0, z, 0] }, { duration: SWAP, at: back, ease: IN_OUT }],
				[scene, { x: [-682 * u, 0], y: [147 * u, 0] }, { duration: SWAP, at: back, ease: IN_OUT }],
				[alt1, { opacity: [1, 0] }, { duration: ENTER, at: back, ease: vanish }],
				[alt1, { x: [420 * u, 198 * u], y: [63 * u, 0] }, { duration: ENTER, at: back, ease: SLIDE_OUT }],
				[alt2, { opacity: [1, 0] }, { duration: ENTER, at: back, ease: vanish }],
				[alt2, { x: [420 * u, 198 * u], y: [-58 * u, 0] }, { duration: ENTER, at: back, ease: SLIDE_OUT }],
				[name1, { opacity: [0, 1] }, { duration: LEAVE, at: back + SWAP - LEAVE, ease: appear }],
				[name1, { y: [-32 * u, 0] }, { duration: LEAVE, at: back + SWAP - LEAVE, ease: SLIDE_IN }],
				[name2, { opacity: [0, 1] }, { duration: LEAVE, at: back + SWAP - LEAVE, ease: appear }],
				[name2, { y: [-58 * u, 0] }, { duration: LEAVE, at: back + SWAP - LEAVE, ease: SLIDE_IN }],
			],
			{ repeat: Infinity },
		);
	}

	// Màn hẹp: chữ cũ và chữ mới chung một chỗ, nên gần như nối tiếp nhau (chỉ chạm nhau 0.1s)
	// để không bao giờ thấy hai chữ đè lên nhau. Chữ cũ nhích lên rồi mất, chữ mới nhích lên vào chỗ.
	function compactLoop() {
		const lift = parseFloat(getComputedStyle(name1).fontSize) * 0.18;
		const z = scene.offsetWidth * (36 / 318);
		const OUT = SWAP / 2; // giây chữ cũ đi ra
		const IN = SWAP / 2 + 0.1; // giây chữ mới đi vào
		const leave = (els: HTMLElement[], at: number, dir: number) =>
			els.flatMap((el) => [
				[el, { opacity: [1, 0] }, { duration: OUT, at, ease: vanish }],
				[el, { y: [0, -lift * dir] }, { duration: OUT, at, ease: SLIDE_OUT }],
			]);
		const enter = (els: HTMLElement[], at: number, dir: number) =>
			els.flatMap((el) => [
				[el, { opacity: [0, 1] }, { duration: IN, at, ease: appear }],
				[el, { y: [lift * dir, 0] }, { duration: IN, at, ease: SLIDE_IN }],
			]);
		return animate(
			[
				[card, { rotateY: [0, 180], z: [0, z, 0] }, { duration: SWAP, at: go, ease: IN_OUT }],
				...leave([name1, name2], go, 1),
				...enter([alt1, alt2], go + SWAP - IN, 1),
				[card, { rotateY: [180, 360], z: [0, z, 0] }, { duration: SWAP, at: back, ease: IN_OUT }],
				...leave([alt1, alt2], back, -1),
				...enter([name1, name2], back + SWAP - IN, -1),
			] as Parameters<typeof animate>[0],
			{ repeat: Infinity },
		);
	}

	const wide = matchMedia(WIDE);
	const build = () => {
		const l = wide.matches ? wideLoop() : compactLoop();
		l.pause();
		return l;
	};
	let loop = build();

	// Vòng lặp chỉ chạy khi hero đang trong màn hình và tab đang mở, cho đỡ tốn pin
	let started = false;
	let visible = true;
	const sync = () => {
		if (started && visible && !document.hidden) loop.play();
		else loop.pause();
	};
	new IntersectionObserver(([entry]) => {
		visible = entry.isIntersecting;
		sync();
	}).observe(root);
	document.addEventListener('visibilitychange', sync);

	// Đổi bề ngang thì số đo cũ sai (và có thể đổi bố cục): bỏ vòng cũ, về trạng thái đầu, dựng lại
	let lastWidth = block.offsetWidth;
	let timer = 0;
	new ResizeObserver(() => {
		if (block.offsetWidth === lastWidth) return;
		lastWidth = block.offsetWidth;
		clearTimeout(timer);
		timer = window.setTimeout(() => {
			loop.stop();
			// Motion nhớ x/y/z của từng phần tử, phải đặt lại qua Motion chứ không chỉ xoá style
			const still = { duration: 0 };
			animate([name1, name2], { opacity: 1, x: 0, y: 0 }, still);
			animate([alt1, alt2], { opacity: 0, x: 0, y: 0 }, still);
			animate(scene, { x: 0, y: 0 }, still);
			animate(card, { rotateY: 0, z: 0 }, still);
			loop = build();
			sync();
		}, 200);
	}).observe(block);

	animate(scene, { opacity: [0, 1] }, { duration: 0.4, delay: 0.7, ease: EASE_OUT });
	animate(scene, { rotate: [18, 0], scale: [0.5, 1] }, { duration: 0.8, delay: 0.7, ease: [0.45, 1.45, 0.8, 1] }).then(
		() => {
			started = true;
			sync();
		},
	);
}

function initMarquee() {
	document.querySelectorAll<HTMLElement>('.marquee-track').forEach((track) => {
		// ~90px/giây (Figma là 175, chậm lại cho dễ đọc), nửa track là một vòng
		track.style.setProperty('--marquee-duration', `${track.scrollWidth / 2 / 90}s`);
	});
}

initMarquee();
if (document.documentElement.classList.contains('motion-ok')) {
	const hero = document.querySelector<HTMLElement>('[data-intro="home"]');
	if (hero) initHomeHero(hero);
	initReveal();
}
