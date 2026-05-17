
## Tutorial
Complete local setup to learn Redis : https://www.youtube.com/watch?v=UEm0mHeXdxk

## Run
1. install bun if not present in your local machine
```
npm install -g bun
```
2. install package.json 
```
bun i
```
3. Run Docker
```
docker compose up -d
```
<img src="imgs/docker_containers.png" width="100%" />

4. Run Nodejs
```
npm run dev
```
<img src="imgs/server_run.png" width="100%" />

5. Test in Postman
in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/redis
<img src="imgs/redis_test_postman.png" width="70%" />
in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/mongodb
<img src="imgs/mongodb_test_postman.png" width="70%" />