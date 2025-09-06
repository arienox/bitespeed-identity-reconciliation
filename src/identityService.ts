import { Database, Contact } from './database';

export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

export interface IdentifyResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export class IdentityService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = request;

    // Validate that at least one contact method is provided
    if (!email && !phoneNumber) {
      throw new Error('Either email or phoneNumber must be provided');
    }

    // Find existing contacts that match the provided email or phone
    const existingContacts = await this.db.findContactsByEmailOrPhone(email, phoneNumber);

    if (existingContacts.length === 0) {
      // No existing contacts found, create a new primary contact
      const newContactId = await this.db.createContact({
        phoneNumber: phoneNumber || null,
        email: email || null,
        linkedId: null,
        linkPrecedence: 'primary',
        deletedAt: null
      });

      return {
        contact: {
          primaryContatctId: newContactId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      };
    }

    // Find all primary contacts in the result set
    const primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');
    
    // If we have multiple primary contacts, we need to merge them
    // The oldest primary contact becomes the main one
    let primaryContact;
    if (primaryContacts.length > 0) {
      primaryContact = primaryContacts.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
      );
    } else {
      // If no primary contacts found in the result set, 
      // we need to find the primary contact that the secondary contacts are linked to
      const secondaryContacts = existingContacts.filter(c => c.linkPrecedence === 'secondary');
      if (secondaryContacts.length > 0) {
        // Get the primary contact that the first secondary is linked to
        const linkedPrimaryId = secondaryContacts[0].linkedId;
        if (linkedPrimaryId) {
          const linkedPrimary = await this.db.findPrimaryContact(linkedPrimaryId);
          if (linkedPrimary) {
            primaryContact = linkedPrimary;
          } else {
            primaryContact = existingContacts[0]; // Fallback
          }
        } else {
          primaryContact = existingContacts[0]; // Fallback
        }
      } else {
        primaryContact = existingContacts[0]; // Fallback
      }
    }
    
    // Check if we need to merge separate contact groups FIRST
    const otherPrimaryContacts = primaryContacts.filter(c => c.id !== primaryContact.id);

    if (otherPrimaryContacts.length > 0) {
      // We have multiple primary contacts that need to be merged
      // Convert the newer primary contacts to secondary
      for (const otherPrimary of otherPrimaryContacts) {
        await this.db.updateContact(otherPrimary.id, {
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id,
          updatedAt: new Date()
        });

        // Update all secondary contacts linked to the old primary
        const secondaryContacts = await this.db.findContactsByLinkedId(otherPrimary.id);
        for (const secondary of secondaryContacts) {
          await this.db.updateContact(secondary.id, {
            linkedId: primaryContact.id,
            updatedAt: new Date()
          });
        }
      }

      // Refresh the linked contacts list
      const updatedLinkedContacts = await this.db.getAllLinkedContacts(primaryContact.id);
      return this.buildResponse(updatedLinkedContacts);
    }

    // Get all linked contacts
    const allLinkedContacts = await this.db.getAllLinkedContacts(primaryContact.id);

    // Check if we need to create a new secondary contact
    const hasNewEmail = email && !allLinkedContacts.some(c => c.email === email);
    const hasNewPhone = phoneNumber && !allLinkedContacts.some(c => c.phoneNumber === phoneNumber);

    if (hasNewEmail || hasNewPhone) {
      // Create a new secondary contact
      await this.db.createContact({
        phoneNumber: phoneNumber || null,
        email: email || null,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
        deletedAt: null
      });

      // Refresh the linked contacts list
      const updatedLinkedContacts = await this.db.getAllLinkedContacts(primaryContact.id);
      return this.buildResponse(updatedLinkedContacts);
    }

    // No new information, return existing linked contacts
    return this.buildResponse(allLinkedContacts);
  }

  private buildResponse(contacts: Contact[]): IdentifyResponse {
    const primaryContact = contacts.find(c => c.linkPrecedence === 'primary') || contacts[0];
    const secondaryContacts = contacts.filter(c => c.linkPrecedence === 'secondary');

    // Collect unique emails and phone numbers
    const emails = [...new Set(contacts.map(c => c.email).filter(Boolean))] as string[];
    const phoneNumbers = [...new Set(contacts.map(c => c.phoneNumber).filter(Boolean))] as string[];

    return {
      contact: {
        primaryContatctId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryContacts.map(c => c.id)
      }
    };
  }
}
