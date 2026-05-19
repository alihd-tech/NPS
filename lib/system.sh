#!/bin/bash
phase_system_setup() {
    log_info "Phase 1: System preparation"

    export DEBIAN_FRONTEND=noninteractive
    apt update && apt upgrade -y
    apt install -y curl git unzip software-properties-common gnupg2 ufw

    # Create deploy user
    if id "$DEPLOY_USER" &>/dev/null; then
        log_warn "User $DEPLOY_USER already exists. Skipping creation."
    else
        useradd -m -s /bin/bash "$DEPLOY_USER"
        echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/$DEPLOY_USER
        chmod 440 /etc/sudoers.d/$DEPLOY_USER
        # Copy root SSH keys to new user (if any)
        if [[ -d /root/.ssh ]]; then
            cp -r /root/.ssh "$DEPLOY_USER_HOME/"
            chown -R $DEPLOY_USER:$DEPLOY_USER "$DEPLOY_USER_HOME/.ssh"
        fi
    fi

    # Firewall
    ufw allow OpenSSH
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
}