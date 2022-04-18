import React from 'react'
import { useRouter } from 'next/router'

function DatePicker() {
  const [fromDate, setFromDate] = React.useState('2022-04-01')
  const [toDate, setToDate] = React.useState('2022-04-06')

  const router = useRouter()

  return (
    <>
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
      <button onClick={() => router.push(`?from=${fromDate}&to=${toDate}`)}>
        Dates
      </button>
    </>
  )
}

export default DatePicker
