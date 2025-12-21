# Security Testing Documentation

## Overview

This directory contains comprehensive security tests for the GarageManager application. These tests verify the application's resilience against common security vulnerabilities following OWASP guidelines.

## Test Categories

### 1. Authentication Security (`TestAuthenticationSecurity`)

Tests covering user authentication mechanisms:

- **Login with incorrect credentials** - Verifies that invalid passwords are rejected
- **Non-existent user login** - Ensures proper handling of login attempts for non-existent users
- **Protected endpoint access** - Validates that endpoints require proper authentication
- **Invalid token handling** - Tests rejection of malformed or invalid JWT tokens
- **Token expiration** - Verifies that expired tokens are properly rejected
- **Password complexity** - Ensures weak passwords are rejected during registration

### 2. Authorization Security (`TestAuthorizationSecurity`)

Tests for role-based access control (RBAC):

- **Admin endpoint protection** - Verifies clients cannot access admin-only endpoints
- **Cross-user data modification** - Ensures users cannot modify other users' data
- **Appointment access control** - Validates users can only view their own appointments
- **Role-based permissions** - Tests proper enforcement of role-based access rules

### 3. Input Validation Security (`TestInputValidationSecurity`)

Tests protecting against injection attacks:

- **SQL Injection prevention** - Verifies protection against SQL injection attempts
- **XSS prevention** - Tests sanitization of JavaScript injection attempts
- **Email validation** - Ensures only valid email formats are accepted
- **File upload validation** - Validates file type and size restrictions

### 4. Session Security (`TestSessionSecurity`)

Tests for session management:

- **Token invalidation on logout** - Verifies proper token blacklisting
- **Concurrent login handling** - Tests multiple simultaneous logins
- **Session expiration** - Validates proper token expiration

### 5. Data Protection Security (`TestDataProtectionSecurity`)

Tests for data privacy and protection:

- **Password exposure prevention** - Ensures passwords are never returned in responses
- **Cross-user data access** - Validates users cannot access others' private data
- **Sensitive data handling** - Tests proper handling of PII and sensitive information

### 6. CORS Security (`TestCORSSecurity`)

Tests for Cross-Origin Resource Sharing configuration:

- **CORS headers validation** - Verifies proper CORS configuration
- **Origin whitelisting** - Tests that only allowed origins can access the API

### 7. Rate Limiting Security (`TestRateLimitingSecurity`)

Tests for brute-force attack prevention:

- **Login attempt limiting** - Verifies rate limiting on failed login attempts
- **API throttling** - Tests general API rate limiting

## Running Security Tests

### Prerequisites

```bash
# Install dependencies
pip install -r requirements.txt

# Ensure test database is configured
python manage.py migrate --settings=backend.settings
```

### Run All Security Tests

```bash
# From backend directory
pytest backend/tests/test_security.py -v

# Run with coverage
pytest backend/tests/test_security.py --cov=. --cov-report=html

# Run specific test class
pytest backend/tests/test_security.py::TestAuthenticationSecurity -v

# Run specific test
pytest backend/tests/test_security.py::TestAuthenticationSecurity::test_login_with_incorrect_credentials -v
```

### Run All Tests Including Security

```bash
# Run all tests
pytest

# Run with markers
pytest -m security  # If security marker is added
```

## Security Features Implemented

### 1. JWT Authentication
- Access tokens expire after 1 hour
- Refresh tokens expire after 1 day
- Token rotation on refresh
- Blacklist support for logged-out tokens

### 2. Password Security
- Bcrypt hashing algorithm
- Minimum complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### 3. Role-Based Access Control
- Client role - can view own data and appointments
- Mechanic role - can manage assigned repairs
- Owner role - can manage workshop operations
- Admin role - full system access

### 4. Input Validation
- Django REST Framework serializers
- Email format validation
- SQL injection prevention via ORM
- XSS prevention via output encoding

### 5. CORS Protection
- Configured allowed origins
- Credentials support
- Preflight request handling

### 6. CSRF Protection
- Django CSRF middleware
- Token-based validation
- Exempt for JWT-authenticated API endpoints

## Security Configuration

### Environment Variables

Required security-related environment variables:

```bash
SECRET_KEY=your-secret-key-here  # Django secret key
ALLOWED_HOSTS=localhost,127.0.0.1  # Allowed host domains
CORS_ALLOWED_ORIGINS=http://localhost:5173  # Allowed CORS origins
```

### Settings Configuration

Key security settings in `backend/settings.py`:

```python
# JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True

# CSRF Protection
CSRF_COOKIE_SECURE = True  # In production
CSRF_COOKIE_HTTPONLY = True
```

## OWASP Top 10 Coverage

The security tests cover the following OWASP Top 10 vulnerabilities:

✓ **A01:2021 – Broken Access Control**
- Role-based access control tests
- Authorization tests
- Cross-user data access prevention

✓ **A02:2021 – Cryptographic Failures**
- Password hashing tests
- Secure token generation
- Sensitive data protection

✓ **A03:2021 – Injection**
- SQL injection prevention
- XSS prevention
- Input validation tests

✓ **A05:2021 – Security Misconfiguration**
- CORS configuration tests
- Security headers validation
- Environment variable security

✓ **A07:2021 – Identification and Authentication Failures**
- Authentication tests
- Session management tests
- Password complexity requirements

## Future Security Enhancements

### Planned Improvements

1. **Rate Limiting**
   - Implement Django rate limiting middleware
   - Add brute-force protection
   - API throttling per user role

2. **Two-Factor Authentication (2FA)**
   - TOTP support
   - SMS verification option
   - Backup codes

3. **Security Logging**
   - Audit trail for sensitive operations
   - Failed login attempt logging
   - Security event monitoring

4. **Enhanced Headers**
   - Content Security Policy (CSP)
   - HTTP Strict Transport Security (HSTS)
   - X-Content-Type-Options
   - X-Frame-Options

5. **Automated Security Scanning**
   - Integration with SAST tools
   - Dependency vulnerability scanning
   - Regular penetration testing

## Test Fixtures

The tests use the following fixtures:

- `api_client` - Django REST Framework test client
- `create_user` - Helper for creating test users
- `client_user` - Pre-created client role user
- `mechanic_user` - Pre-created mechanic role user
- `owner_user` - Pre-created owner role user
- `admin_user` - Pre-created admin role user

## Best Practices

### When Adding New Security Tests

1. **Follow naming convention**: `test_<what_is_being_tested>`
2. **Use descriptive docstrings**: Explain what vulnerability is being tested
3. **Test both positive and negative cases**: Test what should work and what shouldn't
4. **Clean up test data**: Use fixtures and ensure proper cleanup
5. **Document assumptions**: Note any security assumptions in comments

### Security Testing Checklist

Before deploying to production:

- [ ] All security tests pass
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Security headers configured
- [ ] Logging enabled for security events
- [ ] Password policy enforced
- [ ] Regular security updates scheduled

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to: security@garagemanager.com
3. Include detailed description and steps to reproduce
4. Allow reasonable time for response before public disclosure

## References

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Django Security Documentation](https://docs.djangoproject.com/en/stable/topics/security/)
- [Django REST Framework Security](https://www.django-rest-framework.org/topics/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Pytest Documentation](https://docs.pytest.org/)

## License

This testing suite is part of the GarageManager project and follows the same license terms.
