-- ====================================================
-- SQL SCHEMA FOR UNIVERSITY MANAGEMENT PLATFORM
-- ====================================================

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    cin VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_cin ON users(cin);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Insert sample user for testing (CIN: AB123456, Password: password123)
-- Password hash for 'password123' with bcrypt
-- INSERT INTO users (cin, email, password_hash, first_name, last_name, role, is_verified)
-- VALUES 
--     ('AB123456', 'test@university.edu', '$2b$10$rJ5Z3QZ8Z8Z8Z8Z8Z8Z8Zu8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'Ahmed', 'Missaoui', 'student', false)
-- ON CONFLICT (cin) DO NOTHING;

-- Display success message
SELECT 'Database tables created successfully!' AS message;
