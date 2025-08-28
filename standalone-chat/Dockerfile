# Dockerfile för fristående modulär chat frontend
FROM nginx:alpine

# Installera curl för health checks
RUN apk add --no-cache curl

# Skapa applikationskatalog
WORKDIR /usr/share/nginx/html

# Kopiera alla frontend-filer med korrekt struktur
COPY index.html ./
COPY assets/ ./assets/

# Kopiera nginx-konfiguration
COPY nginx.conf /etc/nginx/nginx.conf

# Sätt korrekta permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Exponera port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Starta nginx
CMD ["nginx", "-g", "daemon off;"]