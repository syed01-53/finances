from fastapi import APIRouter

from app.api import accounts, balances, clients, pdf, reports

api_router = APIRouter()
api_router.include_router(clients.router, tags=["Clients"])
api_router.include_router(accounts.router, tags=["Accounts"])
api_router.include_router(reports.router, tags=["Reports"])
api_router.include_router(balances.router, tags=["Balances"])
api_router.include_router(pdf.router, tags=["PDF"])
