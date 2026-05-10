pipeline {
  agent any

  environment {
    IMAGE      = "areppzubaidi/playschool"
    TAG        = "${env.BUILD_NUMBER}"
    AWS_REGION = "ap-southeast-1"
    TG_ARN     = "arn:aws:elasticloadbalancing:ap-southeast-1:439152312386:targetgroup/playschool-tg/df4987714a9f60ed"
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 20, unit: 'MINUTES')
  }

  stages {

    stage('1. BUILD') {
      steps {
        echo "Building multi-arch image: ${IMAGE}:${TAG}"
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-creds',
          usernameVariable: 'DH_USER',
          passwordVariable: 'DH_PASS'
        )]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin

            docker buildx create --name cibuilder --use 2>/dev/null || docker buildx use cibuilder

            docker buildx build \
              --platform linux/amd64,linux/arm64 \
              -t ${IMAGE}:${TAG} \
              -t ${IMAGE}:latest \
              --push \
              .
          '''
        }
      }
    }

    stage('2. TEST') {
      steps {
        echo "Smoke testing image..."
        sh '''
          docker rm -f smoke-${BUILD_NUMBER} 2>/dev/null || true

          docker run -d \
            --name smoke-${BUILD_NUMBER} \
            -p 9999:80 \
            ${IMAGE}:${TAG}

          sleep 5

          STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9999/health)
          echo "Health check status: $STATUS"

          if [ "$STATUS" != "200" ]; then
            echo "FAIL: /health returned $STATUS"
            docker rm -f smoke-${BUILD_NUMBER}
            exit 1
          fi

          BODY=$(curl -s http://localhost:9999/)
          if ! echo "$BODY" | grep -q "Little Sprouts"; then
            echo "FAIL: page content not found"
            docker rm -f smoke-${BUILD_NUMBER}
            exit 1
          fi

          echo "PASS: health OK, content verified"
          docker rm -f smoke-${BUILD_NUMBER}
        '''
      }
      post {
        failure {
          sh 'docker rm -f smoke-${BUILD_NUMBER} 2>/dev/null || true'
        }
      }
    }

    stage('3. DEPLOY') {
      steps {
        echo "Deploying to all ASG instances..."
        withCredentials([
          sshUserPrivateKey(
            credentialsId: 'ec2-ssh-key',
            keyFileVariable: 'SSH_KEY',
            usernameVariable: 'SSH_USER'
          ),
          string(credentialsId: 'aws-access-key-id', variable: 'AWS_ACCESS_KEY_ID'),
          string(credentialsId: 'aws-secret-access-key', variable: 'AWS_SECRET_ACCESS_KEY')
        ]) {
          sh '''
            IPS=$(AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
                  AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
                  aws ec2 describe-instances \
                    --region $AWS_REGION \
                    --filters \
                      "Name=tag:Project,Values=playschool" \
                      "Name=instance-state-name,Values=running" \
                    --query "Reservations[].Instances[].PublicIpAddress" \
                    --output text)

            echo "Deploying to: $IPS"

            for IP in $IPS; do
              echo "==> $IP"
              ssh -i $SSH_KEY \
                  -o StrictHostKeyChecking=no \
                  -o ConnectTimeout=15 \
                  ubuntu@$IP "
                docker pull ${IMAGE}:${TAG} &&
                docker rm -f playschool 2>/dev/null || true &&
                docker run -d \
                  --name playschool \
                  --restart unless-stopped \
                  -p 80:80 \
                  ${IMAGE}:${TAG} &&
                sleep 3 &&
                curl -s http://localhost/health
              "
            done
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Build #${BUILD_NUMBER} deployed: ${IMAGE}:${TAG}"
    }
    failure {
      echo "Build #${BUILD_NUMBER} FAILED"
    }
    always {
      sh 'docker logout 2>/dev/null || true'
    }
  }
}
