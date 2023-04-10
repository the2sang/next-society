import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import {koKR} from "@mui/x-date-pickers/locales";
import ko from 'date-fns/locale/ko'


export default function App({ Component, pageProps }: AppProps) {
  return (
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={ko}
        localeText={koKR.components.MuiLocalizationProvider.defaultProps.localeText}
      >
        <Component {...pageProps} />
      </LocalizationProvider>
  )
}
