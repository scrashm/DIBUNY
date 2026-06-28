# ESCAPE FROM DIBUNY

Браузерная визуальная новелла.

**Играть онлайн:** https://scrashm.github.io/DIBUNY/

## Локальный запуск

```bash
cd C:\DIBUNY
python -m http.server 8080
```

Откройте http://localhost:8080

## Публикация на GitHub Pages

Репозиторий: `https://github.com/scrashm/DIBUNY`

После `git push` включите **Settings → Pages → Build and deployment → GitHub Actions** (workflow уже в `.github/workflows/pages.yml`).

## Структура

- `index.html` — страница игры
- `script.js` — движок
- `style.css` — стили
- `data/scenes.json` — сценарий
- `assets/images/` — фоны и портреты
