#!/bin/bash

echo What should the version be?
read VERSION

docker build -t andybridges/reddit:$VERSION .
docker push andybridges/reddit:$VERSION
ssh root@165.232.34.190 "docker pull andybridges/reddit:$VERSION && docker tag andybridges/reddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"