const hero = document.querySelector(".hero");
const bg = document.getElementById("bg");
const girl = document.getElementById("girl");
const text = document.getElementById("text");
const cvExplosoes = document.getElementById("explosoes");
const cvDisparo = document.getElementById("disparo");
const ctxE = cvExplosoes.getContext("2d");
const ctxD = cvDisparo.getContext("2d");

// Quem ativou "reduzir movimento" no sistema continua vendo os efeitos,
// só que mais suaves e com menos explosões.
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const intensidade = reduzirMovimento ? 0.4 : 1;

// Ponta do cano na imagem girl.webp (2040 x 1505), em fração do tamanho
const CANO = { x: 1550 / 2040, y: 595 / 1505 };
const GIRL_W = 2040;
const GIRL_H = 1505;

const bala = new Image();
bala.src = "images/bala-sprite.webp"; // 102 x 28, apontando para a direita

let W = 0;
let H = 0;
let dpr = 1;
let escala = 1; // escala em que a imagem da personagem aparece na tela
let scrollY = 0;
let coice = 0; // recuo da arma logo após o tiro
let heroVisivel = true;

// ---------------------------------------------------------------------------
// Tamanho e posição
// ---------------------------------------------------------------------------

function redimensionar() {
    W = hero.clientWidth;
    H = hero.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    for (const cv of [cvExplosoes, cvDisparo]) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
    }
    ctxE.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxD.setTransform(dpr, 0, 0, dpr, 0, 0);
    escala = Math.min(girl.offsetWidth / GIRL_W, girl.offsetHeight / GIRL_H);
}

// Onde está a ponta do cano agora (a imagem usa object-fit: contain)
function pontaDoCano() {
    const largura = GIRL_W * escala;
    const altura = GIRL_H * escala;
    const x0 = girl.offsetLeft + (girl.offsetWidth - largura) / 2;
    const y0 = girl.offsetTop + (girl.offsetHeight - altura) / 2;
    const deslocY = scrollY * intensidade * 0.15; // acompanha o parallax da personagem
    return { x: x0 + largura * CANO.x - coice, y: y0 + altura * CANO.y + deslocY };
}

// ---------------------------------------------------------------------------
// Parallax
// ---------------------------------------------------------------------------

function aplicarParallax() {
    const v = scrollY * intensidade;
    bg.style.transform = `translateY(${v * 0.5}px)`;
    cvExplosoes.style.transform = `translateY(${v * 0.5}px)`;
    girl.style.transform = `translate(${-coice}px, ${v * 0.15}px)`;
    text.style.transform = `translateY(${-v * 0.8}px)`;
}

// ---------------------------------------------------------------------------
// Partículas
// ---------------------------------------------------------------------------

const aleatorio = (min, max) => min + Math.random() * (max - min);
const particulasD = []; // faíscas e fumaça do cano
const explosoes = [];

function faisca(x, y, angulo, velocidade) {
    particulasD.push({
        tipo: "faisca", x, y,
        vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade,
        vida: 0, max: aleatorio(0.15, 0.4), tam: aleatorio(1, 2.5) * Math.max(escala, 0.5),
    });
}

function fumaca(x, y, forca = 1) {
    particulasD.push({
        tipo: "fumaca", x, y,
        vx: aleatorio(10, 40) * forca, vy: aleatorio(-25, -8),
        vida: 0, max: aleatorio(1.4, 2.6), tam: aleatorio(6, 12) * Math.max(escala, 0.5),
        cresce: aleatorio(14, 26) * Math.max(escala, 0.5),
    });
}

// ---------------------------------------------------------------------------
// Disparo
// ---------------------------------------------------------------------------

let clarao = 0; // 1 logo após o tiro, cai até 0
let disparou = false;
let podeDispararDeNovo = false;

function disparar() {
    const p = pontaDoCano();
    clarao = 1;
    coice = 10 * Math.max(escala, 0.5) * intensidade;
    for (let i = 0; i < 26; i++) faisca(p.x, p.y, aleatorio(-0.45, 0.45), aleatorio(250, 700) * Math.max(escala, 0.5));
    for (let i = 0; i < 10; i++) fumaca(p.x, p.y, 2.5);
    disparou = true;
}

