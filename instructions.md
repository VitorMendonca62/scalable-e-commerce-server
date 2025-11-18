## Criar rede de mensageria:
```bash
docker network create scalable-commerce-net
```

## Iniciar container para mensageria
´´´bash
docker run -d --name scalable-commerce-net --network scalable-commerce-net -p 15672:15672 -p 5672:5672  -e RABBITMQ_DEFAULT_USER=vhmendonca -e RABBITMQ_DEFAULT_PASS=Vh12345678 rabbitmq:3-management-alpine
´´´