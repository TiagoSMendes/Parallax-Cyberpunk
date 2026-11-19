# Parallax Cyberpunk

Efeito de rolagem parallax com tema Cyberpunk, feito com HTML, CSS e JavaScript puro.

## Como funciona

Cada camada se move numa velocidade diferente enquanto você rola a página:

| Camada | Movimento |
|---|---|
| Fundo da cidade + explosões | desce a 50% da rolagem |
| Personagem | desce a 15% da rolagem |
| Bala | sai do cano e cruza a tela até sumir pela direita |
| Título "CyberGirl" | sobe mais rápido |

## Efeitos

- **Disparo:** ao abrir a página, a arma dispara, com clarão no cano, faíscas, coice e fumaça saindo do cano. Voltando ao topo depois que a bala saiu, ela dispara de novo.
- **Bala:** acompanha a rolagem, com rastro de calor e uma leve queda, até sair da tela.
- **Explosões:** a cidade ao fundo tem explosões aleatórias, com bola de fogo, clarão no céu, onda de choque, destroços em brasa e fumaça escura.

Tudo é desenhado em `<canvas>` com `requestAnimationFrame`. As animações pausam quando o topo da página sai da tela ou a aba fica em segundo plano. Para quem ativou "reduzir movimento" no sistema, os efeitos ficam mais suaves e as explosões, menos frequentes.

## Rodando

Abra `Parallax - Cyberpunk/index.html` no navegador e role a página.
