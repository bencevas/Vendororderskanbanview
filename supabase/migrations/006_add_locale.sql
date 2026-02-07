-- Migration 006: Add locale column for multilingual support
-- Run this in Supabase SQL Editor

-- Add locale column to users table with Hungarian as default
ALTER TABLE users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'hu';

-- Update existing users to have Hungarian locale if null
UPDATE users SET locale = 'hu' WHERE locale IS NULL;

-- Add a check constraint to ensure valid locale values
ALTER TABLE users ADD CONSTRAINT valid_locale CHECK (locale IN ('en', 'hu'));
