import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// Fade-up khi scroll vào viewport
export function FadeUp({ children, delay = 0, duration = 0.55, style, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.22, 0.61, 0.36, 1] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade-in đơn giản
export function FadeIn({ children, delay = 0, duration = 0.5, style, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration, delay, ease: 'easeOut' }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger container — các con tự delay theo thứ tự
export function StaggerList({ children, stagger = 0.1, style, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Con của StaggerList
export function StaggerItem({ children, style, className }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Button với hiệu ứng nhấn
export function MotionBtn({ children, className, style, onClick, type = 'button', disabled }) {
  return (
    <motion.button
      type={type}
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
