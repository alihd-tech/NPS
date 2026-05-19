#!/bin/bash
phase_deploy_laravel() {
    log_info "Phase 3: Deploying Laravel application"

    # Clone repository
    sudo -u $DEPLOY_USER git clone "$LARAVEL_REPO" "$LARAVEL_PATH"
    cd "$LARAVEL_PATH"

    # Install PHP dependencies
    sudo -u $DEPLOY_USER composer install --no-dev --optimize-autoloader

    # Create .env
    cp .env.example .env
    sed -i "s|APP_ENV=.*|APP_ENV=$APP_ENV|" .env
    sed -i "s|APP_DEBUG=.*|APP_DEBUG=$APP_DEBUG|" .env
    sed -i "s|APP_URL=.*|APP_URL=$APP_URL|" .env
    sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$MYSQL_ROOT_PASSWORD|" .env
    sed -i "s|DB_DATABASE=.*|DB_DATABASE=vps_manager|" .env

    # Generate key and run migrations
    sudo -u $DEPLOY_USER php artisan key:generate --force
    sudo -u $DEPLOY_USER php artisan storage:link

    # Create database if not exists
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS vps_manager;"

    sudo -u $DEPLOY_USER php artisan migrate --force

    # Create admin user (using tinker or seeder)
    sudo -u $DEPLOY_USER php artisan tinker --execute="
        \$user = new App\Models\User();
        \$user->name = 'Admin';
        \$user->email = '$ADMIN_EMAIL';
        \$user->password = bcrypt('$ADMIN_PASSWORD');
        \$user->save();
    "

    # Set permissions
    chown -R $DEPLOY_USER:www-data "$LARAVEL_PATH/storage" "$LARAVEL_PATH/bootstrap/cache"
    chmod -R 775 "$LARAVEL_PATH/storage" "$LARAVEL_PATH/bootstrap/cache"
    chmod 640 "$LARAVEL_PATH/.env"
}