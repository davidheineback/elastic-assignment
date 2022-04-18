import React from 'react'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

function FlagBtn({ code }: { code: string }) {
  const [activeCountries, setActiveCountries] = React.useState<{
    [key: string]: boolean
  }>({
    au: true,
    br: true,
    gb: true,
    us: true,
    se: true,
    global: true,
  })

  function handleActiveFlags(country: string) {
    setActiveCountries({
      ...activeCountries,
      [country]: !activeCountries[country],
    })
  }

  return (
    <div
      className={`${styles.flags} ${
        !activeCountries[code] && styles.inactiveFlag
      }`}
      onClick={() => handleActiveFlags(`${code}`)}
    >
      <Image src={`/img/${code}.svg`} alt="flag" height={35} width={35} />
    </div>
  )
}

export default FlagBtn
