/*
  # Clear User Accounts

  This migration:
  1. Removes all user accounts and related data
  2. Preserves service_areas table and its data
  3. Resets the profiles table
*/

-- First, disable the trigger temporarily to prevent automatic profile creation
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Clear all related tables in correct order
DELETE FROM bookings;
DELETE FROM nurse_slots;
DELETE FROM nurse_service_areas;
DELETE FROM nurse_profiles;
DELETE FROM patient_profiles;
DELETE FROM profiles;

-- Clear auth.users table
DELETE FROM auth.users;

-- Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;