function desenharClarao(p) {
    if (clarao <= 0) return;
    const r = 120 * Math.max(escala, 0.45) * (0.5 + clarao * 0.7);
    ctxD.save();
    ctxD.globalCompositeOperation = "lighter";

    // brilho redondo
    const brilho = ctxD.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.6);
    brilho.addColorStop(0, `rgba(255, 250, 220, ${0.95 * clarao})`);
    brilho.addColorStop(0.25, `rgba(255, 190, 60, ${0.75 * clarao})`);
    brilho.addColorStop(0.6, `rgba(255, 80, 20, ${0.3 * clarao})`);
    brilho.addColorStop(1, "rgba(255, 40, 0, 0)");
    ctxD.fillStyle = brilho;
    ctxD.beginPath();
    ctxD.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
    ctxD.fill();

    // chama em forma de estrela, saindo para a frente do cano
    ctxD.translate(p.x, p.y);
    const pontas = 7;
    ctxD.beginPath();
    for (let i = 0; i <= pontas * 2; i++) {
        const ang = -Math.PI / 2.3 + (i / (pontas * 2)) * (Math.PI / 1.15);
        const raio = i % 2 === 0 ? r * aleatorio(1.1, 2.2) : r * 0.35;
        ctxD.lineTo(Math.cos(ang) * raio, Math.sin(ang) * raio * 0.55);
    }
    ctxD.closePath();
    const chama = ctxD.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    chama.addColorStop(0, `rgba(255, 255, 235, ${clarao})`);
    chama.addColorStop(0.35, `rgba(255, 170, 40, ${0.9 * clarao})`);
    chama.addColorStop(1, "rgba(255, 60, 0, 0)");
    ctxD.fillStyle = chama;
    ctxD.fill();
    ctxD.restore();
}

// Bala: sai do cano e, conforme a rolagem, voa até sair pela direita da tela
function progressoDaBala() {
    return Math.min(1, Math.max(0, (scrollY * intensidade) / (H * 0.55)));
}

function desenharBala(p) {
    if (!disparou || !bala.complete) return;
    const t = progressoDaBala();
    const bw = 102 * escala * 1.1;
    const bh = 28 * escala * 1.1;
    const inicioX = p.x + 6 * escala;
    const fimX = W + bw + 60;
    const easing = t * t * (3 - 2 * t);
    const x = inicioX + (fimX - inicioX) * easing;
    const y = p.y + easing * H * 0.05; // leve queda até sair da tela
    if (x - bw > W) return;

    // rastro de calor atrás da bala
    const dx = x - p.x;
    const dy = y - p.y;
    const dist = Math.hypot(dx, dy);
    if (t > 0.01 && dist > 1) {
        const L = Math.min(dist, W * 0.45);
        const sx = x - (dx / dist) * L;
        const sy = y - (dy / dist) * L;
        const rastro = ctxD.createLinearGradient(sx, sy, x, y);
        rastro.addColorStop(0, "rgba(255, 120, 40, 0)");
        rastro.addColorStop(0.7, "rgba(255, 170, 70, 0.25)");
        rastro.addColorStop(1, "rgba(255, 230, 170, 0.7)");
        ctxD.save();
        ctxD.globalCompositeOperation = "lighter";
        ctxD.strokeStyle = rastro;
        ctxD.lineWidth = Math.max(2, bh * 0.35);
        ctxD.lineCap = "round";
        ctxD.beginPath();
        ctxD.moveTo(sx, sy);
        ctxD.lineTo(x, y);
        ctxD.stroke();
        ctxD.restore();
    }

    ctxD.save();
    ctxD.translate(x, y);
    ctxD.rotate(Math.atan2(H * 0.05, fimX - inicioX) * 0.6);
    ctxD.shadowColor = "rgba(255, 170, 60, 0.9)";
    ctxD.shadowBlur = 12;
    ctxD.drawImage(bala, -bw / 2, -bh / 2, bw, bh);
    ctxD.restore();
}

