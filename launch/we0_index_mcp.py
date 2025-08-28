#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# @Time    : 2025/6/2
# @Author  : .*?
# @Email   : amashiro2233@gmail.com
# @File    : we0_index_mcp
# @Software: PyCharm
from contextlib import asynccontextmanager
from typing import AsyncIterator

from mcp.server.fastmcp import FastMCP
from mcp.server.fastmcp.tools import Tool
from mcp.server.lowlevel.server import LifespanResultT, Server
from mcp.shared.context import RequestT

from extensions import ext_manager
from router.git_router import clone_and_index
from router.vector_router import retrieval
from setting.setting import get_we0_index_settings

sider_settings = get_we0_index_settings()


@asynccontextmanager
async def lifespan(server: Server[LifespanResultT, RequestT]) -> AsyncIterator[object]:
    # Initialize vector extension on startup
    await ext_manager.init_vector()
    yield {}
    # Cleanup on shutdown (if needed)
    # For now, no specific cleanup is required


def create_fast_mcp() -> FastMCP:
    app = FastMCP(
        name="We0 Index",
        description="CodeIndex, embedding, retrieval, Tool parameters must be in standard JSON format",
        tools=[
            Tool.from_function(clone_and_index),
            Tool.from_function(retrieval),
        ],
        lifespan=lifespan,
        host=sider_settings.server.host,
        port=sider_settings.server.port,
        log_level=sider_settings.log.level
    )
    return app


we0_index_mcp = create_fast_mcp()