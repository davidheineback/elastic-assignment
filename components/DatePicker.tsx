import React from 'react'
import { useRouter } from 'next/router'

/**
 *
 * Represent a datepicker component.
 */
function DatePicker() {
  const [fromDate, setFromDate] = React.useState('2022-04-12')
  const [toDate, setToDate] = React.useState('2022-04-16')

  const router = useRouter()

  return (
    <>
      {/* from date input, min and max 2021-04-01 & 2022-04-16, same date as data set*/}
      <input
        type="date"
        min="2021-04-01"
        max="2022-04-16"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
      {/* to date input, min value is "from date" and max 2022-04-16, same date as data set*/}
      <input
        type="date"
        value={toDate}
        min={fromDate}
        max="2022-04-16"
        onChange={(e) => setToDate(e.target.value)}
      />
      <button
        onClick={() => {
          // if toDate is set to a date after fromDate, query the dates...
          if (fromDate <= toDate) {
            router.push(`?from=${fromDate}&to=${toDate}`)
          } else {
            // ...else query fromDate as both from and to.
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
