import React from 'react'
import { useRouter } from 'next/router'

function DatePicker() {
  const [fromDate, setFromDate] = React.useState('2022-04-12')
  const [toDate, setToDate] = React.useState('2022-04-16')

  const router = useRouter()

  return (
    <>
      <input
        type="date"
        min="2021-08-01"
        max="2022-04-16"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
      <input
        type="date"
        value={toDate}
        min={fromDate}
        max="2022-04-16"
        onChange={(e) => setToDate(e.target.value)}
      />
      <button
        onClick={() => {
          if (fromDate <= toDate) {
            router.push(`?from=${fromDate}&to=${toDate}`)
          } else {
            setToDate(fromDate)
            router.push(`?from=${fromDate}&to=${fromDate}`)
          }
        }}
      >
        Select Dates
      </button>
    </>
  )
}

export default DatePicker
