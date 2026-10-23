@echo off
setlocal
pushd "%~dp0" || exit /b 1
call codex resume 01a14fc3-f83c-7280-a2cc-fce783d79883 --no-daemon --cd "%CD%" %*
set "codexExitCode=%errorlevel%"
popd
if not "%codexExitCode%"=="0" (
    echo.
    echo Codex exited with error %codexExitCode%.
    echo Check that Codex is installed and this saved session exists on this PC.
    pause
)
exit /b %codexExitCode%
