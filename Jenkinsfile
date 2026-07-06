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
                // Run Cypress using its official Docker image on the same network as the compose stack
                sh '''
                    docker run --rm \
                        --network="${COMPOSE_PROJECT_NAME}_default" \
                        -e CYPRESS_baseUrl="http://smart-upf-frontend" \
                        -v "${WORKSPACE}/frontend:/e2e" \
                        -w /e2e \
                        cypress/included:15.18.0
                '''
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