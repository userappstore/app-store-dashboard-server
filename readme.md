# App Store Dashboard Server
The app store software is divided into two separate projects that must both be setup and configured, the application server and this dashboard server.

The corresponding application server builds on top of this to provide a project editor, subscription and free app store, and panelled interface for using installed projects, app and imported URLs.

This server integrates Dashboard to provide user account management, with its modules for Stripe subscriptions, Stripe Connect for publishing to the app store, and organizations for sharing access to apps and administrative tools.

The server is NodeJS and storage may be local file system, Redis, PostgreSQL or Amazon S3.  Redis may be used as a cache where that makes sense.

## Installation part 1: Dashboard Server

You must install [NodeJS](https://nodejs.org) 8.1.4+ prior to these steps.

    $ git clone https://github.com/userappstore/app-store-application-server
    $ cd app-store-application-server
    $ npm install --only=production
    $ STRIPE_KEY=abc \
      STRIPE_JS=2|3|false \
      SUBSCRIPTIONS_ENDPOINT_SECRET=xyz \
      APPLICATION_SERVER=http://localhost:3000 \
      APPLICATION_SERVER_TOKEN="a shared secret" \
      node main.js # check start-dev.sh for more startup parameters    

    # npm install git+https://github.com/userappstore/storage-redis
    # STORAGE_ENGINE="@userappstore/storage-redis"
    # REDIS_URL="..."

    # npm install git+https://github.com/userappstore/storage-s3
    # STORAGE_ENGINE="@userappstore/storage-s3"
    # S3_BUCKET_NAME=the_name
    # ACCESS_KEY_ID=secret from amazon
    # SECRET_ACCESS_KEY=secret from amazon

    # npm install git+https://github.com/userappstore/storage-postgresql
    # STORAGE_ENGINE="@userappstore/storage-redis"
    # DATABASE_URL="..."

## Installation part 2: Application server

Visit the [App Store Application Server](https://github.com/userappstore/app-store-application-server) for setup information.
      
### BYO storage engine
The storage interface is a basic read, write, list and delete API.  Check `storage-fs.js` and `storage-s3.js` for examples you can copy.

Pull requests are welcome with additional storage engines.  Do not include their modules in the `package.json` just have their driver etc install separately.

#### Dashboard documentation
- [Introduction](https://github.com/userappstore/dashboard/wiki)
- [Configuring Dashboard](https://github.com/userappstore/dashboard/wiki/Configuring-Dashboard)
- [Contributing to Dashboard](https://github.com/userappstore/dashboard/wiki/Contributing-to-Dashboard)
- [Dashboard code structure](https://github.com/userappstore/dashboard/wiki/Dashboard-code-structure)
- [Server request lifecycle](https://github.com/userappstore/dashboard/wiki/Server-Request-Lifecycle)

#### License

This is free and unencumbered software released into the public domain.  The MIT License is provided for countries that have not established a public domain.