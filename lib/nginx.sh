#!/bin/bash
phase_configure_nginx() {
    log_info "Phase 5: Configuring Nginx for Laravel"

    # Copy template with variable substitution
    sed -e "s|{{DOMAIN}}|$DOMAIN|g" \
        -e "s|{{LARAVEL_PATH}}|$LARAVEL_PATH|g" \
        "$SCRIPT_DIR/templates/nginx-laravel.conf" > "$NGINX_SITE_CONF"

    ln -sf "$NGINX_SITE_CONF" "$NGINX_SITE_ENABLED"
    rm -f /etc/nginx/sites-enabled/default

    # Test and reload
    nginx -t
    systemctl reload nginx
    systemctl restart php8.3-fpm
}