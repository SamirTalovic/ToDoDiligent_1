import React from 'react'
import ReactDOM from 'react-dom/client'
import { StoreContext, store } from './stores/store.js'
import { RouterProvider } from 'react-router-dom'
import { router } from '../src/router/NewRouter.js'
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StoreContext.Provider value={store}>
    <RouterProvider router={router}/>
  </StoreContext.Provider>
)
