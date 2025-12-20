fix:
	docker compose run --build --rm server npm run fix
install:
	docker compose run --build --rm server npm install
snapshot:
	docker compose run --build --rm server npm run build
	docker compose run --build --rm server npm run snapshot
start:
	docker compose run --build --rm server npm run build
	docker compose up --build
test:
	docker compose run --build --rm server npm run build
	docker compose run --build --rm server npm test

docker:
	docker compose run --build --rm server bash -c "${c}"
