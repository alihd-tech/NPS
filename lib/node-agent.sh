#!/bin/bash
phase_deploy_node_agent() {
    log_info "Phase 4: Deploying Node.js agent"

    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs

    # Clone agent
    sudo -u $DEPLOY_USER git clone "$AGENT_REPO" "$AGENT_PATH"
    cd "$AGENT_PATH"
    sudo -u $DEPLOY_USER npm install

    # Create .env for agent (if not using config file)
    cat > "$AGENT_PATH/.env" <<EOF
PORT=$AGENT_PORT
API_KEY=$AGENT_API_KEY
LARAVEL_URL=http://localhost
EOF
    chown $DEPLOY_USER:$DEPLOY_USER "$AGENT_PATH/.env"
    chmod 600 "$AGENT_PATH/.env"

    # Create systemd service
    cat > /etc/systemd/system/vps-agent.service <<EOF
[Unit]
Description=VPS Management Node.js Agent
After=network.target

[Service]
Type=simple
User=$DEPLOY_USER
WorkingDirectory=$AGENT_PATH
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable vps-agent
    systemctl start vps-agent
}