import React from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

export interface ChartTypes {
  types: 'bar' | 'line' | 'area' | 'pie'
}

type Series = {
  name: string
  data: number[]
}

export interface ChartData {
  labels: string[]
  series: Series[]
}

type Easing = 'linear' | 'easein' | 'easeout' | 'easeinout' | undefined
const easyingType: Easing = 'linear'

function CustomChart({
  data = {} as ChartData,
  type = 'bar',
}: {
  data: ChartData
  type?: ChartTypes['types']
}) {
  const [chartData, setChartData] = React.useState<ChartData>(data)
  const [options, setOptions] = React.useState({
    chart: {
      id: 'apexchart-example',
      animations: {
        enabled: true,
        easing: easyingType,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 300,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    xaxis: {
      categories: chartData.labels,
    },
    dataLabels: {
      enabled: false,
    },
  })

  const [series, setSeries] = React.useState<Series[]>([])

  React.useEffect(() => {
    setSeries(chartData.series)

    setOptions((prevOptions) => {
      return {
        ...prevOptions,
        xaxis: {
          categories: chartData.labels,
        },
      }
    })
  }, [chartData])

  return (
    <Chart
      options={options}
      series={series}
      type={type}
      width={1600}
      height={500}
    />
  )
}

export default CustomChart
