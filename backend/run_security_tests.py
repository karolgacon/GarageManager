#!/usr/bin/env python
"""
Security Test Runner Script
Runs all security tests and generates a comprehensive report
"""
import subprocess
import sys
from datetime import datetime

def run_security_tests():
    """Run security tests and generate report"""
    
    print("=" * 80)
    print("GarageManager Security Test Suite")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    # Run security tests with verbose output
    print("Running security tests...")
    print("-" * 80)
    
    result = subprocess.run(
        [
            'pytest',
            'backend/tests/test_security.py',
            '-v',
            '--tb=short',
            '--color=yes',
            '-m', 'security',
            '--cov=backend',
            '--cov=users',
            '--cov=appointments',
            '--cov=workshops',
            '--cov-report=term-missing',
            '--cov-report=html:htmlcov/security',
        ],
        capture_output=False,
        text=True
    )
    
    print()
    print("=" * 80)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    if result.returncode == 0:
        print("✓ All security tests passed!")
        print()
        print("Coverage report generated in: htmlcov/security/index.html")
    else:
        print("✗ Some security tests failed!")
        print("Please review the output above for details.")
        sys.exit(1)
    
    return result.returncode

if __name__ == "__main__":
    sys.exit(run_security_tests())
