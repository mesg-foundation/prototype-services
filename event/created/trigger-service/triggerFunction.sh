#!/bin/bash

curl -X POST \
  https://wt-54a6fa92d4396b7a157d1220c47ff2fd-0.run.webtask.io/user-created-create-project \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{"data":{"Event":{"updatedFields":["updatedAt"],"node":{"id":"cj6w9dexld7ex015229igrruj","payload":"{\"jobId\":\"234\"}","trigger":{"id":"cj6w9dexld7ex015229igrruj","serviceData":"{\"code\":\"module.exports = (event, callback) => {\n\tcallback(null, event);\n}\"}","service":{"endpoint":"http://webhook.site/f32dd210-d856-4746-a239-0d7a612ec5a1"}}}}},"context":{"request":{"sourceIp":"test-ip","headers":{},"httpMethod":"post"},"graphcool":{"pat":"test-pat","projectId":"test-project-id","alias":"test-alias"},"environment":{},"auth":{"nodeId":"test-node-id","typeName":"test-type","token":"test-token"},"sessionCache":{}}}'