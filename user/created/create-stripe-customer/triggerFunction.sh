#!/bin/bash

curl -X POST \
  https://wt-54a6fa92d4396b7a157d1220c47ff2fd-0.run.webtask.io/user-created-create-stripe-customer \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{"data":{"User":{"updatedFields":["updatedAt"],"node":{"id":"cj4s770l6y3tm0176rgn4gsu5","email":"anthony.estebe@gmail.com"}}},"context":{"request":{"sourceIp":"test-ip","headers":{},"httpMethod":"post"},"graphcool":{"pat":"test-pat","projectId":"test-project-id","alias":"test-alias"},"environment":{},"auth":{"nodeId":"test-node-id","typeName":"test-type","token":"test-token"},"sessionCache":{}}}'