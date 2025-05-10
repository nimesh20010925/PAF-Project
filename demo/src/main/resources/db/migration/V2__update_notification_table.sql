-- Rename the 'read' column to 'is_read' to avoid SQL reserved keyword issues
ALTER TABLE notifications CHANGE COLUMN `read` `is_read` BOOLEAN;
