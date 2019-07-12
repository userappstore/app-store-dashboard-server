NODE_ENV="development" \
APPID="userappstore.server7373.synology.me" \
APPLICATION_SERVER="$USERAPPSTORE_APPLICATION_SERVER" \
APPLICATION_SERVER_TOKEN="$USERAPPSTORE_APPLICATION_SERVER_TOKEN" \
BCRYPT_FIXED_SALT="$USERAPPSTORE_BCRYPT_FIXED_SALT" \
BCRYPT_WORKLOAD_FACTOR=$USERAPPSTORE_BCRYPT_WORKLOAD_FACTOR \
DASHBOARD_SERVER="$USERAPPSTORE_DASHBOARD_SERVER" \
DASHBOARD_SESSION_KEY="$USERAPPSTORE_DASHBOARD_SESSION_KEY" \
DOMAIN="$USERAPPSTORE_DOMAIN" \
IP="0.0.0.0" \
MAXIMUM_PASSWORD_LENGTH="1024" \
MAXIMUM_RESET_CODE_LENGTH="1024" \
MAXIMUM_USERNAME_LENGTH="1024" \
MINIMUM_PASSWORD_LENGTH="8" \
MINIMUM_RESET_CODE_LENGTH="8" \
MINIMUM_USERNAME_LENGTH="8" \
PAGE_SIZE="40" \
STRIPE_JS="3" \
STRIPE_KEY="$USERAPPSTORE_STRIPE_KEY" \
STRIPE_PUBLISHABLE_KEY="$USERAPPSTORE_STRIPE_PUBLISHABLE_KEY" \
CONNECT_ENDPOINT_SECRET="$USERAPPSTORE_CONNECT_ENDPOINT_SECRET" \
SUBSCRIPTIONS_ENDPOINT_SECRET1="$USERAPPSTORE_SUBSCRIPTIONS_ENDPOINT_SECRET1" \
SUBSCRIPTIONS_ENDPOINT_SECRET2="$USERAPPSTORE_SUBSCRIPTIONS_ENDPOINT_SECRET2" \
SILENT_START=true \
STORAGE_PATH=~/tmp/data1 \
node main.js

# App store startup parameters
# APPID="website.com"
# string default 
# prefixes data, eg a key becomes website.com/account/account_12345

# Organizations module startup parameters

# MINIMUM_ORGANIZATION_NAME_LENGTH=1 
# number default 1
# minumum length for organization names

# MAXIMUM_ORGANIZATION_NAME_LENGTH=50 
# number default 100
# maximum length for organization names

# MINIMUM_INVITATION_CODE_LENGTH=1 
# number default 10
# minumum length for organization invite codes

# MAXIMUM_INVITATION_CODE_LENGTH=50 
# number default 10
# minumum length for organization invite codes

# Connect module startup parameters

# STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxx 
# string received from Stripe
# an API key published inside HTML pages for web browsers to use Stripe

# STRIPE_KEY=sk_test_xxxxx
# string received from Stripe
# an API key used by the web server to use Stripe

# CONNECT_ENDPOINT_SECRET=whsec_xxxxxxx
# string received from Stripe
# used to verify webhooks received from stripe

# CONNECT_ENDPOINT_SECRET=whsec_xxxxxxx
# string received from Stripe
# used to verify webhooks received from stripe

# SUBSCRIPTIONS_ENDPOINT_SECRET_1=whsec_xxxxxxx
# string received from Stripe
# used to verify webhooks received from stripe for subscriptions within Connect accounts

# Subscriptions module startup parameters

# SUBSCRIPTIONS_ENDPOINT_SECRET2=whsec_xxxxxxx
# string received from Stripe
# used to verify webhooks received from stripe

# STRIPE_JS=3
# false | 2 | 3
# determines whether to use stripe.js in web browsers and which version

# Dashboard startup parameters

# NODE_ENV=development 
# production | development | testing
# when in production strict configuration is required

# PAGE_SIZE=3 
# number
# the number of rows of data on object list pages

# DASHBOARD_SERVER="http://localhost:8001" 
# URL
# the URL to your dashboard server

# DOMAIN=localhost 
# web domain
# the domain of your application server

# IP=0.0.0.0 
# ip default localhost
# start server on a public IP address

# PORT=8001 
# number
# start server on a specific port

# STORAGE_PATH=/tmp/test-data
# storage path if using file system

# ID_LENGTH=6 
# number
# the length of random ids

# ALLOW_PUBLIC_API=false 
# false | true default false
# permits public access to the browser API

# REQUIRE_PROFILE_EMAIL=false 
# false | true default false
# requires email address when registering

# REQUIRE_PROFILE_NAME=false 
# false |true default false
# requires name when registering

# DELETE_DELAY=7 # number
# accounts are flagged for deletion after this many days

# MINIMUM_PASSWORD_LENGTH=10 
# number default 1
# minimum length for passwords 

# MAXIMUM_PASSWORD_LENGTH=100 
# number default 50
# maximum length for passwords

# MINIMUM_USERNAME_LENGTH=10 
# number default 1
# minimum length for usernames

# MAXIMUM_USERNAME_LENGTH=100 
# number default 50
# maximum length for usernames

# MINIMUM_RESET_CODE_LENGTH=1 
# number default 10
# minumum length for account reset codes

# MAXIMUM_RESET_CODE_LENGTH=100 
# number default 50
# maximum length for account reset codes

# MINIMUM_PROFILE_FIRST_NAME_LENGTH=1 
# number default 1
# minumum length for first name

# MAXIMUM_PROFILE_FIRST_NAME_LENGTH=50 
# number default 50
# maximum length for first name

# MINIMUM_PROFILE_LAST_NAME_LENGTH=1 
# number default 1
# minumum length for last name

# MAXIMUM_PROFILE_LAST_NAME_LENGTH=50 
# number default 50
# maximum length for last name