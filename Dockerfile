# Use a simple nginx server to serve static files
FROM nginx:alpine

# Copy the web application files
COPY index.html /usr/share/nginx/html/
COPY web-config.html /usr/share/nginx/html/
COPY web-preview.html /usr/share/nginx/html/
COPY static/ /usr/share/nginx/html/static/
COPY logo.png /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/

# Copy any other HTML files
COPY *.html /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Nginx will start automatically