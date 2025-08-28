#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from loguru import logger

def validate_environment():
    """Validate environment configuration"""
    try:
        from setting.setting import get_we0_index_settings
        settings = get_we0_index_settings()
        
        if not settings:
            logger.error("Failed to load settings")
            return False
            
        # Validate vector database configuration
        if settings.vector.platform == "pgvector":
            if not settings.vector.pgvector:
                logger.error("PgVector configuration is missing")
                return False
                
        elif settings.vector.platform == "qdrant":
            if not settings.vector.qdrant:
                logger.error("Qdrant configuration is missing") 
                return False
                
        elif settings.vector.platform == "chroma":
            if not settings.vector.chroma:
                logger.error("Chroma configuration is missing")
                return False
        
        # Check API keys
        if settings.vector.embedding_provider == "openai":
            if not os.environ.get("OPENAI_API_KEY"):
                logger.warning("OPENAI_API_KEY not set")
                
        if settings.vector.embedding_provider == "jina":
            if not os.environ.get("JINA_API_KEY"):
                logger.warning("JINA_API_KEY not set")
        
        logger.info("Environment validation completed")
        return True
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        return False

if __name__ == "__main__":
    validate_environment()
