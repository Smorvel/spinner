import { useState, useEffect, useCallback, useMemo } from 'react';
import SpinWheel from './components/SpinWheel';

interface WheelItem {
  text: string;
  percentage: number;
  color: string;
}

function App() {
  const [items, setItems] = useState<WheelItem[]>([
    { text: 'Пункт 1', percentage: 25, color: '#FF6B6B' },
    { text: 'Пункт 2', percentage: 25, color: '#4ECDC4' },
    { text: 'Пункт 3', percentage: 25, color: '#45B7D1' },
    { text: 'Пункт 4', percentage: 25, color: '#96CEB4' },
  ]);
  const [inputText, setInputText] = useState(
    'Пункт 1\nПункт 2\nПункт 3\nПункт 4'
  );

  const colors = useMemo(
    () => [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FECA57',
      '#FF9FF3',
      '#54A0FF',
      '#5F27CD',
      '#00D2D3',
      '#FF9F43',
      '#10AC84',
      '#EE5A24',
    ],
    []
  );

  const parseItems = useCallback(
    (text: string): WheelItem[] => {
      const lines = text.split('\n').filter((line) => line.trim());
      if (lines.length === 0) return [];

      const parsedItems: { text: string; percentage?: number }[] = [];
      let totalSpecifiedPercentage = 0;
      let itemsWithoutPercentage = 0;

      // Парсим строки и извлекаем проценты
      lines.forEach((line) => {
        const match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)%\s*$/);
        if (match) {
          const text = match[1].trim();
          const percentage = parseFloat(match[2]);
          parsedItems.push({ text, percentage });
          totalSpecifiedPercentage += percentage;
        } else {
          parsedItems.push({ text: line.trim() });
          itemsWithoutPercentage++;
        }
      });

      // Распределяем оставшиеся проценты
      const remainingPercentage = Math.max(0, 100 - totalSpecifiedPercentage);
      const defaultPercentage =
        itemsWithoutPercentage > 0
          ? remainingPercentage / itemsWithoutPercentage
          : 0;

      return parsedItems.map((item, index) => ({
        text: item.text,
        percentage: item.percentage ?? defaultPercentage,
        color: colors[index % colors.length],
      }));
    },
    [colors]
  );

  useEffect(() => {
    const newItems = parseItems(inputText);
    setItems(newItems);
  }, [inputText, parseItems]);

  return (
    <div
      style={{
        backgroundColor: '#1a1a1a',
        minHeight: '100vh',
        color: '#ffffff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        {/* Колесо фортуны */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              marginBottom: '20px',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
            }}
          >
            Колесо Фортуны
          </h1>
          <SpinWheel items={items} />
        </div>

        {/* Панель управления */}
        <div
          style={{
            backgroundColor: '#2d2d2d',
            padding: '30px',
            borderRadius: '15px',
            width: '350px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          <h2
            style={{
              marginBottom: '20px',
              fontSize: '1.5rem',
              color: '#4ECDC4',
            }}
          >
            Настройки
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '1.1rem',
                color: '#cccccc',
              }}
            >
              Пункты колеса:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите пункты, каждый с новой строки&#10;Можно указать процент: Пункт1 30%"
              style={{
                width: '100%',
                height: '200px',
                padding: '15px',
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                border: '2px solid #4ECDC4',
                borderRadius: '10px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: '#1a1a1a',
              padding: '15px',
              borderRadius: '10px',
              border: '1px solid #444',
            }}
          >
            <h3
              style={{
                marginBottom: '10px',
                fontSize: '1rem',
                color: '#96CEB4',
              }}
            >
              Инструкция:
            </h3>
            <ul
              style={{
                fontSize: '12px',
                color: '#aaaaaa',
                lineHeight: '1.5',
                paddingLeft: '20px',
              }}
            >
              <li>Каждая строка = новый пункт</li>
              <li>Добавьте % для веса: "Пункт1 30%"</li>
              <li>Вращайте мышью или кнопкой в центре</li>
              <li>Сила вращения зависит от движения мыши</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