function desenharParticulasDoCano(dt) {
    for (let i = particulasD.length - 1; i >= 0; i--) {
        const q = particulasD[i];
        q.vida += dt;
        if (q.vida >= q.max) { particulasD.splice(i, 1); continue; }
        const k = 1 - q.vida / q.max;
        q.x += q.vx * dt;
        q.y += q.vy * dt;

        if (q.tipo === "faisca") {
            q.vy += 500 * dt;
            ctxD.save();
            ctxD.globalCompositeOperation = "lighter";
            ctxD.strokeStyle = `rgba(255, ${180 + 60 * k}, 90, ${k})`;
            ctxD.lineWidth = q.tam;
            ctxD.beginPath();
            ctxD.moveTo(q.x, q.y);
            ctxD.lineTo(q.x - q.vx * 0.02, q.y - q.vy * 0.02);
            ctxD.stroke();
            ctxD.restore();
        } else {
            q.vx *= 0.98;
            const r = q.tam + q.cresce * (q.vida / q.max) * 2;
            const g = ctxD.createRadialGradient(q.x, q.y, 0, q.x, q.y, r);
            g.addColorStop(0, `rgba(190, 190, 200, ${0.22 * k})`);
            g.addColorStop(1, "rgba(150, 150, 160, 0)");
            ctxD.fillStyle = g;
            ctxD.beginPath();
            ctxD.arc(q.x, q.y, r, 0, Math.PI * 2);
            ctxD.fill();
        }
    }
}

// ---------------------------------------------------------------------------
// Explosões no fundo
// ---------------------------------------------------------------------------

let proximaExplosao = 0.6;

function novaExplosao(grande = false) {
    const forca = (grande ? aleatorio(1.3, 1.6) : aleatorio(0.7, 1.2)) * Math.max(W / 1400, 0.5);
    const e = {
        x: aleatorio(0.05, 0.95) * W,
        y: aleatorio(0.55, 0.78) * H,
        vida: 0, max: aleatorio(1.6, 2.4), forca,
        destrocos: [], fumacas: [],
    };
    // Evita explodir bem atrás do rosto da personagem
    if (e.x > W * 0.3 && e.x < W * 0.55) e.x += W * 0.3;
    for (let i = 0; i < 40; i++) {
        const ang = aleatorio(-Math.PI, 0);
        const vel = aleatorio(120, 420) * forca;
        e.destrocos.push({ x: e.x, y: e.y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, tam: aleatorio(2, 4.5) * forca });
    }
    for (let i = 0; i < 6; i++) {
        e.fumacas.push({ dx: aleatorio(-60, 60) * forca, atraso: aleatorio(0.15, 0.6), r: aleatorio(40, 80) * forca });
    }
    explosoes.push(e);
}

