#!/bin/bash
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root. Use sudo."
    fi
}

check_os() {
    if [[ ! -f /etc/os-release ]]; then
        log_error "Cannot detect OS."
    fi
    source /etc/os-release
    if [[ "$ID" != "ubuntu" ]] || [[ "$VERSION_ID" != "22.04" && "$VERSION_ID" != "24.04" ]]; then
        log_error "This installer supports Ubuntu 22.04 or 24.04 only."
    fi
}

check_ram() {
    local total_ram=$(free -m | awk '/^Mem:/{print $2}')
    if [[ $total_ram -lt 1024 ]]; then
        log_error "Insufficient RAM (${total_ram}MB). At least 1GB required for Laravel + agent."
    fi
}

wait_for_apt() {
    while fuser /var/lib/dpkg/lock >/dev/null 2>&1; do
        sleep 1
    done
}