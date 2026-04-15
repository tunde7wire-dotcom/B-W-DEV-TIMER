import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useAnimation, PanInfo, useMotionValueEvent } from 'motion/react';
import { Button } from '../components/Layout';

const TankInteractiveWrapper: React.FC<{ children: React.ReactNode, isActive: boolean, isPouring?: boolean, onEasterEggTrigger?: () => void }> = ({ children, isActive, isPouring, onEasterEggTrigger }) => {
  const rotateTarget = useMotionValue(0);
  const springRotate = useSpring(rotateTarget, { stiffness: 150, damping: 15, mass: 1 });
  
  // Secondary delayed tilt (slosh)
  const sloshTarget = useTransform(rotateTarget, [-180, -45, 0, 45, 180], [15, 5, 0, -5, -15]);
  const springSlosh = useSpring(sloshTarget, { stiffness: 80, damping: 12 });

  const controls = useAnimation();
  const isUpsideDown = useRef(false);
  const inversionCount = useRef(0);

  useMotionValueEvent(springRotate, "change", (latest) => {
    if (!isActive || isPouring) return;

    if (Math.abs(latest) > 140 && !isUpsideDown.current) {
      isUpsideDown.current = true;
    } else if (Math.abs(latest) < 40 && isUpsideDown.current) {
      isUpsideDown.current = false;
      inversionCount.current += 1;
      
      if (inversionCount.current >= 3) {
        inversionCount.current = 0; // Reset
        if (onEasterEggTrigger) onEasterEggTrigger();
      }
    }
  });

  useEffect(() => {
    if (isPouring) {
      rotateTarget.set(0); 
      controls.start({
        rotate: 100,
        y: -20,
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    } else {
      controls.start({
        rotate: 0,
        y: 0,
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    }
  }, [isPouring, controls, rotateTarget]);

  const activePointers = useRef(new Map<number, { x: number, y: number }>());
  const initialOneFingerX = useRef(0);
  const initialRotation = useRef(0);
  const initialTwoFingerAngle = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isActive || isPouring) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    
    // Sync target to current visual position to catch it mid-spring
    rotateTarget.set(springRotate.get());

    if (activePointers.current.size === 1) {
      initialOneFingerX.current = e.clientX;
      initialRotation.current = rotateTarget.get();
    } else if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      initialTwoFingerAngle.current = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      initialRotation.current = rotateTarget.get();
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive || isPouring) return;
    if (!activePointers.current.has(e.pointerId)) return;
    
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    
    if (activePointers.current.size === 1) {
      const deltaX = e.clientX - initialOneFingerX.current;
      // 200px drag = 35 degrees
      let targetRot = initialRotation.current + (deltaX / 200) * 35;
      // Limit one-finger tilt to a modest angle
      targetRot = Math.max(-40, Math.min(40, targetRot));
      rotateTarget.set(targetRot);
    } else if (activePointers.current.size === 2) {
      const pts = Array.from(activePointers.current.values());
      const currentAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
      
      let deltaAngle = currentAngle - initialTwoFingerAngle.current;
      
      // Handle wrap-around
      if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
      if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
      
      let targetRot = initialRotation.current + deltaAngle * (180 / Math.PI);
      rotateTarget.set(targetRot);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isActive || isPouring) return;
    activePointers.current.delete(e.pointerId);
    
    if (activePointers.current.size === 1) {
      const pts = Array.from(activePointers.current.values());
      initialOneFingerX.current = pts[0].x;
      initialRotation.current = rotateTarget.get();
    } else if (activePointers.current.size === 0) {
      rotateTarget.set(0);
    }
  };

  return (
    <motion.div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ rotate: springRotate, touchAction: isActive && !isPouring ? 'none' : 'auto' }}
      whileTap={isActive && !isPouring ? { scale: 0.98 } : {}}
      className={`w-full h-full origin-center ${isActive && !isPouring ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <motion.div style={{ rotate: springSlosh }} className="w-full h-full origin-center">
        <motion.div animate={controls} className="w-full h-full origin-center">
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export const LaunchScreen: React.FC<{ onStart: () => void, transitionStage?: number }> = ({ onStart, transitionStage = 0 }) => {
  const [showStart, setShowStart] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const [easterEggPouring, setEasterEggPouring] = useState(false);
  const [easterEggKey, setEasterEggKey] = useState(0);

  const handleEasterEgg = () => {
    setEasterEggPouring(true);
    setEasterEggKey(prev => prev + 1);
    setTimeout(() => {
      setEasterEggPouring(false);
    }, 3000); // 3 seconds pour
  };

  useEffect(() => {
    // Extended total sequence time to 14 seconds for a natural flow
    const timer = setTimeout(() => {
      setShowStart(true);
    }, 12500);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    if (!showStart) {
      setIsSkipped(true);
      setShowStart(true);
    }
  };

  return (
    <div 
      className={`h-full bg-gradient-to-b from-[#FAF8F3] via-[#F4F2ED] to-[#EAE6DD] flex flex-col items-center justify-center relative overflow-hidden ${!showStart ? 'cursor-pointer' : ''}`}
      onClick={handleSkip}
    >
      
      {/* Film & Canister Container */}
      <div className="absolute top-24 flex flex-row items-center z-0 h-32 w-[380px]" style={{ left: '50%', transform: 'translateX(-50%)' }}>
        
        {/* Canister */}
        <motion.div
          className="absolute z-20 flex flex-col items-center"
          initial={{ x: 800 }} // Fully off-screen right
          animate={{ x: 0 }}
          transition={isSkipped ? { duration: 0 } : { delay: 8.0, duration: 2.0, ease: "easeOut" }}
          style={{ top: 0, bottom: 0, width: '60px' }}
        >
          {/* Top Nub */}
          <div className="w-6 h-4 bg-gradient-to-r from-[#111] via-[#333] to-[#111] rounded-t-sm border-t border-x border-[#444]" />
          {/* Top Rim */}
          <div className="w-[64px] h-3 bg-gradient-to-r from-[#0a0a0a] via-[#2a2a2a] to-[#0a0a0a] rounded-sm border border-[#333] z-10 shadow-md" />
          
          {/* Body with rotating label */}
          <div className="w-[56px] flex-1 relative overflow-hidden bg-[#e5e5e5] border-x border-[#999]">
            {/* Inner shadow for 3D cylinder effect */}
            <div className="absolute inset-0 shadow-[inset_8px_0_12px_rgba(0,0,0,0.6),inset_-8px_0_12px_rgba(0,0,0,0.6)] z-10 pointer-events-none" />
            
            {/* Dynamic Light Off Shadows */}
            <motion.div 
              className="absolute inset-0 z-15 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: transitionStage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 50%)' }}
            />
            <motion.div 
              className="absolute inset-0 z-15 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: transitionStage >= 2 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.7) 0%, transparent 50%)' }}
            />
            
            {/* Sliding Label (Rolling effect) */}
            <motion.div
              className="absolute top-0 bottom-0 flex flex-row"
              initial={{ x: -400 }} // Start offset to match the long roll distance
              animate={{ x: 0 }}   // Slide texture to simulate rolling left (counter-clockwise)
              transition={isSkipped ? { duration: 0 } : { delay: 8.0, duration: 2.0, ease: "easeOut" }}
            >
              {/* Repeat label texture to ensure continuous wrapping */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-[100px] h-full flex flex-row shrink-0 bg-white">
                  <div className="w-1/3 h-full bg-yellow-400 flex items-center justify-center border-r border-black/10">
                    <span className="text-[8px] font-bold text-[#111111] -rotate-90 tracking-widest">NOTES</span>
                  </div>
                  <div className="w-2/3 h-full flex flex-col items-center justify-center bg-white relative">
                    <span className="text-[10px] font-black text-black tracking-tighter leading-none">400</span>
                    <span className="text-[16px] font-black text-black tracking-tighter leading-none">TX</span>
                    <span className="text-[6px] font-bold text-black absolute right-1 top-1 rotate-90 origin-top-right">Kodak</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Bottom Rim */}
          <div className="w-[64px] h-3 bg-gradient-to-r from-[#0a0a0a] via-[#2a2a2a] to-[#0a0a0a] rounded-sm border border-[#333] z-10 shadow-md" />
        </motion.div>

        {/* Film Strip */}
        <motion.div 
          className="absolute left-[30px] top-4 bottom-4 z-10 flex flex-row items-center overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: 340 }}
          transition={isSkipped ? { duration: 0 } : { delay: 10.0, duration: 2.0, ease: "linear" }}
        >
          <motion.div 
            className="h-full bg-[#111] border-y border-[#222] flex flex-row items-center gap-4 px-4 shrink-0 w-[340px] relative"
            initial={{ boxShadow: '0px 0px 0px 0px rgba(253, 224, 71, 0)' }}
            animate={{ boxShadow: transitionStage >= 3 ? '0px 0px 0px 0px rgba(253, 224, 71, 0)' : '0px 0px 25px 8px rgba(253, 224, 71, 0.65)' }}
            transition={transitionStage >= 3 ? { duration: 0 } : isSkipped ? { duration: 0 } : { delay: 12.0, duration: 1.5 }}
          >
            {/* Dynamic Light Off Shadows */}
            <motion.div 
              className="absolute inset-0 z-10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: transitionStage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, transparent 40%)' }}
            />
            <motion.div 
              className="absolute inset-0 z-10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: transitionStage >= 2 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.8) 0%, transparent 40%)' }}
            />
            {/* Sprocket Holes Top */}
            <div className="absolute top-1 left-0 right-0 flex flex-row justify-between px-1">
              {[...Array(24)].map((_, i) => (
                <div key={`t-${i}`} className="w-2 h-2.5 bg-black rounded-[1px]" />
              ))}
            </div>
            {/* Sprocket Holes Bottom */}
            <div className="absolute bottom-1 left-0 right-0 flex flex-row justify-between px-1">
              {[...Array(24)].map((_, i) => (
                <div key={`b-${i}`} className="w-2 h-2.5 bg-black rounded-[1px]" />
              ))}
            </div>
            
            {/* Film Edge Text (Rebate Area) */}
            <div className="absolute top-4 left-0 right-0 flex flex-row justify-between px-4 opacity-40">
              {[...Array(4)].map((_, i) => <span key={i} className="text-[6px] font-mono text-yellow-500">KODAK 400TX</span>)}
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex flex-row justify-between px-4 opacity-40">
              {[...Array(4)].map((_, i) => <span key={i} className="text-[6px] font-mono text-yellow-500">KODAK 400TX</span>)}
            </div>
            
            {/* Frames (Inner Title Panels) */}
            <div className="h-12 w-20 bg-black/80 border border-white/10 flex items-center justify-center rounded-sm shadow-inner shrink-0 ml-4 z-10">
              <span className="text-white font-bold text-lg tracking-widest">B&amp;W</span>
            </div>
            <div className="h-12 w-20 bg-black/80 border border-white/10 flex items-center justify-center rounded-sm shadow-inner shrink-0 z-10">
              <span className="text-white font-bold text-lg tracking-widest">DEV</span>
            </div>
            <div className="h-12 w-20 bg-black/80 border border-white/10 flex items-center justify-center rounded-sm shadow-inner shrink-0 z-10">
              <span className="text-white font-bold text-lg tracking-widest">TIMER</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Paterson Tank Container - Scaled up for better visibility */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[160px] h-[180px] scale-[1.7] origin-center">
        <TankInteractiveWrapper 
          isActive={showStart}
          isPouring={easterEggPouring}
          onEasterEggTrigger={handleEasterEgg}
        >
          <motion.div
            animate={{
            rotate: [
              0, 
              -180, // 2.5s: Slow inversion left
              0,    // 3.5s: Return upright
              0,    // 4.0s: Pause
              100,  // 5.0s: Tilt right to pour
              100,  // 7.0s: Hold pour
              0     // 8.0s: Return upright
            ],
            y: [
              0,
              -40,
              0,
              0,
              -20,
              -20,
              0
            ]
          }}
          transition={isSkipped ? { duration: 0 } : {
            duration: 8.0,
            times: [
              0, 
              0.3125, // 2.5s / 8.0s
              0.4375, // 3.5s / 8.0s
              0.5,    // 4.0s / 8.0s
              0.625,  // 5.0s / 8.0s
              0.875,  // 7.0s / 8.0s
              1       // 8.0s / 8.0s
            ],
            ease: "easeInOut"
          }}
          className="origin-center"
        >
          <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tankBody" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0a0a0a" />
                <motion.stop offset="15%" animate={{ stopColor: transitionStage >= 1 ? "#111111" : "#2a2a2a" }} transition={{ duration: 0.6 }} />
                <motion.stop offset="30%" animate={{ stopColor: transitionStage >= 1 ? "#1a1a1a" : "#555555" }} transition={{ duration: 0.6 }} />
                <stop offset="45%" stopColor="#1a1a1a" />
                <stop offset="70%" stopColor="#050505" />
                <motion.stop offset="85%" animate={{ stopColor: transitionStage >= 2 ? "#111111" : "#333333" }} transition={{ duration: 0.6 }} />
                <stop offset="100%" stopColor="#000" />
              </linearGradient>
              <linearGradient id="redRing" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#600" />
                <motion.stop offset="15%" animate={{ stopColor: transitionStage >= 1 ? "#400" : "#d00" }} transition={{ duration: 0.6 }} />
                <motion.stop offset="30%" animate={{ stopColor: transitionStage >= 1 ? "#600" : "#f33" }} transition={{ duration: 0.6 }} />
                <stop offset="45%" stopColor="#a00" />
                <stop offset="70%" stopColor="#400" />
                <motion.stop offset="85%" animate={{ stopColor: transitionStage >= 2 ? "#400" : "#e00" }} transition={{ duration: 0.6 }} />
                <stop offset="100%" stopColor="#200" />
              </linearGradient>
              <linearGradient id="capTop" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#111" />
                <motion.stop offset="30%" animate={{ stopColor: transitionStage >= 1 ? "#111111" : "#444444" }} transition={{ duration: 0.6 }} />
                <stop offset="70%" stopColor="#000" />
                <motion.stop offset="100%" animate={{ stopColor: transitionStage >= 2 ? "#000000" : "#111111" }} transition={{ duration: 0.6 }} />
              </linearGradient>
            </defs>

            {/* Base Rim */}
            <path d="M42 165 C42 168 45 170 50 170 L110 170 C115 170 118 168 118 165 L118 155 L42 155 Z" fill="#0a0a0a" />
            {/* Base Notches */}
            <rect x="48" y="165" width="6" height="5" fill="#000" rx="2" />
            <rect x="106" y="165" width="6" height="5" fill="#000" rx="2" />

            {/* Lower Body */}
            <rect x="40" y="75" width="80" height="80" fill="url(#tankBody)" />
            <rect x="40" y="75" width="80" height="2" fill="#444" opacity="0.6" />
            
            {/* Middle Step */}
            <rect x="36" y="60" width="88" height="15" fill="url(#tankBody)" />
            <rect x="36" y="60" width="88" height="2" fill="#555" opacity="0.6" />
            <rect x="36" y="73" width="88" height="2" fill="#000" opacity="0.8" />
            
            {/* Upper Body */}
            <path d="M30 45 L130 45 L124 60 L36 60 Z" fill="url(#tankBody)" />
            <rect x="30" y="45" width="100" height="2" fill="#666" opacity="0.6" />
            
            {/* Red Ring */}
            <rect x="28" y="30" width="104" height="15" rx="2" fill="url(#redRing)" />
            <rect x="28" y="30" width="104" height="3" fill="#ff9999" opacity="0.4" />
            <rect x="28" y="42" width="104" height="3" fill="#4a0000" opacity="0.6" />
            
            {/* Cap Base */}
            <path d="M26 20 L134 20 L132 30 L28 30 Z" fill="url(#tankBody)" />
            <rect x="26" y="20" width="108" height="2" fill="#555" opacity="0.6" />
            
            {/* Cap Top Rim */}
            <rect x="32" y="10" width="96" height="10" rx="3" fill="url(#capTop)" />
            <rect x="32" y="10" width="96" height="2" fill="#666" opacity="0.6" />
            
            {/* Cap Inner Flat */}
            <rect x="36" y="6" width="88" height="4" fill="#0a0a0a" />
          </svg>
        </motion.div>

        {/* Realistic Liquid Pouring Out */}
        <motion.div
          className="absolute z-20"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0, 1, 1, 0],
          }}
          transition={isSkipped ? { duration: 0 } : { 
            duration: 2.4, // 4.6s to 7.0s
            delay: 4.6, // Starts slightly after tilt begins
            times: [0, 0.05, 0.15, 0.85, 1] 
          }}
          style={{ 
            top: '135px', 
            left: '130px', 
          }}
        >
          {/* Complex liquid SVG with animated paths */}
          <svg width="80" height="250" viewBox="0 0 80 250" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Main Stream */}
            <motion.path 
              d="M20 0 C40 20, 45 80, 35 150 C25 220, 20 250, 20 250 L10 250 C10 250, 15 220, 25 150 C35 80, 20 20, 10 0 Z" 
              fill="#d97706" 
              opacity="0.95"
              animate={{
                d: [
                  "M20 0 C20 0, 20 0, 20 0 C20 0, 20 0, 20 0 L10 0 C10 0, 10 0, 10 0 C10 0, 10 0, 10 0 Z", // Start empty
                  "M20 0 C40 20, 45 80, 35 150 C25 220, 20 250, 20 250 L10 250 C10 250, 15 220, 25 150 C35 80, 20 20, 10 0 Z", // Full flow
                  "M20 0 C30 20, 35 80, 25 150 C15 220, 20 250, 20 250 L15 250 C15 250, 10 220, 20 150 C30 80, 15 20, 10 0 Z", // Wavy flow
                  "M20 0 C40 20, 45 80, 35 150 C25 220, 20 250, 20 250 L10 250 C10 250, 15 220, 25 150 C35 80, 20 20, 10 0 Z", // Full flow
                  "M15 0 C15 20, 15 80, 15 150 C15 220, 15 250, 15 250 L15 250 C15 250, 15 220, 15 150 C15 80, 15 20, 15 0 Z", // Thin out trailing finish
                ]
              }}
              transition={isSkipped ? { duration: 0 } : { duration: 2.4, delay: 4.6, ease: "easeInOut", times: [0, 0.15, 0.5, 0.85, 1] }}
            />
            {/* Inner Highlight Stream */}
            <motion.path 
              d="M22 0 C38 20, 42 80, 32 150 C22 220, 18 250, 18 250 L14 250 C14 250, 18 220, 28 150 C38 80, 22 20, 14 0 Z" 
              fill="#f59e0b" 
              opacity="0.8"
              animate={{
                d: [
                  "M22 0 C22 0, 22 0, 22 0 C22 0, 22 0, 22 0 L14 0 C14 0, 14 0, 14 0 C14 0, 14 0, 14 0 Z",
                  "M22 0 C38 20, 42 80, 32 150 C22 220, 18 250, 18 250 L14 250 C14 250, 18 220, 28 150 C38 80, 22 20, 14 0 Z",
                  "M22 0 C30 20, 34 80, 24 150 C14 220, 18 250, 18 250 L16 250 C16 250, 12 220, 22 150 C32 80, 18 20, 14 0 Z",
                  "M22 0 C38 20, 42 80, 32 150 C22 220, 18 250, 18 250 L14 250 C14 250, 18 220, 28 150 C38 80, 22 20, 14 0 Z",
                  "M15 0 C15 20, 15 80, 15 150 C15 220, 15 250, 15 250 L15 250 C15 250, 15 220, 15 150 C15 80, 15 20, 15 0 Z",
                ]
              }}
              transition={isSkipped ? { duration: 0 } : { duration: 2.4, delay: 4.6, ease: "easeInOut", times: [0, 0.15, 0.5, 0.85, 1] }}
            />
            
            {/* Splashes */}
            <motion.circle cx="25" cy="230" r="3" fill="#f59e0b" opacity="0.9" 
              animate={{ cy: [230, 250], opacity: [0, 0.9, 0] }} transition={isSkipped ? { duration: 0 } : { duration: 0.3, repeat: 5, delay: 4.8 }} />
            <motion.circle cx="15" cy="240" r="2" fill="#d97706" opacity="0.8" 
              animate={{ cy: [240, 260], opacity: [0, 0.8, 0] }} transition={isSkipped ? { duration: 0 } : { duration: 0.2, repeat: 6, delay: 4.9 }} />
            <motion.circle cx="35" cy="220" r="2.5" fill="#f59e0b" opacity="0.9" 
              animate={{ cy: [220, 250], opacity: [0, 0.9, 0] }} transition={isSkipped ? { duration: 0 } : { duration: 0.4, repeat: 4, delay: 5.0 }} />
          </svg>
        </motion.div>

        {/* Easter Egg Liquid Pouring Out */}
        {easterEggPouring && (
          <motion.div
            key={`easter-egg-${easterEggKey}`}
            className="absolute z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, delay: 0.5, times: [0, 0.1, 0.8, 1] }}
            style={{ top: '135px', left: '130px' }}
          >
            <svg width="80" height="250" viewBox="0 0 80 250" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Main Stream */}
              <motion.path 
                d="M20 0 C40 20, 45 80, 35 150 C25 220, 20 250, 20 250 L10 250 C10 250, 15 220, 25 150 C35 80, 20 20, 10 0 Z" 
                fill="#d97706" 
                opacity="0.95"
                animate={{
                  d: [
                    "M20 0 C20 0, 20 0, 20 0 C20 0, 20 0, 20 0 L10 0 C10 0, 10 0, 10 0 C10 0, 10 0, 10 0 Z",
                    "M20 0 C40 20, 45 80, 35 150 C25 220, 20 250, 20 250 L10 250 C10 250, 15 220, 25 150 C35 80, 20 20, 10 0 Z",
                    "M20 0 C30 20, 35 80, 25 150 C15 220, 20 250, 20 250 L15 250 C15 250, 10 220, 20 150 C30 80, 15 20, 10 0 Z",
                    "M20 0 C40 20, 45 80, 35 150 C25 220, 20 250, 20 250 L10 250 C10 250, 15 220, 25 150 C35 80, 20 20, 10 0 Z",
                    "M15 0 C15 20, 15 80, 15 150 C15 220, 15 250, 15 250 L15 250 C15 250, 15 220, 15 150 C15 80, 15 20, 15 0 Z",
                  ]
                }}
                transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut", times: [0, 0.15, 0.5, 0.85, 1] }}
              />
              {/* Inner Highlight Stream */}
              <motion.path 
                d="M22 0 C38 20, 42 80, 32 150 C22 220, 18 250, 18 250 L14 250 C14 250, 18 220, 28 150 C38 80, 22 20, 14 0 Z" 
                fill="#f59e0b" 
                opacity="0.8"
                animate={{
                  d: [
                    "M22 0 C22 0, 22 0, 22 0 C22 0, 22 0, 22 0 L14 0 C14 0, 14 0, 14 0 C14 0, 14 0, 14 0 Z",
                    "M22 0 C38 20, 42 80, 32 150 C22 220, 18 250, 18 250 L14 250 C14 250, 18 220, 28 150 C38 80, 22 20, 14 0 Z",
                    "M22 0 C30 20, 34 80, 24 150 C14 220, 18 250, 18 250 L16 250 C16 250, 12 220, 22 150 C32 80, 18 20, 14 0 Z",
                    "M22 0 C38 20, 42 80, 32 150 C22 220, 18 250, 18 250 L14 250 C14 250, 18 220, 28 150 C38 80, 22 20, 14 0 Z",
                    "M15 0 C15 20, 15 80, 15 150 C15 220, 15 250, 15 250 L15 250 C15 250, 15 220, 15 150 C15 80, 15 20, 15 0 Z",
                  ]
                }}
                transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut", times: [0, 0.15, 0.5, 0.85, 1] }}
              />
              
              {/* Splashes */}
              <motion.circle cx="25" cy="230" r="3" fill="#f59e0b" opacity="0.9" 
                animate={{ cy: [230, 250], opacity: [0, 0.9, 0] }} transition={{ duration: 0.3, repeat: 6, delay: 0.7 }} />
              <motion.circle cx="15" cy="240" r="2" fill="#d97706" opacity="0.8" 
                animate={{ cy: [240, 260], opacity: [0, 0.8, 0] }} transition={{ duration: 0.2, repeat: 8, delay: 0.8 }} />
              <motion.circle cx="35" cy="220" r="2.5" fill="#f59e0b" opacity="0.9" 
                animate={{ cy: [220, 250], opacity: [0, 0.9, 0] }} transition={{ duration: 0.4, repeat: 5, delay: 0.9 }} />
            </svg>
          </motion.div>
        )}

        {/* Front Lip of Tank (for occlusion) */}
        <motion.div
          className="absolute inset-0 z-30 origin-center pointer-events-none"
          animate={{
            rotate: [
              0, 
              -180, // 2.5s: Slow inversion left
              0,    // 3.5s: Return upright
              0,    // 4.0s: Pause
              100,  // 5.0s: Tilt right to pour
              100,  // 7.0s: Hold pour
              0     // 8.0s: Return upright
            ],
            y: [
              0,
              -40,
              0,
              0,
              -20,
              -20,
              0
            ]
          }}
          transition={isSkipped ? { duration: 0 } : {
            duration: 8.0,
            times: [
              0, 
              0.3125, // 2.5s / 8.0s
              0.4375, // 3.5s / 8.0s
              0.5,    // 4.0s / 8.0s
              0.625,  // 5.0s / 8.0s
              0.875,  // 7.0s / 8.0s
              1       // 8.0s / 8.0s
            ],
            ease: "easeInOut"
          }}
        >
          <svg width="160" height="180" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Red Ring */}
            <rect x="28" y="30" width="104" height="15" rx="2" fill="url(#redRing)" />
            <rect x="28" y="30" width="104" height="3" fill="#ff9999" opacity="0.4" />
            <rect x="28" y="42" width="104" height="3" fill="#4a0000" opacity="0.6" />
            
            {/* Cap Base */}
            <path d="M26 20 L134 20 L132 30 L28 30 Z" fill="url(#tankBody)" />
            <rect x="26" y="20" width="108" height="2" fill="#555" opacity="0.6" />
            
            {/* Cap Top Rim */}
            <rect x="32" y="10" width="96" height="10" rx="3" fill="url(#capTop)" />
            <rect x="32" y="10" width="96" height="2" fill="#666" opacity="0.6" />
          </svg>
        </motion.div>
        </TankInteractiveWrapper>
      </div>

      {/* CTA */}
      <motion.div
        className="absolute bottom-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showStart ? 1 : 0, y: showStart ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button
          onClick={onStart}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 rounded-full bg-[#111111] text-[#FFFFFF] text-lg font-medium tracking-wide shadow-[0_4px_12px_rgba(17,17,17,0.12)] relative overflow-hidden"
        >
          <span className="relative z-10">Enter the Darkroom</span>
          {/* Dynamic Light Off Shadows */}
          <motion.div 
            className="absolute inset-0 z-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: transitionStage >= 1 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, transparent 50%)' }}
          />
          <motion.div 
            className="absolute inset-0 z-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: transitionStage >= 2 ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.6) 0%, transparent 50%)' }}
          />
        </motion.button>
      </motion.div>
    </div>
  );
};
