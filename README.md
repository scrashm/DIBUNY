# ESCAPE FROM DIBUNY

Браузерная визуальная новелла.

**Играть онлайн:** https://scrashm.github.io/DIBUNY/

## Локальный запуск

```bash
cd C:\DIBUNY
python -m http.server 8080
```

Откройте http://localhost:8080

## GitHub Pages (настройка)

Репозиторий: https://github.com/scrashm/DIBUNY

1. **Settings** → **Pages**
2. **Build and deployment** → **Source:** выберите **Deploy from a branch** (не GitHub Actions)
3. **Branch:** `main` → папка **/ (root)** → **Save**
4. Подождите 1–2 минуты и откройте https://scrashm.github.io/DIBUNY/

Если раньше был включён GitHub Actions — переключите на **Deploy from a branch**, иначе сайт не поднимется.

## Структура

- `index.html` — страница игры
- `script.js` — движок
- `style.css` — стили
- `data/scenes.json` — сценарий
- `assets/images/` — фоны и портреты
