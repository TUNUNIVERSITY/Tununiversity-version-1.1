"""
Test password hashing without passlib
Using hashlib as fallback
"""
import hashlib
import os
import base64

def hash_password_fallback(password: str) -> str:
    """
    Fallback password hashing using hashlib (less secure than bcrypt)
    This is a temporary solution until passlib/bcrypt is installed
    """
    # Generate a salt
    salt = os.urandom(32)
    # Hash password with salt
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000  # iterations
    )
    # Store salt and hash together
    storage = salt + key
    return base64.b64encode(storage).decode('utf-8')

def verify_password_fallback(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash (fallback method)
    """
    try:
        # Decode the stored hash
        storage = base64.b64decode(hashed_password.encode('utf-8'))
        salt = storage[:32]
        stored_key = storage[32:]
        
        # Hash the provided password with the same salt
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            100000
        )
        
        # Compare
        return key == stored_key
    except:
        return False

# Test
if __name__ == "__main__":
    test_password = "TestPassword123"
    hashed = hash_password_fallback(test_password)
    print(f"Hashed: {hashed}")
    print(f"Verification: {verify_password_fallback(test_password, hashed)}")
    print(f"Wrong password: {verify_password_fallback('wrong', hashed)}")
