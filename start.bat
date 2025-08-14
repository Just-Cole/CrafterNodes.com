@echo off
echo Building the application...
call npm run build

echo.
echo Starting the production server...
call npm start

pause
