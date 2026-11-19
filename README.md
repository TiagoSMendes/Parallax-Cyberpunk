# Parallax Cyberpunk

Efeito de rolagem parallax com tema Cyberpunk, feito com HTML, CSS e JavaScript puro.

## Como funciona

Cada camada se move numa velocidade diferente enquanto você rola a página:

| Camada | Movimento |
|---|---|
| Fundo da cidade | desce a 50% da rolagem |
| Personagem | desce a 15% da rolagem |
| Balas | andam para o lado |
| Título "CyberGirl" | sobe mais rápido |

A animação usa `transform` + `requestAnimationFrame` para ficar suave, e é desligada para quem ativou "reduzir movimento" no sistema.

## Rodando

Abra `Parallax - Cyberpunk/index.html` no navegador e role a página.
