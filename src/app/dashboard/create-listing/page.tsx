'use client'

import React, { useState } from 'react'
import { ArrowLeft, Upload, X, Plus, DollarSign, MapPin, Tag, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    condition: 'good' as 'new' | 'like_new' | 'good' | 'fair' | 'poor',
    featured: false
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()

  const categories = [
    'Transformers',
    'Breakers',
    'Motors',
    'Switchgear',
    'Panels',
    'Cables',
    'Generators',
    'Insulators',
    'Protective Equipment',
    'Testing Equipment',
    'Other'
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError('')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Limit to 5 images total
    const remainingSlots = 5 - images.length
    const filesToAdd = files.slice(0, remainingSlots)
    
    setImages(prev => [...prev, ...filesToAdd])
    
    // Create previews
    filesToAdd.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    const supabase = createClientSupabase()
    const uploadedUrls: string[] = []
    
    for (const image of images) {
      const fileName = `${Date.now()}-${image.name}`
      
      try {
        const { data, error } = await supabase.storage
          .from('listing-images')
          .upload(fileName, image)
        
        if (error) {
          console.error('Error uploading image:', {
            message: error.message,
            error: error
          })
          throw new Error(`Failed to upload ${image.name}: ${error.message}`)
        }
        
        const { data: urlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(data.path)
        
        uploadedUrls.push(urlData.publicUrl)
      } catch (error) {
        console.error('Image upload failed:', error)
        throw error // Re-throw to stop the process
      }
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.price || !formData.location || !formData.category) {
        setError('Please fill in all required fields')
        return
      }

      const price = parseFloat(formData.price)
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price')
        return
      }

      // Upload images
      const imageUrls = await uploadImages()

      // Get current user
      const { getCurrentUser } = await import('@/lib/auth')
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        setError('Please sign in to create a listing')
        return
      }

      if (currentUser.role !== 'seller') {
        setError('Only sellers can create listings')
        return
      }

      // Create listing
      const supabase = createClientSupabase()
      const { data, error } = await supabase
        .from('listings')
        .insert({
          title: formData.title,
          description: formData.description,
          price: price,
          location: formData.location,
          category: formData.category,
          condition: formData.condition as any,
          image_urls: imageUrls,
          seller_id: currentUser.id,
          is_featured: formData.featured,
          is_sold: false
        })
        .select()
        .single()

      if (error) {
        console.error('Database error creating listing:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          error: error
        })
        throw new Error(`Failed to create listing: ${error.message}`)
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?success=listing-created')
    } catch (error: any) {
      console.error('Error creating listing:', error)
      setError(error?.message || 'Failed to create listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-open-sans">Back to Dashboard</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Create New Listing
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            List your high voltage equipment for sale
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-open-sans text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-2" />
                  Equipment Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 500 kVA Power Transformer"
                />
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <Tag className="inline h-4 w-4 mr-2" />
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  required
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="new">New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-2" />
                  Price (USD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="City, State"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Provide detailed information about the equipment including specifications, condition, history, and any relevant details..."
                />
              </div>

              <div className="lg:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="font-open-sans font-bold text-gray-700">
                    Feature this listing (additional fee may apply)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-open-sans text-xl font-bold text-gray-900 mb-6">Equipment Images</h2>
            
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="font-open-sans text-lg text-gray-600">
                    Upload equipment photos
                  </p>
                  <p className="font-open-sans text-sm text-gray-500">
                    JPG, PNG up to 10MB each. Maximum 5 images.
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={images.length >= 5}
                    />
                    <span className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-open-sans font-bold cursor-pointer inline-block">
                      {images.length >= 5 ? 'Maximum images reached' : 'Choose Files'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-open-sans font-bold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-open-sans font-bold"
            >
              {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
} 