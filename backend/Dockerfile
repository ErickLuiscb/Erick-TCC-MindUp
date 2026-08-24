FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
git \
curl \
unzip \
libpq-dev \
&& docker-php-ext-install pdo pdo_pgsql pcntl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN php artisan config:clear
RUN php artisan storage:link || true

ENV PHP_CLI_SERVER_WORKERS=4

EXPOSE 10000

CMD php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=$PORT
