.PHONY: setup dev test e2e lint build check clean db-reset

setup:
	npm install
	@test -f .env || cp .env.example .env
	npm run db:generate
	npm run db:migrate
	npm run db:seed
	@echo ""
	@echo "GreenQuote setup complete."
	@echo "Run: make dev"

dev:
	npm run dev

test:
	npm test

e2e:
	npm run test:e2e

lint:
	npm run lint

build:
	npm run build

check:
	npm run lint
	npm test
	npm run build

db-reset:
	npx prisma migrate reset --force
	npm run db:seed

clean:
	rm -rf .next
	rm -rf .tmp
	rm -rf logs