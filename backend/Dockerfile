FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
git \
curl \
unzip \
libpq-dev \
&& docker-php-ext-install pdo pdo_pgsql pcntl

# A imagem php:8.3-cli não vem com php.ini configurado — os padrões do
# PHP (upload_max_filesize=2M, post_max_size=8M) são baixos demais para
# uploads de vídeo. Sem isso, uploads grandes eram cortados pelo PHP
# antes mesmo de chegar nas validações do Laravel, derrubando a conexão
# no meio (o navegador reporta isso, de forma enganosa, como erro de CORS).
RUN { \
    echo 'upload_max_filesize=100M'; \
    echo 'post_max_size=100M'; \
    echo 'memory_limit=256M'; \
    echo 'max_execution_time=300'; \
    echo 'max_input_time=300'; \
} > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN php artisan config:clear
RUN php artisan storage:link || true

ENV PHP_CLI_SERVER_WORKERS=4

EXPOSE 10000

CMD php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=$PORT
