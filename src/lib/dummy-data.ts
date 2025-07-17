import { createAdminSupabase } from './supabase-server'
import { v4 as uuidv4 } from 'uuid'

const supabase = createAdminSupabase()

// Sample data for generating realistic listings
const equipmentData = [
  {
    category: 'Transformers',
    items: [
      { name: '500 kVA Power Transformer', basePrice: 45000, description: 'Excellent condition 500 kVA power transformer. Recently tested and certified. Includes all original documentation and has been regularly maintained. Perfect for industrial applications requiring reliable power distribution.' },
      { name: '1000 kVA Distribution Transformer', basePrice: 75000, description: 'Heavy-duty distribution transformer with proven reliability. Suitable for utility-scale applications. Recently serviced and includes comprehensive test reports.' },
      { name: '300 kVA Step-Down Transformer', basePrice: 32000, description: 'Compact step-down transformer ideal for commercial installations. Low-maintenance design with excellent efficiency ratings.' },
      { name: '750 kVA Pad-Mount Transformer', basePrice: 58000, description: 'Weather-resistant pad-mount transformer for outdoor installations. Includes protective cabinet and all necessary hardware.' },
    ]
  },
  {
    category: 'Breakers',
    items: [
      { name: '15 kV Vacuum Circuit Breaker', basePrice: 12500, description: 'High-quality 15 kV vacuum circuit breaker in like-new condition. Includes control panel and protection systems. Excellent for medium voltage applications.' },
      { name: '35 kV Gas Circuit Breaker', basePrice: 28000, description: 'Reliable gas-insulated circuit breaker with remote operation capabilities. Fully tested and certified for safety.' },
      { name: '5 kV Air Circuit Breaker', basePrice: 8500, description: 'Compact air circuit breaker suitable for low to medium voltage applications. Easy installation and maintenance.' },
      { name: '25 kV Outdoor Circuit Breaker', basePrice: 22000, description: 'Weather-resistant outdoor circuit breaker with excellent breaking capacity. Includes lightning protection features.' },
    ]
  },
  {
    category: 'Motors',
    items: [
      { name: '1000 HP Electric Motor', basePrice: 28000, description: 'Industrial-grade 1000 HP electric motor. Good working condition with recent maintenance records. Suitable for heavy industrial applications.' },
      { name: '500 HP Synchronous Motor', basePrice: 35000, description: 'High-efficiency synchronous motor with variable speed control. Perfect for pumps and compressors.' },
      { name: '2000 HP Induction Motor', basePrice: 45000, description: 'Heavy-duty induction motor designed for continuous operation. Excellent for mining and steel industry applications.' },
      { name: '750 HP AC Motor', basePrice: 24000, description: 'Reliable AC motor with soft-start capabilities. Recently refurbished with new bearings and windings.' },
    ]
  },
  {
    category: 'Switchgear',
    items: [
      { name: 'Medium Voltage Switchgear Panel', basePrice: 75000, description: 'Complete medium voltage switchgear panel. Includes protective relays, control systems, and monitoring equipment. Suitable for industrial substations.' },
      { name: 'Low Voltage Switchgear Assembly', basePrice: 45000, description: 'Modular low voltage switchgear with intelligent protection systems. Easy to expand and modify for future needs.' },
      { name: 'Metal-Clad Switchgear Unit', basePrice: 85000, description: 'Heavy-duty metal-clad switchgear for critical applications. Includes arc flash protection and remote monitoring capabilities.' },
      { name: 'Outdoor Switchgear Station', basePrice: 125000, description: 'Complete outdoor switchgear station with weather protection. Ideal for utility and industrial substations.' },
    ]
  },
  {
    category: 'Panels',
    items: [
      { name: 'Generator Control Panel', basePrice: 8500, description: 'Advanced generator control panel with automatic transfer switch capabilities. Fair condition, suitable for backup power systems.' },
      { name: 'Motor Control Center', basePrice: 15000, description: 'Comprehensive motor control center with variable frequency drives. Excellent for industrial automation applications.' },
      { name: 'Distribution Panel Board', basePrice: 3500, description: 'Standard distribution panel board with surge protection. Perfect for commercial and light industrial use.' },
      { name: 'PLC Control Panel', basePrice: 12000, description: 'Programmable logic controller panel with HMI interface. Includes custom programming for specific applications.' },
    ]
  }
]

