import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Always shows Istanbul time (UTC+3) regardless of visitor's timezone.
function istanbulNow(locale) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'Europe/Istanbul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())
}

export default function Clock() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('tr') ? 'tr-TR' : 'en-GB'
  const [time, setTime] = useState(() => istanbulNow(locale))

  useEffect(() => {
    setTime(istanbulNow(locale))
    const id = setInterval(() => setTime(istanbulNow(locale)), 1000)
    return () => clearInterval(id)
  }, [locale])

  return (
    <div className="clock" title={`${t('footer.tz')} · UTC+3`}>
      <span className="clock__dot" />
      <span className="clock__time">{time}</span>
      <span className="clock__tz">{t('footer.tz')} · +03</span>
    </div>
  )
}
