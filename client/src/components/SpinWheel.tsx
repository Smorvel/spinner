import { useRef, useEffect, useState, useCallback } from 'react';

interface WheelItem {
  text: string;
  percentage: number;
  color: string;
}

interface SpinWheelProps {
  items: WheelItem[];
}

const SpinWheel: React.FC<SpinWheelProps> = ({ items }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseAngle, setLastMouseAngle] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const animationRef = useRef<number>();
  const wheelRadius = 200;
  const centerX = wheelRadius + 50;
  const centerY = wheelRadius + 50;

  // Функция для получения угла мыши относительно центра колеса
  const getMouseAngle = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return 0;

      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - centerX;
      const y = clientY - rect.top - centerY;
      return Math.atan2(y, x);
    },
    [centerX, centerY]
  );

  // Рисование колеса
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    let currentAngle = 0;
    const totalPercentage = items.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    items.forEach((item, index) => {
      const sliceAngle = (item.percentage / totalPercentage) * 2 * Math.PI;

      // Рисуем сектор
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelRadius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Рисуем границу сектора
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Рисуем текст
      ctx.save();
      ctx.rotate(currentAngle + sliceAngle / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const text = item.text;
      const textRadius = wheelRadius * 0.7;
      ctx.fillText(text, textRadius * 0.3, 0);

      // Рисуем процент
      ctx.font = '12px Arial';
      ctx.fillText(`${item.percentage.toFixed(1)}%`, textRadius * 0.3, 20);

      ctx.restore();
      currentAngle += sliceAngle;
    });

    ctx.restore();

    // Рисуем указатель
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(centerX + wheelRadius - 10, centerY);
    ctx.lineTo(centerX + wheelRadius + 20, centerY - 15);
    ctx.lineTo(centerX + wheelRadius + 20, centerY + 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Рисуем центральную кнопку
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = isSpinning ? '#FF6B6B' : '#4ECDC4';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Текст на кнопке
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isSpinning ? 'СТОП' : 'СПИН', centerX, centerY);
  }, [items, rotation, isSpinning, centerX, centerY, wheelRadius]);

  // Анимация вращения
  useEffect(() => {
    const animate = () => {
      if (Math.abs(velocity) > 0.01) {
        setRotation((prev) => prev + velocity);
        setVelocity((prev) => prev * 0.98); // Замедление
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setVelocity(0);

        // Определяем победителя
        if (items.length > 0) {
          const normalizedRotation =
            ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          const pointerAngle =
            (2 * Math.PI - normalizedRotation) % (2 * Math.PI);

          let currentAngle = 0;
          const totalPercentage = items.reduce(
            (sum, item) => sum + item.percentage,
            0
          );

          for (const item of items) {
            const sliceAngle =
              (item.percentage / totalPercentage) * 2 * Math.PI;
            if (
              pointerAngle >= currentAngle &&
              pointerAngle < currentAngle + sliceAngle
            ) {
              setWinner(item.text);
              break;
            }
            currentAngle += sliceAngle;
          }
        }
      }
    };

    if (isSpinning) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [velocity, isSpinning, rotation, items]);

  // Перерисовка при изменениях
  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Обработчики мыши
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const distance = Math.sqrt(x * x + y * y);

    // Клик по центральной кнопке
    if (distance <= 40) {
      if (isSpinning) {
        setIsSpinning(false);
        setVelocity(0);
      } else {
        setIsSpinning(true);
        setVelocity((Math.random() - 0.5) * 0.5);
        setWinner(null);
      }
      return;
    }

    // Начало перетаскивания
    if (distance <= wheelRadius) {
      setIsDragging(true);
      setLastMouseAngle(getMouseAngle(e.clientX, e.clientY));
      setIsSpinning(false);
      setVelocity(0);
      setWinner(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const currentAngle = getMouseAngle(e.clientX, e.clientY);
    let angleDiff = currentAngle - lastMouseAngle;

    // Нормализация разности углов
    if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

    setRotation((prev) => prev + angleDiff);
    setVelocity(angleDiff * 3); // Скорость зависит от движения мыши
    setLastMouseAngle(currentAngle);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (Math.abs(velocity) > 0.05) {
        setIsSpinning(true);
      }
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        width={wheelRadius * 2 + 100}
        height={wheelRadius * 2 + 100}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          border: '3px solid #4ECDC4',
          borderRadius: '50%',
          backgroundColor: '#2d2d2d',
          boxShadow: '0 0 30px rgba(78, 205, 196, 0.3)',
        }}
      />

      {winner && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px 30px',
            backgroundColor: '#4ECDC4',
            color: '#1a1a1a',
            borderRadius: '25px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }}
        >
          🎉 Победитель: {winner} 🎉
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default SpinWheel;
