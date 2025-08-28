-- =============================================
-- ADD NOTIFICATIONS SYSTEM
-- =============================================
-- Run this script in your Supabase SQL Editor to add notifications support

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN DEFAULT FALSE,
    related_id TEXT, -- ID of related item (listing_id, message_id, etc.)
    related_type TEXT, -- Type of related item ('listing', 'message', etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Add comments to document the table
COMMENT ON TABLE public.notifications IS 'User notifications for various platform events';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: info, success, warning, error';
COMMENT ON COLUMN public.notifications.related_id IS 'ID of related item (listing, message, etc.)';
COMMENT ON COLUMN public.notifications.related_type IS 'Type of related item (listing, message, etc.)';

-- Create function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_related_id TEXT DEFAULT NULL,
    p_related_type TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_id,
        related_type
    ) VALUES (
        p_user_id,
        p_title,
        p_message,
        p_type,
        p_related_id,
        p_related_type
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
