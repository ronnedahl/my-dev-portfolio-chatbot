#!/bin/bash

# PeterBot Deployment Script för Hetzner
# Användning: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Deploying PeterBot to $ENV environment..."

# Färger för output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktioner
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Kontrollera att Docker är installerat
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    log_success "Docker and Docker Compose are available"
}

# Kontrollera att .env-filer finns
check_env_files() {
    if [ ! -f "langgraph-api/.env.production" ]; then
        log_error "Missing langgraph-api/.env.production file"
    fi
    
    log_success "Environment files are present"
}

# Bygg och starta containers
deploy_containers() {
    log_info "Building and starting containers..."
    
    # Stoppa befintliga containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    # Bygg nya images
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Starta services
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Containers are running"
}

# Vänta på att services ska starta
wait_for_services() {
    log_info "Waiting for services to be healthy..."
    
    # Vänta på API
    echo -n "Waiting for API"
    for i in {1..30}; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            echo ""
            log_success "API is healthy"
            break
        fi
        echo -n "."
        sleep 2
        if [ $i -eq 30 ]; then
            echo ""
            log_error "API failed to start within 60 seconds"
        fi
    done
    
    # Vänta på Frontend
    echo -n "Waiting for Frontend"
    for i in {1..15}; do
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            echo ""
            log_success "Frontend is healthy"
            break
        fi
        echo -n "."
        sleep 2
        if [ $i -eq 15 ]; then
            echo ""
            log_error "Frontend failed to start within 30 seconds"
        fi
    done
}

# Visa status
show_status() {
    log_info "Current status:"
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    log_info "Services are available at:"
    echo "  • API: http://localhost:8000 (or https://api.peterbod.dev)"
    echo "  • Chat: http://localhost:3000 (or https://chat.peterbod.dev)"
    echo "  • API Docs: http://localhost:8000/docs"
    echo "  • Cache Stats: http://localhost:8000/admin/cache/stats"
}

# Cleanup gamla images
cleanup() {
    log_info "Cleaning up old Docker images..."
    docker image prune -f
    docker system prune -f --volumes
    log_success "Cleanup completed"
}

# Backup (om det behövs)
backup_data() {
    log_info "Creating backup..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup logs
    if docker ps | grep -q peterbot-api; then
        docker logs peterbot-api > "$BACKUP_DIR/api.log" 2>&1
    fi
    
    log_success "Backup created in $BACKUP_DIR"
}

# Huvudfunktion
main() {
    log_info "Starting deployment process..."
    
    check_docker
    check_env_files
    backup_data
    deploy_containers
    wait_for_services
    show_status
    cleanup
    
    log_success "🎉 Deployment completed successfully!"
    log_info "Monitor logs with: docker-compose -f docker-compose.prod.yml logs -f"
}

# Script options
case "$1" in
    "status")
        docker-compose -f docker-compose.prod.yml ps
        ;;
    "logs")
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    "stop")
        docker-compose -f docker-compose.prod.yml down
        log_success "Services stopped"
        ;;
    "restart")
        docker-compose -f docker-compose.prod.yml restart
        log_success "Services restarted"
        ;;
    "clean")
        docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans
        docker system prune -af
        log_success "Complete cleanup done"
        ;;
    *)
        main
        ;;
esac