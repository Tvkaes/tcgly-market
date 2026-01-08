import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'

export interface MarketPriceDatum {
  market: string
  avgPrice: number
  changePercent: number
}

interface MarketPriceChartProps {
  data: MarketPriceDatum[]
}

const marketCurrency = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })

type TooltipPayloadEntry = {
  value?: number
}

type TooltipCastingProps = TooltipProps<number, string> & {
  payload?: TooltipPayloadEntry[]
  label?: string
}

const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active } = props
  const { payload = [], label = '' } = props as TooltipCastingProps
  if (!active || payload.length === 0) return null
  const datum = payload[0]
  return (
    <div className="rounded-2xl border border-white/60 bg-white/95 px-4 py-2 text-sm shadow-xl shadow-purple-500/20">
      <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">{label}</p>
      <p className="text-lg font-semibold text-[#1f1235]">{marketCurrency(Number(datum.value ?? 0))}</p>
    </div>
  )
}

const MarketPriceChart = ({ data }: MarketPriceChartProps) => (
  <div className="h-72 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
      <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ede7ff" />
        <XAxis
          dataKey="market"
          tick={{ fill: '#7a678f', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value: number) => `$${(value / 1000).toFixed(1)}k`}
          tick={{ fill: '#7a678f', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: '#f7f2ff' }} content={<CustomTooltip />} />
        <Bar dataKey="avgPrice" radius={[10, 10, 4, 4]} fill="url(#marketGradient)">
          <defs>
            <linearGradient id="marketGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="5%" stopColor="#7f5af0" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#a27ec8" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0.95} />
            </linearGradient>
          </defs>
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export default MarketPriceChart
