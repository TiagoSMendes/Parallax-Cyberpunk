const bg = document.getElementById("bg");
const bala = document.getElementById("bala");
const girl = document.getElementById("girl");
const text = document.getElementById("text");

// Respeita quem pediu para reduzir animações no sistema
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let agendado = false;

function atualizarParallax() {
    const value = window.scrollY;

    // Cada camada anda numa velocidade diferente: é isso que cria o efeito parallax.
    // (Antes estava "value + 0.5", que fazia tudo andar junto, sem profundidade.)
    bg.style.transform = `translateY(${value * 0.5}px)`;
    girl.style.transform = `translateY(${value * 0.15}px)`;
    bala.style.transform = `translateX(${value * 0.5}px)`;
    text.style.transform = `translateY(${-value * 0.8}px)`;

    agendado = false;
}

if (!reduzirMovimento) {
    // requestAnimationFrame deixa a animação suave e economiza processamento
    window.addEventListener("scroll", () => {
        if (!agendado) {
            agendado = true;
            requestAnimationFrame(atualizarParallax);
        }
    }, { passive: true });
}
