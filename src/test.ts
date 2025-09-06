import { Database } from './database';
import { IdentityService } from './identityService';

async function runTests() {
  console.log('🧪 Starting Identity Reconciliation Tests...\n');

  const database = new Database();
  const identityService = new IdentityService(database);

  try {
    // Test 1: Create new primary contact
    console.log('Test 1: Creating new primary contact');
    const test1 = await identityService.identify({
      email: 'lorraine@hillvalley.edu',
      phoneNumber: '123456'
    });
    console.log('✅ Test 1 Result:', JSON.stringify(test1, null, 2));
    console.log('Expected: primaryContatctId: 1, emails: ["lorraine@hillvalley.edu"], phoneNumbers: ["123456"], secondaryContactIds: []\n');

    // Test 2: Create secondary contact with same phone, different email
    console.log('Test 2: Creating secondary contact with same phone, different email');
    const test2 = await identityService.identify({
      email: 'mcfly@hillvalley.edu',
      phoneNumber: '123456'
    });
    console.log('✅ Test 2 Result:', JSON.stringify(test2, null, 2));
    console.log('Expected: primaryContatctId: 1, emails: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"], phoneNumbers: ["123456"], secondaryContactIds: [2]\n');

    // Test 3: Query with just phone number
    console.log('Test 3: Query with just phone number');
    const test3 = await identityService.identify({
      phoneNumber: '123456'
    });
    console.log('✅ Test 3 Result:', JSON.stringify(test3, null, 2));
    console.log('Expected: Same as Test 2\n');

    // Test 4: Query with just email (lorraine)
    console.log('Test 4: Query with just email (lorraine)');
    const test4 = await identityService.identify({
      email: 'lorraine@hillvalley.edu'
    });
    console.log('✅ Test 4 Result:', JSON.stringify(test4, null, 2));
    console.log('Expected: Same as Test 2\n');

    // Test 5: Query with just email (mcfly)
    console.log('Test 5: Query with just email (mcfly)');
    const test5 = await identityService.identify({
      email: 'mcfly@hillvalley.edu'
    });
    console.log('✅ Test 5 Result:', JSON.stringify(test5, null, 2));
    console.log('Expected: Same as Test 2\n');

    // Test 6: Create separate primary contact
    console.log('Test 6: Creating separate primary contact');
    const test6 = await identityService.identify({
      email: 'george@hillvalley.edu',
      phoneNumber: '919191'
    });
    console.log('✅ Test 6 Result:', JSON.stringify(test6, null, 2));
    console.log('Expected: primaryContatctId: 3, emails: ["george@hillvalley.edu"], phoneNumbers: ["919191"], secondaryContactIds: []\n');

    // Test 7: Create another separate primary contact
    console.log('Test 7: Creating another separate primary contact');
    const test7 = await identityService.identify({
      email: 'biffsucks@hillvalley.edu',
      phoneNumber: '717171'
    });
    console.log('✅ Test 7 Result:', JSON.stringify(test7, null, 2));
    console.log('Expected: primaryContatctId: 4, emails: ["biffsucks@hillvalley.edu"], phoneNumbers: ["717171"], secondaryContactIds: []\n');

    // Test 8: Merge two primary contacts (george email + biffsucks phone)
    console.log('Test 8: Merging two primary contacts');
    const test8 = await identityService.identify({
      email: 'george@hillvalley.edu',
      phoneNumber: '717171'
    });
    console.log('✅ Test 8 Result:', JSON.stringify(test8, null, 2));
    console.log('Expected: primaryContatctId: 3, emails: ["george@hillvalley.edu", "biffsucks@hillvalley.edu"], phoneNumbers: ["919191", "717171"], secondaryContactIds: [4]\n');

    // Test 9: Verify the merge worked by querying biffsucks email
    console.log('Test 9: Verifying merge by querying biffsucks email');
    const test9 = await identityService.identify({
      email: 'biffsucks@hillvalley.edu'
    });
    console.log('✅ Test 9 Result:', JSON.stringify(test9, null, 2));
    console.log('Expected: Same as Test 8\n');

    // Test 10: Add new secondary to merged group
    console.log('Test 10: Adding new secondary to merged group');
    const test10 = await identityService.identify({
      email: 'marty@hillvalley.edu',
      phoneNumber: '717171'
    });
    console.log('✅ Test 10 Result:', JSON.stringify(test10, null, 2));
    console.log('Expected: primaryContatctId: 3, emails: ["george@hillvalley.edu", "biffsucks@hillvalley.edu", "marty@hillvalley.edu"], phoneNumbers: ["919191", "717171"], secondaryContactIds: [4, 5]\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await database.close();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };
