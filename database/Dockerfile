FROM postgres:17-alpine

# Copy the database dump and restore script directly into the image
COPY db.sql /tmp/db.dump
COPY restore.sh /docker-entrypoint-initdb.d/restore.sh

# Ensure the restore script is executable
RUN chmod +x /docker-entrypoint-initdb.d/restore.sh
