import React from 'react'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

/**
 *
 * Represent a jsx component. that renders a flag.
 */
function FlagBtn({
  active,
  code,
  onClick,
}: {
  active: boolean
  code: string
  onClick: () => void
}) {
  return (
    <div
      className={`${styles.flags} ${!active && styles.inactiveFlag}`}
      onClick={onClick}
    >
      <Image src={`/img/${code}.svg`} alt="flag" height={35} width={35} />
    </div>
  )
}

export default FlagBtn
