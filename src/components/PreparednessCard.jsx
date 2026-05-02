import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import templateHTML from './templates/PreparednessCard.html?raw'

export default function PreparednessCard() {
    const { t } = useLanguage()
    const [html, setHtml] = useState('')

    useEffect(() => {
        // Replace translation keys with actual translations
        let rendered = templateHTML.replace(/{{([\w.]+)}}/g, (match, key) => {
            return t(key) || match
        })
        setHtml(rendered)
    }, [t])

    return <div dangerouslySetInnerHTML={{ __html: html }} />
}
