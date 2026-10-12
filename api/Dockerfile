FROM node:jod-alpine3.23

EXPOSE 3000

COPY db.json /app/

RUN npm i json-server --global

CMD ["json-server", "/app/db.json"]