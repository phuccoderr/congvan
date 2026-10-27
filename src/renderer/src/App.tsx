import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  useEffect(() => {
    async function fetchDepartments() {
      try {
        // Gọi API qua window.api đã được expose ở preload script
        const data = await window.api.getDepartments()
        console.log('Danh sách phòng ban:', data)
      } catch (error) {
        console.error('Không thể lấy danh sách phòng ban:', error)
      } finally {
      }
    }

    fetchDepartments()
  }, [])
  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      <Versions></Versions>
      <Button>Hello123</Button>
    </>
  )
}

export default App
