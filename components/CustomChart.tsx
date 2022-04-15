import React from 'react'
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
})

export interface ChartTypes {
  types: 'bar' | 'line' | 'area' | 'pie'
}

export interface ChartData {
  label: string
  value: number
}

type Easing = 'linear' | 'easein' | 'easeout' | 'easeinout' | undefined
const easyingType: Easing = 'linear'

function CustomChart({
  data = [],
  type = 'bar',
}: {
  data: ChartData[]
  type: ChartTypes['types']
}) {
  const [chartData, setChartData] = React.useState<ChartData[]>(data)

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
      categories: chartData.map((d) => d.label),
    },
  })

  const [series, setSeries] = React.useState([
    {
      name: 'series-1',
      data: chartData.map((d) => d.value),
    },
  ])

  React.useEffect(() => {
    setSeries([
      {
        name: 'series-1',
        data: chartData.map((d) => d.value),
      },
    ])

    setOptions((prevOptions) => {
      return {
        ...prevOptions,
        xaxis: {
          categories: chartData.map((d) => d.label),
        },
      }
    })
  }, [chartData])

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      width={500}
      height={320}
    />
  )
}

export default CustomChart
