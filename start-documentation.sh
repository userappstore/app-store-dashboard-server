NODE_ENV="testing" \
APPID=$APP_STORE_DOCUMENTATION_DOMAIN \
APPLICATION_SERVER="http://0.0.0.0:7001" \
APPLICATION_SERVER_TOKEN="$APP_STORE_DOCUMENTATION_APPLICATION_SERVER_TOKEN" \
BCRYPT_FIXED_SALT="$APP_STORE_DOCUMENTATION_BCRYPT_FIXED_SALT" \
BCRYPT_WORKLOAD_FACTOR=$APP_STORE_DOCUMENTATION_BCRYPT_WORKLOAD_FACTOR \
DASHBOARD_SERVER="$APP_STORE_DOCUMENTATION_DASHBOARD_SERVER" \
DASHBOARD_SESSION_KEY="$APP_STORE_DOCUMENTATION_DASHBOARD_SESSION_KEY" \
DOMAIN="$APP_STORE_DOCUMENTATION_DOMAIN" \
IP="0.0.0.0" \
PORT=$APP_STORE_DOCUMENTATION_DASHBOARD_SERVER_PORT \
MAXIMUM_PASSWORD_LENGTH="1024" \
MAXIMUM_RESET_CODE_LENGTH="1024" \
MAXIMUM_USERNAME_LENGTH="1024" \
MINIMUM_PASSWORD_LENGTH="8" \
MINIMUM_RESET_CODE_LENGTH="8" \
MINIMUM_USERNAME_LENGTH="8" \
PAGE_SIZE="40" \
STRIPE_JS="3" \
STRIPE_KEY="$APP_STORE_DOCUMENTATION_STRIPE_KEY" \
STRIPE_PUBLISHABLE_KEY="$APP_STORE_DOCUMENTATION_STRIPE_PUBLISHABLE_KEY" \
CONNECT_ENDPOINT_SECRET="$APP_STORE_DOCUMENTATION_CONNECT_ENDPOINT_SECRET" \
SUBSCRIPTIONS_ENDPOINT_SECRET1="$APP_STORE_DOCUMENTATION_SUBSCRIPTIONS_ENDPOINT_SECRET1" \
SUBSCRIPTIONS_ENDPOINT_SECRET2="$APP_STORE_DOCUMENTATION_SUBSCRIPTIONS_ENDPOINT_SECRET2" \
REQUIRE_PROFILE_EMAIL=true \
REQUIRE_PROFILE_NAME=true \
STORAGE_PATH=/tmp/app-store-documentation-dashboard-server \
node main.js