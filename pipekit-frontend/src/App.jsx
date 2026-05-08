import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import PipelineEditor from './components/pipelineEditor'
import RunView from './pages/runview'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<Dashboard />} />
        <Route path="/pipeline/:id"       element={<PipelineEditor />} />
        <Route path="/pipeline/new"       element={<PipelineEditor />} />
        <Route path="/runs/:id"           element={<RunView />} />
      </Routes>
    </BrowserRouter>
  )
}