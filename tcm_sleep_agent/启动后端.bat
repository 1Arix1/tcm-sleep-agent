@echo off
chcp 65001 > nul
cd /d "C:\Users\LX\Desktop\Proj_2\tcm_sleep_agent"
title TCM Backend - FastAPI :8000
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000 --host 127.0.0.1
