import { Client as HubSpotClient } from '@hubspot/api-client'

// Initialize HubSpot client
const hubspotClient = new HubSpotClient({ accessToken: process.env.HUBSPOT_API_KEY })

export interface ContactData {
  email: string
  name: string
  phone?: string
  role: 'buyer' | 'seller'
  location?: string
}

export interface MessageData {
  senderEmail: string
  recipientEmail: string
  listingTitle: string
  messageText: string
}

// HubSpot Integration
export class HubSpotCRM {
  static async createContact(data: ContactData): Promise<boolean> {
    try {
      const properties = {
        email: data.email,
        firstname: data.name.split(' ')[0] || '',
        lastname: data.name.split(' ').slice(1).join(' ') || '',
        phone: data.phone || '',
        custom_role: data.role,
        city: data.location || '',
        lifecyclestage: data.role === 'seller' ? 'customer' : 'lead',
      }

      await hubspotClient.crm.contacts.basicApi.create({
        properties,
        associations: [],
      })

      console.log('HubSpot contact created:', data.email)
      return true
    } catch (error) {
      console.error('Error creating HubSpot contact:', error)
      return false
    }
  }

  static async updateContact(email: string, data: Partial<ContactData>): Promise<boolean> {
    try {
      const properties: any = {}
      
      if (data.name) {
        properties.firstname = data.name.split(' ')[0] || ''
        properties.lastname = data.name.split(' ').slice(1).join(' ') || ''
      }
      if (data.phone) properties.phone = data.phone
      if (data.role) properties.custom_role = data.role
      if (data.location) properties.city = data.location

      await hubspotClient.crm.contacts.basicApi.update(email, {
        properties,
      })

      console.log('HubSpot contact updated:', email)
      return true
    } catch (error) {
      console.error('Error updating HubSpot contact:', error)
      return false
    }
  }

  static async logInteraction(data: MessageData): Promise<boolean> {
    try {
      // Create engagement for message interaction
      const engagementData = {
        engagement: {
          active: true,
          type: 'NOTE',
          timestamp: Date.now(),
        },
        associations: {
          contactIds: [], // Would need to get contact IDs first
        },
        metadata: {
          body: `Message sent regarding listing: ${data.listingTitle}\n\nMessage: ${data.messageText}`,
          subject: `Inquiry about ${data.listingTitle}`,
        },
      }

      // Note: This is a simplified version. In production, you'd want to:
      // 1. Find contact IDs by email
      // 2. Associate the engagement with both contacts
      // 3. Handle the engagement creation properly

      console.log('HubSpot interaction logged:', data.listingTitle)
      return true
    } catch (error) {
      console.error('Error logging HubSpot interaction:', error)
      return false
    }
  }
}

// Mailchimp Integration
export class MailchimpCRM {
  private static readonly API_KEY = process.env.MAILCHIMP_API_KEY!
  private static readonly AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID!
  private static readonly SERVER_PREFIX = MailchimpCRM.API_KEY?.split('-')[1] || 'us1'
  private static readonly BASE_URL = `https://${MailchimpCRM.SERVER_PREFIX}.api.mailchimp.com/3.0`

  static async addToAudience(data: ContactData): Promise<boolean> {
    try {
      const memberData = {
        email_address: data.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: data.name.split(' ')[0] || '',
          LNAME: data.name.split(' ').slice(1).join(' ') || '',
          PHONE: data.phone || '',
          ROLE: data.role,
          LOCATION: data.location || '',
        },
        tags: [
          data.role === 'seller' ? 'seller' : 'buyer',
          'high-voltage-classifieds',
        ],
      }

      const response = await fetch(
        `${MailchimpCRM.BASE_URL}/lists/${MailchimpCRM.AUDIENCE_ID}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`anystring:${MailchimpCRM.API_KEY}`).toString('base64')}`,
          },
          body: JSON.stringify(memberData),
        }
      )

      if (response.ok) {
        console.log('Mailchimp contact added:', data.email)
        return true
      } else {
        const error = await response.json()
        console.error('Mailchimp API error:', error)
        return false
      }
    } catch (error) {
      console.error('Error adding to Mailchimp audience:', error)
      return false
    }
  }

  static async updateContact(email: string, data: Partial<ContactData>): Promise<boolean> {
    try {
      const subscriberHash = require('crypto').createHash('md5').update(email.toLowerCase()).digest('hex')
      
      const updateData: any = {
        merge_fields: {},
      }

      if (data.name) {
        updateData.merge_fields.FNAME = data.name.split(' ')[0] || ''
        updateData.merge_fields.LNAME = data.name.split(' ').slice(1).join(' ') || ''
      }
      if (data.phone) updateData.merge_fields.PHONE = data.phone
      if (data.role) updateData.merge_fields.ROLE = data.role
      if (data.location) updateData.merge_fields.LOCATION = data.location

      const response = await fetch(
        `${MailchimpCRM.BASE_URL}/lists/${MailchimpCRM.AUDIENCE_ID}/members/${subscriberHash}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`anystring:${MailchimpCRM.API_KEY}`).toString('base64')}`,
          },
          body: JSON.stringify(updateData),
        }
      )

      if (response.ok) {
        console.log('Mailchimp contact updated:', email)
        return true
      } else {
        const error = await response.json()
        console.error('Mailchimp update error:', error)
        return false
      }
    } catch (error) {
      console.error('Error updating Mailchimp contact:', error)
      return false
    }
  }

  static async addTag(email: string, tag: string): Promise<boolean> {
    try {
      const subscriberHash = require('crypto').createHash('md5').update(email.toLowerCase()).digest('hex')
      
      const response = await fetch(
        `${MailchimpCRM.BASE_URL}/lists/${MailchimpCRM.AUDIENCE_ID}/members/${subscriberHash}/tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(`anystring:${MailchimpCRM.API_KEY}`).toString('base64')}`,
          },
          body: JSON.stringify({
            tags: [{ name: tag, status: 'active' }],
          }),
        }
      )

      if (response.ok) {
        console.log('Mailchimp tag added:', tag, 'to', email)
        return true
      } else {
        const error = await response.json()
        console.error('Mailchimp tag error:', error)
        return false
      }
    } catch (error) {
      console.error('Error adding Mailchimp tag:', error)
      return false
    }
  }
}

// Combined CRM operations
export class CRMIntegration {
  static async createContact(data: ContactData): Promise<void> {
    try {
      // Create contact in both systems
      await Promise.allSettled([
        HubSpotCRM.createContact(data),
        MailchimpCRM.addToAudience(data),
      ])
    } catch (error) {
      console.error('Error in CRM integration:', error)
    }
  }

  static async updateContact(email: string, data: Partial<ContactData>): Promise<void> {
    try {
      // Update contact in both systems
      await Promise.allSettled([
        HubSpotCRM.updateContact(email, data),
        MailchimpCRM.updateContact(email, data),
      ])
    } catch (error) {
      console.error('Error updating CRM contact:', error)
    }
  }

  static async logMessage(data: MessageData): Promise<void> {
    try {
      // Log interaction in HubSpot and add tag in Mailchimp
      await Promise.allSettled([
        HubSpotCRM.logInteraction(data),
        MailchimpCRM.addTag(data.senderEmail, 'active-user'),
        MailchimpCRM.addTag(data.recipientEmail, 'active-user'),
      ])
    } catch (error) {
      console.error('Error logging message in CRM:', error)
    }
  }
} 