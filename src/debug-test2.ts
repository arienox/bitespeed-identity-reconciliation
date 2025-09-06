import { Database } from './database';
import { IdentityService } from './identityService';

async function debugTest2() {
  console.log('🔍 Debug Test 2: Checking database queries...\n');

  const database = new Database();
  const identityService = new IdentityService(database);

  try {
    // Create first primary contact
    console.log('Step 1: Creating george@hillvalley.edu with phone 919191');
    await identityService.identify({
      email: 'george@hillvalley.edu',
      phoneNumber: '919191'
    });

    // Create second primary contact
    console.log('Step 2: Creating biffsucks@hillvalley.edu with phone 717171');
    await identityService.identify({
      email: 'biffsucks@hillvalley.edu',
      phoneNumber: '717171'
    });

    // Check what contacts exist
    console.log('\nStep 3: Checking all contacts in database');
    const allContacts = await database.findContactsByEmailOrPhone();
    console.log('All contacts:', JSON.stringify(allContacts, null, 2));

    // Check what we find when searching for george email + 717171 phone
    console.log('\nStep 4: Searching for george@hillvalley.edu + 717171');
    const foundContacts = await database.findContactsByEmailOrPhone('george@hillvalley.edu', '717171');
    console.log('Found contacts:', JSON.stringify(foundContacts, null, 2));

    // Check what we find when searching for just george email
    console.log('\nStep 5: Searching for just george@hillvalley.edu');
    const foundByEmail = await database.findContactsByEmailOrPhone('george@hillvalley.edu');
    console.log('Found by email:', JSON.stringify(foundByEmail, null, 2));

    // Check what we find when searching for just 717171 phone
    console.log('\nStep 6: Searching for just 717171');
    const foundByPhone = await database.findContactsByEmailOrPhone(undefined, '717171');
    console.log('Found by phone:', JSON.stringify(foundByPhone, null, 2));

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await database.close();
  }
}

debugTest2();
