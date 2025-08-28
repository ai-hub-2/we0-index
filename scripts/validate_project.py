#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def main():
    """Main validation script"""
    from loguru import logger
    logger.info("Starting project validation...")
    
    try:
        from config.validation import validate_environment
        logger.info("1. Validating environment configuration...")
        if not validate_environment():
            logger.error("Environment validation failed")
            return False
    except Exception as e:
        logger.error(f"Environment validation error: {e}")
        return False
    
    logger.info("Project validation completed successfully!")
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
