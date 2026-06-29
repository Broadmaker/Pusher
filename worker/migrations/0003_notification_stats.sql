ALTER TABLE notifications ADD COLUMN sent_count INTEGER DEFAULT 0;
ALTER TABLE notifications ADD COLUMN failed_count INTEGER DEFAULT 0;
ALTER TABLE notifications ADD COLUMN total_devices INTEGER DEFAULT 0;
