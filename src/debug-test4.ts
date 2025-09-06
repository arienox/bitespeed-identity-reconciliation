import { Database } from './database';
import { IdentityService } from './identityService';

async function debugTest4() {
  console.log('🔍 Debug Test 4: Checking merge execution...\n');

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

    // Check database state before merge
    console.log('\nStep 3: Database state before merge');
    const beforeMerge = await database.findContactsByEmailOrPhone();
    console.log('Before merge:', JSON.stringify(beforeMerge, null, 2));

    // Perform the merge
    console.log('\nStep 4: Performing merge with george@hillvalley.edu + 717171');
    const mergeResult = await identityService.identify({
      email: 'george@hillvalley.edu',
      phoneNumber: '717171'
    });
    console.log('Merge result:', JSON.stringify(mergeResult, null, 2));

    // Check database state after merge
    console.log('\nStep 5: Database state after merge');
    const afterMerge = await database.findContactsByEmailOrPhone();
    console.log('After merge:', JSON.stringify(afterMerge, null, 2));

    // Check what we find when querying biffsucks email
    console.log('\nStep 6: Querying biffsucks@hillvalley.edu after merge');
    const queryResult = await identityService.identify({
      email: 'biffsucks@hillvalley.edu'
    });
    console.log('Query result:', JSON.stringify(queryResult, null, 2));

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await database.close();
  }
}

debugTest4();
