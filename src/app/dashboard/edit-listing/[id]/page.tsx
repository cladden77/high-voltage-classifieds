'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload, X, Plus, DollarSign, MapPin, Tag, FileText } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function EditListingPage() {
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
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

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

  useEffect(() => {
    loadListingData()
  }, [listingId])

  const loadListingData = async () => {
    try {
      const { getCurrentUser } = await import('@/lib/auth')
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }

      const supabase = createClientSupabase()
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .eq('seller_id', currentUser.id) // Ensure user owns this listing
        .single()

      if (error) {
        setError('Listing not found or you do not have permission to edit it')
        return
      }

      // Cast to any to handle database schema differences
      const listingData = listing as any

      // Populate form with existing data
      setFormData({
        title: listingData.title || '',
        description: listingData.description || '',
        price: listingData.price?.toString() || '',
        location: listingData.location || '',
        category: listingData.category || '',
        condition: (listingData.condition as any) || 'good',
        featured: listingData.is_featured || false
      })

      // Set existing images (database column is image_urls)
      if (listingData.image_urls && Array.isArray(listingData.image_urls)) {
        setExistingImages(listingData.image_urls)
      }

    } catch (error) {
      console.error('Error loading listing:', error)
      setError('Failed to load listing data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'condition' ? (value as any) : value
    }))
    if (error) setError('')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Limit to 5 images total (including existing ones)
    const totalImages = existingImages.length + images.length
    const remainingSlots = 5 - totalImages
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

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
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

      // Upload new images
      const newImageUrls = await uploadImages()

      // Combine existing images with new ones
      const allImageUrls = [...existingImages, ...newImageUrls]

      // Update listing
      const supabase = createClientSupabase()
      const { error } = await supabase
        .from('listings')
        .update({
          title: formData.title,
          description: formData.description,
          price: price,
          location: formData.location,
          category: formData.category,
          condition: formData.condition as any,
          image_urls: allImageUrls,
          is_featured: formData.featured
          // Don't set updated_at manually - it's handled by database trigger
        })
        .eq('id', listingId)

      if (error) {
        console.error('Database error updating listing:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          error: error
        })
        throw new Error(`Failed to update listing: ${error.message}`)
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?success=listing-updated')
    } catch (error: any) {
      console.error('Error updating listing:', error)
      setError(error?.message || 'Failed to update listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="text-center">
            <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-4">
              Listing Not Found
            </h1>
            <p className="font-open-sans text-lg text-gray-500 mb-8">{error}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-open-sans font-bold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-open-sans">Back to Dashboard</span>
          </button>
        </div>

        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Edit Listing
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Update your high voltage equipment listing
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
                  onChange={(e) => handleInputChange('condition', e.target.value as any)}
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
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <h3 className="font-open-sans font-bold text-gray-700 mb-4">Current Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="font-open-sans text-lg text-gray-600">
                    Add more equipment photos
                  </p>
                  <p className="font-open-sans text-sm text-gray-500">
                    JPG, PNG up to 10MB each. Maximum 5 images total.
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={existingImages.length + images.length >= 5}
                    />
                    <span className={`py-2 px-4 rounded-lg font-open-sans font-bold cursor-pointer inline-block ${
                      existingImages.length + images.length >= 5
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}>
                      {existingImages.length + images.length >= 5 ? 'Maximum images reached' : 'Add More Images'}
                    </span>
                  </label>
                </div>
              </div>

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <h3 className="font-open-sans font-bold text-gray-700 mb-4">New Images to Add</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`New preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-open-sans font-bold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-open-sans font-bold"
            >
              {isSubmitting ? 'Updating Listing...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
} 