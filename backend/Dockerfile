FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache imagemagick ghostscript ttf-dejavu fontconfig \
  && if [ -f /etc/ImageMagick-7/policy.xml ]; then \
       sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \\/>/<policy domain="coder" rights="read|write" pattern="PDF" \\/>/g' /etc/ImageMagick-7/policy.xml; \
     fi \
  && if [ -f /etc/ImageMagick-6/policy.xml ]; then \
       sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \\/>/<policy domain="coder" rights="read|write" pattern="PDF" \\/>/g' /etc/ImageMagick-6/policy.xml; \
     fi

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
