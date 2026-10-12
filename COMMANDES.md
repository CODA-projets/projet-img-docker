# Création des images

## API

```bash
docker build -t api-node ./api  
```

## Client

```bash
docker build -t client-node ./client 
```

# Lancement des images

## API

```bash
docker run -d --name api-projet-node -p 3000:3000 api-node 
```

## Client

```bash
docker run -d --name client-projet-node -p 8080:80 client-node
```

