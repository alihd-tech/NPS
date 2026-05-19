#!/bin/bash
phase_final_hardening() {
    log_info "Phase 6: Final security hardening"

    # Disable root SSH login (optional)
    sed -i 's/PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
    systemctl reload sshd

    # Set ownership for web files
    chown -R $DEPLOY_USER:www-data "$LARAVEL_PATH"

    # Save credentials for admin
    cat > /root/vps-manager-credentials.txt <<EOF
VPS Manager Installation Credentials
=====================================
Admin Panel: http://$DOMAIN (or IP)
Admin Email: $ADMIN_EMAIL
Admin Password: $ADMIN_PASSWORD

MySQL root password: $MYSQL_ROOT_PASSWORD

Node Agent API Key: $AGENT_API_KEY
Agent runs on port: $AGENT_PORT

Save this information securely.
EOF
    chmod 600 /root/vps-manager-credentials.txt

    log_info "Credentials saved to /root/vps-manager-credentials.txt"
}