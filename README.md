# 如何使用

## release部署

```shell
    cd ./scripts
    bash download-latest.sh
    bash boot.sh
```


## 源码部署

```shell
    cd ./panel
    yarn 
    yarn build
    cd ..
    docker-compose build
    docker-compose up -d
```
