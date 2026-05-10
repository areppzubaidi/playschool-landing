#!/bin/bash
set -euxo pipefail
apt-get update -y
apt-get install -y docker.io
systemctl enable --now docker
usermod -aG docker ubuntu
docker run -d --name playschool --restart unless-stopped -p 80:80 areppzubaidi/playschool:latest
