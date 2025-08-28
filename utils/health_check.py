#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import asyncio
from typing import Dict, Any
from loguru import logger
from extensions.ext_manager import ExtManager
from setting.setting import get_we0_index_settings

async def check_vector_database_health() -> Dict[str, Any]:
    """Check if vector database is healthy and accessible"""
    try:
        settings = get_we0_index_settings()
        
        # Initialize vector database
        await ExtManager.vector.init_app()
        
        # Test basic operations
        dimension = await ExtManager.vector.get_dimension()
        
        return {
            "status": "healthy",
            "platform": settings.vector.platform,
            "dimension": dimension,
            "embedding_provider": settings.vector.embedding_provider,
            "embedding_model": settings.vector.embedding_model
        }
    except Exception as e:
        logger.error(f"Vector database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

async def check_embedding_service_health() -> Dict[str, Any]:
    """Check if embedding service is accessible"""
    try:
        # Get embedding model and test it
        embedding_model = await ExtManager.vector.get_embedding_model()
        
        # Test with a simple string
        test_embeddings = await embedding_model.create_embedding(["health check test"])
        
        return {
            "status": "healthy",
            "dimension": len(test_embeddings[0]) if test_embeddings else 0,
            "provider": embedding_model.model_type,
            "model": embedding_model.model_name
        }
    except Exception as e:
        logger.error(f"Embedding service health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

async def comprehensive_health_check() -> Dict[str, Any]:
    """Perform comprehensive health check of all services"""
    results = {
        "overall_status": "healthy",
        "timestamp": asyncio.get_event_loop().time(),
        "services": {}
    }
    
    # Check vector database
    vector_health = await check_vector_database_health()
    results["services"]["vector_database"] = vector_health
    
    # Check embedding service
    embedding_health = await check_embedding_service_health()
    results["services"]["embedding_service"] = embedding_health
    
    # Determine overall status
    unhealthy_services = [
        service for service, health in results["services"].items()
        if health.get("status") != "healthy"
    ]
    
    if unhealthy_services:
        results["overall_status"] = "unhealthy"
        results["unhealthy_services"] = unhealthy_services
    
    return results

if __name__ == "__main__":
    asyncio.run(comprehensive_health_check())
