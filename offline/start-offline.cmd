@echo off
chcp 65001 >nul
title 一器千年 - 龙泉青瓷离线展览
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
if errorlevel 1 pause