function desenharExplosoes(dt) {
    ctxE.clearRect(0, 0, W, H);

    proximaExplosao -= dt;
    if (proximaExplosao <= 0) {
        novaExplosao();
        proximaExplosao = reduzirMovimento ? aleatorio(3, 5) : aleatorio(1.2, 3);
    }

    for (let i = explosoes.length - 1; i >= 0; i--) {
        const e = explosoes[i];
        e.vida += dt;
        const t = e.vida / e.max;
        if (t >= 1) { explosoes.splice(i, 1); continue; }

        // fumaça escura subindo (desenhada antes do fogo, por trás dele)
        for (const f of e.fumacas) {
            const tf = e.vida - f.atraso;
            if (tf <= 0) continue;
            const k = Math.max(0, 1 - tf / (e.max - f.atraso));
            const r = f.r * (1 + tf * 1.1);
            const fx = e.x + f.dx;
            const fy = e.y - tf * 70 * e.forca;
            const g = ctxE.createRadialGradient(fx, fy, 0, fx, fy, r);
            g.addColorStop(0, `rgba(25, 18, 20, ${0.55 * k})`);
            g.addColorStop(1, "rgba(25, 18, 20, 0)");
            ctxE.fillStyle = g;
            ctxE.beginPath();
            ctxE.arc(fx, fy, r, 0, Math.PI * 2);
            ctxE.fill();
        }

        ctxE.save();
        ctxE.globalCompositeOperation = "lighter";

        // bola de fogo (pisca um pouco, como chama de verdade)
        const fogo = Math.max(0, 1 - t * 1.8);
        if (fogo > 0) {
            const r = (60 + 200 * Math.sqrt(t)) * e.forca * aleatorio(0.92, 1.08);
            const g = ctxE.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
            g.addColorStop(0, `rgba(255, 250, 210, ${fogo})`);
            g.addColorStop(0.25, `rgba(255, 170, 50, ${0.9 * fogo})`);
            g.addColorStop(0.6, `rgba(230, 60, 20, ${0.5 * fogo})`);
            g.addColorStop(1, "rgba(120, 0, 0, 0)");
            ctxE.fillStyle = g;
            ctxE.beginPath();
            ctxE.arc(e.x, e.y, r, 0, Math.PI * 2);
            ctxE.fill();

            // clarão alaranjado iluminando o céu
            const ceu = ctxE.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 4);
            ceu.addColorStop(0, `rgba(255, 110, 40, ${0.3 * fogo})`);
            ceu.addColorStop(1, "rgba(255, 60, 20, 0)");
            ctxE.fillStyle = ceu;
            ctxE.fillRect(e.x - r * 4, e.y - r * 4, r * 8, r * 8);
        }

        // onda de choque
        if (t < 0.4) {
            const k = 1 - t / 0.4;
            ctxE.strokeStyle = `rgba(255, 200, 150, ${0.25 * k})`;
            ctxE.lineWidth = 6 * e.forca * k;
            ctxE.beginPath();
            ctxE.ellipse(e.x, e.y, 260 * t * e.forca * 2.5, 80 * t * e.forca * 2.5, 0, 0, Math.PI * 2);
            ctxE.stroke();
        }

        // destroços em brasa
        for (const d of e.destrocos) {
            d.vy += 260 * dt;
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            const k = Math.max(0, 1 - t * 1.3);
            ctxE.fillStyle = `rgba(255, ${140 + 80 * k}, 60, ${k})`;
            ctxE.fillRect(d.x, d.y, d.tam, d.tam);
        }

        ctxE.restore();
    }
}

// ---------------------------------------------------------------------------
// Loop principal
// ---------------------------------------------------------------------------

let ultimo = null;
let acumFumaca = 0;

function quadro(agora) {
    // Tempo desde o quadro anterior (nunca negativo, no máximo 50 ms)
    const dt = ultimo === null ? 0 : Math.min(0.05, Math.max(0, (agora - ultimo) / 1000));
    ultimo = agora;

    if (heroVisivel && !document.hidden) {
        clarao = Math.max(0, clarao - dt * 3.2);
        coice *= Math.pow(0.0005, dt); // volta rápido à posição normal
        aplicarParallax();

        desenharExplosoes(dt);

        ctxD.clearRect(0, 0, W, H);
        const p = pontaDoCano();

        // fumaça contínua saindo do cano (a arma acabou de disparar)
        if (disparou) {
            acumFumaca += dt;
            if (acumFumaca > 0.12) {
                acumFumaca = 0;
                fumaca(p.x, p.y, 0.6);
            }
        }

        desenharParticulasDoCano(dt);
        desenharBala(p);
        desenharClarao(p);

        // voltou ao topo depois de a bala sair: dispara de novo
        const t = progressoDaBala();
        if (t > 0.9) podeDispararDeNovo = true;
        if (podeDispararDeNovo && t === 0) {
            podeDispararDeNovo = false;
            disparar();
        }
    }
    requestAnimationFrame(quadro);
}

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });
window.addEventListener("resize", redimensionar);

// Pausa as animações quando o topo da página não está visível
new IntersectionObserver(([entrada]) => {
    heroVisivel = entrada.isIntersecting;
}).observe(hero);

function iniciar() {
    scrollY = window.scrollY;
    redimensionar();
    aplicarParallax();
    novaExplosao(true);
    setTimeout(disparar, 500);
    requestAnimationFrame(quadro);
}

if (girl.complete) iniciar();
else girl.addEventListener("load", iniciar, { once: true });
