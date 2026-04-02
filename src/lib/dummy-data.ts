import { createAdminSupabase } from './supabase-server'
import { v4 as uuidv4 } from 'uuid'
import { LISTING_CATEGORIES, type ListingCategory } from './listing-categories'

const supabase = createAdminSupabase()

type EquipmentItem = {
  name: string
  basePrice: number
  description: string
}

const categoryEquipment: Record<ListingCategory, EquipmentItem[]> = {
  'Distribution Hardware & Equipment': [
    { name: '10\' Wood Crossarm Set', basePrice: 280, description: 'Pressure-treated crossarms with insulator pins. Surplus from distribution upgrade; stored dry.' },
    { name: 'Pole Top Pin Insulator Brackets (Lot)', basePrice: 620, description: 'Mixed lot of distribution pole hardware, galvanized. Suitable for 15–25 kV class construction.' },
  ],
  'Substation Hardware & Equipment': [
    { name: 'Substation Ground Grid Copper', basePrice: 4200, description: 'Reclaimed bare copper for substation grounding; cut to length available. Tested conductivity documentation on request.' },
    { name: 'Rigid Bus Support Insulator Stands', basePrice: 1800, description: 'Porcelain standoffs for indoor substation bus. Good cosmetic condition; hardware included.' },
  ],
  'Transmission Hardware & Equipment': [
    { name: 'Dead-End Strain Assembly 795 ACSR', basePrice: 950, description: 'Transmission dead-end hardware set for large conductor. Field surplus; inspect before energizing.' },
    { name: 'Suspension Clamp Bundle (Used)', basePrice: 720, description: 'Assorted transmission suspension clamps and yoke plates. Priced as lot; tag photos available.' },
  ],
  Arresters: [
    { name: '10 kV Distribution Surge Arrester', basePrice: 185, description: 'Polymer-housed distribution-class arrester. Removed during line rebuild; date codes documented.' },
    { name: 'Station Class MOV Arrester 69kV', basePrice: 2400, description: 'Station-class metal-oxide surge arrester. Suitable for substation spares or testing bench.' },
  ],
  Breakers: [
    { name: '15 kV Vacuum Circuit Breaker', basePrice: 12500, description: 'Vacuum breaker in like-new condition with controls. Ideal for medium-voltage motor or feeder applications.' },
    { name: '5 kV Air Circuit Breaker', basePrice: 8500, description: 'Compact air breaker for low/medium voltage. Easy maintenance; includes trip unit.' },
  ],
  Clothing: [
    { name: 'FR Shirt & Pants Set (Various Sizes)', basePrice: 120, description: 'Arc-rated FR workwear bundle; assorted sizes from contractor inventory. Laundered, no tears.' },
    { name: 'Class 2 Rubber Insulating Gloves', basePrice: 85, description: 'Tested lineman gloves with leather protectors. Test dates within 6 months at time of listing.' },
  ],
  Conduit: [
    { name: '4" Rigid Steel Conduit (20 ft sticks)', basePrice: 45, description: 'Galvanized rigid conduit; multiple lengths. Threaded ends; minor scuffs from storage.' },
    { name: 'PVC Schedule 80 Conduit Bundle', basePrice: 320, description: 'Assorted elbows, couplings, and straight sections for underground runs.' },
  ],
  Insulators: [
    { name: 'Porcelain Suspension Insulator String', basePrice: 340, description: 'Glass/porcelain disc string for transmission or sub-transmission. Inspected for chips; priced per string.' },
    { name: 'Polymer Line Post Insulators', basePrice: 95, description: 'Distribution polymer posts; mixed voltage ratings. Bulk pricing available.' },
  ],
  'Switches & Switchgear': [
    { name: 'Medium Voltage Metal-Clad Switchgear Section', basePrice: 75000, description: 'Switchgear section with relays and metering. Removed intact; buyer responsible for engineering review.' },
    { name: 'Motor Control Center Bucket (VFD)', basePrice: 15000, description: 'MCC bucket with VFD; programmed for general-purpose motor. Verify nameplate with your application.' },
  ],
  Tools: [
    { name: 'Hydraulic Crimper 12-Ton', basePrice: 890, description: 'Battery hydraulic crimper with dies for ACSR and copper. Recently serviced.' },
    { name: 'Hot Stick Set (Fiberglass)', basePrice: 650, description: 'Assorted universal sticks and shotgun attachment. Dielectric test sticker current.' },
  ],
  Trailers: [
    { name: '20 ft Equipment Trailer (Tandem Axle)', basePrice: 4200, description: 'Heavy-duty equipment trailer with ramps. Title clear; tires ~60% tread.' },
    { name: 'Pole Trailer (Extendable)', basePrice: 7800, description: 'Utility pole trailer; extendable bunk. Surplus fleet unit; brakes serviced annually.' },
  ],
  Transformers: [
    { name: '500 kVA Pad-Mount Transformer', basePrice: 45000, description: 'Padmount unit, recently tested. Documentation and oil samples available to serious buyers.' },
    { name: '300 kVA Step-Down Transformer', basePrice: 32000, description: 'Compact step-down for commercial service. Low hours; suitable for industrial backup.' },
  ],
  Trucks: [
    { name: 'Bucket Truck (Altec Boom)', basePrice: 85000, description: 'Class 7 chassis with insulated boom. DOT inspection current; PTO and hydraulics operational.' },
    { name: 'Flatbed Stake Truck 26k GVW', basePrice: 38000, description: 'Stake bed for hauling poles and reels. Fleet-maintained; service records included.' },
  ],
  'Voltage Regulators': [
    { name: 'Single-Phase Step Voltage Regulator', basePrice: 12000, description: 'Distribution regulator removed from upgrade project. Controls included; bench test recommended.' },
    { name: 'Three-Phase Voltage Regulator Bank', basePrice: 45000, description: 'Bank suitable for substation or large industrial feeder. Sold as-is where-is.' },
  ],
  'Wood & Steel Structures': [
    { name: '40 ft Class 4 Wood Pole (Used)', basePrice: 450, description: 'Pole suitable for yard storage or non-energized training. Buyer coordinates delivery.' },
    { name: 'Steel Lattice Tower Sections', basePrice: 12000, description: 'Salvaged transmission tower steel; bolt patterns documented. Ideal for antenna or non-utility reuse.' },
  ],
  'Wire & Cable': [
    { name: '1000 MCM Copper 15kV Cable (per ft)', basePrice: 12, description: 'Medium-voltage copper cable on partial reel; footage verified. Jacket intact.' },
    { name: '795 ACSR Drake (Full Drum)', basePrice: 2800, description: 'Transmission conductor, new-old stock drum. Stored indoors; end seals intact.' },
  ],
  Other: [
    { name: 'Industrial Generator Control Panel', basePrice: 8500, description: 'ATS-capable control panel; surplus from cancelled project. Wiring diagrams included.' },
    { name: 'Cable Pulling Tension Meter', basePrice: 2200, description: 'Digital tension monitoring for pulls; calibrated within manufacturer interval.' },
  ],
}

const equipmentData = LISTING_CATEGORIES.map((category) => ({
  category,
  items: categoryEquipment[category],
}))

const locations = [
  'Houston, TX', 'Dallas, TX', 'Austin, TX', 'San Antonio, TX', 'Phoenix, AZ',
  'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Miami, FL', 'Chicago, IL',
  'Detroit, MI', 'Charlotte, NC', 'Seattle, WA', 'Portland, OR', 'Las Vegas, NV'
]

const conditions: Array<'new' | 'like_new' | 'good' | 'fair' | 'poor'> = [
  'new',
  'like_new',
  'good',
  'fair',
  'poor',
]

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
        image_urls: [],
        seller_id: getRandomItem(sellers).id,
        is_sold: Math.random() > 0.8, // 20% sold
        is_featured: Math.random() > 0.9, // 10% featured
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