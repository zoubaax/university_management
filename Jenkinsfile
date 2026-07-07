pipeline {
    agent any

    environment {
        JWT_SECRET = 'jenkins_test_secret_key'
        JWT_REFRESH_SECRET = 'jenkins_test_refresh_secret_key'
        COMPOSE_PROJECT_NAME = 'university_management'
    }

    stages {
        stage('Docker Info') {
            steps {
                echo 'Checking Docker environment...'
                sh 'docker --version'
                sh 'docker-compose --version'
            }
        }

        stage('Cleanup Previous Run') {
            steps {
                echo 'Removing any leftover containers from previous runs...'
                sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} down -v --remove-orphans || true'
            }
        }

        stage('Spin up Application Stack') {
            steps {
                echo 'Building and starting all services (postgres, backend, frontend) via Docker Compose...'
                sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} up --build -d'
            }
        }

        stage('Wait for Services') {
            steps {
                echo 'Waiting for backend server to respond to health check...'
                sh '''
                    timeout 120s bash -c '
                        until docker exec smart-upf-backend wget -qO- http://localhost:5000/health > /dev/null 2>&1; do
                            echo "Waiting for backend to be ready..."
                            sleep 3
                        done
                    '
                '''
                echo 'Application stack is ready!'
            }
        }

        stage('Run E2E Tests (Cypress)') {
            steps {
                echo 'Running Cypress E2E tests in a container...'
                sh '''
                    # Create a named volume and copy test files into it
                    # (bind mounts from Jenkins workspace don't work because Docker
                    #  resolves paths on the Mac host, not inside the Jenkins container)
                    docker volume create cypress-tests

                    # Use a temp container to copy files into the volume
                    docker create --name cypress-copy -v cypress-tests:/e2e alpine:latest
                    docker cp ${WORKSPACE}/frontend/cypress.config.js cypress-copy:/e2e/
                    docker cp ${WORKSPACE}/frontend/cypress cypress-copy:/e2e/
                    docker cp ${WORKSPACE}/frontend/package.json cypress-copy:/e2e/
                    docker rm cypress-copy

                    # Run Cypress against the volume
                    docker run --rm \
                        --network="${COMPOSE_PROJECT_NAME}_default" \
                        -e CYPRESS_baseUrl="http://smart-upf-frontend" \
                        -v cypress-tests:/e2e \
                        -w /e2e \
                        cypress/included:15.18.0

                    # Cleanup the volume
                    docker volume rm cypress-tests || true
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo 'Pushing Docker images to Docker Hub...'
                withCredentials([
                    string(credentialsId: 'dockerhub-username', variable: 'DOCKERHUB_USER'),
                    string(credentialsId: 'dockerhub-token', variable: 'DOCKERHUB_TOKEN')
                ]) {
                    sh '''
                        echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
                        
                        # Tag & Push Postgres
                        docker tag university_management-postgres:latest $DOCKERHUB_USER/smart-upf-postgres:latest
                        docker tag university_management-postgres:latest $DOCKERHUB_USER/smart-upf-postgres:$BUILD_NUMBER
                        docker push $DOCKERHUB_USER/smart-upf-postgres:latest
                        docker push $DOCKERHUB_USER/smart-upf-postgres:$BUILD_NUMBER

                        # Tag & Push Backend
                        docker tag university_management-backend:latest $DOCKERHUB_USER/smart-upf-backend:latest
                        docker tag university_management-backend:latest $DOCKERHUB_USER/smart-upf-backend:$BUILD_NUMBER
                        docker push $DOCKERHUB_USER/smart-upf-backend:latest
                        docker push $DOCKERHUB_USER/smart-upf-backend:$BUILD_NUMBER

                        # Tag & Push Frontend
                        docker tag university_management-frontend:latest $DOCKERHUB_USER/smart-upf-frontend:latest
                        docker tag university_management-frontend:latest $DOCKERHUB_USER/smart-upf-frontend:$BUILD_NUMBER
                        docker push $DOCKERHUB_USER/smart-upf-frontend:latest
                        docker push $DOCKERHUB_USER/smart-upf-frontend:$BUILD_NUMBER
                    '''
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                echo 'Deploying to AWS EC2...'
                withCredentials([sshUserPrivateKey(credentialsId: 'aws-ec2-ssh', keyFileVariable: 'IDENTITY_KEY', usernameVariable: 'SSH_USER')]) {
                    sh '''
                        scp -i "$IDENTITY_KEY" -o StrictHostKeyChecking=no docker-compose.prod.yml $SSH_USER@54.162.205.151:/home/ubuntu/smart-upf/docker-compose.prod.yml
                        ssh -i "$IDENTITY_KEY" -o StrictHostKeyChecking=no $SSH_USER@54.162.205.151 'cd /home/ubuntu/smart-upf && docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --remove-orphans && docker image prune -f'
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up resources and docker containers...'
            sh 'docker-compose -p ${COMPOSE_PROJECT_NAME} down -v || true'
        }
    }
}