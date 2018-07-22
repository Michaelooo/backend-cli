FROM docker.gf.com.cn/node-rsync:latest
MAINTAINER lizhonghui <lizhonghui@gf.com.cn>


RUN mkdir -p /opt/webpub
ADD . /opt/webpub

RUN mkdir /var/run/sshd -p
EXPOSE 22
EXPOSE 3000

WORKDIR /opt/webpub

#RUN npm config set registry http://registry_npm.gf.com.cn && \
#  NODEJS_ORG_MIRROR=http://registry_npm.gf.com.cn/mirrors/node npm i --production --verbose

RUN mkdir -p /data/package
RUN rsync --version

CMD node app && tail -f /etc/hosts
