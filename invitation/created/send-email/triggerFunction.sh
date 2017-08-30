#!/bin/bash

curl -X POST \
  https://wt-54a6fa92d4396b7a157d1220c47ff2fd-0.run.webtask.io/invitation-created-send-email \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{"data":{"Invitation":{"updatedFields":["updatedAt"],"node":{"id":"cj6z8dyp800033i5xfn8xc2h5","email":"anthony.estebe@gmail.com","project":{"id":"cj6z8dyp800043i5xutcm2717","name":"TEST"}}}},"context":{"request":{"sourceIp":"test-ip","headers":{},"httpMethod":"post"},"graphcool":{"pat":"test-pat","projectId":"test-project-id","alias":"test-alias"},"environment":{},"auth":{"nodeId":"test-node-id","typeName":"test-type","token":"test-token"},"sessionCache":{}}}'