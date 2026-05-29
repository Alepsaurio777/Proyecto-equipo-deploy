FROM php:8.2-apache

RUN apt-get update \
    && apt-get install -y git unzip libzip-dev libpng-dev libjpeg-dev zip unzip \
    && docker-php-ext-install mysqli pdo pdo_mysql gd \
    && a2enmod rewrite

# Copiar composer desde la imagen oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar el código de la API
COPY api/ /var/www/html/

# Instalar dependencias de PHP (si composer.json está presente)
RUN if [ -f composer.json ]; then composer install --no-interaction --optimize-autoloader || true; fi

RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
