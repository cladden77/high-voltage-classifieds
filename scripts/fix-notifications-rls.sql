-- Fix Notifications Table RLS
-- This script enables RLS on the notifications table and adds appropriate security policies

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (
        (select auth.uid()) = user_id
    );

-- Policy for system to insert notifications (for webhooks and automated processes)
CREATE POLICY "System can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- Policy for users to update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (
        (select auth.uid()) = user_id
    );

-- Policy for users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (
        (select auth.uid()) = user_id
    );

-- Add index for better performance on notifications queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Add trigger to update updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_notifications_updated_at' 
        AND event_object_table = 'notifications'
    ) THEN
        CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
