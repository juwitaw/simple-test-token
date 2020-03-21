FROM juwitaw/truffle-base-image:truffle5.1.17-0.6.3
LABEL MAINTAINER Juwita Winadwiastuti <juwita.winadwiastuti@dattabot.io>
COPY . /code/
RUN npm install --save-exact openzeppelin-solidity@v3.0.0-rc.0