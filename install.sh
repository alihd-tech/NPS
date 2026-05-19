#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Load configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.env"
source "$SCRIPT_DIR/lib/utils.sh"
source "$SCRIPT_DIR/lib/system.sh"
source "$SCRIPT_DIR/lib/lemp.sh"
source "$SCRIPT_DIR/lib/laravel.sh"
source "$SCRIPT_DIR/lib/node-agent.sh"
source "$SCRIPT_DIR/lib/nginx.sh"

# Pre-flight checks
check_root
check_os
check_ram

# Main installation phases
log_info "Starting VPS Manager installation..."

phase_system_setup
phase_install_lemp
phase_deploy_laravel
phase_deploy_node_agent
phase_configure_nginx
phase_final_hardening

log_info "Installation completed successfully!"
log_info "Access your VPS Manager at http://$DOMAIN (or your server IP)"
log_info "Admin credentials: email=$ADMIN_EMAIL, password=$ADMIN_PASSWORD"