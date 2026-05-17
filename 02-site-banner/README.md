
## Tutorial
Site banner APIs with Redis : https://www.youtube.com/watch?v=kYeDJhA4XIw

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

5. Test in Postman
in Postman, you can test this endpoint by sending a POST request to http://localhost:3000/banner
<img src="imgs/redis_banner_post_testing.png" width="70%" />

in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/banner
<img src="imgs/redis_banner_get_testing.png" width="70%" />

in Postman, you can test this endpoint by sending a DELETE request to http://localhost:3000/banner
<img src="imgs/redis_banner_delete_testing.png" width="70%" />

in Postman, you can test this endpoint by sending a GET request to http://localhost:3000/banner/exists
<img src="imgs/redis_banner_exits_testing.png" width="70%" />