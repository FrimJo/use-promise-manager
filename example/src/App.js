import React from 'react'

import { useMyHook } from 'use-promise-manager'

const App = () => {
  const example = useMyHook()
  return (
    <div>
      {example}
    </div>
  )
}
export default App
