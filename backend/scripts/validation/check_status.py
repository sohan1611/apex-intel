import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:VePxIqZCQLXjhosGTCGJdwvbftteVMQx@acela.proxy.rlwy.net:17660/railway')
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT id, status, error_log FROM reports WHERE id = '10857b65-57b8-44f4-9d2c-0fd0a6d0e724'"))
        row = res.first()
        if row:
            print(f'Status: {row[1]}')
            print(f'Error: {row[2]}')
        else:
            print('Report not found')

asyncio.run(main())
