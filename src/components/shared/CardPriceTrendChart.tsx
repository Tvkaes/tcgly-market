import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'

export interface CardTrendPoint {
  label: string
  price: number
}

interface CardPriceTrendChartProps {
  data: CardTrendPoint[]
}

const currencyFormat = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  })

type TrendTooltipPayload = {
  value?: number
}

type TrendTooltipProps = TooltipProps<number, string> & {
  payload?: TrendTooltipPayload[]
  label?: string
}

const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active } = props
  const { payload = [], label = '' } = props as TrendTooltipProps
  if (!active || payload.length === 0) return null
  const datum = payload[0]
  return (
    <div className="rounded-2xl border border-white/60 bg-white/95 px-4 py-2 text-sm shadow-xl shadow-purple-500/20">
      <p className="text-xs uppercase tracking-[0.4em] text-[#a27ec8]">{label}</p>
      <p className="text-lg font-semibold text-[#1f1235]">{currencyFormat(Number(datum.value ?? 0))}</p>
    </div>
  )
}

const CardPriceTrendChart = ({ data }: CardPriceTrendChartProps) => (
  <div className="h-64 w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ede7ff" />
        <XAxis dataKey="label" tick={{ fill: '#7a678f', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(value: number) => `$${value.toFixed(0)}`}
          tick={{ fill: '#7a678f', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ stroke: '#ff4d6d', strokeWidth: 1 }} content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#ff4d6d"
          strokeWidth={3}
          dot={{ fill: '#7f5af0', r: 4 }}
          activeDot={{ r: 6, stroke: '#7f5af0', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export default CardPriceTrendChart
