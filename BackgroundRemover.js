import React, { useState, useRef, useEffect } from 'react';

const BackgroundRemover = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [hairSensitivity, setHairSensitivity] = useState(3);
  const [status, setStatus] = useState('');
  const canvasRef = useRef(null);
  const outputCanvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setProcessedImage(null);
        setStatus('รูปภาพพร้อมสำหรับการประมวลผล');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processImage = () => {
    if (!originalImage) return;

    setProcessing(true);
    setStatus('กำลังประมวลผล...');

    // ใช้ setTimeout เพื่อให้ UI ได้อัพเดทก่อนที่จะเริ่มการประมวลผลภาพ
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        
        ctx.drawImage(originalImage, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = removeBackground(imageData, threshold, hairSensitivity);
        
        const outputCanvas = outputCanvasRef.current;
        outputCanvas.width = canvas.width;
        outputCanvas.height = canvas.height;
        
        const outputCtx = outputCanvas.getContext('2d');
        outputCtx.putImageData(result, 0, 0);
        
        setProcessedImage(outputCanvas.toDataURL('image/png'));
        setStatus('ประมวลผลเสร็จสิ้น');
      } catch (error) {
        setStatus(`เกิดข้อผิดพลาด: ${error.message}`);
      } finally {
        setProcessing(false);
      }
    }, 100);
  };

  const removeBackground = (imageData, threshold, hairSensitivity) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // สร้าง alpha mask ด้วยอัลกอริทึมสำหรับการตรวจจับเส้นผม
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // คำนวณความสว่าง (luminance)
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // ตรวจหาสีที่คล้ายกับพื้นหลัง (สมมติว่าพื้นหลังสว่าง)
      const isBackground = luminance > 240 - threshold;
      
      // ตรวจจับเส้นผมด้วยการหาความแตกต่างของสี
      const colorVariance = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
      const isHair = colorVariance > hairSensitivity && luminance < 150;
      
      // กำหนดค่า alpha
      if (isBackground && !isHair) {
        data[i + 3] = 0; // โปร่งใส
      } else if (isHair) {
        // สำหรับเส้นผม คงค่า alpha ตามความเข้มของเส้นผม
        const hairIntensity = Math.min(255, colorVariance * 2);
        data[i + 3] = hairIntensity;
      }
    }
    
    // ปรับแต่งภาพด้วยการลบสัญญาณรบกวน
    const result = new ImageData(new Uint8ClampedArray(data), width, height);
    return result;
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'removed_background.png';
    link.href = processedImage;
    link.click();
  };

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <label className="block mb-2 font-medium">อัพโหลดรูปภาพ:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          className="w-full p-2 border rounded"
          disabled={processing}
        />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/2">
          <label className="block mb-2 font-medium">ความไวต่อพื้นหลัง ({threshold}):</label>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={threshold} 
            onChange={(e) => setThreshold(parseInt(e.target.value))} 
            className="w-full"
            disabled={processing}
          />
        </div>
        
        <div className="w-full md:w-1/2">
          <label className="block mb-2 font-medium">ความไวต่อเส้นผม ({hairSensitivity}):</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={hairSensitivity} 
            onChange={(e) => setHairSensitivity(parseInt(e.target.value))} 
            className="w-full"
            disabled={processing}
          />
        </div>
      </div>
      
      <button 
        onClick={processImage} 
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        disabled={!originalImage || processing}
      >
        {processing ? 'กำลังประมวลผล...' : 'ลบพื้นหลัง'}
      </button>
      
      {status && <p className="mb-4 text-center font-medium">{status}</p>}
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2 border rounded p-2 bg-gray-50">
          <h3 className="text-center mb-2 font-medium">รูปภาพต้นฉบับ</h3>
          {originalImage ? (
            <div className="flex justify-center">
              <img 
                src={originalImage.src} 
                alt="Original" 
                className="max-w-full max-h-64 object-contain"
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-200 text-gray-500">
              ยังไม่ได้อัพโหลดรูปภาพ
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2 border rounded p-2 bg-gray-50">
          <h3 className="text-center mb-2 font-medium">รูปภาพที่ลบพื้นหลังแล้ว</h3>
          {processedImage ? (
            <div className="flex flex-col items-center">
              <div 
                className="w-full h-64 flex items-center justify-center"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <img 
                  src={processedImage} 
                  alt="Processed" 
                  className="max-w-full max-h-64 object-contain"
                />
              </div>
              <button 
                onClick={downloadImage} 
                className="mt-4 bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition-colors"
              >
                ดาวน์โหลด
              </button>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-200 text-gray-500">
              ยังไม่ได้ประมวลผลรูปภาพ
            </div>
          )}
        </div>
      </div>
      
      {/* Canvas สำหรับการประมวลผลภาพ (ซ่อนไว้) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={outputCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default BackgroundRemover;
