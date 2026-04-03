"""Password hashing and verification service using bcrypt.

This module provides secure password hashing and verification functionality
using the bcrypt algorithm with a cost factor of 12.
"""

import bcrypt


class PasswordService:
    """Service for password hashing and verification.

    Uses bcrypt algorithm directly with cost factor 12 for secure password hashing.
    """

    BCRYPT_ROUNDS = 12

    def hash_password(self, password: str) -> str:
        """Hash a plain text password using bcrypt.

        Args:
            password: The plain text password to hash

        Returns:
            The hashed password string
        """
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=self.BCRYPT_ROUNDS)
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain text password against a hashed password.

        Args:
            plain_password: The plain text password to verify
            hashed_password: The hashed password to compare against

        Returns:
            True if the password matches, False otherwise
        """
        try:
            password_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception:
            return False
