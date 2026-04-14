set -e


RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'


echo "${YELLOW}🚀 Iniciando ambiente de testes E2E...${NC}\n"

set -a
. ./.env.test
set +a

cleanup() {
    echo "\n${YELLOW}🧹 Limpando ambiente de testes...${NC}"
    docker compose --env-file .env.test -f docker-compose.test.yaml down -v
    echo "${GREEN}✅ Ambiente limpo!${NC}"
}

trap cleanup EXIT INT TERM

echo "${YELLOW}📦 Parando containers antigos...${NC}"
docker compose --env-file .env.test -f docker-compose.test.yaml down -v 2>/dev/null || true

echo "${YELLOW}🐳 Subindo containers de teste...${NC}"
docker compose --env-file .env.test -f docker-compose.test.yaml up -d

echo "${YELLOW}⏳ Aguardando containers ficarem prontos...${NC}"
timeout=60
elapsed=0

while [ $elapsed -lt $timeout ]; do
    postgres_healthy=$(docker inspect --format='{{.State.Health.Status}}' database-users-test 2>/dev/null || echo "starting")
    redis_healthy=$(docker inspect --format='{{.State.Health.Status}}' redis-users-test 2>/dev/null || echo "starting")
    rabbit_healthy=$(docker inspect --format='{{.State.Health.Status}}' scalable-commerce-net-test 2>/dev/null || echo "starting")

  if [ "$postgres_healthy" = "healthy" ] && \
    [ "$redis_healthy" = "healthy" ] && \
    [ "$rabbit_healthy" = "healthy" ]; then
        echo "${GREEN}✅ Todos os containers estão prontos!${NC}\n"
        break
    fi

    echo "   Postgres: $postgres_healthy | Redis: $redis_healthy | Rabbit: $rabbit_healthy"
    sleep 2
    elapsed=$((elapsed + 2))
done

if [ $elapsed -ge $timeout ]; then
    echo "${RED}❌ Timeout aguardando containers ficarem prontos${NC}"
    exit 1
fi

echo "${YELLOW}🔍 Verificando conexões...${NC}"


if docker exec redis-users-test redis-cli ping > /dev/null 2>&1; then
    echo "${GREEN}✅ Redis conectado${NC}"
else
    echo "${RED}❌ Falha ao conectar no Redis${NC}"
    exit 1
fi

if docker exec scalable-commerce-net-test rabbitmq-diagnostics check_running > /dev/null 2>&1; then
    echo "${GREEN}✅ Rabbit conectado${NC}"
else
    echo "${RED}❌ Falha ao conectar no Rabbit${NC}"
    exit 1
fi

echo "\n${YELLOW}🗑️  Limpando banco de dados...${NC}"

docker exec database-users-test psql \
  -U "$POSTGRES_USER" \
  -d postgres \
  -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";"

docker exec database-users-test psql \
  -U "$POSTGRES_USER" \
  -d postgres \
  -c "CREATE DATABASE \"$POSTGRES_DB\";"

echo "${GREEN}✅ Banco de dados limpo${NC}\n"

echo "${YELLOW}🧪 Executando testes E2E...${NC}\n"

export $(cat .env.test | xargs)

TEST_CMD="cross-env NODE_ENV=test vitest --config vitest.config.e2e.ts"

if [ "$1" = "--cov" ]; then
  TEST_CMD="cross-env NODE_ENV=test vitest --coverage --config vitest.config.e2e.ts"
fi

mkdir -p certs

bun run jwt:keys:generate

bun run migration:run

bun run $TEST_CMD

exit $TEST_EXIT_CODE