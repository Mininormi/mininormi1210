@echo off
cd /d %~dp0

echo =============================
echo  RIMSURGE AUTO PUSH STARTING
echo =============================

:: 自动获取当前时间戳
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set year=%%d
    set month=%%b
    set day=%%c
)
set timestamp=%year%-%month%-%day%_%time:~0,2%-%time:~3,2%

:: 清理 commit 消息里的空格
set timestamp=%timestamp: =0%

echo Commit message: auto-update-%timestamp%

:: 执行 Git 命令
git add .
git commit -m "auto-update-%timestamp%"
git push

echo.
echo =============================
echo  PUSH FINISHED
echo =============================

:: 获取最新 commit hash
for /f %%a in ('git rev-parse HEAD') do set lastcommit=%%a

set repo=https://github.com/Mininormi/rimsurge-frontend
set commiturl=%repo%/commit/%lastcommit%

echo 这是最新 commit 你接下来的操作都要以这个commit为准:
echo %commiturl%
echo. 请看完并参照这个commit，不要再发以前的旧代码
echo =============================

pause
