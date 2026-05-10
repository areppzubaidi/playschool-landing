pipeline {
  agent any

  environment {
    IMAGE_NAME = "areppzubaidi/playschool"
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
    DEPLOY_HOST = "${env.EC2_PUBLIC_IP}"   // injected from Jenkins env
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {

    stage('1. BUILD') {
      steps {
        echo '🏗️  Building Docker image...'
        sh '''
          docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest .
          docker images | grep playschool
        '''
      }
    }

    stage('2. TEST') {
      steps {
        echo '🧪 Running tests...'
        sh '''
          # Lint check (fail build on errors)
          docker run --rm -v "$PWD/app":/app -w /app node:20-alpine sh -c "npm ci && npm run build"

          # Smoke test the container
          docker run -d --name test-$BUILD_NUMBER -p 8888:80 ${IMAGE_NAME}:${IMAGE_TAG}
          sleep 5
          curl -fsS http://localhost:8888/health | grep -q "ok"
          curl -fsS http://localhost:8888/ | grep -q "Little Sprouts"
          docker stop test-$BUILD_NUMBER && docker rm test-$BUILD_NUMBER
        '''
      }
      post {
        failure {
          sh 'docker rm -f test-$BUILD_NUMBER || true'
        }
      }
    }

    stage('3. DEPLOY') {
      steps {
        echo '🚀 Deploying to AWS ASG instances...'
        withCredentials([
          usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS'),
          sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')
        ]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker push ${IMAGE_NAME}:${IMAGE_TAG}
            docker push ${IMAGE_NAME}:latest
          '''
          // ASG instances pull :latest on user-data refresh / cron
          // For instant deploy, we SSH to each instance behind ALB
          sh '''
            for IP in $(aws ec2 describe-instances \
              --filters "Name=tag:Project,Values=playschool" "Name=instance-state-name,Values=running" \
              --query "Reservations[].Instances[].PublicIpAddress" --output text); do
                ssh -o StrictHostKeyChecking=no -i $SSH_KEY ubuntu@$IP "
                  docker pull ${IMAGE_NAME}:latest &&
                  docker stop playschool || true &&
                  docker rm playschool || true &&
                  docker run -d --name playschool --restart unless-stopped -p 80:80 ${IMAGE_NAME}:latest
                "
            done
          '''
        }
      }
    }
  }

  post {
    success { echo "✅ Pipeline succeeded — Build #${env.BUILD_NUMBER}" }
    failure { echo "❌ Pipeline failed — investigate logs" }
    always  { sh 'docker logout || true' }
  }
}
