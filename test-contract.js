const https = require('https');

const contract = '419f817dfb257a60015fbdde6d97fa86b7552d5fef';
const owner = '413caaf2506a408234f1d924d82dce09a77fa699e9';

const body = JSON.stringify({
  owner_address: owner,
  contract_address: contract,
  function_selector: 'getPropertyIds()',
  parameter: '',
  visible: false
});

const req = https.request(
  'https://nile.trongrid.io/wallet/triggerconstantcontract',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  },
  res => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(data);
    });
  }
);

req.on('error', err => {
  console.error('ERROR:', err.message);
});

req.write(body);
req.end();
