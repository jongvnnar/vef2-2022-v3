import { createSchema, dropSchema, end, insertData } from './lib/db.js';

async function create() {
  const drop = await dropSchema();

  if (drop) {
    console.info('schema dropped');
  } else {
    console.info('schema not dropped, exiting');
    process.exit(-1);
  }

  const result = await createSchema();

  if (result) {
    console.info('schema created');
  } else {
    console.info('schema not created');
  }

  const insert = await insertData();

  if (insert) {
    console.info('data inserted');
  } else {
    console.info('data not inserted');
  }

  await end();
}

create().catch((err) => {
  console.error('Error creating running setup', err);
});
