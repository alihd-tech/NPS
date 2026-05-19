#!/bin/bash
phase_install_lemp() {
    log_info "Phase 2: Installing LEMP stack (Nginx, MySQL, PHP)"

    apt install -y nginx mysql-server

    # PHP 8.3 from Ondřej Surý PPA (Ubuntu 22.04/24.04 compatible)
    add-apt-repository -y ppa:ondrej/php
    apt update
    apt install -y php8.3-fpm php8.3-mysql php8.3-xml php8.3-curl \
        php8.3-gd php8.3-mbstring php8.3-zip php8.3-bcmath php8.3-intl

    # Secure MySQL installation non‑interactively
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';"
    mysql -e "DELETE FROM mysql.user WHERE User='';"
    mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    mysql -e "DROP DATABASE IF EXISTS test;"
    mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    mysql -e "FLUSH PRIVILEGES;"

    # Save MySQL root password for reference
    echo "MySQL root password: $MYSQL_ROOT_PASSWORD" > /root/.mysql_root_password
    chmod 600 /root/.mysql_root_password

    # Install Composer
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php composer-setup.php --quiet
    php -r "unlink('composer-setup.php');"
    mv composer.phar /usr/local/bin/composer
}