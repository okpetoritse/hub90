'use client'

import React, { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { DESIGN_SYSTEM } from '@/app/styles/design-system'
import { Send, X, Image as ImageIcon } from 'lucide-react'

interface ChatInputProps {
  roomId: string
  userEmail: string
}

export default function ChatInput({ roomId, userEmail }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image is too large. Maximum size is 5MB.')
      return
    }

    setSelectedImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Send message with or without image
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() && !selectedImage) return

    setLoading(true)
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let imageUrl = ''
      let finalMessage = message.trim()

      // Upload image if selected
      if (selectedImage) {
        try {
          const fileExt = selectedImage.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('stadium-media')
            .upload(fileName, selectedImage)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('stadium-media')
            .getPublicUrl(fileName)

          imageUrl = publicUrl
        } catch (error) {
          console.error('Image upload failed:', error)
          alert('Failed to upload image. Please try again.')
          setLoading(false)
          setUploading(false)
          return
        }
      }

      // Send message to database
      if (imageUrl) {
        // Message with image
        await supabase.from('fan_reactions').insert({
          match_id: parseInt(roomId) || 0,
          reaction_type: 'PICTURE',
          message: `${imageUrl}|SPLIT|${finalMessage}`,
          amount_paid_ngn: 0,
          user_id: user.id
        })
      } else {
        // Text-only message
        await supabase.from('fan_reactions').insert({
          match_id: parseInt(roomId) || 0,
          reaction_type: 'STANDARD_CHAT',
          message: finalMessage,
          amount_paid_ngn: 0,
          user_id: user.id
        })
      }

      // Clear inputs
      setMessage('')
      clearImage()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(8px, 2vw, 12px)',
    }}>
      {/* Image Preview */}
      {imagePreview && (
        <div style={{
          position: 'relative',
          display: 'inline-block',
          maxWidth: '100%',
        }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              maxHeight: '120px',
              borderRadius: DESIGN_SYSTEM.radius.md,
              border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
              objectFit: 'cover',
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            disabled={uploading}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: DESIGN_SYSTEM.colors.accent,
              color: DESIGN_SYSTEM.colors.text,
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
              transition: 'all 150ms ease-out',
            }}
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        style={{
          display: 'flex',
          gap: 'clamp(8px, 2vw, 12px)',
          alignItems: 'flex-end',
        }}
      >
        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || loading}
          style={{
            padding: '8px',
            background: imagePreview ? DESIGN_SYSTEM.colors.secondary : DESIGN_SYSTEM.colors.surfaceLight,
            color: imagePreview ? DESIGN_SYSTEM.colors.dark : DESIGN_SYSTEM.colors.text,
            border: 'none',
            borderRadius: DESIGN_SYSTEM.radius.md,
            cursor: uploading || loading ? 'not-allowed' : 'pointer',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            opacity: uploading || loading ? 0.6 : 1,
            transition: 'all 150ms ease-out',
          }}
          title="Add image"
        >
          <ImageIcon size={20} />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        {/* Text Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={imagePreview ? 'Add caption...' : '💬 Type a message...'}
          disabled={loading || uploading}
          style={{
            flex: 1,
            padding: 'clamp(10px, 2vw, 12px)',
            background: DESIGN_SYSTEM.colors.surfaceLight,
            border: `1px solid ${DESIGN_SYSTEM.colors.border}`,
            borderRadius: DESIGN_SYSTEM.radius.md,
            color: DESIGN_SYSTEM.colors.text,
            fontSize: 'clamp(12px, 3vw, 14px)',
            fontFamily: 'inherit',
            transition: 'all 150ms ease-out',
            minHeight: '44px',
            opacity: loading || uploading ? 0.6 : 1,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.secondary
            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(255, 215, 0, 0.1)`
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = DESIGN_SYSTEM.colors.border
            e.currentTarget.style.boxShadow = 'none'
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedImage) || loading || uploading}
          style={{
            padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)',
            background:
              (message.trim() || selectedImage) && !loading && !uploading
                ? DESIGN_SYSTEM.colors.secondary
                : DESIGN_SYSTEM.colors.surfaceLight,
            color:
              (message.trim() || selectedImage) && !loading && !uploading
                ? DESIGN_SYSTEM.colors.dark
                : DESIGN_SYSTEM.colors.textSecondary,
            border: 'none',
            borderRadius: DESIGN_SYSTEM.radius.md,
            cursor: (message.trim() || selectedImage) && !loading && !uploading ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: 'clamp(11px, 2.5vw, 12px)',
            textTransform: 'uppercase',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 150ms ease-out',
            opacity: loading || uploading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if ((message.trim() || selectedImage) && !loading && !uploading) {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {uploading ? '⏳' : <Send size={16} />}
        </button>
      </form>
    </div>
  )
}