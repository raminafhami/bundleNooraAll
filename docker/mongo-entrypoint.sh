#!/bin/sh
set -eu

# Persist the replica-set key separately from database files.
if [ ! -s /data/keyfile/replica-set.key ]; then
    openssl rand -base64 756 > /data/keyfile/replica-set.key
fi
chown mongodb:mongodb /data/keyfile/replica-set.key
chmod 400 /data/keyfile/replica-set.key
exec /usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /data/keyfile/replica-set.key
