import { Database } from './database';
import { IdentityService } from './identityService';

async function debugTest() {
  console.log('🔍 Debug Test: Checking merge behavior...\n');

  const database = new Database();
  const identityService = new IdentityService(database);

  try {
    // Create first primary contact
    console.log('Step 1: Creating george@hillvalley.edu with phone 919191');
    const test1 = await identityService.identify({
      email: 'george@hillvalley.edu',
      phoneNumber: '919191'
    });
    console.log('Result:', JSON.stringify(test1, null, 2));

    // Create second primary contact
    console.log('\nStep 2: Creating biffsucks@hillvalley.edu with phone 717171');
    const test2 = await identityService.identify({
      email: 'biffsucks@hillvalley.edu',
      phoneNumber: '717171'
    });
    console.log('Result:', JSON.stringify(test2, null, 2));

    // Merge them
    console.log('\nStep 3: Merging with george@hillvalley.edu + 717171');
    const test3 = await identityService.identify({
      email: 'george@hillvalley.edu',
      phoneNumber: '717171'
    });
    console.log('Result:', JSON.stringify(test3, null, 2));

    // Query biffsucks email after merge
    console.log('\nStep 4: Querying biffsucks@hillvalley.edu after merge');
    const test4 = await identityService.identify({
      email: 'biffsucks@hillvalley.edu'
    });
    console.log('Result:', JSON.stringify(test4, null, 2));

    // Let's also check what's in the database
    console.log('\nStep 5: Checking all contacts in database');
    const allContacts = await database.getAllLinkedContacts(3); // Assuming primary is 3
    console.log('All contacts linked to primary 3:', JSON.stringify(allContacts, null, 2));

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await database.close();
  }
}

debugTest();