const locations = [
  'Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Phoenix, AZ',
  'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Miami, FL', 'Chicago, IL',
  'Detroit, MI', 'Charlotte, NC', 'Seattle, WA', 'Portland, OR', 'Las Vegas, NV'
]

const conditions: Array<'new' | 'used' | 'refurbished'> = ['new', 'used', 'refurbished']

const companies = [
  'PowerTech Solutions', 'Industrial Electric Co.', 'Voltage Systems Inc.',
  'ElectroMax Industries', 'High Voltage Specialists', 'Energy Equipment Corp.',
  'Transformer Technologies', 'Circuit Solutions LLC', 'Power Distribution Co.',
  'Industrial Motors Inc.', 'Switchgear Specialists', 'Electrical Components Co.'
]

const names = [
  'John Smith', 'Sarah Johnson', 'Michael Chen', 'Lisa Thompson', 'David Rodriguez',
  'Emily Davis', 'Robert Wilson', 'Jennifer Martinez', 'James Anderson', 'Maria Garcia',
  'William Brown', 'Ashley Miller', 'Christopher Taylor', 'Amanda White', 'Daniel Lee'
]

// Generate random data helpers
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomPrice(basePrice: number): number {
  const variation = 0.3 // 30% variation
  const min = basePrice * (1 - variation)
  const max = basePrice * (1 + variation)
  return Math.round(min + Math.random() * (max - min))
}

function getRandomDate(daysBack: number = 30): string {
  const now = new Date()
  const pastDate = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000)
  return pastDate.toISOString()
}

// Data generation classes
export class DummyDataGenerator {
  // Generate sample users
  static async generateUsers(count: number = 20): Promise<void> {
    console.log(`Generating ${count} sample users...`)
    
    const users = []
    for (let i = 0; i < count; i++) {
      const isSeller = Math.random() > 0.3 // 70% sellers, 30% buyers
      const user = {
        id: uuidv4(),
        email: `user${i + 1}@example.com`,
        name: getRandomItem(names),
        role: isSeller ? 'seller' as const : 'buyer' as const,
        phone: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        location: getRandomItem(locations),
        created_at: getRandomDate(90),
        updated_at: getRandomDate(30)
      }
      users.push(user)
    }

    const { error } = await supabase
      .from('users')
      .insert(users)

    if (error) {
      console.error('Error inserting users:', error)
    } else {
      console.log(`✅ Generated ${count} users`)
    }
  }

  // Generate sample listings
  static async generateListings(count: number = 50): Promise<void> {
    console.log(`Generating ${count} sample listings...`)
    
    // Get sellers from users table
    const { data: sellers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'seller')

    if (!sellers || sellers.length === 0) {
      console.error('No sellers found. Please generate users first.')
      return
    }

    const listings = []
    for (let i = 0; i < count; i++) {
      const categoryData = getRandomItem(equipmentData)
      const item = getRandomItem(categoryData.items)
      
      const listing = {
        id: uuidv4(),
        title: item.name,
        description: item.description,
        price: getRandomPrice(item.basePrice),
        location: getRandomItem(locations),
        category: categoryData.category,
        condition: getRandomItem(conditions),
        images: [], // No images for dummy data
        seller_id: getRandomItem(sellers).id,
        is_sold: Math.random() > 0.8, // 20% sold
        featured: Math.random() > 0.9, // 10% featured
        created_at: getRandomDate(60),
        updated_at: getRandomDate(15)
      }
      listings.push(listing)
    }

    const { error } = await supabase
      .from('listings')
      .insert(listings)

    if (error) {
      console.error('Error inserting listings:', error)
    } else {
      console.log(`✅ Generated ${count} listings`)
    }
  }

