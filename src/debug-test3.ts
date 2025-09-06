import { Database } from './database';
import { IdentityService } from './identityService';

async function debugTest3() {
  console.log('🔍 Debug Test 3: Checking identity service merge logic...\n');

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

    // Now let's manually check what the identity service finds
    console.log('\nStep 3: Manually checking what identity service finds for george@hillvalley.edu + 717171');
    
    // Simulate the identity service logic
    const existingContacts = await database.findContactsByEmailOrPhone('george@hillvalley.edu', '717171');
    console.log('Existing contacts found:', JSON.stringify(existingContacts, null, 2));
    
    const primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');
    console.log('Primary contacts:', JSON.stringify(primaryContacts, null, 2));
    
    const primaryContact = primaryContacts.length > 0 
      ? primaryContacts.reduce((oldest, current) => 
          current.createdAt < oldest.createdAt ? current : oldest
        )
      : existingContacts[0];
    console.log('Selected primary contact:', JSON.stringify(primaryContact, null, 2));
    
    const otherPrimaryContacts = primaryContacts.filter(c => c.id !== primaryContact.id);
    console.log('Other primary contacts to merge:', JSON.stringify(otherPrimaryContacts, null, 2));

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await database.close();
  }
}

debugTest3();
