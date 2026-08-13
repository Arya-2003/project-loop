const { Client } = require('pg');

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'ap-northeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'sa-east-1',
];

const pass = '%40Googleboy1245';
const user = 'postgres.fppjbmwujvwjqqzunzfc';

async function testRegion(region) {
  const url = `postgresql://${user}:${pass}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require`;
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log(`\nSUCCESS! Region is: ${region}`);
    console.log(`URL: ${url}`);
    await client.end();
    return true;
  } catch (e) {
    process.stdout.write('.');
    return false;
  }
}

async function run() {
  process.stdout.write('Testing regions');
  for (const region of regions) {
    const success = await testRegion(region);
    if (success) process.exit(0);
  }
  console.log('\nFailed to connect to any region.');
  process.exit(1);
}

run();
