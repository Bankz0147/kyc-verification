'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, User, FileText, ShieldCheck, AlertCircle } from 'lucide-react';

const KYCVerification = () => {
  // Steps: 'start', 'face', 'id', 'processing', 'form', 'success'
  const [step, setStep] = useState('start');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data State
  const [faceImage, setFaceImage] = useState(null);
  const [idImages, setIdImages] = useState({ front: null, back: null });
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    address: '',
    city: '',
    zip: '',
    country: ''
  });

  // Webcam Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- Step 1: Start ---
  const startVerification = () => {
    setStep('face');
    startWebcam();
  };

  // --- Webcam Logic ---
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable permissions.");
      setStep('start');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureFace = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const image = canvasRef.current.toDataURL('image/png');
      setFaceImage(image);
      stopWebcam();
      setStep('id');
    }
  };

  // --- Step 2: ID Upload Logic ---
  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImages(prev => ({ ...prev, [side]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitID = () => {
    if (!idImages.front || !idImages.back) {
      setError("Please upload both front and back of your ID.");
      return;
    }
    setStep('processing');
    simulateVerification();
  };

  // --- Simulation of Backend Verification ---
  const simulateVerification = () => {
    setTimeout(() => {
      setStep('form');
      setLoading(false);
    }, 2500); // 2.5s fake delay
  };

  // --- Step 3: Form Logic ---
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitFinalData = async () => {
    setLoading(true);
    setError('');
    
    // TODO: Send formData, faceImage, and idImages to your backend here
    console.log("Submitting KYC Package:", { formData, faceImage, idImages });

    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  };

  // Cleanup webcam on unmount
  useEffect(() => {
    return () => stopWebcam();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">Identity Verification</h2>
          <p className="text-blue-100 text-sm">Secure & Encrypted Process</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm flex items-center rounded-lg">
              <AlertCircle className="w-4 h-4 mr-2" /> {error}
            </div>
          )}

          {/* STEP 1: START */}
          {step === 'start' && (
            <div className="text-center space-y-4">
              <p className="text-gray-600">We need to verify your identity to unlock full access. This process takes about 2 minutes.</p>
              <button 
                onClick={startVerification}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" /> Verify Now
              </button>
            </div>
          )}

          {/* STEP 2: FACE SCAN */}
          {step === 'face' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg">Facial Verification</h3>
                <p className="text-sm text-gray-500">Position your face in the frame</p>
              </div>
              <div className="relative bg-black rounded-lg overflow-hidden h-64">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <button 
                onClick={captureFace}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Capture Photo
              </button>
            </div>
          )}

          {/* STEP 3: ID UPLOAD */}
          {step === 'id' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-bold text-lg">Upload ID Document</h3>
                <p className="text-sm text-gray-500">Passport, Driver's License, or National ID</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {['front', 'back'].map((side) => (
                  <div key={side} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(e, side)} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {idImages[side] ? (
                      <div className="text-green-600 flex flex-col items-center">
                        <CheckCircle className="w-8 h-8 mb-1" />
                        <span className="text-xs font-bold">Uploaded</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 flex flex-col items-center">
                        <Upload className="w-8 h-8 mb-1" />
                        <span className="text-xs">ID {side}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button 
                onClick={submitID}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Submit Documents
              </button>
            </div>
          )}

          {/* STEP 4: PROCESSING */}
          {step === 'processing' && (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="font-bold text-lg">Verifying Documents...</h3>
              <p className="text-gray-500 text-sm">Please wait while we analyze your submission.</p>
            </div>
          )}

          {/* STEP 5: INFO FORM */}
          {step === 'form' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center text-green-700 text-sm mb-4">
                <CheckCircle className="w-4 h-4 mr-2" /> Verification Successful! Please complete your profile.
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <input 
                  name="fullName" 
                  placeholder="Full Legal Name" 
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  name="dob" 
                  type="date" 
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  name="address" 
                  placeholder="Street Address" 
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    name="city" 
                    placeholder="City" 
                    onChange={handleFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input 
                    name="zip" 
                    placeholder="ZIP/Postal" 
                    onChange={handleFormChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select 
                  name="country" 
                  onChange={handleFormChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="NG">Nigeria</option>
                  {/* Add more countries */}
                </select>
              </div>

              <button 
                onClick={submitFinalData}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Complete Verification'}
                {!loading && <CheckCircle className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="font-bold text-2xl text-gray-800">All Done!</h3>
              <p className="text-gray-500 mt-2">Your identity has been verified successfully. You now have full access to the platform.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-6 text-blue-600 font-semibold hover:underline"
              >
                Go to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default KYCVerification;