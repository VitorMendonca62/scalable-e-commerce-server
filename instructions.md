## Iniciar container para mensageria
´´´bash
docker run -d --name message-broker-auth -e RABBITMQ_DEFAULT_USER=vhmendonca -e RABBITMQ_DEFAULT_PASS=Vh12345678 rabbitmq:3-management
´´´