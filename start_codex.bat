@echo off
setlocal
pushd "%~dp0" || exit /b 1
call codex resume 01a12e9b-b3b9-7b52-bdb8-c3785fce7e0e --no-daemon %*
set "codexExitCode=%errorlevel%"
popd
if not "%codexExitCode%"=="0" (
    echo.
    echo Codex exited with error %codexExitCode%.
    echo Check that Codex is installed and this saved session exists on this PC.
    pause
)
exit /b %codexExitCode%
