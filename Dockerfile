# Especifica la imagen base que se utilizará para construir la imagen de Docker
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Establece variables de entorno
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Establece el directorio de trabajo dentro de la imagen de Docker
WORKDIR /usr/src/app

# Copia los archivos package.json y package-lock.json (si existen) desde el directorio local al directorio de trabajo dentro de la imagen de Docker
COPY package*.json ./

# Instala las dependencias de Node.js utilizando el archivo package-lock.json
RUN npm ci

# Copia el resto de los archivos de la aplicación desde el directorio local al directorio de trabajo dentro de la imagen de Docker
COPY . .

# Especifica el comando predeterminado que se ejecutará cuando se inicie un contenedor basado en esta imagen
CMD [ "node", "index.js" ]