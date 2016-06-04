# mws-simple

nodejs Amazon MWS API in 100 lines of code

which means that you will have to do more work in order to make api calls but gives you the most control.  Response uses xml2js for conversion.

Defaults to US marketplace settings, but can code to override default
## Installation

npm install mws-simple

## Usage

### List Orders (open and created in last 24 hours):
``` javascript
let mws = require('mws-simple')({
  accessKeyId: YOUR ACCESS KEY
  secretAccessId: YOUR ACCESS KEY
  merchantId: YOUR MERCHANT ID
});

let date = new Date();
date.setDate(dateDate() - 1);

// create object with path and query
let listOrders = {
  path: '/Orders/2013-09-01',
  query: {
    Action: 'ListOrders',
    CreatedAfter: date.toISOString(),
    'MarketplaceId.Id.1': 'ATVPDKIKX0DER',
    'OrderStatus.Status.1': 'Unshipped',
    'OrderStatus.Status.2': 'PartiallyShipped',
    Version: '2013-09-01'
  }
}

mws.request(listOrders, function(e, result) {
  console.log(JSON.stringify(result));
});


```
## Contributing

Yes, please!

## License

MIT
