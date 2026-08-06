import React, { useState, useEffect } from 'react'

export default function PeminjamanCalendar({ startDate, endDate, onChange }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate min date (H+4)
  const getMinDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 4)
    d.setHours(0, 0, 0, 0)
    return d
  }
  const minDate = getMinDate()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // Prevent going to months entirely before the minDate month
  const isPrevDisabled = year === minDate.getFullYear() && month <= minDate.getMonth()

  const calendarCells = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d)
  }

  const handleDayClick = (dayNum) => {
    const clickedDate = new Date(year, month, dayNum)
    if (clickedDate < minDate) return // Disabled

    const clickedStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`

    if (!startDate || (startDate && endDate)) {
      // Start a new selection
      onChange(clickedStr, '')
    } else {
      // startDate is set, but endDate is not
      const startObj = new Date(startDate)
      if (clickedDate < startObj) {
        // Clicked before start, swap them
        onChange(clickedStr, startDate)
      } else {
        onChange(startDate, clickedStr)
      }
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button 
          type="button"
          onClick={prevMonth} 
          disabled={isPrevDisabled}
          style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: isPrevDisabled ? 'not-allowed' : 'pointer', color: isPrevDisabled ? '#cbd5e1' : '#334155' }}
        >
          ◀
        </button>
        <strong style={{ fontSize: '15px', color: '#0f172a' }}>
          {monthNames[month]} {year}
        </strong>
        <button 
          type="button"
          onClick={nextMonth} 
          style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#334155' }}
        >
          ▶
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {daysOfWeek.map((day, idx) => (
          <div key={idx} style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', paddingBottom: '8px' }}>
            {day}
          </div>
        ))}

        {calendarCells.map((dayNum, idx) => {
          if (!dayNum) {
            return <div key={idx} />
          }

          const cellDate = new Date(year, month, dayNum)
          const cellStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          
          const isDisabled = cellDate < minDate
          const isStart = cellStr === startDate
          const isEnd = cellStr === endDate
          const isBetween = startDate && endDate && cellStr > startDate && cellStr < endDate
          
          let bgColor = 'transparent'
          let color = '#334155'
          let borderRadius = '8px'

          if (isDisabled) {
            color = '#cbd5e1'
          } else if (isStart || isEnd) {
            bgColor = 'var(--accent)'
            color = '#fff'
          } else if (isBetween) {
            bgColor = 'var(--accent-pale)'
            color = 'var(--accent)'
            borderRadius = '0'
          }

          // Special border radius for connected range
          if (isStart && endDate && startDate !== endDate) {
            borderRadius = '8px 0 0 8px'
          }
          if (isEnd && startDate && startDate !== endDate) {
            borderRadius = '0 8px 8px 0'
          }

          return (
            <div 
              key={idx} 
              onClick={() => handleDayClick(dayNum)}
              style={{ 
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '14px', 
                fontWeight: (isStart || isEnd) ? 700 : 500,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                backgroundColor: bgColor,
                color: color,
                borderRadius: borderRadius,
                transition: 'background 0.1s'
              }}
            >
              {dayNum}
            </div>
          )
        })}
      </div>
      
      <div style={{ marginTop: 12, fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
        * Peminjaman minimal H-4 dari hari ini
      </div>
    </div>
  )
}
