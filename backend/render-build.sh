#!/bin/bash
# render-build.sh
echo "Starting build process..."
npm install
npx tsc --skipLibCheck --esModuleInterop
npx prisma generate
echo "Build completed!"