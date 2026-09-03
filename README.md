# Blanck — тренажёр заполнения бланка ОГЭ

В репозитории уже есть:

- `index.html` — бланк ученика. Каждая клетка принимает один символ, есть автопереход, вставка ответа, локальный черновик и кнопка **«Отправить учителю»**.
- `teacher.html` — закрытая страница учителя со списком работ, фильтрами и просмотром ответов.
- `config.js` — подключение к Supabase.
- `supabase.sql` — таблица и политики безопасности.

## 1. Включите GitHub Pages

В репозитории откройте **Settings → Pages**.

Source: **Deploy from a branch**  
Branch: **main** / **root**

После публикации страницы будут доступны примерно по адресам:

- ученику: `https://marianikitina0603-del.github.io/Blanck/`
- учителю: `https://marianikitina0603-del.github.io/Blanck/teacher.html`

## 2. Создайте бесплатный проект Supabase

Создайте проект в Supabase и откройте **SQL Editor**. Выполните содержимое файла `supabase.sql`.

## 3. Создайте учителя

В Supabase откройте **Authentication → Users → Add user** и создайте пользователя с вашим email и паролем.

Учеников регистрировать не нужно.

## 4. Подключите сайт к Supabase

В Supabase откройте **Project Settings → API** и скопируйте:

- Project URL
- anon / publishable key

В `config.js` замените:

```js
window.BLANCK_CONFIG = {
  supabaseUrl: "PASTE_SUPABASE_PROJECT_URL_HERE",
  supabaseAnonKey: "PASTE_SUPABASE_ANON_KEY_HERE"
};
```

на свои значения.

**Важно:** использовать на сайте нужно только `anon` / `publishable` key. Никогда не вставляйте `service_role` key в GitHub.

## Как работает

1. Ученик открывает `index.html` на любом компьютере.
2. Заполняет ФИО, класс и ответы.
3. Нажимает **«Отправить учителю»**.
4. Работа сохраняется в Supabase.
5. Учитель открывает `teacher.html`, входит по email и паролю и видит все работы.

Политики RLS настроены так, что анонимный ученик может отправить работу, но не может просматривать чужие работы. Просмотр и удаление доступны только авторизованному учителю.
