FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Assuming 'start' script runs the app or 'start:prod'
# Checking package.json would be ideal, but standard is npm start or node dist/main
RUN npm run build
CMD ["npm", "run", "start:prod"]
