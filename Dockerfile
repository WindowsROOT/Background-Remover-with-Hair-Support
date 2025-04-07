# ใช้ Node.js เป็นฐาน
FROM node:18-alpine

# ตั้งค่าไดเรกทอรี่ทำงาน
WORKDIR /app

# ติดตั้ง dependencies เพื่อสร้าง React app
RUN npm install -g create-react-app

# สร้าง React app
RUN npx create-react-app background-remover

# เปลี่ยนไปที่ไดเรกทอรี่ของแอพ
WORKDIR /app/background-remover

# ติดตั้ง dependencies เพิ่มเติมที่จำเป็น
RUN npm install tailwindcss postcss autoprefixer

# สร้างไฟล์ tailwind.config.js
RUN npx tailwindcss init -p

# สร้างไฟล์ index.css ใหม่ที่มี Tailwind directives
RUN echo "@tailwind base;\n@tailwind components;\n@tailwind utilities;" > src/index.css

# คัดลอกไฟล์แอพพลิเคชั่น
COPY App.js /app/background-remover/src/App.js
COPY BackgroundRemover.js /app/background-remover/src/components/BackgroundRemover.js

# อัพเดท App.js เพื่อให้ import component ถูกต้อง
RUN mkdir -p src/components

# สร้างไดเรกทอรี่ที่จำเป็น
RUN mkdir -p public/images

# เปิดพอร์ต 3000
EXPOSE 3000

# คำสั่งเริ่มต้นแอพ
CMD ["npm", "start"]
