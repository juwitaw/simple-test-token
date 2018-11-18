FROM juwitaw/truffle-base-image:beta
LABEL MAINTAINER Juwita Winadwiastuti <juwita.winadwiastuti@dattabot.io>
COPY . /code
RUN npm install --save-exact openzeppelin-solidity@2.0.0