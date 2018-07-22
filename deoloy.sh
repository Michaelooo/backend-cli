BUILD_TIME=`date "+%Y%m%d%H%M"`
SERVER_HOST=""
SERVER_PATH=""
CONTAIN_NAME='webpub-backend'
IMAGE_NAME="xxx.com/webpub/test-webpub-backend:$BUILD_TIME"
rsync -cavzP --delete-after ./ --exclude-from='.rsync-exclude' $SERVER_HOST:$SERVER_PATH
ssh $SERVER_HOST "\
  cd $SERVER_PATH; \
  echo "删除旧容器";\
  docker stop webpub-backend;\
  docker rm webpub-backend; \

  echo "清理过时的测试镜像"; \
  docker images | awk '/^xxx.com\/webpub\/test-webpub-backend[ ]+/ { print $3 }' | xargs docker rmi -f; \
  
  echo "构建docker镜像 $IMAGE_NAME"; \
  docker build -t $IMAGE_NAME . ;\

  echo "发布docker镜像"; \
  docker push $IMAGE_NAME ;\

  echo "docker start"; \
  docker run -d -p 7777:3000 -e NODE_ENV=test \
  --hostname ubuntu-14 \
  -v /data/package/:/data/package/ \
  -v /home/:/home/ \
  --name=$CONTAIN_NAME $IMAGE_NAME ; \

  echo "生成 .ssh 目录"; \
  docker exec -i $CONTAIN_NAME \
  mkdir -p  ~/.ssh/ ;\
  echo "ok"; \

  echo "复制公钥,为了ssh登陆"; \
  docker exec -i $CONTAIN_NAME \
  cp -rf ./auth/test/* ~/.ssh/ ;\
  echo "ok"; \

  echo "修改权限"; \
  docker exec -i $CONTAIN_NAME \
  chmod 0600 ~/.ssh/id_rsa ;\
  echo "ok"; \

  echo "模拟登陆主机：首次使用rsync登陆主机存在验证合法性的问题"; \
  /usr/bin/expect << EOF
    
    set timeout -1
    spawn docker exec -it $CONTAIN_NAME ssh $SERVER_HOST ; \
    expect { 
      "*yes/no" { send "yes\\r"; exp_continue}
      "*\#" {exit } ;\
    }

  EOF ;\
  exit; \
  "


echo "\033[40;32m\n"
echo "Sync to Server: $SERVER_HOST"
echo "Build source code path: $SERVER_PATH"
echo "Image: $IMAGE_NAME"
echo "Image deploy success."
echo "\033[0m"

