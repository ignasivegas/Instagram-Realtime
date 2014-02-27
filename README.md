Intagram-Realtime
=================

Show realtime Instagram photos by hashtag or Geographie (Node.js, socket.io and Redis)
This app, is based on https://github.com/Instagram/Realtime-Demo (Deprecated).
I adapted it, and also add subscription tags.

Demo: http://www.mwclive.com/


Instalation
============

- Install Node *brew install node*
- Install redis *brew install redis*
- Clone Project
- Install dependencies: npm install
- Add your client_id and client_secret to settings.js

**Subscribe to a tag or geography:**

In subscribe_examples.info file, you have subscription examples.


**Add your env variables:**

export IG_CLIENT_ID=xxxxx

export IG_CLIENT_SECRET_ID=xxxxx

export IG_CALLBACK_HOST=http://xxxxx.com



PD: If you wanna run this on localhost, you need to provide a callback_url different to localhost or 127.0.0.1
You can do it using: https://ngrok.com/


**Start redis:**

redis-server conf/redis.conf


**Start node:**

node web.js


**Possible Issues:**
Redis connection failed: Change the redis port, in conf/redis.conf file


Heroku
======

This app is ready to run on heroku, and using redisToGo