  // Generate sample messages
  static async generateMessages(count: number = 100): Promise<void> {
    console.log(`Generating ${count} sample messages...`)
    
    const { data: users } = await supabase
      .from('users')
      .select('id, role')

    const { data: listings } = await supabase
      .from('listings')
      .select('id, seller_id, title')

    if (!users || !listings || users.length === 0 || listings.length === 0) {
      console.error('No users or listings found. Please generate users and listings first.')
      return
    }

    const buyers = users.filter(u => u.role === 'buyer')
    const messageTemplates = [
      'Hi, I\'m interested in this equipment. Is it still available?',
      'Can you provide more technical specifications for this item?',
      'Would you be willing to negotiate on the price?',
      'Can I schedule a time to inspect this equipment?',
      'Does this come with any warranty or service records?',
      'Is delivery available to my location?',
      'Can you provide additional photos of the equipment?',
      'What is the reason for selling this equipment?',
      'Are there any known issues or required maintenance?',
      'Would you consider a trade for similar equipment?'
    ]

    const messages = []
    for (let i = 0; i < count; i++) {
      const listing = getRandomItem(listings)
      const buyer = getRandomItem(buyers)
      
      const message = {
        id: uuidv4(),
        sender_id: buyer.id,
        recipient_id: listing.seller_id,
        listing_id: listing.id,
        message_text: getRandomItem(messageTemplates),
        read: Math.random() > 0.3, // 70% read
        created_at: getRandomDate(30)
      }
      messages.push(message)
    }

    const { error } = await supabase
      .from('messages')
      .insert(messages)

    if (error) {
      console.error('Error inserting messages:', error)
    } else {
      console.log(`✅ Generated ${count} messages`)
    }
  }

  // Generate sample favorites
  static async generateFavorites(count: number = 50): Promise<void> {
    console.log(`Generating ${count} sample favorites...`)
    
    const { data: users } = await supabase
      .from('users')
      .select('id')

    const { data: listings } = await supabase
      .from('listings')
      .select('id')

    if (!users || !listings || users.length === 0 || listings.length === 0) {
      console.error('No users or listings found. Please generate users and listings first.')
      return
    }

    const favorites = new Set()
    const favoritesArray = []
    
    for (let i = 0; i < count; i++) {
      let favorite
      let key
      
      // Ensure unique user-listing combinations
      do {
        const user = getRandomItem(users)
        const listing = getRandomItem(listings)
        key = `${user.id}-${listing.id}`
        favorite = {
          id: uuidv4(),
          user_id: user.id,
          listing_id: listing.id,
          created_at: getRandomDate(45)
        }
      } while (favorites.has(key))
      
      favorites.add(key)
      favoritesArray.push(favorite)
    }

    const { error } = await supabase
      .from('favorites')
      .insert(favoritesArray)

    if (error) {
      console.error('Error inserting favorites:', error)
    } else {
      console.log(`✅ Generated ${count} favorites`)
    }
  }

  // Generate all sample data
  static async generateAllData(): Promise<void> {
    console.log('🚀 Starting dummy data generation...')
    
    try {
      await this.generateUsers(25)
      await this.generateListings(60)
      await this.generateMessages(120)
      await this.generateFavorites(75)
      
      console.log('🎉 Dummy data generation completed successfully!')
    } catch (error) {
      console.error('❌ Error generating dummy data:', error)
    }
  }

  // Clear all data (use with caution!)
  static async clearAllData(): Promise<void> {
    console.log('⚠️  Clearing all data...')
    
    try {
      const tables = ['favorites', 'messages', 'payments', 'listings', 'users']
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', 'this-will-never-match') // Delete all rows
        
        if (error) {
          console.error(`Error clearing ${table}:`, error)
        } else {
          console.log(`✅ Cleared ${table}`)
        }
      }
      
      console.log('🧹 All data cleared successfully!')
    } catch (error) {
      console.error('❌ Error clearing data:', error)
    }
  }

  // Get statistics about current data
  static async getDataStats(): Promise<void> {
    console.log('📊 Getting data statistics...')
    
    try {
      const tables = ['users', 'listings', 'messages', 'favorites', 'payments']
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.error(`Error getting ${table} count:`, error)
        } else {
          console.log(`${table}: ${count} records`)
        }
      }
    } catch (error) {
      console.error('❌ Error getting statistics:', error)
    }
  }
}

// Export for use in development scripts
export default DummyDataGenerator 