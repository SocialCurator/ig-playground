import { Routes, Route, Link } from 'react-router-dom'
import App from './App'
import Other from './Other'

const Router = () => {
    return (
        <div>
            <Routes>
                <Route path="" element={<App />} />
                <Route path="other" element={<Other />} />
                <Route
                    path="*"
                    element={<>Nothing was found at this path.</>}
                />
            </Routes>
        </div>
    )
}

export default Router
