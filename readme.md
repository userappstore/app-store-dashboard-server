# App Store Dashboard Server

This application server is one half of the software, it is accompanied by an [Application server](https://github.com/userappstore/app-store-application-server).  This readme assumes you have configured the application server already.

# About

The app store software provides a website where users may code and share single-page applications or import hosted web applications by their server URL.  Users who complete a Stripe Connect registration may publish their apps with paid subscriptions.

- [App store Wiki](https://github.com/userappstore/app-store-application-server/wiki)
- [Compatibility guidelines](https://github.com/userappstore/app-store-application-server/wiki/Compatibility-guidelines)
- [Creating single-page apps](https://github.com/userappstore/app-store-application-server/wiki/Creating-single-page-apps)
- [Creating application servers](https://github.com/userappstore/app-store-application-server/wiki/Creating-application-servers)
- [Integrating existing web applications](https://github.com/userappstore/dashboard/wiki/Integrating-existing-web-applications)

## Screenshots of the app store software (both servers)

| ![Guest landing page](./src/www/public/1-app-store-landing-page.png?raw=true) | 
|:---------------------------------------------------------------------------------------------------------------:|
| Guest landing page that you replace with your own `/` route on your application server |

| ![Signed in home page](./src/www/public/2-app-store-signed-in.png?raw=true) |
|:---------------------------------------------------------------------------------------------------------------:|
| Signed in home page with an empty app store |

## Setting up your Stripe credentials

You will need to retrieve various keys from [Stripe](https://stripe.com).

- create your Stripe account 
- register your Connect platform
- find your API credentials
- create a Connect webhook for all events to https://your_domain/webhooks/connect/index-payout-data (CONNECT_ENDPOINT_SECRET)
- create a Connect webhook for all events to https://your_domain/webhooks/subscriptions/index-stripe-data (SUBSCRIPTIONS_ENDPOINT_SECRET1)
- create a regular webhook for all events to https://your_domain/webhooks/subscriptions/index-stripe-data (SUBSCRIPTIONS_ENDPOINT_SECRET2)
- find your webhook signing secret

## Installation part 1: Dashboard Server

You must install [NodeJS](https://nodejs.org) 8.12.0+ prior to these steps.  Check `start-dev.sh` to see the rest of the `env` variables that configure the app store dashboard server.

    $ mkdir my-app-store
    $ cd my-app-store
    $ npm int
    $ npm install @userappstore/app-store-dashboard-server
    $ APPID=website.com \
      APPLICATION_SERVER="http://localhost:3000" \
      APPLICATION_SERVER_TOKEN="this is a shared secret" \
      DASHBOARD_SERVER="https://website.com" \
      DASHBOARD_SESSION_KEY="this is a secret" \
      STRIPE_JS="3" \
      STRIPE_KEY="sk_test_xxxx" \
      STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx" \
      CONNECT_ENDPOINT_SECRET="whsec_xxxx" \
      SUBSCRIPTIONS_ENDPOINT_SECRET1="whsec_xxxx" \
      SUBSCRIPTIONS_ENDPOINT_SECRET2="whsec_xxxx" \
      node main.js

    # additional parameters using Redis
    # STORAGE_ENGINE="@userdashboard/storage-redis"
    # REDIS_URL="..."
    $ npm install @userdashboard/storage-redis
    
    # additional parameters using Amazon S3 or compatible
    # STORAGE_ENGINE="@userdashboard/storage-s3"
    # S3_BUCKET_NAME=the_name
    # ACCESS_KEY_ID=secret from amazon
    # SECRET_ACCESS_KEY=secret from amazon
    $ npm install @userdashboard/storage-s3

    # additional parameters using PostgreSQL
    # STORAGE_ENGINE="@userdashboard/storage-postgresql"
    # DATABASE_URL="..."
    $ npm install @userdashboard/storage-postgresql

## Installation part 2: Application server

Visit the [App Store Application Server](https://github.com/userappstore/app-store-application-server) if you have not completed that part.

#### Development

Development takes place on [Github](https://github.com/userappstore/app-store-dashboard-server) with releases on [NPM](https://www.npmjs.com/package/@userappstore/app-store-dashboard-server).

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.