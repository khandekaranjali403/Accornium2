# Accornium Backend - Docker Setup

This project includes Docker configuration for containerizing the Accornium Backend application.

## Files Included

- **Dockerfile**: Multi-stage build for the Spring Boot application
- **docker-compose.yml**: Orchestration for MySQL and the backend service
- **.dockerignore**: Files to exclude from Docker build context

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start with Docker Compose

The easiest way to run the application with MySQL is using docker-compose:

### 1. Build and Start Services

```bash
cd D:\accornium\backend
docker-compose up --build
```

This command will:
- Build the Docker image for the backend application
- Start MySQL 8.0 container
- Start the backend application container
- Wait for MySQL to be healthy before starting the backend
- Expose the application on `http://localhost:8080`

### 2. Access the Application

```bash
# Check health endpoint
curl http://localhost:8080/api/health

# Submit a contact message
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'

# Get all messages
curl http://localhost:8080/api/contact
```

### 3. Stop Services

```bash
docker-compose down
```

To also remove the MySQL data volume:

```bash
docker-compose down -v
```

## Building the Docker Image Manually

If you prefer to build the image without docker-compose:

```bash
cd D:\accornium\backend
docker build -t accornium-backend:1.0.0 .
```

## Running the Container Manually

### Option 1: With External MySQL

```bash
docker run -d \
  --name accornium-backend \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/accorniumdb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root \
  accornium-backend:1.0.0
```

### Option 2: Link to MySQL Container

First, start MySQL:

```bash
docker run -d \
  --name accornium-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=accorniumdb \
  -p 3306:3306 \
  mysql:8.0-debian
```

Then start the backend (link to MySQL):

```bash
docker run -d \
  --name accornium-backend \
  --link accornium-mysql:mysql \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/accorniumdb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root \
  accornium-backend:1.0.0
```

## Environment Variables

You can customize the application behavior with these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | See `application.properties` | MySQL database URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `root` | Database password |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Hibernate DDL behavior (create, update, validate, none) |
| `SPRING_JPA_SHOW_SQL` | `true` | Enable SQL logging |
| `SERVER_PORT` | `8080` | Application port |

## Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View container logs
docker logs accornium-backend

# Follow container logs in real-time
docker logs -f accornium-backend

# Execute command in running container
docker exec -it accornium-backend sh

# Remove container
docker rm accornium-backend

# Remove image
docker rmi accornium-backend:1.0.0

# View docker-compose logs
docker-compose logs -f
```

## Troubleshooting

### Container exits immediately
- Check logs: `docker logs accornium-backend`
- Ensure MySQL is running and accessible
- Verify credentials in environment variables

### Connection refused to MySQL
- Ensure MySQL container is running: `docker ps | grep mysql`
- Check MySQL container logs: `docker logs accornium-mysql`
- Wait for MySQL to be healthy (can take 20-30 seconds on first start)

### Port already in use
- Change the port mapping in docker-compose.yml or `docker run` command
- Example: `-p 8081:8080` (external port 8081 maps to container port 8080)

### Permission denied errors
- On Linux, you may need to run Docker with `sudo` or add your user to the docker group

## Production Considerations

For production deployments:

1. **Use a secrets manager** for sensitive data (passwords, API keys)
2. **Set proper resource limits** in docker-compose.yml (CPU, memory)
3. **Use a reverse proxy** (nginx, Traefik) for routing
4. **Enable SSL/TLS** certificates
5. **Use persistent volumes** for database data
6. **Implement proper logging** and monitoring
7. **Use specific image tags** (not `latest`)
8. **Scan images for vulnerabilities**: `docker scan accornium-backend:1.0.0`

## CI/CD Integration

### Example GitHub Actions Workflow

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: [v*]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: username/accornium-backend:${{ github.ref_name }}
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)

