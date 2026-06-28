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

### Шаг 1 — дождитесь зелёного workflow

После каждого push запускается **Build GitHub Pages**. Дождитесь зелёной галочки во вкладке **Actions** (не путать со старым красным «Deploy GitHub Pages #1»).

### Шаг 2 — включите Pages

1. **Settings** → **Pages**
2. **Source:** **Deploy from a branch**
3. **Branch:** `gh-pages` → **/ (root)** → **Save**
4. Через 1–2 минуты: https://scrashm.github.io/DIBUNY/

Если в списке нет `gh-pages` — обновите страницу после успешного workflow.

**Не выбирайте** GitHub Actions в Source — для этого проекта нужен **Deploy from a branch**.

## Структура

- `index.html` — страница игры
- `script.js` — движок
- `style.css` — стили
- `data/scenes.json` — сценарий
- `assets/images/` — фоны и портреты
