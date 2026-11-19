const bg = document.getElementById("bg");
const bala = document.getElementById("bala");
const girl = document.getElementById("girl");
const text = document.getElementById("text");

// Quem ativou "reduzir movimento" no sistema (no Windows: "Efeitos de animação"
// desligado) continua vendo o parallax, só que mais suave.
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const intensidade = reduzirMovimento ? 0.4 : 1;

let agendado = false;

function atualizarParallax() {
    const value = window.scrollY * intensidade;

    // Cada camada anda numa velocidade diferente: é isso que cria o efeito parallax.
    bg.style.transform = `translateY(${value * 0.5}px)`;
    girl.style.transform = `translateY(${value * 0.15}px)`;
    bala.style.transform = `translateX(${value * 0.5}px)`;
    text.style.transform = `translateY(${-value * 0.8}px)`;

    agendado = false;
}

// requestAnimationFrame deixa a animação suave e economiza processamento
window.addEventListener("scroll", () => {
    if (!agendado) {
        agendado = true;
        requestAnimationFrame(atualizarParallax);
    }
}, { passive: true });

// Aplica a posição certa se a página abrir já rolada (ex.: ao recarregar)
atualizarParallax();
