import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Target, Brain, BarChart3 } from 'lucide-react';
import './App.css';

interface HistoricalDataPoint {
  time: number;
  price: number;
  date: string;
}

interface PredictionModel {
  predictions: number[];
  rSquared?: number;
  mape?: number;
  name: string;
  confidence: number;
}

interface TechnicalIndicators {
  sma20?: number[];
  ema12?: number[];
  rsi?: number[];
  bollingerBands?: { upper: number; middle: number; lower: number }[];
}

const SNEKAnalysisDashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [predictions, setPredictions] = useState<Record<string, PredictionModel>>({});
  const [modelPerformance, setModelPerformance] = useState<Record<string, any>>({});
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators>({});
  const [tradingSignal, setTradingSignal] = useState<string>('Hold');

  const historicalData: HistoricalDataPoint[] = [
    { time: 1717545600, price: 0.00300427, date: '2024-06-05' },
    { time: 1717632000, price: 0.00293839, date: '2024-06-06' },
    { time: 1717718400, price: 0.00295374, date: '2024-06-07' },
    { time: 1717804800, price: 0.00286815, date: '2024-06-08' },
    { time: 1717891200, price: 0.0028682, date: '2024-06-09' },
    { time: 1717977600, price: 0.00276731, date: '2024-06-10' },
    { time: 1718064000, price: 0.00280096, date: '2024-06-11' },
    { time: 1718150400, price: 0.00283664, date: '2024-06-12' },
    { time: 1718236800, price: 0.00274672, date: '2024-06-13' },
    { time: 1718323200, price: 0.00274685, date: '2024-06-14' },
    { time: 1718409600, price: 0.00272244, date: '2024-06-15' },
    { time: 1718496000, price: 0.0026613, date: '2024-06-16' },
    { time: 1718582400, price: 0.00263638, date: '2024-06-17' },
    { time: 1718668800, price: 0.00252538, date: '2024-06-18' },
    { time: 1718755200, price: 0.00234059, date: '2024-06-19' },
    { time: 1718841600, price: 0.00228763, date: '2024-06-20' },
    { time: 1718928000, price: 0.00215215, date: '2024-06-21' },
    { time: 1719014400, price: 0.00237894, date: '2024-06-22' },
    { time: 1719100800, price: 0.00257862, date: '2024-06-23' },
    { time: 1719187200, price: 0.00227412, date: '2024-06-24' },
    { time: 1719273600, price: 0.00233422, date: '2024-06-25' },
    { time: 1719360000, price: 0.00233256, date: '2024-06-26' },
    { time: 1719446400, price: 0.00219353, date: '2024-06-27' },
    { time: 1719532800, price: 0.00219026, date: '2024-06-28' },
    { time: 1719619200, price: 0.00216774, date: '2024-06-29' },
    { time: 1719705600, price: 0.00251693, date: '2024-06-30' },
    { time: 1719792000, price: 0.00233699, date: '2024-07-01' },
    { time: 1719878400, price: 0.00238854, date: '2024-07-02' },
    { time: 1719964800, price: 0.00222663, date: '2024-07-03' },
    { time: 1720051200, price: 0.00225943, date: '2024-07-04' },
    { time: 1720137600, price: 0.00229654, date: '2024-07-05' },
    { time: 1720224000, price: 0.00229088, date: '2024-07-06' },
    { time: 1720310400, price: 0.00228358, date: '2024-07-07' },
    { time: 1720396800, price: 0.00228699, date: '2024-07-08' },
    { time: 1720483200, price: 0.00234623, date: '2024-07-09' },
    { time: 1720569600, price: 0.00234102, date: '2024-07-10' },
    { time: 1720656000, price: 0.00217519, date: '2024-07-11' },
    { time: 1720742400, price: 0.00228046, date: '2024-07-12' },
    { time: 1720828800, price: 0.00232958, date: '2024-07-13' },
    { time: 1720915200, price: 0.00247522, date: '2024-07-14' },
    { time: 1721001600, price: 0.00251126, date: '2024-07-15' },
    { time: 1721088000, price: 0.00271799, date: '2024-07-16' },
    { time: 1721174400, price: 0.00268839, date: '2024-07-17' },
    { time: 1721260800, price: 0.00266628, date: '2024-07-18' },
    { time: 1721347200, price: 0.00266418, date: '2024-07-19' },
    { time: 1721433600, price: 0.00254562, date: '2024-07-20' },
    { time: 1721520000, price: 0.00261751, date: '2024-07-21' },
    { time: 1721606400, price: 0.00265305, date: '2024-07-22' },
    { time: 1721692800, price: 0.00253707, date: '2024-07-23' },
    { time: 1721779200, price: 0.00248819, date: '2024-07-24' },
    { time: 1721865600, price: 0.0024311, date: '2024-07-25' },
    { time: 1721952000, price: 0.00249003, date: '2024-07-26' },
    { time: 1722038400, price: 0.00243914, date: '2024-07-27' },
    { time: 1722124800, price: 0.00239874, date: '2024-07-28' },
    { time: 1722211200, price: 0.00238797, date: '2024-07-29' },
    { time: 1722297600, price: 0.0023786, date: '2024-07-30' },
    { time: 1722384000, price: 0.0023944, date: '2024-07-31' },
    { time: 1722470400, price: 0.00238346, date: '2024-08-01' },
    { time: 1722556800, price: 0.00232527, date: '2024-08-02' },
    { time: 1722643200, price: 0.0023032, date: '2024-08-03' },
    { time: 1722729600, price: 0.00229923, date: '2024-08-04' },
    { time: 1722816000, price: 0.00221796, date: '2024-08-05' },
    { time: 1722902400, price: 0.00227656, date: '2024-08-06' },
    { time: 1722988800, price: 0.00234176, date: '2024-08-07' },
    { time: 1723075200, price: 0.0022804, date: '2024-08-08' },
    { time: 1723161600, price: 0.00229232, date: '2024-08-09' },
    { time: 1723248000, price: 0.00231815, date: '2024-08-10' },
    { time: 1723334400, price: 0.00221405, date: '2024-08-11' },
    { time: 1723420800, price: 0.00221731, date: '2024-08-12' },
    { time: 1723507200, price: 0.00215989, date: '2024-08-13' },
    { time: 1723593600, price: 0.00219942, date: '2024-08-14' },
    { time: 1723680000, price: 0.00222179, date: '2024-08-15' },
    { time: 1723766400, price: 0.00220428, date: '2024-08-16' },
    { time: 1723852800, price: 0.00222732, date: '2024-08-17' },
    { time: 1723939200, price: 0.0021345, date: '2024-08-18' },
    { time: 1724025600, price: 0.00205075, date: '2024-08-19' },
    { time: 1724112000, price: 0.00206201, date: '2024-08-20' },
    { time: 1724198400, price: 0.00203961, date: '2024-08-21' },
    { time: 1724284800, price: 0.00200312, date: '2024-08-22' },
    { time: 1724371200, price: 0.00214992, date: '2024-08-23' },
    { time: 1724457600, price: 0.00226963, date: '2024-08-24' },
    { time: 1724544000, price: 0.00229665, date: '2024-08-25' },
    { time: 1724630400, price: 0.0022627, date: '2024-08-26' },
    { time: 1724716800, price: 0.00222458, date: '2024-08-27' },
    { time: 1724803200, price: 0.0021912, date: '2024-08-28' },
    { time: 1724889600, price: 0.00215285, date: '2024-08-29' },
    { time: 1724976000, price: 0.00227665, date: '2024-08-30' },
    { time: 1725062400, price: 0.00219047, date: '2024-08-31' },
    { time: 1725148800, price: 0.00217887, date: '2024-09-01' },
    { time: 1725235200, price: 0.00229342, date: '2024-09-02' },
    { time: 1725321600, price: 0.00229537, date: '2024-09-03' },
    { time: 1725408000, price: 0.0023706, date: '2024-09-04' },
    { time: 1725494400, price: 0.0021278, date: '2024-09-05' },
    { time: 1725580800, price: 0.00211846, date: '2024-09-06' },
    { time: 1725667200, price: 0.00217279, date: '2024-09-07' },
    { time: 1725753600, price: 0.00216172, date: '2024-09-08' },
    { time: 1725840000, price: 0.0020937, date: '2024-09-09' },
    { time: 1725926400, price: 0.00206178, date: '2024-09-10' },
    { time: 1726012800, price: 0.00206578, date: '2024-09-11' },
    { time: 1726099200, price: 0.00204456, date: '2024-09-12' },
    { time: 1726185600, price: 0.00203593, date: '2024-09-13' },
    { time: 1726272000, price: 0.00203431, date: '2024-09-14' },
    { time: 1726358400, price: 0.00201966, date: '2024-09-15' },
    { time: 1726444800, price: 0.00195805, date: '2024-09-16' },
    { time: 1726531200, price: 0.00188621, date: '2024-09-17' },
    { time: 1726617600, price: 0.00181644, date: '2024-09-18' },
    { time: 1726704000, price: 0.00204893, date: '2024-09-19' },
    { time: 1726790400, price: 0.00214592, date: '2024-09-20' },
    { time: 1726876800, price: 0.00207163, date: '2024-09-21' },
    { time: 1726963200, price: 0.00207031, date: '2024-09-22' },
    { time: 1727049600, price: 0.00204544, date: '2024-09-23' },
    { time: 1727136000, price: 0.00214055, date: '2024-09-24' },
    { time: 1727222400, price: 0.00212164, date: '2024-09-25' },
    { time: 1727308800, price: 0.00229963, date: '2024-09-26' },
    { time: 1727395200, price: 0.00252229, date: '2024-09-27' },
    { time: 1727481600, price: 0.00249046, date: '2024-09-28' },
    { time: 1727568000, price: 0.00259821, date: '2024-09-29' },
    { time: 1727654400, price: 0.00259284, date: '2024-09-30' },
    { time: 1727740800, price: 0.00245119, date: '2024-10-01' },
    { time: 1727827200, price: 0.00249628, date: '2024-10-02' },
    { time: 1727913600, price: 0.00251349, date: '2024-10-03' },
    { time: 1728000000, price: 0.00256789, date: '2024-10-04' },
    { time: 1728086400, price: 0.00258062, date: '2024-10-05' },
    { time: 1728172800, price: 0.00251206, date: '2024-10-06' },
    { time: 1728259200, price: 0.00256038, date: '2024-10-07' },
    { time: 1728345600, price: 0.00263231, date: '2024-10-08' },
    { time: 1728432000, price: 0.00246346, date: '2024-10-09' },
    { time: 1728518400, price: 0.00270189, date: '2024-10-10' },
    { time: 1728604800, price: 0.00261364, date: '2024-10-11' },
    { time: 1728691200, price: 0.00263135, date: '2024-10-12' },
    { time: 1728777600, price: 0.00266909, date: '2024-10-13' },
    { time: 1728864000, price: 0.00280392, date: '2024-10-14' },
    { time: 1728950400, price: 0.0027501, date: '2024-10-15' },
    { time: 1729036800, price: 0.00270463, date: '2024-10-16' },
    { time: 1729123200, price: 0.002962, date: '2024-10-17' },
    { time: 1729209600, price: 0.00298813, date: '2024-10-18' },
    { time: 1729296000, price: 0.00292418, date: '2024-10-19' },
    { time: 1729382400, price: 0.00297362, date: '2024-10-20' },
    { time: 1729468800, price: 0.0029138, date: '2024-10-21' },
    { time: 1729555200, price: 0.00297305, date: '2024-10-22' },
    { time: 1729641600, price: 0.00282205, date: '2024-10-23' },
    { time: 1729728000, price: 0.002778, date: '2024-10-24' },
    { time: 1729814400, price: 0.00297494, date: '2024-10-25' },
    { time: 1729900800, price: 0.00286614, date: '2024-10-26' },
    { time: 1729987200, price: 0.00279122, date: '2024-10-27' },
    { time: 1730073600, price: 0.00287246, date: '2024-10-28' },
    { time: 1730160000, price: 0.00281738, date: '2024-10-29' },
    { time: 1730246400, price: 0.00290299, date: '2024-10-30' },
    { time: 1730332800, price: 0.00292236, date: '2024-10-31' },
    { time: 1730419200, price: 0.00287491, date: '2024-11-01' },
    { time: 1730505600, price: 0.00288893, date: '2024-11-02' },
    { time: 1730592000, price: 0.00287075, date: '2024-11-03' },
    { time: 1730678400, price: 0.00281494, date: '2024-11-04' },
    { time: 1730764800, price: 0.00288526, date: '2024-11-05' },
    { time: 1730851200, price: 0.0028318, date: '2024-11-06' },
    { time: 1730937600, price: 0.00259913, date: '2024-11-07' },
    { time: 1731024000, price: 0.00283808, date: '2024-11-08' },
    { time: 1731110400, price: 0.00264225, date: '2024-11-09' },
    { time: 1731196800, price: 0.00286693, date: '2024-11-10' },
    { time: 1731283200, price: 0.00281023, date: '2024-11-11' },
    { time: 1731369600, price: 0.00278113, date: '2024-11-12' },
    { time: 1731456000, price: 0.00286128, date: '2024-11-13' },
    { time: 1731542400, price: 0.00300663, date: '2024-11-14' },
    { time: 1731628800, price: 0.00325028, date: '2024-11-15' },
    { time: 1731715200, price: 0.003355, date: '2024-11-16' },
    { time: 1731801600, price: 0.00364521, date: '2024-11-17' },
    { time: 1731888000, price: 0.00408251, date: '2024-11-18' },
    { time: 1731974400, price: 0.00393759, date: '2024-11-19' },
    { time: 1732060800, price: 0.00374804, date: '2024-11-20' },
    { time: 1732147200, price: 0.00385059, date: '2024-11-21' },
    { time: 1732233600, price: 0.00386424, date: '2024-11-22' },
    { time: 1732320000, price: 0.00414268, date: '2024-11-23' },
    { time: 1732406400, price: 0.00428355, date: '2024-11-24' },
    { time: 1732492800, price: 0.00434769, date: '2024-11-25' },
    { time: 1732579200, price: 0.00425051, date: '2024-11-26' },
    { time: 1732665600, price: 0.00444059, date: '2024-11-27' },
    { time: 1732752000, price: 0.00478009, date: '2024-11-28' },
    { time: 1732838400, price: 0.00518774, date: '2024-11-29' },
    { time: 1732924800, price: 0.00594355, date: '2024-11-30' },
    { time: 1733011200, price: 0.00586166, date: '2024-12-01' },
    { time: 1733097600, price: 0.0064076, date: '2024-12-02' },
    { time: 1733184000, price: 0.00622901, date: '2024-12-03' },
    { time: 1733270400, price: 0.00648387, date: '2024-12-04' },
    { time: 1733356800, price: 0.00673786, date: '2024-12-05' },
    { time: 1733443200, price: 0.00662794, date: '2024-12-06' },
  ];

  const currentPrice = 0.00662794;

  const calculateSMA = (data: HistoricalDataPoint[], period: number): number[] => {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.price, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateEMA = (data: HistoricalDataPoint[], period: number): number[] => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    ema[0] = data[0].price;
    for (let i = 1; i < data.length; i++) {
      ema[i] = data[i].price * multiplier + ema[i - 1] * (1 - multiplier);
    }
    return ema;
  };

  const calculateRSI = (data: HistoricalDataPoint[], period: number = 14): number[] => {
    const changes: number[] = [];
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i].price - data[i - 1].price);
    }
    const gains = changes.map(change => (change > 0 ? change : 0));
    const losses = changes.map(change => (change < 0 ? Math.abs(change) : 0));
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;
    const rsi: number[] = [];
    for (let i = period; i < data.length; i++) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + rs));
      avgGain = (avgGain * (period - 1) + (i < changes.length ? gains[i] : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (i < changes.length ? losses[i] : 0)) / period;
    }
    return rsi;
  };

  const calculateBollingerBands = (data: HistoricalDataPoint[], period: number = 20, multiplier: number = 2) => {
    const sma = calculateSMA(data, period);
    const bands: { upper: number; middle: number; lower: number }[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const subset = data.slice(i - period + 1, i + 1);
      const mean = sma[i - (period - 1)];
      const variance = subset.reduce((acc, val) => acc + Math.pow(val.price - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      bands.push({
        upper: mean + multiplier * stdDev,
        middle: mean,
        lower: mean - multiplier * stdDev,
      });
    }
    return bands;
  };

  const linearRegressionModel = (data: HistoricalDataPoint[]): PredictionModel => {
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.price);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const predictions: number[] = [];
    for (let i = 0; i < 30; i++) {
      const nextIndex = n + i;
      predictions.push(Math.max(0, slope * nextIndex + intercept));
    }
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * i + intercept), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    return {
      predictions,
      rSquared,
      name: 'Linear Regression',
      confidence: Math.max(0, Math.min(100, rSquared * 100)),
    };
  };

  const exponentialSmoothingModel = (data: HistoricalDataPoint[], alpha: number = 0.3): PredictionModel => {
    const prices = data.map(d => d.price);
    let forecast = prices[0];
    const forecasts = [forecast];
    for (let i = 1; i < prices.length; i++) {
      forecast = alpha * prices[i] + (1 - alpha) * forecast;
      forecasts.push(forecast);
    }
    const predictions: number[] = [];
    let nextForecast = forecast;
    for (let i = 0; i < 30; i++) {
      predictions.push(Math.max(0, nextForecast));
      nextForecast = alpha * nextForecast + (1 - alpha) * nextForecast;
    }
    const mape =
      forecasts.reduce((sum, pred, i) => {
        if (i === 0) return sum;
        return sum + Math.abs((prices[i] - pred) / prices[i]);
      }, 0) /
      (forecasts.length - 1);
    return {
      predictions,
      mape,
      name: 'Exponential Smoothing',
      confidence: Math.max(0, Math.min(100, (1 - mape) * 100)),
    };
  };

  const movingAverageModel = (data: HistoricalDataPoint[], period: number = 10): PredictionModel => {
    const prices = data.map(d => d.price);
    const sma = calculateSMA(data, period);
    const recentSMA = sma.slice(-5);
    const trend = recentSMA.length > 1 ? (recentSMA[recentSMA.length - 1] - recentSMA[0]) / (recentSMA.length - 1) : 0;
    const predictions: number[] = [];
    let lastSMA = sma[sma.length - 1];
    for (let i = 0; i < 30; i++) {
      lastSMA += trend;
      predictions.push(Math.max(0, lastSMA));
    }
    const recentPrices = prices.slice(-20);
    const recentVolatility = Math.sqrt(
      recentPrices.reduce((sum, price, i) => {
        if (i === 0) return sum;
        return sum + Math.pow(price - recentPrices[i - 1], 2);
      }, 0) / (recentPrices.length - 1)
    );
    const confidence = Math.max(0, Math.min(100, 100 - (recentVolatility / lastSMA) * 10000));
    return {
      predictions,
      name: 'Moving Average Trend',
      confidence,
    };
  };

  const polynomialRegressionModel = (data: HistoricalDataPoint[], degree: number = 2): PredictionModel => {
    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.price);
    const x2 = x.map(xi => xi * xi);
    const xy = x.map((xi, i) => xi * y[i]);
    const x2y = x2.map((xi2, i) => xi2 * y[i]);
    const x3 = x.map(xi => Math.pow(xi, 3));
    const x4 = x.map(xi => Math.pow(xi, 4));
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumX2 = x2.reduce((a, b) => a + b, 0);
    const sumXY = xy.reduce((a, b) => a + b, 0);
    const sumX2Y = x2y.reduce((a, b) => a + b, 0);
    const sumX3 = x3.reduce((a, b) => a + b, 0);
    const sumX4 = x4.reduce((a, b) => a + b, 0);
    const matrix = [
      [n, sumX, sumX2],
      [sumX, sumX2, sumX3],
      [sumX2, sumX3, sumX4],
    ];
    const vector = [sumY, sumXY, sumX2Y];
    const solveLinearSystem = (A: number[][], b: number[]): number[] => {
      const n = A.length;
      const augmented = A.map((row, i) => [...row, b[i]]);
      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
            maxRow = j;
          }
        }
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
        for (let j = i + 1; j < n; j++) {
          const factor = augmented[j][i] / augmented[i][i];
          for (let k = i; k <= n; k++) {
            augmented[j][k] -= factor * augmented[i][k];
          }
        }
      }
      const coeffs = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = augmented[i][n];
        for (let j = i + 1; j < n; j++) {
          sum -= augmented[i][j] * coeffs[j];
        }
        coeffs[i] = sum / augmented[i][i];
      }
      return coeffs;
    };
    const coeffs = solveLinearSystem(matrix, vector);
    const predictions: number[] = [];
    for (let i = 0; i < 30; i++) {
      const t = n + i;
      const prediction = coeffs[0] + coeffs[1] * t + coeffs[2] * t * t;
      predictions.push(Math.max(0, prediction));
    }
    const fitted = x.map(t => coeffs[0] + coeffs[1] * t + coeffs[2] * t * t);
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - fitted[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const rSquared = 1 - ssRes / ssTot;
    return {
      predictions,
      rSquared,
      name: 'Polynomial Regression',
      confidence: Math.max(0, Math.min(100, rSquared * 100)),
    };
  };

  const generateTradingSignal = (
    predictions: Record<string, PredictionModel>,
    indicators: TechnicalIndicators
  ): string => {
    const { rsi, bollingerBands } = indicators;
    const latestRSI = rsi && rsi[rsi.length - 1];
    const latestBB = bollingerBands && bollingerBands[bollingerBands.length - 1];
    const latestPrice = historicalData[historicalData.length - 1].price;

    const modelNames = [
      'Linear Regression',
      'Exponential Smoothing',
      'Moving Average Trend',
      'Polynomial Regression',
    ];
    let weightedPrediction = 0;
    let totalWeight = 0;

    modelNames.forEach(model => {
      if (predictions[model]) {
        const avgPrediction = predictions[model].predictions.reduce((sum, val) => sum + val, 0) / 30;
        weightedPrediction += avgPrediction * predictions[model].confidence;
        totalWeight += predictions[model].confidence;
      }
    });

    const avgFuturePrice = totalWeight > 0 ? weightedPrediction / totalWeight : latestPrice;

    let signal = 'Hold';
    const rsiBuy = latestRSI && latestRSI < 30;
    const rsiSell = latestRSI && latestRSI > 70;
    const bbBuy = latestBB && latestPrice < latestBB.lower;
    const bbSell = latestBB && latestPrice > latestBB.upper;
    const priceIncrease = avgFuturePrice > latestPrice * 1.05;
    const priceDecrease = avgFuturePrice < latestPrice * 0.95;

    if ((rsiBuy || bbBuy) && priceIncrease) {
      signal = 'Buy';
    } else if ((rsiSell || bbSell) && priceDecrease) {
      signal = 'Sell';
    }

    return signal;
  };

  useEffect(() => {
    const sma20 = calculateSMA(historicalData, 20);
    const ema12 = calculateEMA(historicalData, 12);
    const rsi = calculateRSI(historicalData, 14);
    const bollingerBands = calculateBollingerBands(historicalData, 20, 2);

    setTechnicalIndicators({
      sma20,
      ema12,
      rsi,
      bollingerBands,
    });

    const linearModel = linearRegressionModel(historicalData);
    const expModel = exponentialSmoothingModel(historicalData);
    const maModel = movingAverageModel(historicalData);
    const polyModel = polynomialRegressionModel(historicalData);

    const modelPredictions = {
      'Linear Regression': linearModel,
      'Exponential Smoothing': expModel,
      'Moving Average Trend': maModel,
      'Polynomial Regression': polyModel,
    };

    setPredictions(modelPredictions);

    setModelPerformance({
      'Linear Regression': { rSquared: linearModel.rSquared, confidence: linearModel.confidence },
      'Exponential Smoothing': { mape: expModel.mape, confidence: expModel.confidence },
      'Moving Average Trend': { confidence: maModel.confidence },
      'Polynomial Regression': { rSquared: polyModel.rSquared, confidence: polyModel.confidence },
    });

    const signal = generateTradingSignal(modelPredictions, { rsi, bollingerBands });
    setTradingSignal(signal);
  }, []);

  const chartData = historicalData.map((data, index) => {
    const item: any = { ...data };
    if (technicalIndicators.sma20 && index >= 19) {
      item.sma20 = technicalIndicators.sma20[index - 19];
    }
    if (technicalIndicators.ema12) {
      item.ema12 = technicalIndicators.ema12[index];
    }
    if (technicalIndicators.bollingerBands && index >= 19) {
      item.bbUpper = technicalIndicators.bollingerBands[index - 19].upper;
      item.bbLower = technicalIndicators.bollingerBands[index - 19].lower;
      item.bbMiddle = technicalIndicators.bollingerBands[index - 19].middle;
    }
    return item;
  });

  const lastDate = new Date(historicalData[historicalData.length - 1].time * 1000);
  const predictionData = Array(30)
    .fill(0)
    .map((_, i) => {
      const date = new Date(lastDate);
      date.setDate(lastDate.getDate() + i + 1);
      const dateStr = date.toISOString().split('T')[0];
      const item: any = { date: dateStr };
      if (selectedModel === 'all' || selectedModel === 'Linear Regression') {
        item.linear = predictions['Linear Regression']?.predictions[i];
      }
      if (selectedModel === 'all' || selectedModel === 'Exponential Smoothing') {
        item.exponential = predictions['Exponential Smoothing']?.predictions[i];
      }
      if (selectedModel === 'all' || selectedModel === 'Moving Average Trend') {
        item.movingAverage = predictions['Moving Average Trend']?.predictions[i];
      }
      if (selectedModel === 'all' || selectedModel === 'Polynomial Regression') {
        item.polynomial = predictions['Polynomial Regression']?.predictions[i];
      }
      return item;
    });

  const rsiData = historicalData.slice(14).map((data, index) => ({
    date: data.date,
    rsi: technicalIndicators.rsi ? technicalIndicators.rsi[index] : null,
  }));

  return (
    <div className="snek-dashboard">
      <h1>SNEK Analysis Dashboard</h1>
      <div className="grid-container">
        <div className="card">
          <h2>
            <BarChart3 size={20} /> Current Price
          </h2>
          <p>${currentPrice.toFixed(6)}</p>
        </div>
        <div className="card">
          <h2>
            <AlertTriangle size={20} /> Trading Signal
          </h2>
          <p className={`signal-${tradingSignal.toLowerCase()}`}>{tradingSignal}</p>
        </div>
      </div>
      <div className="model-selector">
        <label>Select Prediction Model:</label>
        <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
          <option value="all">All Models</option>
          <option value="Linear Regression">Linear Regression</option>
          <option value="Exponential Smoothing">Exponential Smoothing</option>
          <option value="Moving Average Trend">Moving Average Trend</option>
          <option value="Polynomial Regression">Polynomial Regression</option>
        </select>
      </div>
      <div className="chart-container">
        <h2>
          <BarChart3 size={20} /> Price History with Technical Indicators
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price" />
            <Line type="monotone" dataKey="sma20" stroke="#82ca9d" name="SMA 20" />
            <Line type="monotone" dataKey="ema12" stroke="#ffc658" name="EMA 12" />
            <Line type="monotone" dataKey="bbUpper" stroke="#ff7300" name="Bollinger Upper" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="bbLower" stroke="#ff7300" name="Bollinger Lower" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="bbMiddle" stroke="#ff7300" name="Bollinger Middle" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-container">
        <h2>
          <Brain size={20} /> Price Predictions (Next 30 Days)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={predictionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            {(selectedModel === 'all' || selectedModel === 'Linear Regression') && (
              <Line type="monotone" dataKey="linear" stroke="#8884d8" name="Linear Regression" />
            )}
            {(selectedModel === 'all' || selectedModel === 'Exponential Smoothing') && (
              <Line type="monotone" dataKey="exponential" stroke="#82ca9d" name="Exponential Smoothing" />
            )}
            {(selectedModel === 'all' || selectedModel === 'Moving Average Trend') && (
              <Line type="monotone" dataKey="movingAverage" stroke="#ffc658" name="Moving Average Trend" />
            )}
            {(selectedModel === 'all' || selectedModel === 'Polynomial Regression') && (
              <Line type="monotone" dataKey="polynomial" stroke="#ff7300" name="Polynomial Regression" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-container">
        <h2>
          <Target size={20} /> RSI (14-Period)
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rsiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="rsi" stroke="#8884d8" name="RSI" />
            <Line type="monotone" dataKey={() => 70} stroke="#ff0000" name="Overbought (70)" strokeDasharray="5 5" />
            <Line type="monotone" dataKey={() => 30} stroke="#00ff00" name="Oversold (30)" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-container">
        <h2>
          <BarChart3 size={20} /> Model Performance
        </h2>
        <div className="performance-grid">
          {Object.entries(modelPerformance).map(([model, metrics]) => (
            <div key={model} className="performance-card">
              <h3>{model}</h3>
              {metrics.rSquared && <p>R²: {(metrics.rSquared * 100).toFixed(2)}%</p>}
              {metrics.mape && <p>MAPE: {(metrics.mape * 100).toFixed(2)}%</p>}
              <p>Confidence: {metrics.confidence.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SNEKAnalysisDashboard;