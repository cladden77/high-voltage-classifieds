import { createClientSupabase, STORAGE_BUCKETS } from './supabase'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Image upload utilities
export class ImageUploadService {
  private static supabase = createClientSupabase()

  // Validate image file
  static validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed'
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 10MB'
      }
    }

    return { valid: true }
  }

  // Generate unique filename
  static generateFileName(originalName: string): string {
    const extension = originalName.split('.').pop()
    const timestamp = Date.now()
    const uuid = uuidv4().slice(0, 8)
    return `${timestamp}_${uuid}.${extension}`
  }

  // Upload single image
  static async uploadImage(
    file: File,
    folder: string = 'listings',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate image
      const validation = this.validateImage(file)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Generate unique filename
      const fileName = this.generateFileName(file.name)
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(STORAGE_BUCKETS.LISTING_IMAGES)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        }
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(STORAGE_BUCKETS.LISTING_IMAGES)
        .getPublicUrl(data.path)

      return {
        success: true,
        url: urlData.publicUrl
      }
    } catch (error) {
      console.error('Image upload error:', error)
      return {
        success: false,
        error: 'Upload failed due to an unexpected error'
      }
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(
    files: File[],
    folder: string = 'listings',
    onProgress?: (completed: number, total: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadImage(files[i], folder)
      results.push(result)
      
      if (onProgress) {
        onProgress(i + 1, files.length)
      }
    }

    return results
  }

  // Delete image
  static async deleteImage(url: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const folder = urlParts[urlParts.length - 2]
      const filePath = `${folder}/${fileName}`

      const { error } = await this.supabase.storage
        .from(STORAGE_BUCKETS.LISTING_IMAGES)
        .remove([filePath])

      if (error) {
        console.error('Error deleting image:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Image deletion error:', error)
      return false
    }
  }

  // Get storage usage stats
  static async getStorageStats(): Promise<{
    totalFiles: number
    totalSize: number
    sizeFormatted: string
  }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(STORAGE_BUCKETS.LISTING_IMAGES)
        .list()

      if (error) throw error

      const totalFiles = data?.length || 0
      const totalSize = data?.reduce((acc, file) => acc + (file.metadata?.size || 0), 0) || 0
      
      return {
        totalFiles,
        totalSize,
        sizeFormatted: this.formatFileSize(totalSize)
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      return {
        totalFiles: 0,
        totalSize: 0,
        sizeFormatted: '0 B'
      }
    }
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Compress image before upload (client-side)
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Return original if compression fails
            }
          },
          file.type,
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }
}

// React hook for image uploads
export function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = async (file: File, folder?: string): Promise<string | null> => {
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // Compress image before upload
      const compressedFile = await ImageUploadService.compressImage(file)
      
      const result = await ImageUploadService.uploadImage(
        compressedFile,
        folder,
        (progressData) => {
          setProgress(progressData.percentage)
        }
      )

      if (result.success && result.url) {
        setProgress(100)
        return result.url
      } else {
        setError(result.error || 'Upload failed')
        return null
      }
    } catch (err) {
      setError('Upload failed due to an unexpected error')
      return null
    } finally {
      setUploading(false)
    }
  }

  const uploadMultipleImages = async (files: File[], folder?: string): Promise<string[]> => {
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const compressedFiles = await Promise.all(
        files.map(file => ImageUploadService.compressImage(file))
      )

      const results = await ImageUploadService.uploadMultipleImages(
        compressedFiles,
        folder,
        (completed, total) => {
          setProgress((completed / total) * 100)
        }
      )

      const urls = results
        .filter(result => result.success && result.url)
        .map(result => result.url!)

      const failedUploads = results.filter(result => !result.success)
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} uploads failed`)
      }

      return urls
    } catch (err) {
      setError('Upload failed due to an unexpected error')
      return []
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadImage,
    uploadMultipleImages,
    uploading,
    progress,
    error,
    clearError: () => setError(null)
  }
}

// Helper function to get optimized image URL
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url) return ''
  
  // For Supabase Storage, you might want to add transformation parameters
  // This is a placeholder - actual implementation depends on your CDN/transformation service
  const params = new URLSearchParams()
  
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  params.append('q', quality.toString())
  
  return params.toString() ? `${url}?${params.toString()}` : url
} 