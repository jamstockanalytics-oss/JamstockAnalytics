# Use nginx Alpine for lightweight static file serving
FROM nginx:alpine

# Copy web application files
COPY index.html /usr/share/nginx/html/
COPY web-config.html /usr/share/nginx/html/
COPY web-preview.html /usr/share/nginx/html/
COPY static/ /usr/share/nginx/html/static/
COPY logo.png /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/
COPY *.html /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Nginx starts automatically