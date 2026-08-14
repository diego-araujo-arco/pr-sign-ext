# PR Confidence Label

Extensão de navegador (Manifest V3) que adiciona um selo de confiança (🟢 Alta / 🟡 Média / 🔴 Baixa) ao título das suas Pull Requests no GitHub, ajudando a sinalizar o nível de segurança para auto-merge.

## Instalação (modo desenvolvedor)

1. Abra `chrome://extensions` no Chrome.
2. Ative o "Modo do desenvolvedor".
3. Clique em "Carregar sem compactação" e selecione a pasta deste repositório.

## Uso

Ao abrir uma página de Pull Request no GitHub (`https://github.com/*/*/pull/*`), a extensão exibe um widget permitindo escolher o nível de confiança, que é então inserido no título do PR.

## Arquivos

- `manifest.json` — configuração da extensão.
- `content.js` — script injetado nas páginas de PR do GitHub.
