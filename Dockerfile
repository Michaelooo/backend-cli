FROM xxx.com.cn/node-rsync:latest
MAINTAINER michaelcheng <422201870@qq.com>


RUN mkdir -p /opt/webpub
ADD . /opt/webpub

RUN mkdir /var/run/sshd -p
EXPOSE 22
EXPOSE 3000

WORKDIR /opt/webpub

RUN mkdir -p /data/package
RUN rsync --version

CMD node app && tail -f /etc/hosts
