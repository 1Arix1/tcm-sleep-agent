@echo off
chcp 65001 > nul
title TCM 中医失眠助手

echo 正在启动后端...
start "TCM Backend :8000" cmd /k "cd /d C:\Users\LX\Desktop\Proj_2\tcm_sleep_agent && .venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000 --host 127.0.0.1"

echo 等待后端就绪...
timeout /t 4 /nobreak > nul

echo 正在启动前端...
start "TCM Frontend :3000" cmd /k "cd /d C:\Users\LX\Desktop\Proj_2\frontend\app && npm run dev"

echo.
echo 后端：http://localhost:8000
echo 前端：http://localhost:3000/app
echo.
echo 两个窗口启动完成，请稍等片刻后访问前端地址。
pause
