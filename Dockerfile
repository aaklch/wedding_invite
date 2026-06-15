# Используем легковесный образ nginx
FROM nginx:alpine

# Удаляем стандартную страницу nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем все файлы сайта в папку nginx
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY guests.json /usr/share/nginx/html/
COPY 2.mp4 /usr/share/nginx/html/

# Копируем конфигурацию nginx (опционально)
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]