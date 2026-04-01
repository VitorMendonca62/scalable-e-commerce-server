set -e


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Iniciando ambiente de testes E2E...${NC}\n"

set -a
. ./.env.test.local
set +a

cleanup() {
    echo -e "\n${YELLOW}🧹 Limpando ambiente de testes...${NC}"
    docker compose --env-file .env.test.local -f docker-compose.test.yaml down -v
    echo -e "${GREEN}✅ Ambiente limpo!${NC}"
}

trap cleanup EXIT INT TERM

echo -e "${YELLOW}📦 Parando containers antigos...${NC}"
docker compose --env-file .env.test.local -f docker-compose.test.yaml down -v 2>/dev/null || true

echo -e "${YELLOW}🐳 Subindo containers de teste...${NC}"
docker compose --env-file .env.test.local -f docker-compose.test.yaml up -d

echo -e "${YELLOW}⏳ Aguardando containers ficarem prontos...${NC}"
timeout=60
elapsed=0

while [ $elapsed -lt $timeout ]; do
    mongo_healthy=$(docker inspect --format='{{.State.Health.Status}}' database-auth-test 2>/dev/null || echo "starting")
    redis_healthy=$(docker inspect --format='{{.State.Health.Status}}' redis-auth-test 2>/dev/null || echo "starting")
    rabbit_healthy=$(docker inspect --format='{{.State.Health.Status}}' scalable-commerce-net-test 2>/dev/null || echo "starting")
    
  if [ "$mongo_healthy" = "healthy" ] && \
    [ "$redis_healthy" = "healthy" ] && \
    [ "$rabbit_healthy" = "healthy" ]; then
        echo -e "${GREEN}✅ Todos os containers estão prontos!${NC}\n"
        break
    fi
    
    echo -e "   MongoDB: $mongo_healthy | Redis: $redis_healthy | Rabbit: $rabbit_healthy"
    sleep 2
    elapsed=$((elapsed + 2))
done

if [ $elapsed -ge $timeout ]; then
    echo -e "${RED}❌ Timeout aguardando containers ficarem prontos${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Verificando conexões...${NC}"


if docker exec database-auth-test mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB conectado${NC}"
else
    echo -e "${RED}❌ Falha ao conectar no MongoDB${NC}"
    exit 1
fi

if docker exec redis-auth-test redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis conectado${NC}"
else
    echo -e "${RED}❌ Falha ao conectar no Redis${NC}"
    exit 1
fi

if docker exec scalable-commerce-net-test rabbitmq-diagnostics check_running > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Rabbit conectado${NC}"
else
    echo -e "${RED}❌ Falha ao conectar no Rabbit${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🗑️  Limpando banco de dados...${NC}"
docker exec database-auth-test mongosh \
    --username ${MONGO_INITDB_ROOT_USERNAME} \
    --password ${MONGO_INITDB_ROOT_PASSWORD} \
    --authenticationDatabase admin \
    ${MONGO_INITDB_DATABASE} \
    --eval "db.dropDatabase()" \
    --quiet

echo -e "${GREEN}✅ Banco de dados limpo${NC}\n"

echo -e "${YELLOW}🧪 Executando testes E2E...${NC}\n"

export $(cat .env.test.local | xargs)

TEST_CMD="cross-env NODE_ENV=test vitest --config vitest.config.e2e.ts"

if [ "$1" = "--cov" ]; then
  TEST_CMD="cross-env NODE_ENV=test vitest --coverage --config vitest.config.e2e.ts"
fi

bun run $TEST_CMD

exit $TEST_EXIT_CODE