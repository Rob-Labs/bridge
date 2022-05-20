# Requirment

- Redis
- PM2

# ENV File

please use different listener and redeem RPC provider

# Running Listener

update chain last_block.txt to start block deployed or running bridge

pm2 start ropsten_listener.js
pm2 start eth_listener.js
pm2 start bsc_listener.js
pm2 start bsc_testnet_listener.js

# Running Redeem

pm2 start redeem/ropsten.js
pm2 start redeem/eth.js
pm2 start redeem/bsc.js
pm2 start redeem/bsc_testnet.js
